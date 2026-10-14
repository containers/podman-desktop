/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import type { ExtensionInfo, TelemetryMessages } from '@desktop-framework/api';
import { TelemetrySettings } from '@desktop-framework/api/telemetry';
import type { TelemetrySender } from '@desktop-framework/extension-api';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { DefaultConfiguration } from '/@/plugin/default-configuration.js';
import type { LockedConfiguration } from '/@/plugin/locked-configuration.js';
import { TelemetryTrustedValue } from '/@/plugin/types/telemetry.js';
import product from '/@product.json' with { type: 'json' };

// eslint-disable-next-line no-restricted-imports
import type * as TelemetryJSON from '../../../../../telemetry.json';
import type { CIDetection } from './ci-detection.js';
import type { EventType } from './telemetry.js';
import { Telemetry, TelemetryLoggerImpl } from './telemetry.js';

const getConfigurationMock = vi.fn();
const onDidChangeConfigurationMock = vi.fn();

const configurationRegistryMock = {
  getConfiguration: getConfigurationMock,
  onDidChangeConfiguration: onDidChangeConfigurationMock,
  registerConfigurations: vi.fn(),
  updateConfigurationValue: vi.fn(),
} as unknown as ConfigurationRegistry;

const defaultConfigurationMock = {
  getContent: vi.fn(),
  getTelemetryInfo: vi.fn(),
} as unknown as DefaultConfiguration;

const lockedConfigurationMock = {
  getContent: vi.fn(),
  getTelemetryInfo: vi.fn(),
} as unknown as LockedConfiguration;

const ciDetectionMock = {
  isCIEnvironment: vi.fn(),
} as unknown as CIDetection;

vi.mock(
  import('../../../../../telemetry.json'),
  () =>
    ({
      default: {
        rules: [
          {
            event: 'dropMe',
            disabled: true,
          },
          { event: 'sometimes', ratio: 0.5 },
          { event: 'list', frequency: 'dailyPerInstance' },
        ],
      },
    }) as unknown as typeof TelemetryJSON,
);

vi.mock(import('/@product.json'));

class TelemetryTest extends Telemetry {
  constructor() {
    super(configurationRegistryMock, defaultConfigurationMock, lockedConfigurationMock, ciDetectionMock);
  }
  public getLastTimeEvents(): Map<string, number> {
    return this.lastTimeEvents;
  }

  public getAggregateTimeoutEvents(): Map<string, { timeout: NodeJS.Timeout; properties: unknown[] }> {
    return this.aggregateTimeoutEvents;
  }

  public getPendingItems(): { eventName: string; properties?: unknown }[] {
    return this.pendingItems;
  }

  public override shouldDropEvent(eventName: string): boolean {
    return super.shouldDropEvent(eventName);
  }

  public override listenForTelemetryUpdates(): void {
    super.listenForTelemetryUpdates();
  }

  public override createBuiltinTelemetrySender(extensionInfo: ExtensionInfo): TelemetrySender {
    return super.createBuiltinTelemetrySender(extensionInfo);
  }

  public setTelemetryInitialized(value: boolean): void {
    this.telemetryInitialized = value;
  }

  public setTelemetryEnabled(value: boolean): void {
    this.telemetryEnabled = value;
  }

  public isEnabled(): boolean {
    return this.telemetryEnabled;
  }

  public isInitialized(): boolean {
    return this.telemetryInitialized;
  }

  public override async internalTrack(event: EventType, eventProperties?: unknown): Promise<void> {
    return super.internalTrack(event, eventProperties);
  }
}

let telemetry: TelemetryTest;

beforeEach(() => {
  telemetry = new TelemetryTest();
  getConfigurationMock.mockReturnValue({
    get: vi.fn(),
  });
  vi.mocked(ciDetectionMock.isCIEnvironment).mockReturnValue(false);
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Should not filter out basic event', async () => {
  expect(telemetry.shouldDropEvent('basic')).toBeFalsy();
});

test('Should not filter out a dailyPerInstance event if it is first time', async () => {
  expect(telemetry.shouldDropEvent('listFirstTime')).toBeFalsy();
});

test('Should filter out a dailyPerInstance event if last event was < 24h', async () => {
  // last call was 23h ago
  telemetry.getLastTimeEvents().set('listSecondTime', Date.now() - 1000 * 60 * 60 * 23);
  expect(telemetry.shouldDropEvent('listSecondTime')).toBeTruthy();
});

