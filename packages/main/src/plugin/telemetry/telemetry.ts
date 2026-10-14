/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import * as os from 'node:os';
import { promisify } from 'node:util';

import type { Event, FeedbackProperties } from '@desktop-framework/api';
import { TelemetryMessages } from '@desktop-framework/api';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { TelemetrySettings } from '@desktop-framework/api/telemetry';
import type {
  TelemetryLogger,
  TelemetryLoggerOptions,
  TelemetrySender,
  TelemetryTrustedValue,
} from '@desktop-framework/extension-api';
import type { EventProperties } from '@segment/analytics-core';
import { Analytics, type UserTraits } from '@segment/analytics-node';
import { app } from 'electron';
import type { LinuxOs } from 'getos';
import getos from 'getos';
import { inject, injectable } from 'inversify';
import osLocale from 'os-locale';

import { DefaultConfiguration } from '/@/plugin/default-configuration.js';
import { Emitter } from '/@/plugin/events/emitter.js';
import { LockedConfiguration } from '/@/plugin/locked-configuration.js';
import { TelemetryTrustedValue as TypeTelemetryTrustedValue } from '/@/plugin/types/telemetry.js';
import { stoppedExtensions } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

// eslint-disable-next-line no-restricted-imports
import telemetry from '../../../../../telemetry.json' with { type: 'json' };
import { CIDetection } from './ci-detection.js';
import { Identity } from './identity.js';
import type { TelemetryRule } from './telemetry-api.js';

export const EventType = {
  TRACK: 'track',
  PAGE: 'page',
  STARTUP: 'startup',
  SHUTDOWN: 'shutdown',
  FEEDBACK: 'feedback',
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType] | string;

/**
 * Handle the telemetry reporting.
 */
@injectable()
export class Telemetry {
  public static readonly DEFAULT_DELAY_AGGREGATE = 10_000; // 10 seconds

  private static readonly SEGMENT_KEY = product.telemetry.key;

  private cachedTelemetrySettings: TelemetryRule[] | undefined;
  private regexp: Map<string, RegExp> = new Map();

  private identity: Identity;

  private locale: string | undefined;

  private analytics: Analytics | undefined;

  protected telemetryEnabled = false;

  protected telemetryInitialized = false;

  private isCIEnvironment = false;

  private telemetryConfigured = false;

  protected pendingItems: { eventName: string; properties?: unknown }[] = [];

  protected aggregateTimeoutEvents: Map<string, { timeout: NodeJS.Timeout; properties: unknown[] }> = new Map();

  protected lastTimeEvents: Map<string, number>;

  private readonly _onDidChangeTelemetryEnabled = new Emitter<boolean>();
  readonly onDidChangeTelemetryEnabled: Event<boolean> = this._onDidChangeTelemetryEnabled.event;

  constructor(
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
    @inject(DefaultConfiguration)
    private defaultConfiguration: DefaultConfiguration,
    @inject(LockedConfiguration)
    private lockedConfiguration: LockedConfiguration,
    @inject(CIDetection)
    private ciDetection: CIDetection,
  ) {
    this.identity = new Identity();
    this.lastTimeEvents = new Map();
  }

