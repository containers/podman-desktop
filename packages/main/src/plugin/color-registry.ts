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

import type { ColorDefinition, ColorInfo, RawThemeContribution, ThemeInfo } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { AppearanceSettings } from '@desktop-framework/api/appearance';
import type * as extensionApi from '@desktop-framework/extension-api';

import type { AnalyzedExtension } from '/@/plugin/extension/extension-analyzer.js';

// eslint-disable-next-line no-restricted-imports
import tailwindColorPalette from '../../../../tailwind-color-palette.json' with { type: 'json' };
// use relative path as this file is embedded in the website build to generate css
// and then type alias won't resolve it
// eslint-disable-next-line no-restricted-imports
import { isWindows } from '../util.js';
import { ColorBuilder } from './color-builder.js';
import { colorPaletteHelper } from './color-palette-helper.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import { Disposable } from './types/disposable.js';

const {
  accent1,
  amber,
  black,
  charcoal,
  dustypurple,
  fuchsia,
  gray,
  green,
  neutral,
  purple,
  red,
  sky,
  slate,
  stone,
  white,
  yellow,
  transparent,
} = tailwindColorPalette;

export type ColorDefinitionWithId = ColorDefinition & { id: string };

export class ColorRegistry {
  #apiSender: ApiSenderType;
  #configurationRegistry: ConfigurationRegistry;
  #definitions: Map<string, ColorDefinition>;
  #initDone = false;
  #themes: Map<string, Map<string, string>>;
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
    this.#themes.set('hc-light', new Map());
    this.#themes.set('hc-dark', new Map());
    this.#parentThemes.set('hc-light', 'light');
    this.#parentThemes.set('hc-dark', 'dark');
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
      const colorMap = new Map<string, string>();
      this.#themes.set(theme.id, colorMap);

      // iterate over all color definitions and register either default or provided color
      for (const colorDefinitionId of this.#definitions.keys()) {
        // get the color from the theme
        // need to convert kebab-case to camelCase as in json it's contributed with camelCase
        const camelCaseColorDefinitionId = colorDefinitionId.replace(/-([a-z])/g, g => (g[1] ?? '').toUpperCase());
        let color: string | undefined = theme.colors[camelCaseColorDefinitionId];
        color ??= parentTheme?.get(colorDefinitionId);
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
    if (definition.hcLight !== undefined) {
      this.#themes.get('hc-light')?.set(colorId, definition.hcLight);
    }
    if (definition.hcDark !== undefined) {
      this.#themes.get('hc-dark')?.set(colorId, definition.hcDark);
    }
    this.notifyUpdate();
  }

  /**
   * Register a color using a built color definition that includes the id.
   * Use this.color() for fluent color definition creation.
   *
   * @example
   * this.registerColorDefinition(
   *   this.color('my-color')
   *     .withLight(colorPaletteHelper('#ffffff'))
   *     .withDark(colorPaletteHelper('#000000'))
   *     .build()
   * );
   *
   * @example
   * this.registerColorDefinition(
   *   this.color('transparent-color')
   *     .withLight(colorPaletteHelper('#ffffff').withAlpha(0.5))
   *     .withDark(colorPaletteHelper('#000000').withAlpha(0.8))
   *     .build()
   * );
   *
   * @param definition - The color definition with id, light, and dark values
   */
  protected registerColorDefinition(definition: ColorDefinitionWithId): void {
    this.registerColor(definition.id, {
      light: definition.light,
      dark: definition.dark,
      hcDark: definition.hcDark,
      hcLight: definition.hcLight,
    });
  }

  /**
   * Create a ColorBuilder for fluent color definition creation.
   * Call build() on the result and pass it to registerColorDefinition().
   * Use colorPaletteHelper() to wrap colors with optional alpha values.
   *
   * @example
   * this.registerColorDefinition(
   *   this.color('my-color')
   *     .withLight(colorPaletteHelper('#ffffff'))
   *     .withDark(colorPaletteHelper('#000000'))
   *     .build()
   * );
   *
   * @example
   * this.registerColorDefinition(
   *   this.color('transparent-color')
   *     .withLight(colorPaletteHelper('#ffffff').withAlpha(0.5))
   *     .withDark(colorPaletteHelper('#000000').withAlpha(0.8))
   *     .build()
   * );
   *
   * @param colorId - The unique color identifier
   * @returns A ColorBuilder instance for method chaining
   */
  protected color(colorId: string): ColorBuilder {
    return new ColorBuilder(colorId);
  }

  isDarkTheme(themeId: string): boolean {
    if (themeId === 'light') {
      return false;
    } else if (themeId === 'dark') {
      return true;
    } else {
      const parent = this.#parentThemes.get(themeId);
      if (parent) {
        return this.isDarkTheme(parent);
      } else {
        console.error(`Theme ${themeId} does not exist.`);
        return true;
      }
    }
  }

  isHighContrastTheme(themeId: string): boolean {
    if (themeId === 'hc-light' || themeId === 'hc-dark') {
      return true;
    } else if (themeId === 'light' || themeId === 'dark') {
      return false;
    } else {
      const parent = this.#parentThemes.get(themeId);
      if (parent) {
        return this.isHighContrastTheme(parent);
      } else {
        return false;
      }
    }
  }

  getThemeInfo(themeId: string): ThemeInfo {
    return {
      isDark: this.isDarkTheme(themeId),
      isHighContrast: this.isHighContrastTheme(themeId),
    };
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
      }

      // fall back to parent theme (e.g. hc-light → light, hc-dark → dark)
      const parentName = this.#parentThemes.get(themeName);
      if (parentName) {
        const parentTheme = this.#themes.get(parentName);
        if (parentTheme?.has(id)) {
          return { id, cssVar, value: parentTheme.get(id)! };
        }
      }

