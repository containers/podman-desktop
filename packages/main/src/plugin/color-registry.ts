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

import type { Color, ColorDefinition, ColorInfo } from '/@api/color-info.js';
import type { RawThemeContribution } from '/@api/theme-info.js';

import colorPalette from '../../../../tailwind-color-palette.json';
import type { ApiSenderType } from './api.js';
import { AppearanceSettings } from './appearance-settings.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { AnalyzedExtension } from './extension-loader.js';
import { Disposable } from './types/disposable.js';

export class ColorRegistry {
  #apiSender: ApiSenderType | undefined;
  #configurationRegistry: ConfigurationRegistry | undefined;
  #definitions: Map<string, ColorDefinition>;
  #initDone = false;
  #themes: Map<string, Map<string, Color>>;
  #parentThemes: Map<string, string>;

  constructor(apiSender?: ApiSenderType, configurationRegistry?: ConfigurationRegistry) {
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
    const disposeConfiguration = this.#configurationRegistry?.addConfigurationEnum(
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
        disposeConfiguration?.dispose();
      },
    };
  }

  public listThemes(): string[] {
    return Array.from(this.#themes.keys());
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
      this.#apiSender?.send('color-updated');
    }
  }

  protected trackChanges(): void {
    // add listener on the configuration change for the theme
    this.#configurationRegistry?.onDidChangeConfiguration(async e => {
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
    this.initDefaults();
    this.initNotificationDot();
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
    this.initModal();
    this.initLink();
    this.initButton();
    this.initActionButton();
    this.initTooltip();
    this.initDropdown();
    this.initLabel();
    this.initStatusColors();
    this.initStatusBar();
    this.initOnboarding();
    this.initStates();
  }

  protected initDefaults(): void {
    const def = 'default-';

    // Global default colors
    this.registerColor(`${def}text`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
    });
  }

  protected initNotificationDot(): void {
    this.registerColor('notification-dot', {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });
  }

  protected initGlobalNav(): void {
    const glNav = 'global-nav-';

    // Global navbar
    this.registerColor(`${glNav}bg`, {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[100],
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

    this.registerColor(`${ct}text`, {
      dark: colorPalette.gray[700],
      light: colorPalette.gray[900],
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
      light: colorPalette.purple[900],
    });

    this.registerColor(`${ct}card-bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    });

    this.registerColor(`${ct}card-hover-bg`, {
      dark: colorPalette.charcoal[500],
      light: colorPalette.purple[200],
    });

    this.registerColor(`${ct}card-selected-bg`, {
      dark: colorPalette.charcoal[400],
      light: colorPalette.purple[100],
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

    this.registerColor(`${ct}card-hover-inset-bg`, {
      dark: colorPalette.charcoal[700],
      light: colorPalette.dustypurple[300],
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

    this.registerColor(`${ct}card-border`, {
      dark: colorPalette.charcoal[700],
      light: colorPalette.gray[200],
    });

    this.registerColor(`${ct}card-border-selected`, {
      dark: colorPalette.dustypurple[700],
      light: colorPalette.purple[600],
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
      dark: colorPalette.gray[800],
      light: colorPalette.gray[800],
    });
    this.registerColor(`${sNav}on-bg`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });
    this.registerColor(`${sNav}on-focused-bg`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[500],
    });
    this.registerColor(`${sNav}switch`, {
      dark: colorPalette.white,
      light: colorPalette.white,
    });
    this.registerColor(`${sNav}focused-switch`, {
      dark: colorPalette.white,
      light: colorPalette.white,
    });
    this.registerColor(`${sNav}on-text`, {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
    });
    this.registerColor(`${sNav}off-text`, {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
    });
    this.registerColor(`${sNav}disabled-text`, {
      dark: colorPalette.gray[700],
      light: colorPalette.charcoal[200],
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
      dark: colorPalette.gray[200],
      light: colorPalette.gray[200],
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
      light: colorPalette.charcoal[100],
    });
    // color for the text in the main column of the table (generally Name)
    this.registerColor(`${tab}body-text-highlight`, {
      dark: colorPalette.gray[300],
      light: colorPalette.charcoal[700],
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
    this.registerColor(`${details}card-bg`, {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[300],
    });
    this.registerColor(`${details}card-header`, {
      dark: colorPalette.gray[700],
      light: colorPalette.charcoal[300],
    });
    this.registerColor(`${details}card-text`, {
      dark: colorPalette.white,
      light: colorPalette.charcoal[900],
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

  // modal dialog
  protected initModal(): void {
    const modal = 'modal-';

    this.registerColor(`${modal}fade`, {
      dark: colorPalette.black,
      light: colorPalette.white,
    });
    this.registerColor(`${modal}text`, {
      dark: colorPalette.gray[500],
      light: colorPalette.charcoal[300],
    });
    this.registerColor(`${modal}text-hover`, {
      dark: colorPalette.gray[300],
      light: colorPalette.purple[800],
    });
    this.registerColor(`${modal}bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    });
    this.registerColor(`${modal}border`, {
      dark: colorPalette.charcoal[500],
      light: colorPalette.gray[500],
    });
    this.registerColor(`${modal}header-bg`, {
      dark: colorPalette.black,
      light: colorPalette.gray[100],
    });
    this.registerColor(`${modal}header-text`, {
      dark: colorPalette.gray[400],
      light: colorPalette.purple[500],
    });
    this.registerColor(`${modal}header-divider`, {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[300],
    });
  }

  // links
  protected initLink(): void {
    const link = 'link';

    this.registerColor(`${link}`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    });
    this.registerColor(`${link}-hover-bg`, {
      dark: colorPalette.white + '2',
      light: colorPalette.black + '2',
    });
  }

  // button
  protected initButton(): void {
    const button = 'button-';

    this.registerColor(`${button}primary-bg`, {
      dark: colorPalette.purple[600],
      light: colorPalette.purple[600],
    });
    this.registerColor(`${button}primary-hover-bg`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    });
    this.registerColor(`${button}secondary`, {
      dark: colorPalette.gray[200],
      light: colorPalette.purple[600],
    });
    this.registerColor(`${button}secondary-hover`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    });
    this.registerColor(`${button}text`, {
      dark: colorPalette.white,
      light: colorPalette.white,
    });
    this.registerColor(`${button}disabled`, {
      dark: colorPalette.charcoal[300],
      light: colorPalette.gray[600],
    });
    this.registerColor(`${button}disabled-text`, {
      dark: colorPalette.charcoal[50],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${button}danger-border`, {
      dark: colorPalette.red[500],
      light: colorPalette.red[700],
    });
    this.registerColor(`${button}danger-bg`, {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    });
    this.registerColor(`${button}danger-text`, {
      dark: colorPalette.red[500],
      light: colorPalette.red[700],
    });
    this.registerColor(`${button}danger-hover-text`, {
      dark: colorPalette.white,
      light: colorPalette.white,
    });
    this.registerColor(`${button}danger-hover-bg`, {
      dark: colorPalette.red[600],
      light: colorPalette.red[600],
    });
    this.registerColor(`${button}danger-disabled-border`, {
      dark: colorPalette.charcoal[50],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${button}danger-disabled-text`, {
      dark: colorPalette.charcoal[50],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${button}danger-disabled-bg`, {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    });
    this.registerColor(`${button}tab-border`, {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    });
    this.registerColor(`${button}tab-border-selected`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[600],
    });
    this.registerColor(`${button}tab-hover-border`, {
      dark: colorPalette.charcoal[100],
      light: colorPalette.gray[600],
    });
    this.registerColor(`${button}tab-text`, {
      dark: colorPalette.gray[600],
      light: colorPalette.charcoal[200],
    });
    this.registerColor(`${button}tab-text-selected`, {
      dark: colorPalette.white,
      light: colorPalette.black,
    });
    this.registerColor(`${button}link-text`, {
      dark: colorPalette.purple[400],
      light: colorPalette.purple[700],
    });
    this.registerColor(`${button}link-hover-bg`, {
      dark: colorPalette.white + '2',
      light: colorPalette.black + '2',
    });
    this.registerColor(`${button}help-link-text`, {
      dark: colorPalette.gray[100],
      light: colorPalette.charcoal[900],
    });
  }

  protected initActionButton(): void {
    const ab = 'action-button-';

    this.registerColor(`${ab}text`, {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[500],
    });
    this.registerColor(`${ab}bg`, {
      dark: colorPalette.charcoal[900],
      light: colorPalette.gray[400],
    });
    this.registerColor(`${ab}hover-bg`, {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[50],
    });
    this.registerColor(`${ab}hover-text`, {
      dark: colorPalette.purple[600],
      light: colorPalette.purple[500],
    });

    this.registerColor(`${ab}primary-text`, {
      dark: colorPalette.purple[600],
      light: colorPalette.purple[600],
    });
    this.registerColor(`${ab}primary-hover-text`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    });

    this.registerColor(`${ab}disabled-text`, {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    });

    this.registerColor(`${ab}details-text`, {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[900],
    });
    this.registerColor(`${ab}details-bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    });
    this.registerColor(`${ab}details-hover-text`, {
      dark: colorPalette.purple[600],
      light: colorPalette.purple[500],
    });

    this.registerColor(`${ab}details-disabled-text`, {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[900],
    });
    this.registerColor(`${ab}details-disabled-bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    });

    this.registerColor(`${ab}spinner`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    });
  }

  // tooltip
  protected initTooltip(): void {
    const tooltip = 'tooltip-';

    this.registerColor(`${tooltip}bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[50],
    });
    this.registerColor(`${tooltip}text`, {
      dark: colorPalette.white,
      light: colorPalette.black,
    });
    this.registerColor(`${tooltip}border`, {
      dark: colorPalette.charcoal[500],
      light: colorPalette.gray[500],
    });
  }

  protected initDropdown(): void {
    const dropdown = 'dropdown-';
    const select = 'select-';

    this.registerColor(`${dropdown}bg`, {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[100],
    });
    this.registerColor(`${select}bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[300],
    });
    this.registerColor(`${dropdown}ring`, {
      dark: colorPalette.purple[900],
      light: colorPalette.gray[500],
    });
    this.registerColor(`${dropdown}hover-ring`, {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[300],
    });
    this.registerColor(`${dropdown}divider`, {
      dark: colorPalette.charcoal[600],
      light: colorPalette.gray[100],
    });

    this.registerColor(`${dropdown}item-text`, {
      dark: colorPalette.gray[400],
      light: colorPalette.charcoal[600],
    });
    this.registerColor(`${dropdown}item-hover-bg`, {
      dark: colorPalette.black,
      light: colorPalette.gray[300],
    });
    this.registerColor(`${dropdown}item-hover-text`, {
      dark: colorPalette.purple[500],
      light: colorPalette.purple[500],
    });

    this.registerColor(`${dropdown}disabled-item-text`, {
      dark: colorPalette.gray[900],
      light: colorPalette.charcoal[100],
    });
    this.registerColor(`${dropdown}disabled-item-bg`, {
      dark: colorPalette.charcoal[800],
      light: colorPalette.gray[200],
    });
  }

  // labels
  protected initLabel(): void {
    const label = 'label-';

    this.registerColor(`${label}bg`, {
      dark: colorPalette.charcoal[500],
      light: colorPalette.purple[200],
    });
    this.registerColor(`${label}text`, {
      dark: colorPalette.gray[500],
      light: colorPalette.charcoal[300],
    });
  }

  protected initStatusColors(): void {
    const status = 'status-';

    // Podman & Kubernetes
    this.registerColor(`${status}running`, {
      dark: colorPalette.green[400],
      light: colorPalette.green[400],
    });
    // Kubernetes only
    this.registerColor(`${status}terminated`, {
      dark: colorPalette.red[500],
      light: colorPalette.red[500],
    });
    this.registerColor(`${status}waiting`, {
      dark: colorPalette.amber[600],
      light: colorPalette.amber[600],
    });
    // Podman only
    this.registerColor(`${status}starting`, {
      dark: colorPalette.green[600],
      light: colorPalette.green[600],
    });
    // Stopped & Exited are the same color / same thing in the eyes of statuses
    this.registerColor(`${status}stopped`, {
      dark: colorPalette.gray[300],
      light: colorPalette.gray[600],
    });
    this.registerColor(`${status}exited`, {
      dark: colorPalette.gray[300],
      light: colorPalette.gray[600],
    });
    this.registerColor(`${status}not-running`, {
      dark: colorPalette.gray[700],
      light: colorPalette.gray[900],
    });
    // "Warning"
    this.registerColor(`${status}paused`, {
      dark: colorPalette.amber[600],
      light: colorPalette.amber[600],
    });
    this.registerColor(`${status}degraded`, {
      dark: colorPalette.amber[700],
      light: colorPalette.amber[700],
    });
    // Others
    this.registerColor(`${status}created`, {
      dark: colorPalette.green[300],
      light: colorPalette.green[300],
    });
    this.registerColor(`${status}dead`, {
      dark: colorPalette.red[500],
      light: colorPalette.red[500],
    });
    // If we don't know the status, use gray
    this.registerColor(`${status}unknown`, {
      dark: colorPalette.gray[100],
      light: colorPalette.gray[400],
    });
    // Connections / login
    this.registerColor(`${status}connected`, {
      dark: colorPalette.green[600],
      light: colorPalette.green[600],
    });
    this.registerColor(`${status}disconnected`, {
      dark: colorPalette.gray[500],
      light: colorPalette.gray[800],
    });
    // Scaled / updated, use blue as it's a 'neutral' color
    // to indicate that it's informative but not a problem
    this.registerColor(`${status}updated`, {
      dark: colorPalette.sky[500],
      light: colorPalette.sky[500],
    });
    this.registerColor(`${status}ready`, {
      dark: colorPalette.gray[900],
      light: colorPalette.gray[100],
    });

    // contrast color for the other status colors,
    // e.g. to use in status icons
    this.registerColor(`${status}contrast`, {
      dark: colorPalette.white,
      light: colorPalette.white,
    });
  }

  protected initStatusBar(): void {
    const statusbar = 'statusbar-';
    this.registerColor(`${statusbar}bg`, {
      dark: colorPalette.purple[900],
      light: colorPalette.purple[900],
    });

    this.registerColor(`${statusbar}hover-bg`, {
      dark: colorPalette.purple[800],
      light: colorPalette.purple[800],
    });

    this.registerColor(`${statusbar}text`, {
      dark: colorPalette.white,
      light: colorPalette.white,
    });
  }

  protected initOnboarding(): void {
    const onboarding = 'onboarding-';
    this.registerColor(`${onboarding}active-dot-bg`, {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[700],
    });

    this.registerColor(`${onboarding}active-dot-border`, {
      dark: colorPalette.purple[700],
      light: colorPalette.purple[700],
    });

    this.registerColor(`${onboarding}inactive-dot-bg`, {
      dark: colorPalette.transparent,
      light: colorPalette.transparent,
    });

    this.registerColor(`${onboarding}inactive-dot-border`, {
      dark: colorPalette.gray[700],
      light: colorPalette.gray[700],
    });
  }

  protected initStates(): void {
    const state = 'state-';

    // general error and warning states
    this.registerColor(`${state}success`, {
      dark: colorPalette.green[500],
      light: colorPalette.green[600],
    });
    this.registerColor(`${state}warning`, {
      dark: colorPalette.amber[500],
      light: colorPalette.amber[600],
    });
    this.registerColor(`${state}error`, {
      dark: colorPalette.red[500],
      light: colorPalette.red[600],
    });
  }
}
