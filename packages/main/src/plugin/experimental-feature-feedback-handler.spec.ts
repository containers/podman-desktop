/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import type { Configuration } from '@desktop-framework/extension-api';
import type Electron from 'electron';
import { shell } from 'electron';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from './configuration-registry.js';
import type { ExperimentalConfiguration, Timestamp } from './experimental-feature-feedback-handler.js';
import { ExperimentalFeatureFeedbackHandler } from './experimental-feature-feedback-handler.js';
import type { MessageBox } from './message-box.js';
import type { Telemetry } from './telemetry/telemetry.js';

vi.mock(
  import('electron'),
  () =>
    ({
      shell: {
        openExternal: vi.fn().mockResolvedValue(undefined),
      },
    }) as unknown as typeof Electron,
);

const features: Record<string, IConfigurationPropertyRecordedSchema> = {
  'feat.feature1': {
    title: 'feat.feature1',
    parentId: 'parent1',
    experimental: { githubDiscussionLink: 'https://feature.link.1.com' },
  },
  'feat.feature2': {
    title: 'feat.feature2',
    parentId: 'parent2',
    experimental: { githubDiscussionLink: 'https://feature.link.2.com' },
  },
  'feat.feature3': {
    title: 'feat.feature3',
    parentId: 'parent3',
    experimental: { githubDiscussionLink: 'https://feature.link.3.com' },
  },
  feature4: { title: 'feat.feature3', parentId: 'parent3' },
};

const registerConfigurationsMock = vi.fn();

const configurationRegistry: ConfigurationRegistry = {
  onDidChangeConfiguration: vi.fn(),
  registerConfigurations: registerConfigurationsMock,
  getConfigurationProperties: vi.fn(),
  getConfiguration: vi.fn(),
} as unknown as ConfigurationRegistry;

const configurationGetMock = vi.fn();
const updateMock = vi.fn().mockResolvedValue(undefined);

const telemetryTrackMock = vi.fn().mockResolvedValue({});
const telemetry: Telemetry = { track: telemetryTrackMock } as unknown as Telemetry;

const configuration: Configuration = {
  get: configurationGetMock,
  has: () => true,
  update: updateMock,
};

const messageBox: MessageBox = {
  showMessageBox: vi.fn(),
} as unknown as MessageBox;

class TestExperimentalFeatureFeedbackHandler extends ExperimentalFeatureFeedbackHandler {
  override experimentalFeatures: Map<string, ExperimentalConfiguration> = new Map<string, ExperimentalConfiguration>();

  override setTimestamp(feature: string, days: Timestamp): void {
    return super.setTimestamp(feature, days);
  }

  override setReminder(configurationName: string): void {
    return super.setReminder(configurationName);
  }

  override async showFeedbackDialog(): Promise<void> {
    return super.showFeedbackDialog();
  }

  override async save(id: string): Promise<void> {
    return super.save(id);
  }

  override disableFeature(id: string): void {
    return super.disableFeature(id);
  }

  override init(): Promise<void> {
    return super.init();
  }
}

const setReminderSpy = vi.spyOn(TestExperimentalFeatureFeedbackHandler.prototype, 'setReminder');
const setTimestampSpy = vi.spyOn(TestExperimentalFeatureFeedbackHandler.prototype, 'setTimestamp');
const disableFeatureSpy = vi.spyOn(TestExperimentalFeatureFeedbackHandler.prototype, 'disableFeature');

let feedbackForm: TestExperimentalFeatureFeedbackHandler;

/** Listeners registered through the fake api sender, by channel. */
let listeners: Map<string, Array<() => void>>;
const apiSenderDispose = vi.fn();
const apiSender = {
  send: vi.fn(),
  receive: vi.fn((channel: string, func: () => void) => {
    listeners.set(channel, [...(listeners.get(channel) ?? []), func]);
    return { dispose: apiSenderDispose };
  }),
} as unknown as ApiSenderType;

/** Fire a channel the way the plugin system does once extensions are up. */
function emit(channel: string): void {
  for (const listener of listeners.get(channel) ?? []) listener();
}