test('Should not filter out a dailyPerInstance event if last event was > 24h', async () => {
  // last call was 25h ago, so it should not be filtered out
  telemetry.getLastTimeEvents().set('listVeryVeryOldime', Date.now() - 1000 * 60 * 60 * 25);
  expect(telemetry.shouldDropEvent('listVeryVeryOldime')).toBeFalsy();
});

test('Should filter out a disabled event', async () => {
  expect(telemetry.shouldDropEvent('dropMe')).toBeTruthy();
});

test('Should filter out a ratio event sometimes', async () => {
  // this test will flake once every 8x10^62 times. if you are *that* unlucky, sorry
  let count = 0;
  for (let i = 0; i < 100; i++) {
    if (telemetry.shouldDropEvent('sometimes')) {
      count++;
    }
  }

  expect(count === 0).toBeFalsy();
  expect(count === 100).toBeFalsy();
});

test('Check Telemetry is enabled', async () => {
  getConfigurationMock.mockReturnValue({
    get: () => true,
  });

  const enabled = telemetry.isTelemetryEnabled();
  expect(enabled).toBeTruthy();
});

test('Check Telemetry is disabled', async () => {
  getConfigurationMock.mockReturnValue({
    get: () => false,
  });

  const enabled = telemetry.isTelemetryEnabled();
  expect(enabled).toBeFalsy();
});

test('Check propagate enablement event if configuration is updated', async () => {
  let hasBeenEnabled = false;
  telemetry.onDidChangeTelemetryEnabled(event => {
    hasBeenEnabled = event;
  });

  // simulate configuration change
  onDidChangeConfigurationMock.mockImplementation(callback => {
    // simulate telemetry.enabled = true
    callback({ value: true, key: `${TelemetrySettings.SectionName}.${TelemetrySettings.Enabled}` });
  });

  telemetry.listenForTelemetryUpdates();
  expect(hasBeenEnabled).toBeTruthy();
});

test('Enterprise configuration telemetry info is loaded upon init', async () => {
  await telemetry.init();
  expect(defaultConfigurationMock.getTelemetryInfo).toHaveBeenCalled();
  expect(lockedConfigurationMock.getTelemetryInfo).toHaveBeenCalled();
});

describe('CI environment', () => {
  let consoleWarnMock: MockInstance<typeof console.warn>;

  beforeEach(() => {
    consoleWarnMock = vi.spyOn(console, 'warn').mockReturnValue(undefined);
    vi.mocked(ciDetectionMock.isCIEnvironment).mockReturnValue(true);
  });

  test('Telemetry is disabled on init when a CI environment is detected', async () => {
    // telemetry is enabled and the user has been prompted
    getConfigurationMock.mockReturnValue({
      get: () => true,
    });

    await telemetry.init();

    expect(telemetry.isEnabled()).toBeFalsy();
    expect(telemetry.isInitialized()).toBeTruthy();
    expect(consoleWarnMock).toHaveBeenCalledWith('CI environment detected: telemetry is disabled for this run.');
  });

  test('Telemetry configuration is not updated when a CI environment is detected', async () => {
    await telemetry.init();

    // the user configuration and the welcome screen prompt are left untouched
    expect(configurationRegistryMock.updateConfigurationValue).not.toHaveBeenCalled();
  });

  test('Pending events are dropped when a CI environment is detected', async () => {
    telemetry.track('event-sent-before-init');
    expect(telemetry.getPendingItems()).toHaveLength(1);

    await telemetry.init();

    expect(telemetry.getPendingItems()).toHaveLength(0);
  });

  test('Events are not kept as pending after init on a CI', async () => {
    await telemetry.init();

    telemetry.track('event-sent-after-init');

    expect(telemetry.getPendingItems()).toHaveLength(0);
  });

  test('Telemetry stays disabled if the welcome screen asks to configure it on a CI', async () => {
    await telemetry.init();

    // the welcome screen configures the telemetry when the user accepts it
    await telemetry.configureTelemetry();

    expect(telemetry.isEnabled()).toBeFalsy();
    expect(telemetry.isInitialized()).toBeTruthy();
  });

  test('isTelemetryEnabled is false on a CI even if enabled in the configuration', async () => {
    getConfigurationMock.mockReturnValue({
      get: () => true,
    });
    await telemetry.init();

    expect(telemetry.isTelemetryEnabled()).toBeFalsy();
  });

  test('Telemetry follows the regular flow when no CI environment is detected', async () => {
    vi.mocked(ciDetectionMock.isCIEnvironment).mockReturnValue(false);

    await telemetry.init();

    expect(consoleWarnMock).not.toHaveBeenCalledWith(expect.stringContaining('CI environment detected'));
    // regular flow, the enterprise telemetry is loaded
    expect(defaultConfigurationMock.getTelemetryInfo).toHaveBeenCalled();
  });
});

