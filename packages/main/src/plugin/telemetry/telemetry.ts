/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import type {
  TelemetryLogger,
  TelemetryLoggerOptions,
  TelemetrySender,
  TelemetryTrustedValue,
} from '@podman-desktop/api';
import { Analytics, type UserTraits } from '@segment/analytics-node';
import { app } from 'electron';
import type { LinuxOs } from 'getos';
import getos from 'getos';
import * as osLocale from 'os-locale';

import { default as telemetry } from '../../../../../telemetry.json';
import { stoppedExtensions } from '../../util.js';
import type { ConfigurationRegistry, IConfigurationNode } from '../configuration-registry.js';
import type { Event } from '../events/emitter.js';
import { Emitter } from '../events/emitter.js';
import type { Proxy } from '../proxy.js';
import { TelemetryTrustedValue as TypeTelemetryTrustedValue } from '../types/telemetry.js';
import { Identity } from './identity.js';
import type { TelemetryRule } from './telemetry-api.js';
import { TelemetrySettings } from './telemetry-settings.js';

export const TRACK_EVENT_TYPE = 'track';
export const PAGE_EVENT_TYPE = 'page';
export const STARTUP_EVENT_TYPE = 'startup';
export const SHUTDOWN_EVENT_TYPE = 'shutdown';
export const FEEDBACK_EVENT_TYPE = 'feedback';

export type EventType =
  | typeof TRACK_EVENT_TYPE
  | typeof PAGE_EVENT_TYPE
  | typeof STARTUP_EVENT_TYPE
  | typeof SHUTDOWN_EVENT_TYPE
  | typeof FEEDBACK_EVENT_TYPE
  | string;

/**
 * Handle the telemetry reporting.
 */
export class Telemetry {
  private static readonly SEGMENT_KEY = 'Mhl7GXADk5M1vG6r9FXztbCqWRQY8XPy';

  private cachedTelemetrySettings: TelemetryRule[] | undefined;
  private regexp: Map<string, RegExp> = new Map();

  private identity: Identity;

  private locale: string | undefined;

  private analytics: Analytics | undefined;

  private telemetryEnabled = false;

  private telemetryInitialized = false;

  private telemetryConfigured = false;

  private pendingItems: { eventName: string; properties: unknown }[] = [];

  protected lastTimeEvents: Map<string, number>;

  private readonly _onDidChangeTelemetryEnabled = new Emitter<boolean>();
  readonly onDidChangeTelemetryEnabled: Event<boolean> = this._onDidChangeTelemetryEnabled.event;

  constructor(
    private configurationRegistry: ConfigurationRegistry,
    private proxy: Proxy,
  ) {
    this.identity = new Identity();
    this.lastTimeEvents = new Map();
  }

  async init(): Promise<void> {
    const telemetryConfigurationNode: IConfigurationNode = {
      id: 'preferences.telemetry',
      title: 'Telemetry',
      type: 'object',
      properties: {
        [TelemetrySettings.SectionName + '.' + TelemetrySettings.Enabled]: {
          markdownDescription:
            'Help improve Podman Desktop by allowing anonymous usage data to be sent to Red Hat. Read our [Privacy statement](https://developers.redhat.com/article/tool-data-collection)',
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

    // initalize objects
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
    const telemetryConfiguration = this.configurationRegistry.getConfiguration(TelemetrySettings.SectionName);
    const enabled = telemetryConfiguration.get<boolean>(TelemetrySettings.Enabled);
    return enabled === true;
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
        thisArg.track.apply(thisArg, [`${extensionInfo.id}.${eventName}`, data]);
      },
      // report using the id of the extension suffixed by error
      sendErrorData(error: Error, data?: Record<string, unknown>): void {
        data = data ?? {};
        data.sourceError = error.message;
        thisArg.track.apply(thisArg, [`${extensionInfo.id}.error`, data]);
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
    if (!sender) {
      sender = this.createBuiltinTelemetrySender(extensionInfo);
    }

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
    if (this.telemetryInitialized) {
      return;
    }

    await this.initTelemetry();

    this.internalTrack(STARTUP_EVENT_TYPE).catch((err: unknown) => {
      console.log(`Error sending startup event: ${err}`);
    });
    let sendShutdownAnalytics = false;

    app.on('before-quit', e => {
      if (!sendShutdownAnalytics && stoppedExtensions.val) {
        e.preventDefault();
        try {
          this.internalTrack(SHUTDOWN_EVENT_TYPE).catch((err: unknown) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected async internalTrack(event: EventType, eventProperties?: any): Promise<void> {
    const anonymousId = await this.identity.getUserId();

    const context = await this.getContext();
    if (!eventProperties) {
      eventProperties = {};
    }

    const integrations = {
      All: true,
    };

    if (event === PAGE_EVENT_TYPE) {
      const name = eventProperties?.name;

      this.analytics?.page({ anonymousId, name, context, integrations });
    } else {
      const properties = {
        app_name: app.getName(),
        app_version: app.getVersion(),
        ...eventProperties,
      };

      this.analytics?.track({ anonymousId, event, context, properties, integrations });
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
            return false;
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  track(event: EventType, eventProperties?: any): void {
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

  async sendFeedback(feedbackProperties: unknown): Promise<void> {
    if (!this.telemetryConfigured) {
      await this.initTelemetry();
    }
    this.internalTrack('feedback', feedbackProperties).catch((err: unknown) => {
      console.log(`Error sending feedback event: ${err}`);
    });
  }

  protected async getLocale(): Promise<string> {
    if (!this.locale) {
      this.locale = (await osLocale.osLocale()).replace('_', '-');
    }
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

  // eslint-disable-next-line @typescript-eslint/ban-types
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
        const platorm = (await promisify(getos)()) as LinuxOs;
        return platorm.dist;
      } catch {
        return undefined;
      }
    }
    return undefined;
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

    let error = eventName;
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
