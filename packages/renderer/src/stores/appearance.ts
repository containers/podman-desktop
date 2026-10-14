/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import { AppearanceSettings } from '@desktop-framework/api/appearance';
import { type Writable, writable } from 'svelte/store';

import { configurationProperties } from './configurationProperties';

export const isDark: Writable<boolean> = writable(false);
export const isHighContrast: Writable<boolean> = writable(false);

configurationProperties.subscribe(() => {
  if (window?.getConfigurationValue) {
    window
      ?.getConfigurationValue<string>(AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance)
      ?.then(value => {
        if (value) {
          updateAppearance(value);
        }
      })
      ?.catch((err: unknown) =>
        console.error(
          `Error getting configuration value ${AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance}`,
          err,
        ),
      );
  }
});

function updateAppearance(appearance: string): void {
  if (appearance === AppearanceSettings.SystemEnumValue) {
    isDark.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    isHighContrast.set(false);
  } else if (appearance === AppearanceSettings.LightEnumValue) {
    isDark.set(false);
    isHighContrast.set(false);
  } else if (appearance === AppearanceSettings.LightHCEnumValue) {
    isDark.set(false);
    isHighContrast.set(true);
  } else if (appearance === AppearanceSettings.DarkEnumValue) {
    isDark.set(true);
    isHighContrast.set(false);
  } else if (appearance === AppearanceSettings.DarkHCEnumValue) {
    isDark.set(true);
    isHighContrast.set(true);
  } else {
    window.getThemeInfo(appearance).then(
      info => {
        isDark.set(info.isDark);
        isHighContrast.set(info.isHighContrast);
      },
      (err: unknown) => console.error(`Error getting theme info for ${appearance}`, err),
    );
  }
}