describe('TelemetryLoggerImpl', () => {
  const sendEventDataMock = vi.fn();
  const sendErrorDataMock = vi.fn();
  const senderMock = {
    sendEventData: sendEventDataMock,
    sendErrorData: sendErrorDataMock,
  } as unknown as TelemetrySender;

  const dummyExtensionInfo: ExtensionInfo = {
    name: 'dummy',
    version: '1.0.0',
    publisher: 'bar',
  } as unknown as ExtensionInfo;

  test('check simple event', async () => {
    const telemetryLogger = new TelemetryLoggerImpl(dummyExtensionInfo, senderMock);

    // defaults are setup
    expect(telemetryLogger.isUsageEnabled).toBeTruthy();
    expect(telemetryLogger.isErrorsEnabled).toBeTruthy();
    telemetryLogger.logUsage('foo');
    expect(sendEventDataMock).toBeCalledWith('foo', {
      'common.extensionName': 'bar.dummy',
      'common.extensionVersion': '1.0.0',
    });
  });

  test('check additional properties', async () => {
    const telemetryLogger = new TelemetryLoggerImpl(dummyExtensionInfo, senderMock, {
      additionalCommonProperties: { customProp: 'customVal' },
    });

    telemetryLogger.logUsage('foo');
    expect(sendEventDataMock).toBeCalledWith(
      'foo',
      expect.objectContaining({
        customProp: 'customVal',
      }),
    );
  });

  test('check TelemetryTrustedValue', async () => {
    const telemetryLogger = new TelemetryLoggerImpl(dummyExtensionInfo, senderMock);

    telemetryLogger.logUsage('foo', { prop: new TelemetryTrustedValue('bar') });
    expect(sendEventDataMock).toBeCalledWith(
      'foo',
      expect.objectContaining({
        prop: 'bar',
      }),
    );
  });

  test('check string error event', async () => {
    const telemetryLogger = new TelemetryLoggerImpl(dummyExtensionInfo, senderMock);

    telemetryLogger.logError('foo');
    expect(sendErrorDataMock).toBeCalledWith(expect.any(Error), {
      'common.extensionName': 'bar.dummy',
      'common.extensionVersion': '1.0.0',
    });
  });

  test('check error event', async () => {
    const telemetryLogger = new TelemetryLoggerImpl(dummyExtensionInfo, senderMock);

    const fakeError = new Error('fake error');

    telemetryLogger.logError(fakeError, { add1: 'val1' });
    expect(sendErrorDataMock).toBeCalledWith(
      fakeError,
      expect.objectContaining({
        add1: 'val1',
      }),
    );
  });

  test('dispose', async () => {
    const telemetryLogger = new TelemetryLoggerImpl(dummyExtensionInfo, senderMock);

    expect(telemetryLogger['commonProperties']).toMatchObject({ 'common.extensionVersion': '1.0.0' });
    telemetryLogger.dispose();
    expect(telemetryLogger['commonProperties']).toStrictEqual({});
  });
});

