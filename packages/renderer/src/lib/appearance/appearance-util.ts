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

import { AppearanceSettings } from '../../../../main/src/plugin/appearance-settings';
import { isDark } from '../../stores/appearance';

let isDarkTheme = false;
isDark.subscribe(value => {
  isDarkTheme = value;
});

export class AppearanceUtil {
  async getTheme(): Promise<string> {
    const themeName = await window.getConfigurationValue<string>(
      AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance,
    );

    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    if (themeName === AppearanceSettings.SystemEnumValue) {
      return systemTheme;
    }

    return themeName ?? systemTheme;
  }

  /**
   * Helper function that returns the correct image to use based on icon and current light vs dark setting.
   */
  async getImage(icon: string | { light: string; dark: string } | undefined): Promise<string | undefined> {
    if (!icon) {
      return undefined;
    }

    if (typeof icon === 'string') {
      return icon;
    }

    if (isDarkTheme && icon.dark) {
      return icon.dark;
    } else if (!isDarkTheme && icon.light) {
      return icon.light;
    }
    return undefined;
  }

  /**
   * Helper function to look up a color value from the theme.
   */
  getColor(val: string): string {
    // find the current terminal background color
    const computedStyle = window.getComputedStyle(document.documentElement);
    let color = computedStyle.getPropertyValue(val).trim();

    // convert to 6 char RGB value since some things don't support 3 char format
    if (color?.length < 6) {
      color = color
        .split('')
        .map(c => {
          return c === '#' ? c : c + c;
        })
        .join('');
    }
    return color;
  }
}
