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

import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { AppearanceSettings } from '@desktop-framework/api/appearance';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { nativeTheme } from 'electron';
import { inject, injectable } from 'inversify';

const APPEARANCE_FULL_KEY = `${AppearanceSettings.SectionName}.${AppearanceSettings.Appearance}`;
const SEARCHBAR_FULL_KEY = `titleBar.${AppearanceSettings.SearchBar}`;

@injectable()
export class AppearanceInit {
  constructor(
    @inject(IConfigurationRegistry) private configurationRegistry: IConfigurationRegistry,
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
  ) {}

  init(): void {
    const appearanceConfiguration: IConfigurationNode = {
      id: 'preferences.appearance',
      title: 'Appearance',
      type: 'object',
      properties: {
        [APPEARANCE_FULL_KEY]: {
          description: 'Select light, dark, high-contrast light, high-contrast dark, or use your system setting.',
          type: 'string',
          enum: ['system', 'dark', 'light', 'hc-dark', 'hc-light'],
          default: 'system',
        },
        [`${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`]: {
          markdownDescription:
            'Select the zoom level. To **Zoom In**, set a positive value like `1` for a 20% zoom. To **Zoom Out**, use a negative value, like `-1`. Use decimals for more fine-grained zoom control.',
          type: 'number',
          minimum: -3,
          maximum: 3,
          default: 0,
          step: 0.1,
        },
        [`${AppearanceSettings.SectionName}.${AppearanceSettings.NavigationBarWidth}`]: {
          description: 'Width of the navigation bar in pixels. Drag the bar edge to resize.',
          type: 'number',
          minimum: 50,
          maximum: 240,
          default: 160,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([appearanceConfiguration]);

    this.configurationRegistry.onDidChangeConfiguration(async e => {
      if (e.key === APPEARANCE_FULL_KEY && typeof e.value === 'string') {
        this.updateNativeTheme(e.value);
      }

      if (e.key === SEARCHBAR_FULL_KEY && (typeof e.value === 'object' || typeof e.value === 'undefined')) {
        this.apiSender.send('search-bar-enabled', typeof e.value === 'object');
      }
    });
  }

  updateNativeTheme(appearance: string): void {
    // appearance config values match the enum values for themeSource, but lets be expicit
    if (appearance === AppearanceSettings.LightEnumValue || appearance === AppearanceSettings.LightHCEnumValue) {
      nativeTheme.themeSource = 'light';
    } else if (appearance === AppearanceSettings.DarkEnumValue || appearance === AppearanceSettings.DarkHCEnumValue) {
      nativeTheme.themeSource = 'dark';
    } else {
      nativeTheme.themeSource = 'system';
    }
  }
}