// New tests for aggregateTrack
describe('aggregateTrack', () => {
  let internalTrackSpy: MockInstance;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useFakeTimers();
    telemetry.setTelemetryInitialized(true);
    telemetry.setTelemetryEnabled(true);
    internalTrackSpy = vi.spyOn(telemetry, 'internalTrack').mockResolvedValue();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('should skip event if shouldDropEvent returns true', () => {
    vi.spyOn(telemetry, 'shouldDropEvent').mockReturnValue(true);

    telemetry.aggregateTrack('dropMe', { foo: 'bar' });
    expect(telemetry.getAggregateTimeoutEvents().size).toBe(0);
  });
  test('should store in pendingItems if telemetry not initialized', () => {
    telemetry.setTelemetryInitialized(false);

    telemetry.aggregateTrack('eventA', { prop: 1 });
    expect(telemetry.getPendingItems()).toEqual([{ eventName: 'eventA', properties: [{ prop: 1 }] }]);
  });

  test('should aggregate and send after delay', async () => {
    telemetry.aggregateTrack('eventX', { count: 1 });
    telemetry.aggregateTrack('eventX', { count: 2 });

    expect(telemetry.getAggregateTimeoutEvents().get('eventX')?.properties).toEqual([{ count: 1 }, { count: 2 }]);

    vi.runAllTimers();
    await vi.waitFor(() =>
      expect(internalTrackSpy).toBeCalledWith('eventX', { aggregated: [{ count: 1 }, { count: 2 }] }),
    );
  });

  test('should clear previous timeout and reset it on repeated event', () => {
    telemetry.aggregateTrack('eventY', { value: 'first' });

    const initialTimeout = telemetry.getAggregateTimeoutEvents().get('eventY')?.timeout;
    telemetry.aggregateTrack('eventY', { value: 'second' });

    const updatedTimeout = telemetry.getAggregateTimeoutEvents().get('eventY')?.timeout;
    expect(initialTimeout).not.toBe(updatedTimeout);

    vi.runAllTimers();
    expect(internalTrackSpy).toBeCalledWith('eventY', { aggregated: [{ value: 'first' }, { value: 'second' }] });
  });

  test('should use default delay if not provided', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    telemetry.aggregateTrack('eventZ', { key: 'val' });
    vi.runAllTimers();
    await vi.waitFor(() =>
      expect(setTimeoutSpy).toBeCalledWith(expect.any(Function), Telemetry.DEFAULT_DELAY_AGGREGATE),
    );
  });

  test('should respect custom delay', async () => {
    const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
    telemetry.aggregateTrack('eventZ', { key: 'val' }, 5000);
    vi.runAllTimers();
    await vi.waitFor(() => expect(setTimeoutSpy).toBeCalledWith(expect.any(Function), 5_000));
  });

  test('should overwrite non-array properties in pendingItems if malformed', () => {
    telemetry.setTelemetryInitialized(false);
    telemetry.getPendingItems().push({
      eventName: 'badEvent',
      properties: { unexpected: 'format' }, // malformed
    });

    telemetry.aggregateTrack('badEvent', { corrected: true });
    expect(telemetry.getPendingItems().find(e => e.eventName === 'badEvent')?.properties).toEqual([
      { corrected: true },
    ]);
  });

  test('should skip event if telemetry is disabled', () => {
    telemetry.setTelemetryEnabled(false);

    telemetry.aggregateTrack('disabledEvent', { foo: 'bar' });

    expect(telemetry.getAggregateTimeoutEvents().size).toBe(0);
    expect(internalTrackSpy).not.toHaveBeenCalled();
  });

  test('should append properties to existing pending event when telemetry is not initialized', () => {
    telemetry.setTelemetryInitialized(false);

    // Push an initial pending item for the same event
    telemetry.getPendingItems().push({
      eventName: 'initEvent',
      properties: [{ foo: 1 }],
    });

    telemetry.aggregateTrack('initEvent', { bar: 2 });

    const pending = telemetry.getPendingItems().find(item => item.eventName === 'initEvent');
    expect(pending).toBeDefined();
    expect(Array.isArray(pending?.properties)).toBe(true);
    expect(pending?.properties).toEqual([{ foo: 1 }, { bar: 2 }]);
  });

  test('should register telemetry preference correctly', async () => {
    await telemetry.init();

    const messages = telemetry.getTelemetryMessages();
    expect(configurationRegistryMock.registerConfigurations).toHaveBeenCalledWith([
      expect.objectContaining({
        properties: expect.objectContaining({
          'telemetry.enabled': expect.objectContaining({
            markdownDescription: `${messages.acceptMessage} [${messages.info?.link}](${messages.info?.url})`,
          }),
        }),
      }),
    ]);
  });

  test('should return custom telemetry message', () => {
    vi.mocked(product).telemetry.acceptMessage = 'Accept message';
    vi.mocked(product).telemetry.info.link = 'Info message';
    vi.mocked(product).telemetry.info.url = 'info-url';
    vi.mocked(product).telemetry.privacy.link = 'Privacy message';
    vi.mocked(product).telemetry.privacy.url = 'privacy-url';

    const messages = telemetry.getTelemetryMessages();
    expect(messages.acceptMessage).toBe('Accept message');
    expect(messages.info?.link).toBe('Info message');
    expect(messages.info?.url).toBe('info-url');
    expect(messages.privacy?.link).toBe('Privacy message');
    expect(messages.privacy?.url).toBe('privacy-url');
  });

  test('preference should be formatted correctly when no link is provided', async () => {
    vi.mocked(telemetry).getTelemetryMessages = vi.fn().mockReturnValue({
      acceptMessage: 'Accept message',
    } as TelemetryMessages);
    await telemetry.init();

    const messages = telemetry.getTelemetryMessages();
    expect(configurationRegistryMock.registerConfigurations).toHaveBeenCalledWith([
      expect.objectContaining({
        properties: expect.objectContaining({
          'telemetry.enabled': expect.objectContaining({
            markdownDescription: `${messages.acceptMessage}`,
          }),
        }),
      }),
    ]);
  });
});
