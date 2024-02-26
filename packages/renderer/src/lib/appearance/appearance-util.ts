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

export class AppearanceUtil {
  async isDarkMode(): Promise<boolean> {
    // get the configuration of the appearance
    const appearance = await window.getConfigurationValue<string>(
      AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance,
    );

    let isDark = false;

    if (appearance === AppearanceSettings.SystemEnumValue) {
      // need to read the system default theme using the window.matchMedia
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      //FIXME: for now we hardcode to the dark theme even if the Operatin System is using light theme
      // as it renders correctly only in dark mode today
      isDark = true;
    } else if (appearance === AppearanceSettings.LightEnumValue) {
      isDark = false;
    } else if (appearance === AppearanceSettings.DarkEnumValue) {
      isDark = true;
    }
    return isDark;
  }

  async getTheme(): Promise<string> {
    const themeName = await window.getConfigurationValue<string>(
      AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance,
    );

    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    if (themeName === AppearanceSettings.SystemEnumValue) {
      //FIXME: for now we hardcode to the dark theme even if the Operating System is using light theme
      // return systemTheme;
      return 'dark';
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

    const isDark: boolean = await this.isDarkMode();
    if (isDark && icon.dark) {
      return icon.dark;
    } else if (!isDark && icon.light) {
      return icon.light;
    }
    return undefined;
  }
}
