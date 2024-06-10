/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type * as extensionApi from '@podman-desktop/api';

import { AppearanceSettings } from '/@/plugin/appearance-settings.js';
import { getColors } from '/@/plugin/colors.js';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { AnalyzedExtension } from '/@/plugin/extension-loader.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import type { Color, ColorDefinition, ColorInfo } from '/@api/color-info.js';
import type { RawThemeContribution } from '/@api/theme-info.js';

import type { ApiSenderType } from './api.js';

export class ColorRegistry {
  #apiSender: ApiSenderType;
  #configurationRegistry: ConfigurationRegistry;
  #definitions: Map<string, ColorDefinition>;
  #initDone = false;
  #themes: Map<string, Map<string, Color>>;
  #parentThemes: Map<string, string>;

  constructor(apiSender: ApiSenderType, configurationRegistry: ConfigurationRegistry) {
    this.#apiSender = apiSender;
    this.#configurationRegistry = configurationRegistry;
    this.#definitions = new Map();
    this.#themes = new Map();
    this.#parentThemes = new Map();

    // default themes
    this.#themes.set('light', new Map());
    this.#themes.set('dark', new Map());
  }

  registerExtensionThemes(extension: AnalyzedExtension, themes: RawThemeContribution[]): extensionApi.Disposable {
    if (!themes) {
      return Disposable.noop();
    }
    if (!Array.isArray(themes)) {
      return Disposable.noop();
    }

    // missing id property in theme, abort
    if (themes.some(t => !t.id)) {
      throw new Error(`Missing id property in theme. Extension ${extension.id}`);
    }

    // missing parent property in theme, abort
    if (themes.some(t => !t.parent)) {
      throw new Error(`Missing parent property in theme. Extension ${extension.id}`);
    }

    // themes already exists, report an error
    const exists = themes.map(t => t.id).some(id => this.#themes.has(id));

    if (exists) {
      throw new Error(`Theme already exists. Extension trying to register the same theme : ${extension.id}`);
    }

    // Analyze each theme
    for (const theme of themes) {
      // get parent theme
      const parent = theme.parent;

      // check if parent theme exists
      if (!this.#themes.has(parent)) {
        throw new Error(`Parent theme ${parent} does not exist. It is defined in extension ${extension.id}.`);
      }

      this.#parentThemes.set(theme.id, parent);

      // get the parent theme assuming it's now existing
      const parentTheme = this.#themes.get(parent);

      // register theme
      const colorMap = new Map<string, Color>();
      this.#themes.set(theme.id, colorMap);

      // iterate over all color definitions and register either default or provided color
      for (const colorDefinitionId of this.#definitions.keys()) {
        // get the color from the theme
        // need to convert kebab-case to camelCase as in json it's contributed with camelCase
        const camelCaseColorDefinitionId = colorDefinitionId.replace(/-([a-z])/g, g => g[1].toUpperCase());
        let color: string | undefined = theme.colors[camelCaseColorDefinitionId];
        if (!color) {
          color = parentTheme?.get(colorDefinitionId);
        }
        if (color) {
          colorMap.set(colorDefinitionId, color);
        }
      }
    }
    const themeIds = themes.map(t => t.id);

    // update configuration
    const disposeConfiguration = this.#configurationRegistry.addConfigurationEnum(
      AppearanceSettings.SectionName + '.' + AppearanceSettings.Appearance,
      themeIds,
      AppearanceSettings.SystemEnumValue,
    );

    // create Disposable that will remove all theme names from the list of themes
    return {
      dispose: (): void => {
        for (const themeId of themeIds) {
          this.#themes.delete(themeId);
        }
        // remove from configuration
        disposeConfiguration.dispose();
      },
    };
  }

  protected registerColor(colorId: string, definition: ColorDefinition): void {
    if (this.#definitions.has(colorId)) {
      console.warn(`Color ${colorId} already registered.`);
      throw new Error(`Color ${colorId} already registered.`);
    }

    // store the color definition
    this.#definitions.set(colorId, definition);

    // set the colors in the default themes
    this.#themes.get('light')?.set(colorId, definition.light);
    this.#themes.get('dark')?.set(colorId, definition.dark);
    this.notifyUpdate();
  }

  // check if the given theme is dark
  // if light or dark it's easy
  // else we check the parent theme
  isDarkTheme(themeId: string): boolean {
    if (themeId === 'light') {
      return false;
    } else if (themeId === 'dark') {
      return true;
    } else {
      // get the parent theme
      const parent = this.#parentThemes.get(themeId);
      if (parent) {
        return this.isDarkTheme(parent);
      } else {
        console.error(`Theme ${themeId} does not exist.`);
        // return dark by default
        return true;
      }
    }
  }

  /**
   * Returns the colors based on the given theme. Like 'dark' or 'light'.
   */
  listColors(themeName: string): ColorInfo[] {
    // theme exists ? if not use dark theme
    if (!this.#themes.has(themeName)) {
      console.error(`Asking for theme ${themeName} that does not exist. Using dark theme instead.`);
      themeName = 'dark';
    }

    // get the colors based on the theme
    const theme = this.#themes.get(themeName);

    // now, iterate over all color ids
    return Array.from(this.#definitions.keys()).map(id => {
      // css variable name is based from the color id and --pd- prefix
      const cssVar = `--pd-${id}`;

      // check if color is defined in the theme
      if (theme?.has(id)) {
        // return the color
        return { id, cssVar, value: theme.get(id)! };
      } else {
        // error
        throw new Error(`Color ${id} is not defined in theme ${themeName}`);
      }
    });
  }

  protected notifyUpdate(): void {
    // notify only if ended the initialization
    if (this.#initDone) {
      this.#apiSender.send('color-updated');
    }
  }

  protected trackChanges(): void {
    // add listener on the configuration change for the theme
    this.#configurationRegistry.onDidChangeConfiguration(async e => {
      if (e.key === `${AppearanceSettings.SectionName}.${AppearanceSettings.Appearance}`) {
        // refresh the colors
        this.notifyUpdate();
      }
    });
  }

  init(): void {
    this.trackChanges();

    this.initColors();

    this.notifyUpdate();

    this.setDone();
  }

  protected setDone(): void {
    this.#initDone = true;
  }

  protected initColors(): void {
    Object.entries(getColors()).forEach(([colorId, definition]) => {
      this.registerColor(colorId, definition);
    });
  }
}
