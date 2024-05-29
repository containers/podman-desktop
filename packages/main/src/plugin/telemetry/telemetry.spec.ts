/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { TelemetrySender } from '@podman-desktop/api';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ExtensionInfo } from '/@api/extension-info.js';

import type { ConfigurationRegistry } from '../configuration-registry.js';
import type { Proxy } from '../proxy.js';
import { TelemetryTrustedValue } from '../types/telemetry.js';
import { Telemetry, TelemetryLoggerImpl } from './telemetry.js';
import { TelemetrySettings } from './telemetry-settings.js';

const getConfigurationMock = vi.fn();
const onDidChangeConfigurationMock = vi.fn();

const configurationRegistryMock = {
  getConfiguration: getConfigurationMock,
  onDidChangeConfiguration: onDidChangeConfigurationMock,
} as unknown as ConfigurationRegistry;

vi.mock('../../../../../telemetry.json', () => ({
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
}));

class TelemetryTest extends Telemetry {
  constructor() {
    super(configurationRegistryMock, {} as Proxy);
  }
  public getLastTimeEvents(): Map<string, number> {
    return this.lastTimeEvents;
  }

  public shouldDropEvent(eventName: string): boolean {
    return super.shouldDropEvent(eventName);
  }

  public listenForTelemetryUpdates(): void {
    super.listenForTelemetryUpdates();
  }

  public createBuiltinTelemetrySender(extensionInfo: ExtensionInfo): TelemetrySender {
    return super.createBuiltinTelemetrySender(extensionInfo);
  }
}

let telemetry: TelemetryTest;

beforeEach(() => {
  telemetry = new TelemetryTest();
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

    expect((telemetryLogger as any).commonProperties).toMatchObject({ 'common.extensionVersion': '1.0.0' });
    telemetryLogger.dispose();
    expect((telemetryLogger as any).commonProperties).toStrictEqual({});
  });
});