beforeEach(() => {
  vi.resetAllMocks();
  listeners = new Map();
  feedbackForm = new TestExperimentalFeatureFeedbackHandler(configurationRegistry, messageBox, telemetry, apiSender);

  vi.spyOn(feedbackForm, 'save').mockResolvedValue(undefined);
});

describe('init', () => {
  test('should register feedback dialog configuration', async () => {
    configurationGetMock.mockReturnValue({});
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);

    await feedbackForm.init();

    expect(registerConfigurationsMock).toHaveBeenCalledTimes(1);
    expect(registerConfigurationsMock).toHaveBeenCalledWith([
      {
        id: 'preferences.feedback',
        title: 'Feedback reminder',
        type: 'object',
        properties: {
          'feedback.dialog': {
            description: 'Show periodic feedback reminder for experimental features',
            type: 'boolean',
            default: true,
          },
        },
      },
    ]);
  });

  test('should setup reminders on first run', async () => {
    configurationGetMock.mockReturnValue({});
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    await feedbackForm.init();

    expect(setReminderSpy).toHaveBeenCalledTimes(3);
    expect(setReminderSpy).toHaveBeenCalledWith('feat.feature1');
    expect(setReminderSpy).toHaveBeenCalledWith('feat.feature2');
    expect(setReminderSpy).toHaveBeenCalledWith('feat.feature3');
  });

  test('should NOT setup reminders when no configuration exist', async () => {
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    await feedbackForm.init();

    expect(setReminderSpy).not.toBeCalled();
  });

  test('should load existing configurations without showing the dialog', async () => {
    const conf = { remindAt: 123456, disabled: false };
    configurationGetMock.mockReturnValue(conf);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    const showFeedbackDialogSpy = vi.spyOn(feedbackForm, 'showFeedbackDialog').mockResolvedValue(undefined);

    await feedbackForm.init();

    expect(setReminderSpy).not.toHaveBeenCalled();
    expect(feedbackForm.experimentalFeatures.get('feat.feature1')).toEqual(conf);

    // init() runs while the renderer is still loading: the dialog it would show
    // has nobody listening for it yet, which is the defect this fixes.
    expect(showFeedbackDialogSpy).not.toHaveBeenCalled();
  });

  test('should show the dialog when extensions have started', async () => {
    const conf = { remindAt: 123456, disabled: false };
    configurationGetMock.mockReturnValue(conf);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    const showFeedbackDialogSpy = vi.spyOn(feedbackForm, 'showFeedbackDialog').mockResolvedValue(undefined);

    await feedbackForm.init();
    expect(showFeedbackDialogSpy).not.toHaveBeenCalled();

    emit('extensions-started');

    expect(showFeedbackDialogSpy).toHaveBeenCalledOnce();
  });

  test('should subscribe to the readiness event rather than to anything of its own', async () => {
    configurationGetMock.mockReturnValue({});
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);

    await feedbackForm.init();

    // The channel is the one the plugin system already sends and other main-side
    // consumers already listen to; nothing feature-specific was invented for it.
    expect(apiSender.receive).toHaveBeenCalledWith('extensions-started', expect.any(Function));
  });

  test('should drop the subscription when disposed', async () => {
    // registerConfigurations is pushed onto the same disposables list, so it has
    // to return one here — no test disposed this handler before now.
    registerConfigurationsMock.mockReturnValue({ dispose: vi.fn() });
    configurationGetMock.mockReturnValue({});
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);

    await feedbackForm.init();
    feedbackForm.dispose();

    expect(apiSenderDispose).toHaveBeenCalled();
  });

  test(`should skip disabled features with 'false' value`, async () => {
    const conf = false;
    configurationGetMock.mockReturnValue(conf);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);

    const setSpy = vi.spyOn(feedbackForm.experimentalFeatures, 'set');
    const saveSpy = vi.spyOn(feedbackForm, 'save');

    await feedbackForm.init();

    expect(setReminderSpy).not.toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(feedbackForm.experimentalFeatures.get('feat.feature1')).toBe(undefined);
  });
});

describe('save', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
  });

  test('should call update with valid data for enabled experimental config', async () => {
    const conf = { remindAt: 123456, disabled: false };
    vi.spyOn(feedbackForm.experimentalFeatures, 'get').mockReturnValue(conf);

    await feedbackForm.save('feat.feature1');

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith('feature1', conf);
  });

  test('should call update with undefined for missing experimental config', async () => {
    vi.spyOn(feedbackForm.experimentalFeatures, 'get').mockReturnValue(undefined);

    await feedbackForm.save('feat.feature1');

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(updateMock).toHaveBeenCalledWith('feature1', undefined);
  });
});

