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
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { AnalyzedExtension } from '/@/plugin/extension-loader.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import type { Color, ColorDefinition, ColorInfo } from '/@api/color-info.js';
import type { RawThemeContribution } from '/@api/theme-info.js';

import colorPalette from '../../../../tailwind-color-palette.json';
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
    this.initGlobalNav();
    this.initSecondaryNav();
    this.initTitlebar();
    this.initContent();
    this.initInvertContent();
    this.initCardContent();
    this.initInputBox();
    this.initCheckbox();
    this.initToggle();
    this.initTable();
    this.initDetails();
    this.initTab();
  }

  protected initGlobalNav(): void {
    const glNav = 'global-nav-';

    // Global navbar
    this.registerColor(`${glNav}bg`, {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[100],
    });
    this.registerColor(`${glNav}icon-notification-dot`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });
    this.registerColor(`${glNav}icon`, {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    });
    this.registerColor(`${glNav}icon-hover`, {
      dark: colorPalette.white,
      light: colorPalette.purple[800],
    });
    this.registerColor(`${glNav}icon-hover-bg`, {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[300],
    });
    this.registerColor(`${glNav}icon-inset-bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.dustypurple[200],
    });
    this.registerColor(`${glNav}icon-selected`, {
      dark: colorPalette.white,
      light: colorPalette.purple[800],
    });
    this.registerColor(`${glNav}icon-selected-bg`, {
      dark: colorPalette.charcoal[500],
      light: colorPalette.purple[300],
    });
    this.registerColor(`${glNav}icon-selected-highlight`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });
  }

  protected initTitlebar(): void {
    this.registerColor('titlebar-bg', {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[50],
    });

    this.registerColor('titlebar-text', {
      dark: colorPalette.white,
      light: colorPalette.purple[900],
    });

    this.registerColor('titlebar-icon', {
      dark: colorPalette.white,
      light: colorPalette.purple[900],
    });
  }

  // secondary nav (settings)
  protected initSecondaryNav(): void {
    const sNav = 'secondary-nav-';

    this.registerColor(`${sNav}bg`, {
      dark: colorPalette.charcoal[700],
      light: colorPalette.dustypurple[100],
    });

    this.registerColor(`${sNav}header-text`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`${sNav}text`, {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
    });

    this.registerColor(`${sNav}text-hover`, {
      dark: colorPalette.white,
      light: colorPalette.purple[800],
    });

    this.registerColor(`${sNav}text-hover-bg`, {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[300],
    });

    this.registerColor(`${sNav}text-selected`, {
      dark: colorPalette.white,
      light: colorPalette.purple[800],
    });

    this.registerColor(`${sNav}selected-bg`, {
      dark: colorPalette.charcoal[500],
      light: colorPalette.purple[300],
    });

    this.registerColor(`${sNav}selected-highlight`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });

    this.registerColor(`${sNav}icon-notification-dot`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });

    this.registerColor(`${sNav}expander`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[700],
    });
  }

  protected initCardContent(): void {
    this.registerColor(`card-bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[300],
    });

    this.registerColor(`card-header-text`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`card-text`, {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
    });
  }

  protected initInvertContent(): void {
    const invCt = 'invert-content-';
    this.registerColor(`${invCt}bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    });

    this.registerColor(`${invCt}header-text`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`${invCt}header2-text`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`${invCt}card-bg`, {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[300],
    });

    this.registerColor(`${invCt}card-header-text`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`${invCt}card-text`, {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
    });

    this.registerColor(`${invCt}button-active`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });

    this.registerColor(`${invCt}button-inactive`, {
      dark: colorPalette.charcoal[50],
      light: colorPalette.charcoal[50],
    });

    this.registerColor(`${invCt}info-icon`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });
  }

  protected initContent(): void {
    const ct = 'content-';
    this.registerColor(`${ct}breadcrumb`, {
      dark: colorPalette.gray[600],
      light: colorPalette.purple[900],
    });

    this.registerColor(`${ct}breadcrumb-2`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[600],
    });

    this.registerColor(`${ct}header`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`${ct}sub-header`, {
      dark: colorPalette.gray[900],
      light: colorPalette.purple[900],
    });

    this.registerColor(`${ct}header-icon`, {
      dark: colorPalette.gray[600],
      light: colorPalette.purple[700],
    });

    this.registerColor(`${ct}card-header-text`, {
      dark: colorPalette.gray[100],
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`${ct}card-bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    });

    this.registerColor(`${ct}card-hover-bg`, {
      dark: colorPalette.charcoal[500],
      light: colorPalette.purple[200],
    });

    this.registerColor(`${ct}card-text`, {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[900],
    });

    this.registerColor(`${ct}card-title`, {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`${ct}card-light-title`, {
      dark: colorPalette.gray[800],
      light: colorPalette.purple[900],
    });

    this.registerColor(`${ct}card-inset-bg`, {
      dark: colorPalette.charcoal[900],
      light: colorPalette.dustypurple[200],
    });

    this.registerColor(`${ct}bg`, {
      dark: colorPalette.charcoal[700],
      light: colorPalette.gray[300],
    });

    this.registerColor(`${ct}card-icon`, {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[900],
    });

    this.registerColor(`${ct}divider`, {
      dark: colorPalette.charcoal[400],
      light: colorPalette.gray[700],
    });

    this.registerColor(`${ct}card-carousel-card-bg`, {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[300],
    });

    this.registerColor(`${ct}card-carousel-card-hover-bg`, {
      dark: colorPalette.charcoal[500],
      light: colorPalette.gray[200],
    });

    this.registerColor(`${ct}card-carousel-card-header-text`, {
      dark: colorPalette.gray[100],
      light: colorPalette.charcoal[900],
    });

    this.registerColor(`${ct}card-carousel-card-text`, {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[900],
    });

    this.registerColor(`${ct}card-carousel-nav`, {
      dark: colorPalette.gray[800],
      light: colorPalette.gray[400],
    });

    this.registerColor(`${ct}card-carousel-hover-nav`, {
      dark: colorPalette.gray[600],
      light: colorPalette.gray[600],
    });

    this.registerColor(`${ct}card-carousel-disabled-nav`, {
      dark: colorPalette.charcoal[700],
      light: colorPalette.gray[200],
    });
  }

  // input boxes
  protected initInputBox(): void {
    const sNav = 'input-field-';

    this.registerColor(`${sNav}bg`, {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    });
    this.registerColor(`${sNav}focused-bg`, {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[100],
    });
    this.registerColor(`${sNav}disabled-bg`, {
      dark: colorPalette.charcoal[900],
      light: colorPalette.charcoal[900],
    });
    this.registerColor(`${sNav}hover-bg`, {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    });
    this.registerColor(`${sNav}focused-text`, {
      dark: colorPalette.white,
      light: colorPalette.gray[900],
    });
    this.registerColor(`${sNav}error-text`, {
      dark: colorPalette.red[500],
      light: colorPalette.red[500],
    });
    this.registerColor(`${sNav}disabled-text`, {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${sNav}hover-text`, {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${sNav}placeholder-text`, {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${sNav}stroke`, {
      dark: colorPalette.charcoal[400],
      light: colorPalette.charcoal[400],
    });
    this.registerColor(`${sNav}hover-stroke`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[400],
    });
    this.registerColor(`${sNav}stroke-error`, {
      dark: colorPalette.red[500],
      light: colorPalette.red[500],
    });
    this.registerColor(`${sNav}stroke-readonly`, {
      dark: colorPalette.charcoal[100],
      light: colorPalette.charcoal[100],
    });
    this.registerColor(`${sNav}icon`, {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[500],
    });
    this.registerColor(`${sNav}focused-icon`, {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[500],
    });
    this.registerColor(`${sNav}disabled-icon`, {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[500],
    });
    this.registerColor(`${sNav}hover-icon`, {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[500],
    });
  }

  // checkboxes
  protected initCheckbox(): void {
    const sNav = 'input-checkbox-';

    this.registerColor(`${sNav}disabled`, {
      dark: colorPalette.gray[700],
      light: colorPalette.charcoal[200],
    });
    this.registerColor(`${sNav}indeterminate`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[900],
    });
    this.registerColor(`${sNav}focused-indeterminate`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    });
    this.registerColor(`${sNav}checked`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[900],
    });
    this.registerColor(`${sNav}focused-checked`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    });
    this.registerColor(`${sNav}unchecked`, {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[900],
    });
    this.registerColor(`${sNav}focused-unchecked`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    });
  }

  // toggles
  protected initToggle(): void {
    const sNav = 'input-toggle-';

    this.registerColor(`${sNav}off-bg`, {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${sNav}off-focused-bg`, {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[700],
    });
    this.registerColor(`${sNav}on-bg`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    });
    this.registerColor(`${sNav}on-focused-bg`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[600],
    });
    this.registerColor(`${sNav}switch`, {
      dark: colorPalette.white,
      light: colorPalette.black,
    });
    this.registerColor(`${sNav}focused-switch`, {
      dark: colorPalette.white,
      light: colorPalette.black,
    });
    this.registerColor(`${sNav}on-text`, {
      dark: colorPalette.white,
      light: colorPalette.black,
    });
    this.registerColor(`${sNav}off-text`, {
      dark: colorPalette.gray[700],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${sNav}off-disabled-bg`, {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${sNav}on-disabled-bg`, {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${sNav}disabled-switch`, {
      dark: colorPalette.gray[900],
      light: colorPalette.charcoal[900],
    });
  }

  protected initTable(): void {
    const tab = 'table-';
    // color of columns names
    this.registerColor(`${tab}header-text`, {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    });
    // color of up/down arrows when column is not the ordered one
    this.registerColor(`${tab}header-unsorted`, {
      dark: colorPalette.charcoal[200],
      light: colorPalette.charcoal[300],
    });

    // color for most text in tables
    this.registerColor(`${tab}body-text`, {
      dark: colorPalette.gray[700],
      light: colorPalette.charcoal[300],
    });
    // color for the text in the main column of the table (generally Name)
    this.registerColor(`${tab}body-text-highlight`, {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[300],
    });
    // color for the text in second line of main column, in secondary color (generally IDs)
    this.registerColor(`${tab}body-text-sub-secondary`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    });
    // color for highlighted text in second line of main column
    this.registerColor(`${tab}body-text-sub-highlight`, {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[200],
    });
  }

  protected initDetails(): void {
    const details = 'details-';
    this.registerColor(`${details}body-text`, {
      dark: colorPalette.gray[200],
      light: colorPalette.charcoal[500],
    });
    this.registerColor(`${details}empty-icon`, {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    });
    this.registerColor(`${details}empty-header`, {
      dark: colorPalette.gray[200],
      light: colorPalette.charcoal[500],
    });
    this.registerColor(`${details}empty-sub-header`, {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[500],
    });
    this.registerColor(`${details}empty-cmdline-bg`, {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[200],
    });
    this.registerColor(`${details}empty-cmdline-text`, {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[700],
    });
    this.registerColor(`${details}bg`, {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[50],
    });
  }

  protected initTab(): void {
    const tab = 'tab-';
    this.registerColor(`${tab}text`, {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    });
    this.registerColor(`${tab}text-highlight`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[300],
    });
    this.registerColor(`${tab}highlight`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });
    this.registerColor(`${tab}hover`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[500],
    });
  }
}
