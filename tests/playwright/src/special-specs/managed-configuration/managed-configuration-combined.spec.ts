/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { Locator } from '@playwright/test';
import { expect as playExpect } from '@playwright/test';

import { Preferences } from '/@/model/core/settings/preferences';
import { PreferencesPage } from '/@/model/pages/preferences-page';
import { RunnerOptions } from '/@/runner/runner-options';
import { test } from '/@/utility/fixtures';

let preferencesPage: PreferencesPage;

test.use({
  runnerOptions: new RunnerOptions({
    customFolder: 'managed-configuration',
    customSettings: {
      'feedback.dialog': false,
      'preferences.appearance': 'system',
      'tasks.Toast': true,
    },
  }),
});

test.beforeAll(async ({ runner, welcomePage, navigationBar }) => {
  test.setTimeout(120_000);
  runner.setVideoAndTraceName('managed-configuration-combined-e2e');
  await welcomePage.handleWelcomePage(true);
  const settingsBar = await navigationBar.openSettings();
  preferencesPage = await settingsBar.openTabPage(PreferencesPage);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Managed Configuration - preferences', { tag: '@managed-configuration' }, () => {
  test.describe.configure({ mode: 'serial' });
  test.describe('User preference: Appearance', () => {
    test.describe.configure({ mode: 'serial' });
    let value: string;
    test('Expected settings value', async () => {
      const appearanceRow = preferencesPage.getPreferenceRowByName(Preferences.Labels.APPEARANCE);
      await playExpect(appearanceRow).toBeAttached();

      const isManaged = await preferencesPage.isPreferenceManaged(Preferences.Labels.APPEARANCE);
      playExpect(isManaged).toBeFalsy();

      value = await preferencesPage.getPreferenceDropdownValue(Preferences.Labels.APPEARANCE);
      playExpect(value).toBe('system');
    });
    test('Preference can be changed', async () => {
      await preferencesPage.setPreferenceDropdownValue(Preferences.Labels.APPEARANCE, 'dark');

      value = await preferencesPage.getPreferenceDropdownValue(Preferences.Labels.APPEARANCE);
      playExpect(value).toBe('dark');
    });
    test('Reset preference to default', async () => {
      await preferencesPage.resetPreference(Preferences.Labels.APPEARANCE);
      await playExpect
        .poll(
          async () => {
            return preferencesPage.getPreferenceDropdownValue(Preferences.Labels.APPEARANCE);
          },
          {
            timeout: 5000,
            message: 'Appearance preference did not reset to default value',
          },
        )
        .toBe('system');
    });
  });

  test.describe('User + Defaults preference: Feedback Dialog', () => {
    test.describe.configure({ mode: 'serial' });
    let value: boolean;
    test('Expected settings value', async () => {
      const feedbackDialogRow = preferencesPage.getPreferenceRowByName(Preferences.Labels.FEEDBACK_DIALOG);
      await playExpect(feedbackDialogRow).toBeAttached();

      const isManaged = await preferencesPage.isPreferenceManaged(Preferences.Labels.FEEDBACK_DIALOG);
      playExpect(isManaged).toBeFalsy();

      value = await preferencesPage.getPreferenceCheckboxValue(
        Preferences.Labels.FEEDBACK_DIALOG,
        Preferences.FEEDBACK_DIALOG_TOGGLE_BUTTON_LABEL,
      );
      playExpect(value).toBe(false);
    });
    test('Preference can be reset', async () => {
      await preferencesPage.resetPreference(Preferences.Labels.FEEDBACK_DIALOG);
      await playExpect
        .poll(
          async () => {
            return await preferencesPage.getPreferenceCheckboxValue(
              Preferences.Labels.FEEDBACK_DIALOG,
              Preferences.FEEDBACK_DIALOG_TOGGLE_BUTTON_LABEL,
            );
          },
          {
            timeout: 5000,
            message: 'Feedback Dialog preference did not reset to default value',
          },
        )
        .toBe(true);
    });
    test('Preference can be changed', async () => {
      await preferencesPage.togglePreferenceCheckbox(
        Preferences.Labels.FEEDBACK_DIALOG,
        Preferences.FEEDBACK_DIALOG_TOGGLE_BUTTON_LABEL,
      );

      value = await preferencesPage.getPreferenceCheckboxValue(
        Preferences.Labels.FEEDBACK_DIALOG,
        Preferences.FEEDBACK_DIALOG_TOGGLE_BUTTON_LABEL,
      );
      playExpect(value).toBe(false);
    });
  });

  test.describe('User + Locked preference: Toast', () => {
    test.describe.configure({ mode: 'serial' });
    let toastRow: Locator;
    let value: boolean;
    test('Expected settings value', async () => {
      toastRow = preferencesPage.getPreferenceRowByName(Preferences.Labels.TOAST);
      await playExpect(toastRow).toBeAttached();

      const isManaged = await preferencesPage.isPreferenceManaged(Preferences.Labels.TOAST);
      playExpect(isManaged).toBeTruthy();

      value = await preferencesPage.getPreferenceCheckboxValue(
        Preferences.Labels.TOAST,
        Preferences.TOAST_NOTIFICATION_TOGGLE_BUTTON_LABEL,
      );
      playExpect(value).toBeTruthy();
    });
    test('Preference can not be changed', async () => {
      const selectionToggle = toastRow.getByLabel(Preferences.TOAST_NOTIFICATION_TOGGLE_BUTTON_LABEL);
      await playExpect(selectionToggle).toBeDisabled();
    });
    test('Preference can not be reset', async () => {
      const resetButton = toastRow.getByRole('button', { name: 'Reset to default value' });
      await playExpect(resetButton).not.toBeAttached();
    });
  });

  test.describe('Defaults preference: Zoom Level', () => {
    test.describe.configure({ mode: 'serial' });
    let value: string;
    test('Expected settings value', async () => {
      const zoomLevelRow = preferencesPage.getPreferenceRowByName(Preferences.Labels.ZOOM_LEVEL);
      await playExpect(zoomLevelRow).toBeAttached();

      const isManaged = await preferencesPage.isPreferenceManaged(Preferences.Labels.ZOOM_LEVEL);
      playExpect(isManaged).toBeFalsy();

      value = await preferencesPage.getPreferenceNumberInputValue(
        Preferences.Labels.ZOOM_LEVEL,
        Preferences.ZOOM_LEVEL_NUMBER_INPUT_LABEL,
      );
      playExpect(value).toBe('0.5');
    });
    test('Preference can be changed', async () => {
      await preferencesPage.setPreferenceNumberInputValue(
        Preferences.Labels.ZOOM_LEVEL,
        Preferences.ZOOM_LEVEL_NUMBER_INPUT_LABEL,
        '1.0',
      );

      value = await preferencesPage.getPreferenceNumberInputValue(
        Preferences.Labels.ZOOM_LEVEL,
        Preferences.ZOOM_LEVEL_NUMBER_INPUT_LABEL,
      );
      playExpect(value).toBe('1');
    });
    test.fail('Preference can be reset', async () => {
      // Fails because of https://github.com/podman-desktop/podman-desktop/issues/16000
      await preferencesPage.resetPreference(Preferences.Labels.ZOOM_LEVEL);
      await playExpect
        .poll(
          async () => {
            return await preferencesPage.getPreferenceNumberInputValue(
              Preferences.Labels.ZOOM_LEVEL,
              Preferences.ZOOM_LEVEL_NUMBER_INPUT_LABEL,
            );
          },
          {
            timeout: 5000,
            message: 'Zoom Level preference did not reset to default value',
          },
        )
        .toBe('0.5');
    });
  });

  test.describe('Defaults + Locked preference: Exit On Close', () => {
    test.describe.configure({ mode: 'serial' });
    let exitOnCloseRow: Locator;
    let value: boolean;
    test('Expected settings value', async () => {
      exitOnCloseRow = preferencesPage.getPreferenceRowByName(Preferences.Labels.EXIT_ON_CLOSE);
      await playExpect(exitOnCloseRow).toBeAttached();

      const isManaged = await preferencesPage.isPreferenceManaged(Preferences.Labels.EXIT_ON_CLOSE);
      playExpect(isManaged).toBeTruthy();

      value = await preferencesPage.getPreferenceCheckboxValue(
        Preferences.Labels.EXIT_ON_CLOSE,
        Preferences.EXIT_ON_CLOSE_TOGGLE_BUTTON_LABEL,
      );
      playExpect(value).toBeFalsy();
    });
    test('Preference can not be changed', async () => {
      const selectionToggle = exitOnCloseRow.getByLabel(Preferences.EXIT_ON_CLOSE_TOGGLE_BUTTON_LABEL);
      await playExpect(selectionToggle).toBeDisabled();
    });
    test('Preference can not be reset', async () => {
      const resetButton = exitOnCloseRow.getByRole('button', { name: 'Reset to default value' });
      await playExpect(resetButton).not.toBeAttached();
    });
  });

  test.describe('Defaults + Locked preference: App Update', () => {
    test.describe.configure({ mode: 'serial' });
    let appUpdateRow: Locator;
    let value: boolean;
    test('Expected settings value', async () => {
      appUpdateRow = preferencesPage.getPreferenceRowByName(Preferences.Labels.APP_UPDATE);
      await playExpect(appUpdateRow).toBeAttached();

      const isManaged = await preferencesPage.isPreferenceManaged(Preferences.Labels.APP_UPDATE);
      playExpect(isManaged).toBeTruthy();

      value = await preferencesPage.getPreferenceCheckboxValue(
        Preferences.Labels.APP_UPDATE,
        Preferences.APP_UPDATE_TOGGLE_BUTTON_LABEL,
      );
      playExpect(value).toBeFalsy();
    });
    test('Preference can not be changed', async () => {
      const selectionToggle = appUpdateRow.getByLabel(Preferences.APP_UPDATE_TOGGLE_BUTTON_LABEL);
      await playExpect(selectionToggle).toBeDisabled();
    });
    test('Preference can not be reset', async () => {
      const resetButton = appUpdateRow.getByRole('button', { name: 'Reset to default value' });
      await playExpect(resetButton).not.toBeAttached();
    });
  });

  test.describe('Locked preference: Line Height', () => {
    test.describe.configure({ mode: 'serial' });
    let lineHeightRow: Locator;
    let value: string;
    test('Expected settings value', async () => {
      lineHeightRow = preferencesPage.getPreferenceRowByName(Preferences.Labels.LINE_HEIGHT);
      await playExpect(lineHeightRow).toBeAttached();

      const isManaged = await preferencesPage.isPreferenceManaged(Preferences.Labels.LINE_HEIGHT);
      playExpect(isManaged).toBeTruthy();

      value = await preferencesPage.getPreferenceNumberInputValue(
        Preferences.Labels.LINE_HEIGHT,
        Preferences.TERMINAL_LINE_HEIGHT_INPUT_LABEL,
      );
      playExpect(value).toBe('1');
    });
    test('Preference can not be changed', async () => {
      const preferenceInput = lineHeightRow.locator(`input[name="${Preferences.TERMINAL_LINE_HEIGHT_INPUT_LABEL}"]`);
      await playExpect(preferenceInput).toBeDisabled();
    });
    test('Preference can not be reset', async () => {
      const resetButton = lineHeightRow.getByRole('button', { name: 'Reset to default value' });
      await playExpect(resetButton).not.toBeAttached();
    });
  });
});