  async init(): Promise<void> {
    const telemetryMessages = this.getTelemetryMessages();
    const telemetryInfo = telemetryMessages.info
      ? ` [${telemetryMessages.info.link}](${telemetryMessages.info.url})`
      : '';
    const telemetryConfigurationNode: IConfigurationNode = {
      id: 'preferences.telemetry',
      title: 'Telemetry',
      type: 'object',
      properties: {
        [TelemetrySettings.SectionName + '.' + TelemetrySettings.Enabled]: {
          markdownDescription: `${telemetryMessages.acceptMessage}${telemetryInfo}`,
          type: 'boolean',
          default: true,
        },
        [TelemetrySettings.SectionName + '.' + TelemetrySettings.Check]: {
          description: 'Dialog prompt for telemetry',
          type: 'boolean',
          default: false,
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([telemetryConfigurationNode]);

    // grab value
    const telemetryConfiguration = this.configurationRegistry.getConfiguration(TelemetrySettings.SectionName);
    const check = telemetryConfiguration.get<boolean>(TelemetrySettings.Check);

    // track changes on enablement
    this.listenForTelemetryUpdates();

    // running on a CI: never report anything. The configuration and the welcome screen
    // are left untouched, only the reporting is turned off for this run.
    this.isCIEnvironment = this.ciDetection.isCIEnvironment();
    if (this.isCIEnvironment) {
      console.warn('CI environment detected: telemetry is disabled for this run.');
      this.telemetryEnabled = false;
      this.telemetryInitialized = true;

      // clear pending items, they will never be sent
      this.pendingItems.length = 0;
      return;
    }

    // initialize objects
    this.analytics = new Analytics({ writeKey: Telemetry.SEGMENT_KEY });
    this.analytics.on('error', err => {
      console.log(`Telemetry request error: ${err}`);
    });

    if (check) {
      // the user has been prompted, either configure the telemetry system or disable it based on their preference
      if (this.isTelemetryEnabled()) {
        this.configureTelemetry().catch((err: unknown) => {
          console.error(`Error initializing telemetry: ${err}`);
        });
      } else {
        this.telemetryInitialized = true;

        // clear pending items
        this.pendingItems.length = 0;
      }
    }

    this.loadEnterpriseTelemetry();
  }

  // notify if the configuration change for enablement of the telemetry
  protected listenForTelemetryUpdates(): void {
    this.configurationRegistry.onDidChangeConfiguration(e => {
      if (e.key === `${TelemetrySettings.SectionName}.${TelemetrySettings.Enabled}`) {
        const val = e.value as boolean;
        this._onDidChangeTelemetryEnabled.fire(val);
      }
    });
  }

  isTelemetryEnabled(): boolean {
    // telemetry is never reported from a CI environment, whatever the configuration says
    if (this.isCIEnvironment) {
      return false;
    }
    const telemetryConfiguration = this.configurationRegistry.getConfiguration(TelemetrySettings.SectionName);
    const enabled = telemetryConfiguration.get<boolean>(TelemetrySettings.Enabled);
    return enabled === true;
  }

  getTelemetryMessages(): TelemetryMessages {
    return {
      acceptMessage: product.telemetry.acceptMessage,
      info: product.telemetry.info
        ? {
            link: product.telemetry.info?.link,
            url: product.telemetry.info?.url,
          }
        : undefined,
      privacy: product.telemetry.privacy
        ? {
            link: product.telemetry.privacy?.link,
            url: product.telemetry.privacy?.url,
          }
        : undefined,
    } as TelemetryMessages;
  }

  protected createBuiltinTelemetrySender(extensionInfo: {
    id: string;
    name: string;
    publisher: string;
    version: string;
  }): TelemetrySender {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisArg = this;
    const instanceFlush = this.analytics?.closeAndFlush;
    return {
      // prefix with extension id the event
      sendEventData(eventName: string, data?: Record<string, unknown>): void {
        thisArg.track(`${extensionInfo.id}.${eventName}`, data);
      },
      // report using the id of the extension suffixed by error
      sendErrorData(error: Error, data?: Record<string, unknown>): void {
        data = data ?? {};
        data['sourceError'] = error.message;
        thisArg.track(`${extensionInfo.id}.error`, data);
      },
      async flush(): Promise<void> {
        await instanceFlush?.();
      },
    };
  }

  // internal method, not exposed
  protected getTelemetrySettings(): TelemetryRule[] {
    // return the cached version if we have one
    if (this.cachedTelemetrySettings) {
      return this.cachedTelemetrySettings;
    }

    // load the telemetry json file
    this.cachedTelemetrySettings = telemetry.rules.map(obj => obj) as TelemetryRule[];
    this.regexp = new Map();
    this.cachedTelemetrySettings.forEach(rule => this.regexp.set(rule.event, new RegExp(rule.event)));

    return this.cachedTelemetrySettings;
  }

  createTelemetryLogger(
    extensionInfo: { id: string; name: string; publisher: string; version: string },
    sender?: TelemetrySender,
    options?: TelemetryLoggerOptions,
  ): TelemetryLogger {
    // if no sender, use the built-in
    sender ??= this.createBuiltinTelemetrySender(extensionInfo);

    return new TelemetryLoggerImpl(extensionInfo, sender, options);
  }

  protected async initTelemetry(): Promise<void> {
    const anonymousId = await this.identity.getUserId();
    const traits = await this.getSegmentIdentifyTraits();

    this.analytics?.identify({
      anonymousId,
      traits,
    });
  }

  async configureTelemetry(): Promise<void> {
    // the welcome screen asks to configure the telemetry when the user accepts it, keep it disabled on a CI
    if (this.telemetryInitialized || this.isCIEnvironment) {
      return;
    }

    await this.initTelemetry();

    this.internalTrack(EventType.STARTUP).catch((err: unknown) => {
      console.log(`Error sending startup event: ${err}`);
    });
    let sendShutdownAnalytics = false;

    app.on('before-quit', e => {
      if (!sendShutdownAnalytics && stoppedExtensions.val) {
        e.preventDefault();
        try {
          this.internalTrack(EventType.SHUTDOWN).catch((err: unknown) => {
            console.log(`Error sending shutdown event: ${err}`);
          });
          this.analytics?.closeAndFlush().catch((err: unknown) => {
            console.log(`Error flushing analytics: ${err}`);
          });
        } catch (err) {
          console.log(`Telemetry error on shutdown: ${err}`);
        }
        sendShutdownAnalytics = true;
        app.quit();
      }
    });

    // send all pending items
    this.pendingItems.forEach(item => {
      this.internalTrack(item.eventName, item.properties).catch((err: unknown) => {
        console.log(`Error sending pending event: ${err}`);
      });
    });
    this.pendingItems.length = 0;
    this.telemetryConfigured = true;
    this.telemetryEnabled = true;
    this.telemetryInitialized = true;
  }

  protected async internalTrack(event: EventType, eventProperties?: unknown): Promise<void> {
    const anonymousId = await this.identity.getUserId();

    const context = await this.getContext();
    let properties: EventProperties;
    if (!!eventProperties && typeof eventProperties === 'object') {
      properties = eventProperties;
    } else {
      properties = {};
    }

    const integrations = {
      All: true,
    };

    if (event === EventType.PAGE) {
      const name: string | undefined = typeof properties['name'] === 'string' ? properties['name'] : undefined;

      this.analytics?.page({ anonymousId, name, context, integrations });
    } else {
      this.analytics?.track({
        anonymousId,
        event,
        context,
        properties: {
          app_name: app.getName(),
          app_version: app.getVersion(),
          ...properties,
        },
        integrations,
      });
    }
  }

  // return true if the event needs to be dropped
  protected shouldDropEvent(eventName: string): boolean {
    const telem = this.getTelemetrySettings();
    if (!telem || !eventName) {
      return true;
    }

    let dropIt = false;
    telem.forEach(entry => {
      const regex = this.regexp.get(entry.event);
      if (regex?.test(eventName)) {
        if (entry.disabled) {
          // telemetry is entirely disabled for this event
          dropIt = true;
        }
        // eslint-disable-next-line sonarjs/pseudo-random
        if (entry.ratio && entry.ratio < 1 && Math.random() > entry.ratio) {
          // if a ratio is specified, we randomly drop
          dropIt = true;
        }
        if (entry.frequency === 'dailyPerInstance') {
          // only send this event once per day, per running instance (not saved to disk)
          const previousTime = this.lastTimeEvents.get(eventName);
          // it was not there, so we can send it
          if (!previousTime) {
            this.lastTimeEvents.set(eventName, Date.now());
            return;
          } else {
            // it was there, so we check if it was more than 24h ago
            const now = Date.now();
            const diff = now - previousTime;
            if (diff > 24 * 60 * 60 * 1000) {
              this.lastTimeEvents.set(eventName, now);
            } else {
              dropIt = true;
            }
          }
        }
      }
    });

    return dropIt;
  }

  /**
   * will cumulate the data for the given the event and send it to the telemetry system.
   * @param event the event to send after the given delay
   * @param eventProperties all properties that will be aggregated into an array and be sent after the delay if there is no other event received during this time window
   * @param delay the delay in milliseconds before sending the aggregated event, default is 10 seconds
   */
  aggregateTrack(event: EventType, eventProperties?: unknown, delay: number = Telemetry.DEFAULT_DELAY_AGGREGATE): void {
    // skip event ?
    if (this.shouldDropEvent(event)) {
      return;
    }

    const eventPropertiesOrEmpty = eventProperties ?? {};

    // if telemetry is not initialized, we store the event in a pending list
    // but aggregate the data
    if (!this.telemetryInitialized) {
      // search an existing event
      const existingItem = this.pendingItems.find(item => item.eventName === event);
      if (existingItem) {
        if (Array.isArray(existingItem.properties)) {
          // push item to the existing array
          existingItem.properties.push(eventPropertiesOrEmpty);
        } else {
          console.warn(`Event ${event} already exists in pending items, but properties is not an array. Overwriting.`);
          // overwrite the properties
          existingItem.properties = [eventPropertiesOrEmpty];
        }
      } else {
        // create a new item
        this.pendingItems.push({ eventName: event, properties: [eventPropertiesOrEmpty] });
      }
      return;
    }
    if (!this.telemetryEnabled) {
      return;
    }

    // is there an existing timeout for this event name ?
    const existingTimeoutData = this.aggregateTimeoutEvents.get(event);
    let propertiesToSend: unknown[];
    if (existingTimeoutData) {
      propertiesToSend = existingTimeoutData.properties.concat(eventPropertiesOrEmpty);
      // if yes, we clear it
      clearTimeout(existingTimeoutData.timeout);
    } else {
      propertiesToSend = [eventPropertiesOrEmpty];
    }

    const timeout = setTimeout(() => {
      // after delay, we send the aggregated event
      const telemetryData = { aggregated: propertiesToSend };
      this.internalTrack(event, telemetryData).catch((err: unknown) => {
        console.warn(`Error sending aggregated event: ${event}`, err);
      });
      // remove the timeout from the map
      this.aggregateTimeoutEvents.delete(event);
    }, delay);

    // sets a new timeout for this event name
    this.aggregateTimeoutEvents.set(event, { timeout, properties: propertiesToSend });
  }

  track(event: EventType, eventProperties?: unknown): void {
    // skip event ?
    if (this.shouldDropEvent(event)) {
      return;
    }

    if (!this.telemetryInitialized) {
      this.pendingItems.push({ eventName: event, properties: eventProperties });
    }
    if (!this.telemetryEnabled) {
      return;
    }
    this.internalTrack(event, eventProperties).catch((err: unknown) => {
      console.log(`Error sending event: ${event}`, err);
    });
  }

  async sendFeedback(feedbackProperties: FeedbackProperties): Promise<void> {
    if (!this.telemetryConfigured) {
      await this.initTelemetry();
    }
    this.internalTrack('feedback', feedbackProperties).catch((err: unknown) => {
      console.log(`Error sending feedback event: ${err}`);
    });
  }

  protected async getLocale(): Promise<string> {
    this.locale ??= osLocale().replace('_', '-');
    return this.locale;
  }

  protected async getSegmentIdentifyTraits(): Promise<UserTraits> {
    const locale = await this.getLocale();

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const os_version = os.release();
    const os_distribution = await this.getDistribution();
    const os_name = this.getPlatform();

    return {
      timezone,
      os_name,
      os_version,
      os_distribution,
      locale,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
  protected async getContext(): Promise<Object> {
    const locale = await this.getLocale();

    return {
      ip: '0.0.0.0',
      app: {
        name: app.getName(),
        version: app.getVersion(),
      },
      os: {
        name: this.getPlatform(),
        version: os.release(),
        arch: os.arch(),
      },
      locale,
      location: {
        country: app.getLocaleCountryCode(),
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  protected getPlatform(): string {
    const platform: string = os.platform();
    if (platform.startsWith('win')) {
      return 'Windows';
    }
    if (platform.startsWith('darwin')) {
      return 'Mac';
    }
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  }

  protected async getDistribution(): Promise<string | undefined> {
    if (os.platform() === 'linux') {
      try {
        const platform = (await promisify(getos)()) as LinuxOs;
        return platform.dist;
      } catch {
        return undefined;
      }
    }
    return undefined;
  }

  protected loadEnterpriseTelemetry(): void {
    const defaultTelemetryInfo = this.defaultConfiguration.getTelemetryInfo();
    const lockedTelemetryInfo = this.lockedConfiguration.getTelemetryInfo();

    if (defaultTelemetryInfo) {
      this.track(defaultTelemetryInfo.event, defaultTelemetryInfo.eventProperties);
    }

    if (lockedTelemetryInfo) {
      this.track(lockedTelemetryInfo.event, lockedTelemetryInfo.eventProperties);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RecordInfo = Record<string, any | TelemetryTrustedValue>;

export class TelemetryLoggerImpl implements TelemetryLogger {
  readonly isUsageEnabled = true;
  readonly isErrorsEnabled = true;

  private readonly _onDidChangeEnableStates = new Emitter<TelemetryLogger>();
  readonly onDidChangeEnableStates: Event<TelemetryLogger> = this._onDidChangeEnableStates.event;

  private commonProperties: RecordInfo = {};

  constructor(
    extensionInfo: { id: string; name: string; publisher: string; version: string },
    private sender: TelemetrySender,
    private options?: TelemetryLoggerOptions,
  ) {
    this.commonProperties = {
      'common.extensionName': `${extensionInfo.publisher}.${extensionInfo.name}`,
      'common.extensionVersion': extensionInfo.version,
    };
  }

  setupData(data?: RecordInfo): RecordInfo {
    data = data ?? {};

    if (this.options?.additionalCommonProperties) {
      data = { ...this.options.additionalCommonProperties, ...data };
    }

    if (!this.options?.ignoreBuiltInCommonProperties) {
      data = { ...this.commonProperties, ...data };
    }

    // for each trusted value, extract the value and remove the trusted value wrapper
    for (const key in data) {
      const value = data[key];
      if (value instanceof TypeTelemetryTrustedValue) {
        data[key] = value.value;
      }
    }

    return data;
  }

  logUsage(eventName: string, data?: RecordInfo): void {
    data = this.setupData(data);
    this.sender.sendEventData(eventName, data);
  }

  logError(eventName: string, data?: RecordInfo): void;
  logError(error: Error, data?: RecordInfo): void;
  logError(eventName: string | Error, data?: RecordInfo): void {
    data = this.setupData(data);

    let error;
    if (eventName instanceof Error) {
      error = eventName;
    } else {
      error = new Error(eventName);
    }
    this.sender.sendErrorData(error, data);
  }

  dispose(): void {
    this.commonProperties = {};
  }
}