describe('setTimestamp', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should set timestamp when days are defined', () => {
    const MOCK_NOW = new Date('2025-01-01T12:00:00.000Z');
    vi.setSystemTime(MOCK_NOW);

    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);

    const setSpy = vi.spyOn(feedbackForm.experimentalFeatures, 'set');

    const days = 42;
    const expectedTimestamp = new Date(MOCK_NOW.getTime() + days * 24 * 60 * 60 * 1_000).getTime();

    feedbackForm.setTimestamp('feature1', days);

    expect(setSpy).toHaveBeenCalledTimes(1);
    expect(setSpy).toHaveBeenCalledWith('feature1', { remindAt: expectedTimestamp, disabled: false });
  });

  test('should set timestamp when days are not defined', () => {
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);

    feedbackForm.setTimestamp('feature1', undefined);

    expect(setTimestampSpy).toHaveBeenCalledTimes(1);
    expect(setTimestampSpy).toHaveBeenCalledWith('feature1', undefined);
  });
});

describe('setReminder', () => {
  test('feature is defined in configurationRegistry', () => {
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    configurationGetMock.mockReturnValue(true);

    feedbackForm.setReminder('feat.feature1');
    expect(setTimestampSpy).toBeCalledWith('feat.feature1', 2);
  });

  test('feature is not defined in configurationRegistry', () => {
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    configurationGetMock.mockReturnValue(false);

    const setTimestampSpy = vi.spyOn(feedbackForm, 'setTimestamp');
    feedbackForm.setReminder('feat.feature42');
    expect(setTimestampSpy).toBeCalledWith('feat.feature42', undefined);
  });
});