      throw new Error(`Color ${id} is not defined in theme ${themeName}`);
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
    this.initCommon();
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
    this.initSlider();
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
    this.initFiles();
    this.initTerminal();
    this.initProgressBar();
    this.initBadge();
    this.initProviderInfo();
    this.initToast();
  }

  protected initDefaults(): void {
    const def = 'default-';

    // Global default colors
    this.registerColor(`${def}text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${def}text-link`, {
      dark: accent1[400],
      light: accent1[700],
      hcDark: accent1[300],
      hcLight: accent1[950],
    });

    this.registerColorDefinition(
      this.color(`${def}item-hover`)
        .withLight(colorPaletteHelper(accent1[600]).withAlpha(0.1))
        .withDark(colorPaletteHelper(accent1[200]).withAlpha(0.1))
        .withHcLight(colorPaletteHelper(accent1[700]).withAlpha(0.4))
        .withHcDark(colorPaletteHelper(accent1[300]).withAlpha(0.3))
        .build(),
    );
  }

  protected initNotificationDot(): void {
    this.registerColor('notification-dot', {
      dark: accent1[400],
      light: accent1[500],
      hcDark: accent1[300],
      hcLight: accent1[700],
    });
  }

  protected initGlobalNav(): void {
    const glNav = 'global-nav-';

    this.registerColor(`${glNav}bg`, {
      dark: charcoal[600],
      light: gray[100],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${glNav}bg-border`, {
      dark: charcoal[500],
      light: gray[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${glNav}icon`, {
      dark: gray[600],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${glNav}icon-hover`, {
      dark: gray[600],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${glNav}icon-hover-bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${glNav}icon-inset-bg`, {
      dark: charcoal[800],
      light: gray[300],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${glNav}icon-selected`, {
      dark: white,
      light: accent1[500],
      hcDark: white,
      hcLight: white,
    });

    this.registerColor(`${glNav}icon-selected-bg`, {
      dark: charcoal[500],
      light: gray[250],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${glNav}icon-selected-highlight`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: accent1[300],
      hcLight: accent1[700],
    });
  }

  protected initTitlebar(): void {
    const titlebar = 'titlebar-';

    this.registerColor(`${titlebar}bg`, {
      dark: isWindows() ? '#202020' : charcoal[900],
      light: gray[50],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${titlebar}text`, {
      dark: white,
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${titlebar}icon`, {
      dark: white,
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${titlebar}hover-bg`, {
      dark: charcoal[300],
      light: gray[300],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${titlebar}windows-hover-exit-bg`, {
      dark: '#c42b1c',
      light: '#c42b1c',
    });

    this.registerColor(`${titlebar}windows-hover-exit-text`, {
      dark: white,
      light: white,
      hcDark: white,
      hcLight: white,
    });

    this.registerColor(`${titlebar}windows-hover-bg`, {
      dark: '#2d2d2d',
      light: '#dfdfdf',
    });
  }

  // secondary nav (settings)
  protected initSecondaryNav(): void {
    const sNav = 'secondary-nav-';

    this.registerColor(`${sNav}bg`, {
      dark: charcoal[700],
      light: gray[100],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${sNav}header-text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}text`, {
      dark: gray[300],
      light: charcoal[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}text-hover`, {
      dark: gray[275],
      light: charcoal[750],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}text-hover-bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${sNav}text-selected`, {
      dark: white,
      light: black,
    });

    this.registerColor(`${sNav}selected-bg`, {
      dark: charcoal[500],
      light: gray[250],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${sNav}selected-highlight`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${sNav}expander`, {
      dark: white,
      light: charcoal[700],
      hcDark: white,
      hcLight: black,
    });
  }

  protected initCardContent(): void {
    const cCt = 'card-';

    this.registerColor(`${cCt}bg`, {
      dark: charcoal[800],
      light: gray[300],
      hcDark: gray[900],
      hcLight: gray[100],
    });

    this.registerColor(`${cCt}header-text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${cCt}text`, {
      dark: gray[300],
      light: charcoal[700],
      hcDark: white,
      hcLight: black,
    });
  }

  protected initInvertContent(): void {
    const invCt = 'invert-content-';

    this.registerColor(`${invCt}bg`, {
      dark: charcoal[800],
      light: gray[25],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${invCt}header-text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${invCt}header2-text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${invCt}card-bg`, {
      dark: charcoal[600],
      light: gray[100],
      hcDark: neutral[900],
      hcLight: gray[100],
    });

    this.registerColor(`${invCt}card-header-text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${invCt}card-text`, {
      dark: gray[300],
      light: charcoal[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${invCt}button-active`, {
      dark: accent1[400],
      light: accent1[500],
    });

    this.registerColor(`${invCt}button-inactive`, {
      dark: charcoal[50],
      light: charcoal[50],
    });

    this.registerColor(`${invCt}info-icon`, {
      dark: accent1[400],
      light: accent1[500],
    });

    this.registerColor(`${invCt}divider`, {
      dark: charcoal[400],
      light: gray[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColorDefinition(
      this.color(`${invCt}table-row-stripe`)
        .withLight(colorPaletteHelper(black).withAlpha(0.04))
        .withDark(colorPaletteHelper(white).withAlpha(0.04))
        .withHcLight(colorPaletteHelper(black).withAlpha(0.04))
        .withHcDark(colorPaletteHelper(white).withAlpha(0.04))
        .build(),
    );
  }

  protected initContent(): void {
    const ct = 'content-';

    this.registerColor(`${ct}breadcrumb`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: accent1[300],
      hcLight: accent1[700],
    });

    this.registerColor(`${ct}breadcrumb-2`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: accent1[300],
      hcLight: accent1[700],
    });

    this.registerColor(`${ct}header`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}text`, {
      dark: gray[700],
      light: charcoal[250],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}sub-header`, {
      dark: accent1[400],
      light: accent1[600],
      hcDark: accent1[500],
      hcLight: accent1[700],
    });

    this.registerColor(`${ct}header-icon`, {
      dark: gray[600],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}card-header-text`, {
      dark: gray[350],
      light: charcoal[850],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}card-bg`, {
      dark: charcoal[800],
      light: gray[25],
      hcDark: neutral[900],
      hcLight: gray[100],
    });

    this.registerColor(`${ct}card-hover-bg`, {
      dark: charcoal[800],
      light: gray[25],
      hcDark: neutral[900],
      hcLight: gray[100],
    });

    this.registerColor(`${ct}card-selected-bg`, {
      dark: charcoal[400],
      light: accent1[100],
      hcDark: charcoal[700],
      hcLight: gray[200],
    });

    this.registerColor(`${ct}card-text`, {
      dark: gray[350],
      light: charcoal[250],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}card-title`, {
      dark: gray[400],
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}card-light-title`, {
      dark: gray[800],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}card-inset-bg`, {
      dark: black,
      light: white,
      hcDark: black,
      hcLight: gray[100],
    });

    this.registerColor(`${ct}card-hover-inset-bg`, {
      dark: black,
      light: white,
      hcDark: charcoal[900],
      hcLight: gray[200],
    });

    this.registerColor(`${ct}bg`, {
      dark: charcoal[700],
      light: gray[100],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${ct}card-icon`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}divider`, {
      dark: charcoal[400],
      light: gray[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}card-carousel-card-bg`, {
      dark: charcoal[600],
      light: gray[100],
      hcDark: neutral[800],
      hcLight: accent1[50],
    });

    this.registerColor(`${ct}card-carousel-card-hover-bg`, {
      dark: charcoal[600],
      light: gray[100],
      hcDark: neutral[800],
      hcLight: accent1[50],
    });

    this.registerColor(`${ct}card-carousel-card-header-text`, {
      dark: gray[100],
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}card-carousel-card-text`, {
      dark: gray[400],
      light: charcoal[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ct}card-carousel-nav`, {
      dark: gray[800],
      light: gray[300],
      hcDark: transparent,
      hcLight: transparent,
    });

    this.registerColor(`${ct}card-carousel-hover-nav`, {
      dark: gray[600],
      light: gray[500],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${ct}card-carousel-disabled-nav`, {
      dark: charcoal[700],
      light: gray[200],
    });

    this.registerColor(`${ct}card-border`, {
      dark: charcoal[800],
      light: gray[200],
      hcDark: gray[300],
      hcLight: gray[850],
    });

    this.registerColor(`${ct}card-border-selected`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: accent1[500],
      hcLight: accent1[700],
    });

    this.registerColor(`${ct}table-border`, {
      dark: charcoal[400],
      light: gray[300],
      hcDark: gray[300],
      hcLight: gray[850],
    });
  }

  // input boxes
  protected initInputBox(): void {
    const sNav = 'input-field-';

    this.registerColor(`${sNav}bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${sNav}focused-bg`, {
      dark: charcoal[900],
      light: gray[100],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${sNav}disabled-bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${sNav}hover-bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${sNav}focused-text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}error-text`, {
      dark: red[550],
      light: red[550],
    });

    this.registerColor(`${sNav}disabled-text`, {
      dark: charcoal[100],
      light: gray[700],
    });

    this.registerColor(`${sNav}hover-text`, {
      dark: gray[700],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}placeholder-text`, {
      dark: gray[700],
      light: charcoal[200],
    });

    this.registerColor(`${sNav}stroke`, {
      dark: charcoal[400],
      light: gray[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}hover-stroke`, {
      dark: white,
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}stroke-error`, {
      dark: red[550],
      light: red[550],
    });

    this.registerColor(`${sNav}stroke-readonly`, {
      dark: charcoal[100],
      light: charcoal[100],
      hcDark: charcoal[50],
      hcLight: charcoal[100],
    });

    this.registerColor(`${sNav}icon`, {
      dark: gray[700],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}focused-icon`, {
      dark: gray[500],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}disabled-icon`, {
      dark: charcoal[100],
      light: gray[700],
    });

    this.registerColor(`${sNav}hover-icon`, {
      dark: gray[700],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });
  }

  // checkboxes
  protected initCheckbox(): void {
    const sNav = 'input-checkbox-';

    this.registerColor(`${sNav}disabled`, {
      dark: charcoal[350],
      light: gray[350],
    });

    this.registerColor(`${sNav}indeterminate`, {
      dark: accent1[400],
      light: accent1[500],
    });

    this.registerColor(`${sNav}focused-indeterminate`, {
      dark: accent1[400],
      light: accent1[500],
    });

    this.registerColor(`${sNav}checked`, {
      dark: accent1[400],
      light: accent1[500],
    });

    this.registerColor(`${sNav}focused-checked`, {
      dark: accent1[400],
      light: accent1[500],
    });

    this.registerColor(`${sNav}unchecked`, {
      dark: gray[275],
      light: charcoal[875],
    });

    this.registerColor(`${sNav}focused-unchecked`, {
      dark: gray[275],
      light: charcoal[875],
    });
  }

  // toggles
  protected initToggle(): void {
    const sNav = 'input-toggle-';

    this.registerColor(`${sNav}off-bg`, {
      dark: gray[900],
      light: gray[900],
      hcDark: neutral[600],
      hcLight: black,
    });

    this.registerColor(`${sNav}off-focused-bg`, {
      dark: gray[800],
      light: gray[800],
      hcDark: neutral[600],
      hcLight: black,
    });

    this.registerColor(`${sNav}on-bg`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: accent1[400],
      hcLight: accent1[700],
    });

    this.registerColor(`${sNav}on-focused-bg`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: accent1[400],
      hcLight: accent1[700],
    });

    this.registerColor(`${sNav}switch`, {
      dark: white,
      light: white,
    });

    this.registerColor(`${sNav}focused-switch`, {
      dark: white,
      light: white,
    });

    this.registerColor(`${sNav}on-text`, {
      dark: gray[300],
      light: charcoal[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}off-text`, {
      dark: gray[300],
      light: charcoal[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${sNav}disabled-text`, {
      dark: gray[700],
      light: charcoal[200],
    });

    this.registerColor(`${sNav}off-disabled-bg`, {
      dark: charcoal[900],
      light: gray[900],
    });

    this.registerColor(`${sNav}on-disabled-bg`, {
      dark: charcoal[900],
      light: gray[900],
    });

    this.registerColor(`${sNav}disabled-switch`, {
      dark: gray[200],
      light: gray[200],
    });
  }

  // range sliders
  protected initSlider(): void {
    const sld = 'input-slider-';

    // unfilled portion of the track (the filled portion comes from accent-color, see input-toggle-on-bg)
    this.registerColor(`${sld}track-bg`, {
      dark: stone[600],
      light: stone[300],
      hcDark: stone[600],
      hcLight: stone[300],
    });
  }

  protected initTable(): void {
    const tab = 'table-';

    // color of columns names
    this.registerColor(`${tab}header-text`, {
      dark: gray[600],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });

    // color of up/down arrows when column is not the ordered one
    this.registerColor(`${tab}header-unsorted`, {
      dark: charcoal[200],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    // color for most text in tables
    this.registerColor(`${tab}body-text`, {
      dark: gray[700],
      light: charcoal[100],
      hcDark: white,
      hcLight: black,
    });

    // color for the text in the main column of the table (generally Name)
    this.registerColor(`${tab}body-text-highlight`, {
      dark: gray[300],
      light: charcoal[700],
      hcDark: white,
      hcLight: black,
    });

    // color for the text in second line of main column, in secondary color (generally IDs)
    this.registerColor(`${tab}body-text-sub-secondary`, {
      dark: accent1[400],
      light: accent1[500],
    });

    // color for highlighted text in second line of main column
    this.registerColor(`${tab}body-text-sub-highlight`, {
      dark: gray[400],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });
  }

  protected initDetails(): void {
    const details = 'details-';

    this.registerColor(`${details}body-text`, {
      dark: gray[200],
      light: charcoal[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${details}empty-icon`, {
      dark: gray[600],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${details}empty-header`, {
      dark: gray[200],
      light: charcoal[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${details}empty-sub-header`, {
      dark: gray[600],
      light: charcoal[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${details}empty-cmdline-bg`, {
      dark: charcoal[900],
      light: gray[200],
      hcDark: black,
      hcLight: gray[100],
    });

    this.registerColor(`${details}empty-cmdline-text`, {
      dark: gray[400],
      light: charcoal[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${details}bg`, {
      dark: charcoal[900],
      light: gray[50],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${details}card-bg`, {
      dark: charcoal[600],
      light: gray[300],
      hcDark: gray[900],
      hcLight: gray[100],
    });

    this.registerColor(`${details}card-header`, {
      dark: gray[700],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${details}card-text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });
  }

  protected initTab(): void {
    const tab = 'tab-';

    this.registerColor(`${tab}text`, {
      dark: gray[600],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${tab}text-highlight`, {
      dark: white,
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${tab}highlight`, {
      dark: gray[275],
      light: accent1[500],
      hcDark: accent1[500],
      hcLight: accent1[700],
    });

    this.registerColor(`${tab}hover`, {
      dark: charcoal[75],
      light: gray[350],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });
  }

  // modal dialog
  protected initModal(): void {
    const modal = 'modal-';

    this.registerColor(`${modal}fade`, {
      dark: black,
      light: white,
    });

    this.registerColor(`${modal}text`, {
      dark: gray[500],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${modal}text-hover`, {
      dark: gray[300],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${modal}bg`, {
      dark: charcoal[800],
      light: gray[50],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${modal}border`, {
      dark: charcoal[500],
      light: gray[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${modal}header-bg`, {
      dark: black,
      light: gray[100],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${modal}header-text`, {
      dark: gray[150],
      light: charcoal[250],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${modal}header-divider`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColorDefinition(
      this.color(`${modal}shadow`)
        .withDark(colorPaletteHelper(black).withAlpha(0.3))
        .withLight(colorPaletteHelper(black).withAlpha(0.3))
        .withHcDark(colorPaletteHelper(black).withAlpha(0.3))
        .withHcLight(colorPaletteHelper(black).withAlpha(0.3))
        .build(),
    );
  }

  // links
  protected initLink(): void {
    const link = 'link';

    this.registerColor(`${link}`, {
      dark: accent1[400],
      light: accent1[600],
    });
    this.registerColor(`${link}-hover-bg`, {
      dark: transparent,
      light: transparent,
    });
  }

  // button
  protected initButton(): void {
    const itemDisabled = this.#definitions.get('item-disabled');
    const textLink = this.#definitions.get('default-text-link');
    const hoverItem = this.#definitions.get('default-item-hover');

    if (!itemDisabled || !textLink || !hoverItem) {
      throw new Error(
        'item-disabled, default-text-link and default-item-hover colors must be defined before button colors',
      );
    }

    const button = 'button-';

    this.registerColor(`${button}primary-bg`, {
      dark: accent1[500],
      light: accent1[500],
      hcDark: accent1[600],
      hcLight: accent1[600],
    });

    this.registerColor(`${button}primary-hover-bg`, {
      dark: accent1[400],
      light: accent1[400],
      hcDark: accent1[600],
      hcLight: accent1[600],
    });

    this.registerColorDefinition(
      this.color(`${button}primary-border`)
        .withDark(colorPaletteHelper(accent1[300]).withAlpha(0.4))
        .withLight(colorPaletteHelper(transparent))
        .withHcDark(colorPaletteHelper(accent1[100]))
        .withHcLight(colorPaletteHelper(accent1[900]))
        .build(),
    );

    this.registerColor(`${button}primary-text`, {
      dark: white,
      light: white,
      hcDark: white,
      hcLight: white,
    });

    // @deprecated since 2026-04-01. See https://github.com/podman-desktop/podman-desktop/issues/16189
    // Use `button-secondary-bg` instead
    this.registerColor(`${button}secondary`, {
      dark: stone[700], // copied from secondary-bg/dark
      light: accent1[100], // copied from secondary-bg/light
      hcDark: stone[700], // copied from secondary-bg/hcDark
      hcLight: accent1[100], // copied from secondary-bg/hcLight
    });

    this.registerColor(`${button}secondary-bg`, {
      dark: stone[700],
      light: accent1[100],
      hcDark: stone[700],
      hcLight: accent1[100],
    });

    // @deprecated since 2026-04-01. See https://github.com/podman-desktop/podman-desktop/issues/16189
    // Use `button-secondary-hover-bg` instead
    this.registerColor(`${button}secondary-hover`, {
      dark: slate[600], // copied from secondary-hover-bg/dark
      light: accent1[50], // copied from secondary-hover-bg/light
      hcDark: stone[700], // copied from secondary-hover-bg/hcDark
      hcLight: accent1[100], // copied from secondary-hover-bg/hcLight
    });

    this.registerColor(`${button}secondary-hover-bg`, {
      dark: slate[600],
      light: accent1[50],
      hcDark: stone[700],
      hcLight: accent1[100],
    });

    this.registerColorDefinition(
      this.color(`${button}secondary-border`)
        .withDark(colorPaletteHelper(gray[600]).withAlpha(0.4))
        .withLight(colorPaletteHelper(accent1[500]))
        .withHcDark(colorPaletteHelper(stone[300]))
        .withHcLight(colorPaletteHelper(accent1[800]))
        .build(),
    );

    this.registerColor(`${button}secondary-text`, {
      dark: gray[200],
      light: accent1[500],
      hcDark: white,
      hcLight: accent1[950],
    });

    this.registerColor(`${button}text`, {
      dark: white,
      light: white,
      hcDark: white,
      hcLight: white,
    });

    // @deprecated since 2026-04-01. See https://github.com/podman-desktop/podman-desktop/issues/16189
    // Use `button-disabled-bg` instead
    this.registerColor(`${button}disabled`, {
      dark: stone[700], // copied from disabled-bg/dark
      light: stone[300], // copied from disabled-bg/light
      hcDark: stone[700], // copied from disabled-bg/hcDark
      hcLight: stone[300], // copied from disabled-bg/hcLight
    });

    this.registerColor(`${button}disabled-bg`, {
      dark: stone[700],
      light: stone[300],
      hcDark: stone[700],
      hcLight: stone[300],
    });

    this.registerColor(`${button}disabled-text`, {
      dark: itemDisabled.dark,
      light: itemDisabled.light,
      hcDark: itemDisabled.hcDark,
      hcLight: itemDisabled.hcLight,
    });

    this.registerColor(`${button}danger-bg`, {
      dark: red[700],
      light: red[200],
      hcDark: red[700],
      hcLight: red[200],
    });

    this.registerColor(`${button}danger-border`, {
      dark: red[550],
      light: red[800],
      hcDark: red[100],
      hcLight: red[800],
    });

    this.registerColor(`${button}danger-text`, {
      dark: white,
      light: red[800],
      hcDark: white,
      hcLight: red[950],
    });

    // @deprecated since 2026-04-01. See https://github.com/podman-desktop/podman-desktop/issues/16189
    // Button.svelte no longer uses separate hover text color for danger buttons
    this.registerColor(`${button}danger-hover-text`, {
      dark: white,
      light: white,
    });

    this.registerColor(`${button}danger-hover-bg`, {
      dark: red[600],
      light: red[100],
      hcDark: red[700],
      hcLight: red[200],
    });

    // @deprecated since 2026-04-01. See https://github.com/podman-desktop/podman-desktop/issues/16189
    // Disabled buttons now use `button-disabled-bg` for all types
    this.registerColor(`${button}danger-disabled-border`, {
      dark: charcoal[50],
      light: gray[900],
    });

    // @deprecated since 2026-04-01. See https://github.com/podman-desktop/podman-desktop/issues/16189
    // Disabled buttons now use `button-disabled-text` for all types
    this.registerColor(`${button}danger-disabled-text`, {
      dark: charcoal[50],
      light: gray[900],
    });

    // @deprecated since 2026-04-01. See https://github.com/podman-desktop/podman-desktop/issues/16189
    // Disabled buttons now use `button-disabled-bg` for all types
    this.registerColor(`${button}danger-disabled-bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${button}tab-border`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${button}tab-border-selected`, {
      dark: textLink.dark,
      light: textLink.light,
      hcDark: accent1[300],
      hcLight: accent1[700],
    });

    this.registerColor(`${button}tab-hover-border`, {
      dark: hoverItem.dark,
      light: hoverItem.light,
      hcDark: hoverItem.hcDark,
      hcLight: hoverItem.hcLight,
    });

    this.registerColor(`${button}tab-text`, {
      dark: textLink.dark,
      light: textLink.light,
      hcDark: textLink.hcDark,
      hcLight: textLink.hcLight,
    });

    this.registerColor(`${button}tab-text-selected`, {
      dark: textLink.dark,
      light: textLink.light,
      hcDark: textLink.hcDark,
      hcLight: textLink.hcLight,
    });

    this.registerColor(`${button}close-hover-bg`, {
      dark: charcoal[300],
      light: gray[300],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${button}link-bg`, {
      dark: transparent,
      light: transparent,
      hcDark: transparent,
      hcLight: transparent,
    });

    this.registerColor(`${button}link-text`, {
      dark: textLink.dark,
      light: textLink.light,
      hcDark: textLink.hcDark,
      hcLight: textLink.hcLight,
    });

    this.registerColor(`${button}link-hover-bg`, {
      dark: hoverItem.dark,
      light: hoverItem.light,
      hcDark: hoverItem.hcDark,
      hcLight: hoverItem.hcLight,
    });

    this.registerColor(`${button}focus-ring`, {
      dark: textLink.dark,
      light: textLink.light,
      hcDark: accent1[300],
      hcLight: accent1[700],
    });

    this.registerColor(`${button}focus-ring-danger`, {
      dark: red[550],
      light: red[750],
      hcDark: red[550],
      hcLight: red[950],
    });

    // Icon-only (compact) buttons. Replace the `action-button-*` colors, values are unchanged
    this.registerColor(`${button}icon-text`, {
      dark: gray[400],
      light: charcoal[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${button}icon-bg`, {
      dark: charcoal[900],
      light: gray[400],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${button}icon-hover-bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${button}icon-hover-text`, {
      dark: gray[400],
      light: charcoal[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${button}icon-primary-text`, {
      dark: gray[275],
      light: accent1[500],
      hcDark: accent1[500],
      hcLight: accent1[700],
    });

    this.registerColor(`${button}icon-primary-hover-text`, {
      dark: gray[275],
      light: accent1[500],
      hcDark: accent1[500],
      hcLight: accent1[700],
    });

    this.registerColor(`${button}icon-disabled-text`, {
      dark: gray[900],
      light: gray[900],
    });

    // Detailed (icon with visible text) buttons
    this.registerColor(`${button}detailed-text`, {
      dark: gray[400],
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${button}detailed-bg`, {
      dark: charcoal[800],
      light: gray[50],
    });

    this.registerColor(`${button}detailed-hover-text`, {
      dark: gray[400],
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${button}detailed-disabled-text`, {
      dark: gray[900],
      light: gray[900],
    });

    this.registerColor(`${button}detailed-disabled-bg`, {
      dark: charcoal[800],
      light: gray[50],
    });

    this.registerColor(`${button}spinner`, {
      dark: accent1[400],
      light: accent1[500],
    });

    // @deprecated since 2026-04-01. See https://github.com/podman-desktop/podman-desktop/issues/16189
    // Unused color
    this.registerColor(`${button}help-link-text`, {
      dark: gray[100],
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });
  }

  // @deprecated since 2026-09-25. See https://github.com/podman-desktop/podman-desktop/issues/19058
  // Use the `button-icon-*`, `button-detailed-*` and `button-spinner` colors instead
  // Still used by ListItemButtonIcon, migrated in https://github.com/podman-desktop/podman-desktop/issues/19060
  // and by other components, migrated in https://github.com/podman-desktop/podman-desktop/issues/19415
  // Remove this method once both are done
  protected initActionButton(): void {
    const ab = 'action-button-';

    this.registerColor(`${ab}text`, {
      dark: gray[400],
      light: charcoal[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ab}bg`, {
      dark: charcoal[900],
      light: gray[400],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${ab}hover-bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${ab}hover-text`, {
      dark: gray[400],
      light: charcoal[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ab}primary-text`, {
      dark: gray[275],
      light: accent1[500],
      hcDark: accent1[500],
      hcLight: accent1[700],
    });

    this.registerColor(`${ab}primary-hover-text`, {
      dark: gray[275],
      light: accent1[500],
      hcDark: accent1[500],
      hcLight: accent1[700],
    });

    this.registerColor(`${ab}disabled-text`, {
      dark: gray[900],
      light: gray[900],
    });

    this.registerColor(`${ab}details-text`, {
      dark: gray[400],
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ab}details-bg`, {
      dark: charcoal[800],
      light: gray[50],
    });

    this.registerColor(`${ab}details-hover-text`, {
      dark: gray[400],
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${ab}details-disabled-text`, {
      dark: gray[900],
      light: gray[900],
    });

    this.registerColor(`${ab}details-disabled-bg`, {
      dark: charcoal[800],
      light: gray[50],
    });

    this.registerColor(`${ab}spinner`, {
      dark: accent1[400],
      light: accent1[500],
    });
  }

  // tooltip
  protected initTooltip(): void {
    const tooltip = 'tooltip-';

    this.registerColorDefinition(
      this.color(`${tooltip}bg`)
        .withLight(colorPaletteHelper(neutral[100]).withAlpha(0.9))
        .withDark(colorPaletteHelper(neutral[800]).withAlpha(0.8))
        .withHcLight(colorPaletteHelper(white))
        .withHcDark(colorPaletteHelper(black))
        .build(),
    );

    this.registerColor(`${tooltip}text`, {
      light: stone[900],
      dark: white,
      hcLight: black,
      hcDark: white,
    });

    this.registerColor(`${tooltip}border`, {
      // @deprecated since 2025-11-12. See https://github.com/podman-desktop/podman-desktop/pull/14819
      dark: charcoal[500],
      light: gray[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColorDefinition(
      this.color(`${tooltip}inner-border`)
        .withLight(colorPaletteHelper(white).withAlpha(0.33))
        .withDark(colorPaletteHelper(white).withAlpha(0.33))
        .withHcLight(colorPaletteHelper(white))
        .withHcDark(colorPaletteHelper(white))
        .build(),
    );

    this.registerColorDefinition(
      this.color(`${tooltip}outer-border`)
        .withLight(colorPaletteHelper(black).withAlpha(0.33))
        .withDark(colorPaletteHelper(black).withAlpha(0.8))
        .withHcLight(colorPaletteHelper(black))
        .withHcDark(colorPaletteHelper(black))
        .build(),
    );
  }

  protected initDropdown(): void {
    const dropdown = 'dropdown-';
    const select = 'select-';
    const modal = 'modal-';
    const input = 'input-';

    this.registerColor(`${dropdown}bg`, {
      dark: charcoal[600],
      light: gray[100],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${select}bg`, {
      dark: charcoal[800],
      light: gray[300],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${dropdown}ring`, {
      dark: accent1[800],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${dropdown}hover-ring`, {
      dark: accent1[700],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${dropdown}divider`, {
      dark: charcoal[600],
      light: gray[100],
      hcDark: charcoal[400],
      hcLight: gray[300],
    });

    this.registerColor(`${dropdown}item-text`, {
      dark: gray[400],
      light: charcoal[600],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${dropdown}item-hover-bg`, {
      dark: transparent,
      light: transparent,
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${dropdown}item-hover-text`, {
      dark: gray[400],
      light: charcoal[250],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${dropdown}disabled-item-text`, {
      dark: gray[900],
      light: charcoal[100],
    });

    this.registerColor(`${dropdown}disabled-item-bg`, {
      dark: charcoal[800],
      light: gray[200],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${modal}${dropdown}highlight`, {
      dark: accent1[900],
      light: accent1[50],
      hcDark: accent1[800],
      hcLight: accent1[200],
    });

    this.registerColor(`${modal}${dropdown}text`, {
      dark: white,
      light: charcoal[900],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${input}${select}hover-text`, {
      dark: gray[900],
      light: charcoal[200],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${dropdown}border`, {
      dark: transparent,
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });
  }

  // labels
  protected initLabel(): void {
    const label = 'label-';

    this.registerColor(`${label}bg`, {
      dark: charcoal[500],
      light: gray[250],
    });

    this.registerColor(`${label}text`, {
      dark: gray[450],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${label}primary-bg`, {
      dark: accent1[900],
      light: accent1[200],
    });

    this.registerColor(`${label}primary-text`, {
      dark: accent1[200],
      light: accent1[800],
    });

    this.registerColor(`${label}secondary-bg`, {
      dark: sky[900],
      light: sky[200],
    });

    this.registerColor(`${label}secondary-text`, {
      dark: sky[200],
      light: sky[900],
    });

    this.registerColor(`${label}tertiary-bg`, {
      dark: green[900],
      light: green[200],
    });

    this.registerColor(`${label}tertiary-text`, {
      dark: green[200],
      light: green[900],
    });

    this.registerColor(`${label}quaternary-bg`, {
      dark: yellow[800],
      light: yellow[100],
    });

    this.registerColor(`${label}quaternary-text`, {
      dark: yellow[400],
      light: yellow[900],
    });
  }

  protected initStatusColors(): void {
    const status = 'status-';

    // Podman & Kubernetes
    this.registerColor(`${status}running`, {
      dark: green[400],
      light: green[500],
      hcDark: green[400],
      hcLight: green[500],
    });

    // Kubernetes only
    this.registerColor(`${status}terminated`, {
      dark: red[500],
      light: red[600],
      hcDark: red[500],
      hcLight: red[700],
    });

    this.registerColor(`${status}waiting`, {
      dark: amber[500],
      light: amber[700],
      hcDark: amber[600],
      hcLight: amber[700],
    });

    // Podman only
    this.registerColor(`${status}starting`, {
      dark: green[400],
      light: green[500],
      hcDark: green[400],
      hcLight: green[500],
    });

    // Stopped & Exited are the same color / same thing in the eyes of statuses
    this.registerColor(`${status}stopped`, {
      dark: gray[500],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${status}exited`, {
      dark: gray[500],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${status}not-running`, {
      dark: gray[500],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${status}paused`, {
      dark: gray[500],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${status}degraded`, {
      dark: amber[500],
      light: amber[700],
      hcDark: amber[600],
      hcLight: amber[700],
    });

    // Others
    this.registerColor(`${status}created`, {
      dark: sky[400],
      light: sky[500],
      hcDark: sky[500],
      hcLight: sky[600],
    });

    this.registerColor(`${status}dead`, {
      dark: red[500],
      light: red[600],
      hcDark: red[500],
      hcLight: red[700],
    });

    // If we don't know the status, use gray
    this.registerColor(`${status}unknown`, {
      dark: gray[500],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    // Connections / login
    this.registerColor(`${status}connected`, {
      dark: green[400],
      light: green[500],
      hcDark: green[400],
      hcLight: green[500],
    });

    this.registerColor(`${status}disconnected`, {
      dark: gray[500],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    // Scaled / updated, use blue as it's a 'neutral' color
    // to indicate that it's informative but not a problem
    this.registerColor(`${status}updated`, {
      dark: sky[400],
      light: sky[500],
      hcDark: sky[500],
      hcLight: sky[600],
    });

    this.registerColor(`${status}ready`, {
      dark: gray[500],
      light: charcoal[300],
      hcDark: white,
      hcLight: black,
    });

    this.registerColorDefinition(
      this.color(`${status}running-bg`)
        .withLight(colorPaletteHelper(green[200]).withAlpha(0.2))
        .withDark(colorPaletteHelper(green[900]).withAlpha(0.2))
        .build(),
    );
    this.registerColorDefinition(
      this.color(`${status}stopped-bg`)
        .withLight(colorPaletteHelper(gray[300]).withAlpha(0.2))
        .withDark(colorPaletteHelper(charcoal[500]).withAlpha(0.2))
        .build(),
    );
    this.registerColorDefinition(
      this.color(`${status}terminated-bg`)
        .withLight(colorPaletteHelper(red[200]).withAlpha(0.2))
        .withDark(colorPaletteHelper(red[900]).withAlpha(0.2))
        .build(),
    );
    this.registerColorDefinition(
      this.color(`${status}starting-bg`)
        .withLight(colorPaletteHelper(green[200]).withAlpha(0.2))
        .withDark(colorPaletteHelper(green[900]).withAlpha(0.2))
        .build(),
    );
    this.registerColorDefinition(
      this.color(`${status}unknown-bg`)
        .withLight(colorPaletteHelper(gray[300]).withAlpha(0.2))
        .withDark(colorPaletteHelper(charcoal[500]).withAlpha(0.2))
        .build(),
    );

    // contrast color for the other status colors,
    // e.g. to use in status icons
    this.registerColor(`${status}contrast`, {
      dark: white,
      light: white,
    });
  }

  protected initStatusBar(): void {
    const statusbar = 'statusbar-';

    this.registerColor(`${statusbar}bg`, {
      dark: black,
      light: black,
    });

    this.registerColor(`${statusbar}hover-bg`, {
      dark: accent1[500],
      light: accent1[500],
      hcDark: accent1[600],
      hcLight: accent1[700],
    });

    this.registerColor(`${statusbar}text`, {
      dark: white,
      light: white,
    });
  }

  protected initOnboarding(): void {
    const onboarding = 'onboarding-';

    this.registerColor(`${onboarding}active-dot-bg`, {
      dark: accent1[400],
      light: accent1[500],
    });

    this.registerColor(`${onboarding}active-dot-border`, {
      dark: accent1[400],
      light: accent1[500],
    });

    this.registerColor(`${onboarding}inactive-dot-bg`, {
      dark: transparent,
      light: transparent,
    });

    this.registerColor(`${onboarding}inactive-dot-border`, {
      dark: gray[700],
      light: gray[700],
    });

    this.registerColor(`${onboarding}step-completed-text`, {
      light: white,
      dark: black,
      hcLight: white,
      hcDark: black,
    });
  }

  protected initStates(): void {
    const state = 'state-';
    const severity = 'severity-';

    // general error and warning states
    this.registerColor(`${state}success`, {
      dark: green[350],
      light: green[550],
    });

    this.registerColor(`${state}warning`, {
      dark: yellow[500],
      light: yellow[700],
    });

    this.registerColor(`${state}error`, {
      dark: red[550],
      light: red[750],
    });

    this.registerColor(`${state}info`, {
      dark: accent1[400],
      light: accent1[500],
    });

    // additional severity levels
    this.registerColor(`${severity}low`, {
      dark: gray[500],
      light: gray[500],
    });

    this.registerColor(`${severity}medium`, {
      dark: gray[800],
      light: gray[800],
    });
  }

  // colors for image files explorer
  protected initFiles(): void {
    const fc = 'files-';

    this.registerColor(`${fc}hidden`, {
      dark: red[500],
      light: red[500],
    });

    this.registerColor(`${fc}directory`, {
      dark: sky[500],
      light: sky[500],
    });

    this.registerColor(`${fc}symlink`, {
      dark: sky[300],
      light: sky[300],
    });

    this.registerColor(`${fc}executable`, {
      dark: green[500],
      light: green[500],
    });
  }

  // terminal colours
  protected initTerminal(): void {
    const terminal = 'terminal-';

    this.registerColor(`${terminal}foreground`, {
      dark: white,
      light: black,
    });

    this.registerColor(`${terminal}background`, {
      dark: black,
      light: white,
    });

    this.registerColor(`${terminal}cursor`, {
      dark: white,
      light: black,
    });

    this.registerColor(`${terminal}selectionBackground`, {
      dark: white,
      light: black,
    });

    this.registerColor(`${terminal}selectionForeground`, {
      dark: black,
      light: white,
    });

    this.registerColor(`${terminal}ansiBlack`, {
      dark: black,
      light: black,
    });

    this.registerColor(`${terminal}ansiRed`, {
      dark: red[500],
      light: red[500],
    });

    this.registerColor(`${terminal}ansiGreen`, {
      dark: green[500],
      light: green[500],
    });

    this.registerColor(`${terminal}ansiYellow`, {
      dark: yellow[500],
      light: yellow[500],
    });

    this.registerColor(`${terminal}ansiBlue`, {
      dark: sky[500],
      light: sky[500],
    });

    this.registerColor(`${terminal}ansiMagenta`, {
      dark: purple[500],
      light: purple[500],
    });

    this.registerColor(`${terminal}ansiCyan`, {
      dark: sky[500],
      light: sky[500],
    });

    this.registerColor(`${terminal}ansiWhite`, {
      dark: white,
      light: white,
    });

    this.registerColor(`${terminal}ansiBrightBlack`, {
      dark: gray[500],
      light: gray[500],
    });

    this.registerColor(`${terminal}ansiBrightRed`, {
      dark: red[600],
      light: red[600],
    });

    this.registerColor(`${terminal}ansiBrightGreen`, {
      dark: green[600],
      light: green[600],
    });

    this.registerColor(`${terminal}ansiBrightYellow`, {
      dark: yellow[600],
      light: yellow[600],
    });

    this.registerColor(`${terminal}ansiBrightBlue`, {
      dark: sky[600],
      light: sky[600],
    });

    this.registerColor(`${terminal}ansiBrightMagenta`, {
      dark: purple[600],
      light: purple[600],
    });

    this.registerColor(`${terminal}ansiBrightCyan`, {
      dark: sky[600],
      light: sky[600],
    });

    this.registerColor(`${terminal}ansiBrightWhite`, {
      dark: white,
      light: white,
    });
  }

  protected initProgressBar(): void {
    const pb = 'progressBar-';

    this.registerColor(`${pb}bg`, {
      dark: stone[600],
      light: stone[300],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${pb}in-progress-bg`, {
      dark: stone[100],
      light: stone[700],
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${pb}in-progress-border`, {
      dark: stone[800],
      light: white,
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${pb}hc-line-bg`, {
      // the line is visible only in hc modes
      dark: transparent,
      light: transparent,
      hcDark: white,
      hcLight: black,
    });

    this.registerColor(`${pb}text`, {
      dark: accent1[400],
      light: accent1[500],
      hcDark: white,
      hcLight: black,
    });
  }

  protected initBadge(): void {
    const badge = 'badge-';
    this.registerColor(`${badge}bundled-extension-bg`, {
      dark: sky[200],
      light: sky[200],
    });

    this.registerColor(`${badge}text`, {
      dark: charcoal[800],
      light: charcoal[800],
    });

    this.registerColor(`${badge}dd-extension-bg`, {
      dark: sky[600],
      light: sky[600],
    });

    this.registerColor(`${badge}devmode-extension-bg`, {
      dark: dustypurple[600],
      light: dustypurple[600],
    });

    this.registerColor(`${badge}overrides-extension-bg`, {
      dark: yellow[500],
      light: yellow[300],
    });

    this.registerColor(`${badge}dd-extension-text`, {
      dark: white,
      light: white,
    });

    this.registerColor(`${badge}sky`, {
      dark: sky[500],
      light: sky[500],
    });

    this.registerColor(`${badge}purple`, {
      dark: purple[400],
      light: purple[500],
    });

    this.registerColor(`${badge}fuchsia`, {
      dark: fuchsia[600],
      light: fuchsia[600],
    });

    // @deprecated since 2026-02-04. See https://github.com/podman-desktop/podman-desktop/issues/15187
    this.registerColor(`${badge}fuschia`, {
      dark: fuchsia[600],
      light: fuchsia[600],
    });

    this.registerColor(`${badge}gray`, {
      dark: gray[600],
      light: gray[600],
    });
  }

  protected initProviderInfo(): void {
    const provider = 'provider-';

    this.registerColor(`${provider}podman`, {
      dark: purple[600],
      light: purple[600],
      hcDark: purple[400],
      hcLight: purple[700],
    });

    this.registerColor(`${provider}docker`, {
      dark: sky[400],
      light: sky[400],
      hcDark: sky[300],
      hcLight: sky[600],
    });

    this.registerColor(`${provider}kubernetes`, {
      dark: sky[600],
      light: sky[600],
      hcDark: sky[400],
      hcLight: sky[700],
    });

    this.registerColor(`${provider}unknown`, {
      dark: gray[900],
      light: gray[900],
      hcDark: white,
      hcLight: black,
    });
  }

  protected initToast(): void {
    const toast = 'toast-';

    this.registerColor(`${toast}success-bg`, {
      dark: green[600],
      light: green[500],
      hcDark: green[400],
      hcLight: green[600],
    });

    this.registerColor(`${toast}success-color`, {
      dark: white,
      light: white,
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${toast}success-bar-bg`, {
      dark: green[500],
      light: green[400],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${toast}error-bg`, {
      dark: red[700],
      light: red[600],
      hcDark: red[400],
      hcLight: red[800],
    });

    this.registerColor(`${toast}error-color`, {
      dark: white,
      light: white,
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${toast}error-bar-bg`, {
      dark: red[500],
      light: red[400],
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${toast}warning-bg`, {
      dark: yellow[500],
      light: yellow[500],
      hcDark: yellow[400],
      hcLight: yellow[500],
    });

    this.registerColor(`${toast}warning-color`, {
      dark: black,
      light: black,
      hcDark: black,
      hcLight: black,
    });

    this.registerColor(`${toast}warning-bar-bg`, {
      dark: yellow[600],
      light: yellow[600],
      hcDark: black,
      hcLight: black,
    });

    this.registerColor(`${toast}info-bg`, {
      dark: accent1[600],
      light: accent1[500],
      hcDark: accent1[300],
      hcLight: accent1[800],
    });

    this.registerColor(`${toast}info-color`, {
      dark: white,
      light: white,
      hcDark: black,
      hcLight: white,
    });

    this.registerColor(`${toast}info-bar-bg`, {
      dark: accent1[400],
      light: accent1[300],
      hcDark: black,
      hcLight: white,
    });
  }

  protected initCommon(): void {
    this.registerColorDefinition(
      this.color('item-disabled')
        .withDark(colorPaletteHelper(stone[300]).withAlpha(0.4))
        .withLight(colorPaletteHelper(stone[600]).withAlpha(0.4))
        .withHcDark(colorPaletteHelper(stone[300]).withAlpha(0.9))
        .withHcLight(colorPaletteHelper(stone[600]).withAlpha(0.9))
        .build(),
    );

    this.registerColorDefinition(
      this.color('shadow-color')
        .withDark(colorPaletteHelper(black).withAlpha(0.1))
        .withLight(colorPaletteHelper(black).withAlpha(0.1))
        .withHcDark(colorPaletteHelper(black).withAlpha(0.1))
        .withHcLight(colorPaletteHelper(black).withAlpha(0.1))
        .build(),
    );

    this.registerColorDefinition(
      this.color('shadow-color-strong')
        .withDark(colorPaletteHelper(black).withAlpha(0.3))
        .withLight(colorPaletteHelper(black).withAlpha(0.3))
        .withHcDark(colorPaletteHelper(black).withAlpha(0.3))
        .withHcLight(colorPaletteHelper(black).withAlpha(0.3))
        .build(),
    );
  }
}
