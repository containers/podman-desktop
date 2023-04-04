/**********************************************************************
 * Copyright (C) 2022, 2023 Red Hat, Inc.
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

import Analytics from 'analytics-node';
import { app } from 'electron';
import { Identity } from './identity';
import * as os from 'node:os';
import type { LinuxOs } from 'getos';
import getos from 'getos';
import * as osLocale from 'os-locale';
import { promisify } from 'node:util';
import type { ConfigurationRegistry, IConfigurationNode } from '../configuration-registry';
import { TelemetrySettings } from './telemetry-settings';

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

  private identity: Identity;

  private locale: string | undefined;

  private analytics: Analytics | undefined;

  private telemetryEnabled = false;

  private telemetryInitialized = false;

  private telemetryConfigured = false;

  private pendingItems: { eventName: string; properties: unknown }[] = [];

  protected lastTimeEvents: Map<string, number>;

  constructor(private configurationRegistry: ConfigurationRegistry) {
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
          description: 'Enable telemetry',
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

    // initalize objects
    this.analytics = new Analytics(Telemetry.SEGMENT_KEY);

    // needs to prompt the user for the first time he launches the app
    if (check) {
      const enabled = telemetryConfiguration.get<boolean>(TelemetrySettings.Enabled);
      if (enabled === true) {
        await this.configureTelemetry();
      } else {
        this.telemetryInitialized = true;

        // clear pending items
        this.pendingItems.length = 0;
      }
    }
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

    this.internalTrack(STARTUP_EVENT_TYPE);
    let sendShutdownAnalytics = false;

    app.on('before-quit', async e => {
      if (!sendShutdownAnalytics) {
        e.preventDefault();
        await this.internalTrack(SHUTDOWN_EVENT_TYPE);
        await this.analytics?.flush();
        sendShutdownAnalytics = true;
        app.quit();
      }
    });

    // send all pending items
    this.pendingItems.forEach(item => {
      this.internalTrack(item.eventName, item.properties);
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
    // if event is a list event (start with 'list'), do not send it more than one per day
    if (eventName.startsWith('list')) {
      // do we have an existing event with the same name?
      const previousTime = this.lastTimeEvents.get(eventName);
      // it was not there, so we can send it
      if (!previousTime) {
        this.lastTimeEvents.set(eventName, Date.now());
        return false;
      }
      // it was there, so we check if it was more than 24h ago
      const now = Date.now();
      const diff = now - previousTime;
      if (diff > 24 * 60 * 60 * 1000) {
        this.lastTimeEvents.set(eventName, now);
        return false;
      }
      return true;
    }
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async track(event: EventType, eventProperties?: any): Promise<void> {
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
    this.internalTrack(event, eventProperties);
  }

  async sendFeedback(feedbackProperties: unknown): Promise<void> {
    if (!this.telemetryConfigured) {
      await this.initTelemetry();
    }
    this.internalTrack('feedback', feedbackProperties);
  }

  protected async getLocale(): Promise<string> {
    if (!this.locale) {
      this.locale = (await osLocale.osLocale()).replace('_', '-');
    }
    return this.locale;
  }

  protected async getSegmentIdentifyTraits(): Promise<unknown> {
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

  protected async getContext(): Promise<unknown> {
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