describe('showFeedbackDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    const MOCK_NOW = new Date('2025-01-01T12:00:00.000Z');
    vi.setSystemTime(MOCK_NOW);
    configurationGetMock.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('should open external link when user clicks "Share Feedback"', async () => {
    const pastTimestamp = new Date('2020-01-01T00:00:00.000Z').getTime();
    const existingTimestamps = { remindAt: pastTimestamp, disabled: false };
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Share Feedback on GitHub' });
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    const openExternalSpy = vi.spyOn(shell, 'openExternal').mockResolvedValue(undefined);

    feedbackForm.experimentalFeatures = new Map([['feat.feature1', existingTimestamps]]);
    await feedbackForm.showFeedbackDialog();

    expect(messageBox.showMessageBox).toHaveBeenCalledTimes(1);
    expect(openExternalSpy).toHaveBeenCalledWith('https://feature.link.1.com');
    expect(setTimestampSpy).toHaveBeenCalledWith('feat.feature1', undefined);
    expect(telemetry.track).toHaveBeenCalled();
  });

  test('should set timestamp for 1 day when user selects "Remind me tomorrow"', async () => {
    const pastTimestamp = new Date('2020-01-01T00:00:00.000Z').getTime();
    const existingTimestamps = { remindAt: pastTimestamp, disabled: false };
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Remind me later', dropdownIndex: 0 });
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    const openExternalSpy = vi.spyOn(shell, 'openExternal').mockResolvedValue(undefined);

    feedbackForm.experimentalFeatures = new Map([['feat.feature1', existingTimestamps]]);
    await feedbackForm.showFeedbackDialog();

    expect(setTimestampSpy).toHaveBeenCalledWith('feat.feature1', 1);
    expect(openExternalSpy).not.toHaveBeenCalled();
    expect(telemetry.track).toHaveBeenCalled();
  });

  test('should set timestamp for 2 days when user selects "Remind me in 2 days"', async () => {
    const pastTimestamp = new Date('2020-01-01T00:00:00.000Z').getTime();
    const existingTimestamps = { remindAt: pastTimestamp, disabled: false };
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Remind me later', dropdownIndex: 1 });
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    const openExternalSpy = vi.spyOn(shell, 'openExternal').mockResolvedValue(undefined);

    feedbackForm.experimentalFeatures = new Map([['feat.feature1', existingTimestamps]]);
    await feedbackForm.showFeedbackDialog();

    expect(setTimestampSpy).toHaveBeenCalledWith('feat.feature1', 2);
    expect(openExternalSpy).not.toHaveBeenCalled();
    expect(telemetry.track).toHaveBeenCalled();
  });

  test('should call disableFeature when user selects "Dont show again"', async () => {
    const pastTimestamp = new Date('2020-01-01T00:00:00.000Z').getTime();
    const existingTimestamps = { remindAt: pastTimestamp, disabled: false };
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(messageBox.showMessageBox).mockResolvedValue({ response: 'Remind me later', dropdownIndex: 2 });
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);
    const openExternalSpy = vi.spyOn(shell, 'openExternal').mockResolvedValue(undefined);

    feedbackForm.experimentalFeatures = new Map([['feat.feature1', existingTimestamps]]);
    await feedbackForm.showFeedbackDialog();

    expect(setTimestampSpy).not.toHaveBeenCalled();
    expect(openExternalSpy).not.toHaveBeenCalled();
    expect(disableFeatureSpy).toBeCalledTimes(1);
    expect(disableFeatureSpy).toBeCalledWith('feat.feature1');
    expect(telemetry.track).toHaveBeenCalled();
  });

  test('should NOT show a dialog if the timestamp is in the future', async () => {
    const futureTimestamp = new Date('2100-01-01T00:00:00.000Z').getTime();
    const existingTimestamps = { remindAt: futureTimestamp, disabled: true };
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);

    feedbackForm.experimentalFeatures = new Map([['feat.feature1', existingTimestamps]]);
    await feedbackForm.showFeedbackDialog();
    expect(messageBox.showMessageBox).not.toHaveBeenCalled();
    expect(telemetry.track).not.toHaveBeenCalled();
  });

  test('should NOT show dialog when is a feature disabled', async () => {
    const pastTimestamp = new Date('2020-01-01T00:00:00.000Z').getTime();
    const existingTimestamps = { remindAt: pastTimestamp, disabled: true };
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);

    feedbackForm.experimentalFeatures = new Map([['feat.feature1', existingTimestamps]]);
    await feedbackForm.showFeedbackDialog();

    expect(setTimestampSpy).not.toHaveBeenCalled();
    expect(disableFeatureSpy).not.toHaveBeenCalled();
    expect(telemetry.track).not.toHaveBeenCalled();
  });

  test('should NOT show dialog when feedback is globally disabled', async () => {
    const pastTimestamp = new Date('2020-01-01T00:00:00.000Z').getTime();
    const existingTimestamps = { remindAt: pastTimestamp, disabled: false };
    configurationGetMock.mockReturnValue(false);
    vi.mocked(configurationRegistry.getConfigurationProperties).mockReturnValue(features);
    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue(configuration);

    feedbackForm.experimentalFeatures = new Map([['feat.feature1', existingTimestamps]]);
    await feedbackForm.showFeedbackDialog();

    expect(messageBox.showMessageBox).not.toHaveBeenCalled();
    expect(setTimestampSpy).not.toHaveBeenCalled();
    expect(disableFeatureSpy).not.toHaveBeenCalled();
    expect(telemetry.track).not.toHaveBeenCalled();
  });
});

describe('disableFeature', () => {
  test('should set disable of enabled feature', () => {
    const feat = 'feat.feature1';
    const pastTimestamp = new Date('2020-01-01T00:00:00.000Z').getTime();
    const existingTimestamps = { remindAt: pastTimestamp, disabled: false };
    feedbackForm.experimentalFeatures = new Map([[feat, existingTimestamps]]);
    const setSpy = vi.spyOn(feedbackForm.experimentalFeatures, 'set');
    feedbackForm.disableFeature(feat);

    expect(setSpy).toHaveBeenCalledWith(feat, { remindAt: pastTimestamp, disabled: true });
  });

  test('should NOT set disable of feature that is not enabled', () => {
    const feat = 'feat.feature1';
    const setSpy = vi.spyOn(feedbackForm.experimentalFeatures, 'set');
    feedbackForm.disableFeature(feat);

    expect(setSpy).not.toBeCalled();
  });
});
