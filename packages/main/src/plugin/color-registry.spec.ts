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

import type { ColorDefinition, RawThemeContribution } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { AppearanceSettings } from '@desktop-framework/api/appearance';
import type { IConfigurationChangeEvent } from '@desktop-framework/api/configuration';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Emitter } from '/@/plugin/events/emitter.js';
import type { AnalyzedExtension } from '/@/plugin/extension/extension-analyzer.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import * as util from '/@/util.js';

// eslint-disable-next-line no-restricted-imports
import tailwindColorPalette from '../../../../tailwind-color-palette.json' with { type: 'json' };
import { ColorBuilder } from './color-builder.js';
import { colorPaletteHelper } from './color-palette-helper.js';
import { type ColorDefinitionWithId, ColorRegistry } from './color-registry.js';
import type { ConfigurationRegistry } from './configuration-registry.js';

class TestColorRegistry extends ColorRegistry {
  override notifyUpdate(): void {
    super.notifyUpdate();
  }
  override initColors(): void {
    super.initColors();
  }

  override trackChanges(): void {
    super.trackChanges();
  }

  override setDone(): void {
    super.setDone();
  }

  override registerColor(colorId: string, definition: ColorDefinition): void {
    super.registerColor(colorId, definition);
  }

  override registerColorDefinition(definition: ColorDefinitionWithId): void {
    super.registerColorDefinition(definition);
  }

  override color(colorId: string): ColorBuilder {
    return super.color(colorId);
  }

  override initTitlebar(): void {
    super.initTitlebar();
  }

  override initTooltip(): void {
    super.initTooltip();
  }

  override initBadge(): void {
    super.initBadge();
  }

  override initCardContent(): void {
    super.initCardContent();
  }

  override initContent(): void {
    super.initContent();
  }

  override initLabel(): void {
    super.initLabel();
  }

  override initCommon(): void {
    super.initCommon();
  }

  override initDefaults(): void {
    super.initDefaults();
  }

  override initStatusColors(): void {
    super.initStatusColors();
  }

  override initButton(): void {
    super.initButton();
  }

  override initProviderInfo(): void {
    super.initProviderInfo();
  }

  override initToast(): void {
    super.initToast();
  }

  override initProgressBar(): void {
    super.initProgressBar();
  }

  override initSlider(): void {
    super.initSlider();
  }

  override initActionButton(): void {
    super.initActionButton();
  }

  override initInvertContent(): void {
    super.initInvertContent();
  }
}

const _onDidChangeConfiguration = new Emitter<IConfigurationChangeEvent>();

const configurationRegistry = {
  _onDidChangeConfiguration,
  onDidChangeConfiguration: _onDidChangeConfiguration.event,
  addConfigurationEnum: vi.fn(),
} as unknown as ConfigurationRegistry;

let colorRegistry: TestColorRegistry;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(configurationRegistry.addConfigurationEnum).mockReturnValue(Disposable.noop());
  colorRegistry = new TestColorRegistry(apiSender, configurationRegistry);
});

describe('trackChanges', () => {
  test('check trackChanges/ onDidChangeConfiguration call notifyUpdate', async () => {
    const spyOnDidChange = vi.spyOn(configurationRegistry, 'onDidChangeConfiguration');

    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');

    colorRegistry.trackChanges();

    expect(spyOnDidChange).toHaveBeenCalled();
    // grab the anonymous function that is the first argument of the first call
    const callback = spyOnDidChange.mock.calls[0]?.[0];
    expect(callback).toBeDefined();

    // call the callback
    callback?.({
      key: `${AppearanceSettings.SectionName}.${AppearanceSettings.Appearance}`,
    } as unknown as IConfigurationChangeEvent);

    // check we have call notifyUpdate
    expect(spyOnNotifyUpdate).toHaveBeenCalled();
  });

  test('check trackChanges / onDidChangeConfiguration not called ', async () => {
    const spyOnDidChange = vi.spyOn(configurationRegistry, 'onDidChangeConfiguration');

    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');

    colorRegistry.trackChanges();

    expect(spyOnDidChange).toHaveBeenCalled();
    // grab the anonymous function that is the first argument of the first call
    const callback = spyOnDidChange.mock.calls[0]?.[0];
    expect(callback).toBeDefined();

    // call the callback
    callback?.({ key: 'dummyKey' } as unknown as IConfigurationChangeEvent);

    // check we didn't call notifyUpdate
    expect(spyOnNotifyUpdate).not.toHaveBeenCalled();
  });
});

describe('notifyUpdate', () => {
  test('notifyUpdate if not done should not call apiSender', async () => {
    const spyOnSend = vi.spyOn(apiSender, 'send');

    colorRegistry.notifyUpdate();

    expect(spyOnSend).not.toHaveBeenCalled();
  });

  test('notifyUpdate if init done should call apiSender', async () => {
    const spyOnSend = vi.spyOn(apiSender, 'send');
    colorRegistry.setDone();
    colorRegistry.notifyUpdate();

    expect(spyOnSend).toHaveBeenCalledWith('color-updated');
  });
});

test('init', async () => {
  // mock the methods
  const spyOnTrackChanges = vi.spyOn(colorRegistry, 'trackChanges');
  spyOnTrackChanges.mockReturnValue(undefined);

  const spyOnInitColors = vi.spyOn(colorRegistry, 'initColors');
  spyOnInitColors.mockReturnValue(undefined);

  const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
  spyOnNotifyUpdate.mockReturnValue(undefined);

  const spyOnSetDone = vi.spyOn(colorRegistry, 'setDone');
  spyOnSetDone.mockReturnValue(undefined);

  // call init method
  colorRegistry.init();

  expect(spyOnTrackChanges).toHaveBeenCalled();
  expect(spyOnInitColors).toHaveBeenCalled();
  expect(spyOnNotifyUpdate).toHaveBeenCalled();
  expect(spyOnSetDone).toHaveBeenCalled();
});

test('initColors', async () => {
  // spy on registerColor but let it actually register colors
  const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
  // Don't mock it - let it call through to the real implementation

  const spyOnInitProviderInfo = vi.spyOn(colorRegistry, 'initProviderInfo');

  colorRegistry.initColors();

  expect(spyOnRegisterColor).toHaveBeenCalled();

  // at least > 20 times
  expect(spyOnRegisterColor.mock.calls.length).toBeGreaterThan(20);

  expect(spyOnInitProviderInfo).toHaveBeenCalledOnce();
});

describe('initTitlebar', () => {
  test('Check on Windows', async () => {
    // mock the registerColor
    const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    //mock the isWindows to force using Windows colors
    vi.spyOn(util, 'isWindows').mockReturnValue(true);

    colorRegistry.initTitlebar();

    expect(spyOnRegisterColor).toHaveBeenCalled();

    // at least 3 times
    expect(spyOnRegisterColor.mock.calls.length).toBeGreaterThanOrEqual(3);

    // check the first call
    expect(spyOnRegisterColor.mock.calls[0]?.[0]).toStrictEqual('titlebar-bg');
    expect(spyOnRegisterColor.mock.calls[0]?.[1].light).toBe('#f9fafb');
    expect(spyOnRegisterColor.mock.calls[0]?.[1].dark).toBe('#202020');
  });

  test('Check on macOS/Linux', async () => {
    // mock the registerColor
    const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    //mock the isWindows to force using macOS/Linux colors
    vi.spyOn(util, 'isWindows').mockReturnValue(false);

    colorRegistry.initTitlebar();

    expect(spyOnRegisterColor).toHaveBeenCalled();

    // at least 3 times
    expect(spyOnRegisterColor.mock.calls.length).toBeGreaterThanOrEqual(3);

    // check the first call
    expect(spyOnRegisterColor.mock.calls[0]?.[0]).toStrictEqual('titlebar-bg');
    expect(spyOnRegisterColor.mock.calls[0]?.[1].light).toBe('#f9fafb');
    expect(spyOnRegisterColor.mock.calls[0]?.[1].dark).toBe('#0f0f11');
  });
});

test('initCardContent', async () => {
  // mock the registerColor
  const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
  spyOnRegisterColor.mockReturnValue(undefined);

  colorRegistry.initCardContent();

  expect(spyOnRegisterColor).toHaveBeenCalled();

  // at least 3 times
  expect(spyOnRegisterColor.mock.calls.length).toBeGreaterThanOrEqual(3);

  // check the first call
  expect(spyOnRegisterColor.mock.calls[0]?.[0]).toStrictEqual('card-bg');
  expect(spyOnRegisterColor.mock.calls[0]?.[1].light).toBe(tailwindColorPalette.gray[300]);
  expect(spyOnRegisterColor.mock.calls[0]?.[1].dark).toBe(tailwindColorPalette.charcoal[800]);
});

test('initContent', async () => {
  // mock the registerColor
  const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
  spyOnRegisterColor.mockReturnValue(undefined);

  colorRegistry.initContent();

  expect(spyOnRegisterColor).toHaveBeenCalled();

  // at least 10 times
  expect(spyOnRegisterColor.mock.calls.length).toBeGreaterThanOrEqual(10);

  // check the first call
  expect(spyOnRegisterColor.mock.calls[0]?.[0]).toStrictEqual('content-breadcrumb');
  expect(spyOnRegisterColor.mock.calls[0]?.[1].light).toBe(tailwindColorPalette.accent1[500]);
  expect(spyOnRegisterColor.mock.calls[0]?.[1].dark).toBe(tailwindColorPalette.accent1[400]);
});

test('initContent registers content-sub-header with high contrast values', async () => {
  colorRegistry.initColors();

  const expected = {
    light: tailwindColorPalette.accent1[600],
    dark: tailwindColorPalette.accent1[400],
    'hc-light': tailwindColorPalette.accent1[700],
    'hc-dark': tailwindColorPalette.accent1[500],
  };
  for (const [theme, value] of Object.entries(expected)) {
    const color = colorRegistry.listColors(theme).find(c => c.id === 'content-sub-header');
    expect(color?.value, theme).toBe(value);
  }
});

test('initDropdown registers dropdown-border', async () => {
  colorRegistry.initColors();

  const colorsLight = colorRegistry.listColors('light');
  const dropdownBorderLight = colorsLight.find(c => c.id === 'dropdown-border');
  expect(dropdownBorderLight).toBeDefined();
  expect(dropdownBorderLight?.value).toBe(tailwindColorPalette.accent1[500]);

  const colorsDark = colorRegistry.listColors('dark');
  const dropdownBorderDark = colorsDark.find(c => c.id === 'dropdown-border');
  expect(dropdownBorderDark).toBeDefined();
  expect(dropdownBorderDark?.value).toBe('transparent');
});

describe('registerColor', () => {
  test('registerColor not yet defined', async () => {
    // spy notifyUpdate
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    colorRegistry.registerColor('dummyColor', { light: 'lightColor', dark: 'darkColor' });

    // expect notifyUpdate to be called
    expect(spyOnNotifyUpdate).toHaveBeenCalled();

    // should have the color in two themes, light and dark
    const lightColors = colorRegistry.listColors('light');
    expect(lightColors).toBeDefined();
    expect(lightColors).toHaveLength(1);
    expect(lightColors[0]?.id).toBe('dummyColor');
    expect(lightColors[0]?.value).toBe('lightColor');

    const darkColors = colorRegistry.listColors('dark');
    expect(darkColors).toBeDefined();
    expect(darkColors).toHaveLength(1);
    expect(darkColors[0]?.id).toBe('dummyColor');
    expect(darkColors[0]?.value).toBe('darkColor');
  });

  test('registerColor already defined', async () => {
    // spy notifyUpdate
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    // register the color first
    colorRegistry.registerColor('dummyColor', { light: 'lightColor', dark: 'darkColor' });

    // and try again
    expect(() => colorRegistry.registerColor('dummyColor', { light: 'lightColor2', dark: 'darkColor2' })).toThrowError(
      'Color dummyColor already registered',
    );
  });

  test('registerColor without HC values falls back to base colors in HC themes', async () => {
    // spy notifyUpdate
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    // register the color
    colorRegistry.registerColor('hc-fallback-color', { light: 'lightColor', dark: 'darkColor' });

    // should fall back to base color
    const lightHcColors = colorRegistry.listColors('hc-light');
    expect(lightHcColors[0]?.value).toBe('lightColor');

    // should fall back to base color
    const darkHcColors = colorRegistry.listColors('hc-dark');
    expect(darkHcColors[0]?.value).toBe('darkColor');
  });

  test('registerColor with HC values uses overrides in HC themes', async () => {
    // spy notifyUpdate
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    // register the color
    colorRegistry.registerColor('hc-override-color', {
      light: 'lightColor',
      dark: 'darkColor',
      hcLight: 'hcLightColor',
      hcDark: 'hcDarkColor',
    });

    // should override color
    const hcLightColors = colorRegistry.listColors('hc-light');
    expect(hcLightColors[0]?.value).toBe('hcLightColor');

    // should override color
    const hcDarkColors = colorRegistry.listColors('hc-dark');
    expect(hcDarkColors[0]?.value).toBe('hcDarkColor');
  });
});

describe('listColors', () => {
  test('listColors provides default theme if unknown', async () => {
    // register the color first
    colorRegistry.registerColor('dummy-color', { light: 'lightColor', dark: 'darkColor' });

    // ask for a theme that does not exit, should reply with dark theme
    const colors = colorRegistry.listColors('unknownTheme');
    expect(colors).toBeDefined();
    expect(colors).toHaveLength(1);
    expect(colors[0]?.id).toBe('dummy-color');
    expect(colors[0]?.cssVar).toBe('--pd-dummy-color');
    expect(colors[0]?.value).toBe('darkColor');
  });
});

describe('isDarkTheme', () => {
  beforeEach(() => {
    const fakeExtension = {
      id: 'foo.bar',
    } as unknown as AnalyzedExtension;

    // first, init default colors
    colorRegistry.initColors();

    // register two themes with only one color
    colorRegistry.registerExtensionThemes(fakeExtension, [
      {
        id: 'dark-theme1',
        name: 'Dark Theme 1',
        parent: 'dark',
        colors: {
          titlebarBg: 'myCustomValueDark',
        },
      },
      {
        id: 'light-theme1',
        name: 'Light Theme 1',
        parent: 'light',
        colors: {
          titlebarBg: 'myCustomValueLight',
        },
      },
    ]);
  });

  test.each([
    { theme: 'light', expected: false },
    { theme: 'hc-light', expected: false },
    { theme: 'light-theme1', expected: false },
  ])('$theme is not dark', async ({ theme, expected }) => {
    const isDark = colorRegistry.isDarkTheme(theme);
    expect(isDark).toBe(expected);
  });

  test.each([
    { theme: 'dark', expected: true },
    { theme: 'hc-dark', expected: true },
    { theme: 'dark-theme1', expected: true },
    { theme: 'unknown-theme', expected: true },
  ])('$theme is dark', async ({ theme, expected }) => {
    const isDark = colorRegistry.isDarkTheme(theme);
    expect(isDark).toBe(expected);
  });
});

describe('isHighContrastTheme', () => {
  beforeEach(() => {
    const fakeExtension = {
      id: 'foo.bar',
    } as unknown as AnalyzedExtension;

    colorRegistry.initColors();

    colorRegistry.registerExtensionThemes(fakeExtension, [
      {
        id: 'hc-dark-custom',
        name: 'HC Dark Custom',
        parent: 'hc-dark',
        colors: { titlebarBg: '#000' },
      },
      {
        id: 'hc-light-custom',
        name: 'HC Light Custom',
        parent: 'hc-light',
        colors: { titlebarBg: '#fff' },
      },
      {
        id: 'dark-custom',
        name: 'Dark Custom',
        parent: 'dark',
        colors: { titlebarBg: '#111' },
      },
    ]);
  });

  test('light is not high contrast', () => {
    expect(colorRegistry.isHighContrastTheme('light')).toBeFalsy();
  });

  test('dark is not high contrast', () => {
    expect(colorRegistry.isHighContrastTheme('dark')).toBeFalsy();
  });

  test('hc-light is high contrast', () => {
    expect(colorRegistry.isHighContrastTheme('hc-light')).toBeTruthy();
  });

  test('hc-dark is high contrast', () => {
    expect(colorRegistry.isHighContrastTheme('hc-dark')).toBeTruthy();
  });

  test('custom with parent hc-dark is high contrast', () => {
    expect(colorRegistry.isHighContrastTheme('hc-dark-custom')).toBeTruthy();
  });

  test('custom with parent hc-light is high contrast', () => {
    expect(colorRegistry.isHighContrastTheme('hc-light-custom')).toBeTruthy();
  });

  test('custom with parent dark is not high contrast', () => {
    expect(colorRegistry.isHighContrastTheme('dark-custom')).toBeFalsy();
  });

  test('unknown theme is not high contrast', () => {
    expect(colorRegistry.isHighContrastTheme('unknown-theme')).toBeFalsy();
  });
});

describe('getThemeInfo', () => {
  beforeEach(() => {
    const fakeExtension = {
      id: 'foo.bar',
    } as unknown as AnalyzedExtension;

    colorRegistry.initColors();

    colorRegistry.registerExtensionThemes(fakeExtension, [
      {
        id: 'dark-theme1',
        name: 'Dark Theme 1',
        parent: 'dark',
        colors: { titlebarBg: '#111' },
      },
      {
        id: 'hc-dark-theme1',
        name: 'HC Dark Theme 1',
        parent: 'hc-dark',
        colors: { titlebarBg: '#000' },
      },
    ]);
  });

  test('light returns isDark false and isHighContrast false', () => {
    expect(colorRegistry.getThemeInfo('light')).toStrictEqual({ isDark: false, isHighContrast: false });
  });

  test('dark returns isDark true and isHighContrast false', () => {
    expect(colorRegistry.getThemeInfo('dark')).toStrictEqual({ isDark: true, isHighContrast: false });
  });

  test('hc-light returns isDark false and isHighContrast true', () => {
    expect(colorRegistry.getThemeInfo('hc-light')).toStrictEqual({ isDark: false, isHighContrast: true });
  });

  test('hc-dark returns isDark true and isHighContrast true', () => {
    expect(colorRegistry.getThemeInfo('hc-dark')).toStrictEqual({ isDark: true, isHighContrast: true });
  });

  test('custom dark theme returns isDark true and isHighContrast false', () => {
    expect(colorRegistry.getThemeInfo('dark-theme1')).toStrictEqual({ isDark: true, isHighContrast: false });
  });

  test('custom hc-dark theme returns isDark true and isHighContrast true', () => {
    expect(colorRegistry.getThemeInfo('hc-dark-theme1')).toStrictEqual({ isDark: true, isHighContrast: true });
  });
});

describe('registerExtensionThemes', () => {
  const fakeExtension = {
    id: 'foo.bar',
  } as unknown as AnalyzedExtension;

  test('register simple theme', async () => {
    // first, init default colors
    colorRegistry.initColors();

    // register two themes with only one color
    colorRegistry.registerExtensionThemes(fakeExtension, [
      {
        id: 'dark-theme1',
        name: 'Dark Theme 1',
        parent: 'dark',
        colors: {
          titlebarBg: 'myCustomValueDark',
        },
      },
      {
        id: 'light-theme1',
        name: 'Light Theme 1',
        parent: 'light',
        colors: {
          titlebarBg: 'myCustomValueLight',
        },
      },
    ]);

    // now ask for the a color defined in 'dark-theme1'
    const colors = colorRegistry.listColors('dark-theme1');
    expect(colors).toBeDefined();
    const titlebarBg = colors.find(c => c.id === 'titlebar-bg');
    expect(titlebarBg).toBeDefined();
    expect(titlebarBg?.value).toBe('myCustomValueDark');

    // now check for a color not defined in 'dark-theme1'
    const titlebarTextColor = colors.find(c => c.id === 'titlebar-text');
    expect(titlebarTextColor).toBeDefined();
    expect(titlebarTextColor?.value).toBe('#fff');

    // now ask for the a color defined in 'light-theme1'
    const colorsLight = colorRegistry.listColors('light-theme1');
    expect(colorsLight).toBeDefined();
    const titlebarBgLight = colorsLight.find(c => c.id === 'titlebar-bg');
    expect(titlebarBgLight).toBeDefined();
    expect(titlebarBgLight?.value).toBe('myCustomValueLight');

    // now check for a color not defined in 'light-theme1'
    const titlebarTextColorLight = colorsLight.find(c => c.id === 'titlebar-text');
    expect(titlebarTextColorLight).toBeDefined();
    expect(titlebarTextColorLight?.value).toBe(tailwindColorPalette.accent1[500]);
  });

  test('check dispose on Windows', async () => {
    //mock the isWindows to force using Windows colors
    vi.spyOn(util, 'isWindows').mockReturnValue(true);

    // first, init default colors
    colorRegistry.initColors();

    // register two themes with only one color
    const disposable = colorRegistry.registerExtensionThemes(fakeExtension, [
      {
        id: 'dark-theme1',
        name: 'Dark Theme 1',
        parent: 'dark',
        colors: {
          titlebarBg: 'myCustomValueDark',
        },
      },
    ]);

    // now ask for the a color defined in 'dark-theme1'
    let colors = colorRegistry.listColors('dark-theme1');
    expect(colors).toBeDefined();
    let titlebarBg = colors.find(c => c.id === 'titlebar-bg');
    expect(titlebarBg).toBeDefined();
    expect(titlebarBg?.value).toBe('myCustomValueDark');

    // dispose the extension registration
    disposable.dispose();

    // now ask for the a color defined in 'dark-theme1', it will return the default value
    colors = colorRegistry.listColors('dark-theme1');

    expect(colors).toBeDefined();
    titlebarBg = colors.find(c => c.id === 'titlebar-bg');
    expect(titlebarBg).toBeDefined();
    expect(titlebarBg?.value).toBe('#202020');
  });

  test('check dispose on macOS/Linux', async () => {
    //mock the isWindows to force using Windows colors
    vi.spyOn(util, 'isWindows').mockReturnValue(false);

    // first, init default colors
    colorRegistry.initColors();

    // register two themes with only one color
    const disposable = colorRegistry.registerExtensionThemes(fakeExtension, [
      {
        id: 'dark-theme1',
        name: 'Dark Theme 1',
        parent: 'dark',
        colors: {
          titlebarBg: 'myCustomValueDark',
        },
      },
    ]);

    // now ask for the a color defined in 'dark-theme1'
    let colors = colorRegistry.listColors('dark-theme1');
    expect(colors).toBeDefined();
    let titlebarBg = colors.find(c => c.id === 'titlebar-bg');
    expect(titlebarBg).toBeDefined();
    expect(titlebarBg?.value).toBe('myCustomValueDark');

    // dispose the extension registration
    disposable.dispose();

    // now ask for the a color defined in 'dark-theme1', it will return the default value
    colors = colorRegistry.listColors('dark-theme1');

    expect(colors).toBeDefined();
    titlebarBg = colors.find(c => c.id === 'titlebar-bg');
    expect(titlebarBg).toBeDefined();
    expect(titlebarBg?.value).toBe('#0f0f11');
  });

  test('invalid theme (undefined) should return noop disposable', async () => {
    const noopDisposable = Disposable.noop();

    // mock noop
    const noopCalls = vi.spyOn(Disposable, 'noop');
    noopCalls.mockReturnValue(noopDisposable);

    const noop = colorRegistry.registerExtensionThemes(fakeExtension, undefined as unknown as RawThemeContribution[]);
    expect(noop).toBe(noopDisposable);
  });

  test('invalid theme (not array) should return noop disposable', async () => {
    const noopDisposable = Disposable.noop();

    // mock noop
    const noopCalls = vi.spyOn(Disposable, 'noop');
    noopCalls.mockReturnValue(noopDisposable);

    const noop = colorRegistry.registerExtensionThemes(fakeExtension, {} as unknown as RawThemeContribution[]);
    expect(noop).toBe(noopDisposable);
  });

  test('invalid theme (missing id) should throw error', async () => {
    expect(() =>
      colorRegistry.registerExtensionThemes(fakeExtension, [{}] as unknown as RawThemeContribution[]),
    ).toThrowError('Missing id property in theme. Extension foo.bar');
  });

  test('invalid theme should throw error', async () => {
    expect(() =>
      colorRegistry.registerExtensionThemes(fakeExtension, [{ id: 'foo' }] as unknown as RawThemeContribution[]),
    ).toThrowError('Missing parent property in theme. Extension foo.bar');
  });

  test('invalid theme (parent is not there) should throw error', async () => {
    expect(() =>
      colorRegistry.registerExtensionThemes(fakeExtension, [
        { id: 'foo', parent: 'unknown' },
      ] as unknown as RawThemeContribution[]),
    ).toThrowError('Parent theme unknown does not exist. It is defined in extension foo.bar');
  });

  test('duplicated theme', async () => {
    // register two themes with only one color
    colorRegistry.registerExtensionThemes(fakeExtension, [
      {
        id: 'dark-theme1',
        name: 'Dark Theme 1',
        parent: 'dark',
        colors: {
          TitlebarBg: 'myCustomValueDark',
        },
      },
    ]);

    expect(() =>
      colorRegistry.registerExtensionThemes(fakeExtension, [
        { id: 'dark-theme1', parent: 'dark' },
      ] as unknown as RawThemeContribution[]),
    ).toThrowError('Theme already exists. Extension trying to register the same theme : foo.bar');
  });
});

describe('initLabel', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;

  beforeEach(() => {
    // mock the registerColor
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.initLabel();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('primary color', () => {
    expect(spyOnRegisterColor).toHaveBeenCalled();

    // check the first call
    expect(spyOnRegisterColor.mock.calls[2]?.[0]).toStrictEqual('label-primary-bg');
    expect(spyOnRegisterColor.mock.calls[2]?.[1].light).toBe(tailwindColorPalette.accent1[200]);
    expect(spyOnRegisterColor.mock.calls[2]?.[1].dark).toBe(tailwindColorPalette.accent1[900]);

    expect(spyOnRegisterColor.mock.calls[3]?.[0]).toStrictEqual('label-primary-text');
    expect(spyOnRegisterColor.mock.calls[3]?.[1].light).toBe(tailwindColorPalette.accent1[800]);
    expect(spyOnRegisterColor.mock.calls[3]?.[1].dark).toBe(tailwindColorPalette.accent1[200]);
  });

  test('secondary color', () => {
    expect(spyOnRegisterColor).toHaveBeenCalled();

    // check the first call
    expect(spyOnRegisterColor.mock.calls[4]?.[0]).toStrictEqual('label-secondary-bg');
    expect(spyOnRegisterColor.mock.calls[4]?.[1].light).toBe(tailwindColorPalette.sky[200]);
    expect(spyOnRegisterColor.mock.calls[4]?.[1].dark).toBe(tailwindColorPalette.sky[900]);

    expect(spyOnRegisterColor.mock.calls[5]?.[0]).toStrictEqual('label-secondary-text');
    expect(spyOnRegisterColor.mock.calls[5]?.[1].light).toBe(tailwindColorPalette.sky[900]);
    expect(spyOnRegisterColor.mock.calls[5]?.[1].dark).toBe(tailwindColorPalette.sky[200]);
  });

  test('tertiary color', () => {
    expect(spyOnRegisterColor).toHaveBeenCalled();

    // check the first call
    expect(spyOnRegisterColor.mock.calls[6]?.[0]).toStrictEqual('label-tertiary-bg');
    expect(spyOnRegisterColor.mock.calls[6]?.[1].light).toBe(tailwindColorPalette.green[200]);
    expect(spyOnRegisterColor.mock.calls[6]?.[1].dark).toBe(tailwindColorPalette.green[900]);

    expect(spyOnRegisterColor.mock.calls[7]?.[0]).toStrictEqual('label-tertiary-text');
    expect(spyOnRegisterColor.mock.calls[7]?.[1].light).toBe(tailwindColorPalette.green[900]);
    expect(spyOnRegisterColor.mock.calls[7]?.[1].dark).toBe(tailwindColorPalette.green[200]);
  });

  test('quaternary color', () => {
    expect(spyOnRegisterColor).toHaveBeenCalled();

    // check the first call
    expect(spyOnRegisterColor.mock.calls[8]?.[0]).toStrictEqual('label-quaternary-bg');
    expect(spyOnRegisterColor.mock.calls[8]?.[1].light).toBe(tailwindColorPalette.yellow[100]);
    expect(spyOnRegisterColor.mock.calls[8]?.[1].dark).toBe(tailwindColorPalette.yellow[800]);

    expect(spyOnRegisterColor.mock.calls[9]?.[0]).toStrictEqual('label-quaternary-text');
    expect(spyOnRegisterColor.mock.calls[9]?.[1].light).toBe(tailwindColorPalette.yellow[900]);
    expect(spyOnRegisterColor.mock.calls[9]?.[1].dark).toBe(tailwindColorPalette.yellow[400]);
  });
});

describe('badge', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;

  beforeEach(() => {
    // mock the registerColor
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.initBadge();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('devMode badge', () => {
    expect(spyOnRegisterColor).toHaveBeenCalled();

    // check the call
    expect(spyOnRegisterColor).toBeCalledWith('badge-devmode-extension-bg', {
      dark: tailwindColorPalette.dustypurple[600],
      light: tailwindColorPalette.dustypurple[600],
    });
  });

  test('overrides badge', () => {
    expect(spyOnRegisterColor).toHaveBeenCalledWith('badge-overrides-extension-bg', {
      dark: tailwindColorPalette.yellow[500],
      light: tailwindColorPalette.yellow[300],
    });
  });
});

describe('initTooltip', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;
  let spyOnRegisterColorDefinition: MockInstance<(definition: ColorDefinitionWithId) => void>;

  beforeEach(() => {
    // mock both methods since initTooltip uses both
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    spyOnRegisterColorDefinition = vi.spyOn(colorRegistry, 'registerColorDefinition');
    spyOnRegisterColorDefinition.mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('registers tooltip-bg with alpha transparency', () => {
    colorRegistry.initTooltip();

    // tooltip-bg should use registerColorDefinition
    const bgCall = spyOnRegisterColorDefinition.mock.calls.find(call => call?.[0]?.id === 'tooltip-bg');
    expect(bgCall).toBeDefined();

    const bgDefinition = bgCall?.[0];
    expect(bgDefinition?.id).toBe('tooltip-bg');
    expect(bgDefinition?.dark).toBeDefined();
    expect(bgDefinition?.light).toBeDefined();

    // verify both colors contain alpha (0.8 for dark, 0.9 for light)
    expect(bgDefinition?.dark).toContain('0.8');
    expect(bgDefinition?.light).toContain('0.9');
  });

  test('registers tooltip-text without alpha', () => {
    colorRegistry.initTooltip();

    // tooltip-text should use registerColor (old method)
    expect(spyOnRegisterColor).toHaveBeenCalledWith('tooltip-text', {
      light: tailwindColorPalette.stone[900],
      dark: tailwindColorPalette.white,
      hcLight: tailwindColorPalette.black,
      hcDark: tailwindColorPalette.white,
    });
  });

  test('registers tooltip-border with deprecation comment', () => {
    colorRegistry.initTooltip();

    // tooltip-border should still be registered (deprecated but not removed)
    expect(spyOnRegisterColor).toHaveBeenCalledWith('tooltip-border', {
      light: tailwindColorPalette.gray[500],
      dark: tailwindColorPalette.charcoal[500],
      hcDark: tailwindColorPalette.white,
      hcLight: tailwindColorPalette.black,
    });
  });

  test('registers tooltip-inner-border with low opacity', () => {
    colorRegistry.initTooltip();

    // tooltip-inner-border should use registerColorDefinition with low alpha
    const innerBorderCall = spyOnRegisterColorDefinition.mock.calls.find(
      call => call?.[0]?.id === 'tooltip-inner-border',
    );
    expect(innerBorderCall).toBeDefined();

    const innerBorderDefinition = innerBorderCall?.[0];
    expect(innerBorderDefinition?.id).toBe('tooltip-inner-border');
    expect(innerBorderDefinition?.dark).toBeDefined();
    expect(innerBorderDefinition?.light).toBeDefined();

    // verify both colors contain alpha (0.33 for both themes)
    expect(innerBorderDefinition?.dark).toContain('0.33');
    expect(innerBorderDefinition?.light).toContain('0.33');
  });

  test('registers tooltip-outer-border with varying opacity', () => {
    colorRegistry.initTooltip();

    // tooltip-outer-border should use registerColorDefinition with different alpha per theme
    const outerBorderCall = spyOnRegisterColorDefinition.mock.calls.find(
      call => call?.[0]?.id === 'tooltip-outer-border',
    );
    expect(outerBorderCall).toBeDefined();

    const outerBorderDefinition = outerBorderCall?.[0];
    expect(outerBorderDefinition?.id).toBe('tooltip-outer-border');
    expect(outerBorderDefinition?.dark).toBeDefined();
    expect(outerBorderDefinition?.light).toBeDefined();

    // verify different alpha values (0.33 for light, 0.8 for dark)
    expect(outerBorderDefinition?.dark).toContain('0.8');
    expect(outerBorderDefinition?.light).toContain('0.33');
  });

  test('calls both registerColor and registerColorDefinition', () => {
    colorRegistry.initTooltip();

    // Should call registerColor 2 times (text and border)
    expect(spyOnRegisterColor).toHaveBeenCalledTimes(2);

    // Should call registerColorDefinition 3 times (bg, inner-border, outer-border)
    expect(spyOnRegisterColorDefinition).toHaveBeenCalledTimes(3);
  });
});

describe('initCommon', () => {
  let spyOnRegisterColorDefinition: MockInstance<(definition: ColorDefinitionWithId) => void>;

  beforeEach(() => {
    // mock the registerColorDefinition
    spyOnRegisterColorDefinition = vi.spyOn(colorRegistry, 'registerColorDefinition');
    spyOnRegisterColorDefinition.mockReturnValue(undefined);

    colorRegistry.initCommon();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('registers item-disabled color using registerColorDefinition', () => {
    expect(spyOnRegisterColorDefinition).toHaveBeenCalledTimes(3);

    const itemDisabledCall = spyOnRegisterColorDefinition.mock.calls.find(call => call?.[0]?.id === 'item-disabled');
    const definition = itemDisabledCall?.[0];

    expect(definition?.id).toBe('item-disabled');
    expect(definition?.dark).toBeDefined();
    expect(definition?.light).toBeDefined();

    // verify both colors are strings (formatted CSS)
    expect(typeof definition?.dark).toBe('string');
    expect(typeof definition?.light).toBe('string');

    // verify the colors contain alpha information (0.4)
    expect(definition?.dark).toContain('0.4');
    expect(definition?.light).toContain('0.4');
  });

  test('registers shadow-color with subtle opacity', () => {
    const shadowColorCall = spyOnRegisterColorDefinition.mock.calls.find(call => call?.[0]?.id === 'shadow-color');
    const definition = shadowColorCall?.[0];

    expect(definition?.id).toBe('shadow-color');
    expect(definition?.dark).toContain('0.1');
    expect(definition?.light).toContain('0.1');
    expect(definition?.hcDark).toContain('0.1');
    expect(definition?.hcLight).toContain('0.1');
  });

  test('registers shadow-color-strong with stronger opacity', () => {
    const shadowColorStrongCall = spyOnRegisterColorDefinition.mock.calls.find(
      call => call?.[0]?.id === 'shadow-color-strong',
    );
    const definition = shadowColorStrongCall?.[0];

    expect(definition?.id).toBe('shadow-color-strong');
    expect(definition?.dark).toContain('0.3');
    expect(definition?.light).toContain('0.3');
    expect(definition?.hcDark).toContain('0.3');
    expect(definition?.hcLight).toContain('0.3');
  });
});

describe('initDefaults', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;
  let spyOnRegisterColorDefinition: MockInstance<(definition: ColorDefinitionWithId) => void>;

  beforeEach(() => {
    vi.resetAllMocks();

    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);
    spyOnRegisterColorDefinition = vi.spyOn(colorRegistry, 'registerColorDefinition');
    spyOnRegisterColorDefinition.mockReturnValue(undefined);

    colorRegistry.initDefaults();
  });

  test('registers default-text-link color', () => {
    expect(spyOnRegisterColor).toHaveBeenCalledWith('default-text-link', {
      dark: tailwindColorPalette.accent1[400],
      light: tailwindColorPalette.accent1[700],
      hcDark: tailwindColorPalette.accent1[300],
      hcLight: tailwindColorPalette.accent1[950],
    });
  });

  test('registers default-item-hover color using registerColorDefinition', () => {
    const itemHoverCall = spyOnRegisterColorDefinition.mock.calls.find(call => call?.[0]?.id === 'default-item-hover');
    expect(itemHoverCall).toBeDefined();

    const definition = itemHoverCall?.[0];
    expect(definition?.id).toBe('default-item-hover');
    expect(definition?.dark).toBeDefined();
    expect(definition?.light).toBeDefined();
    expect(definition?.hcDark).toBeDefined();
    expect(definition?.hcLight).toBeDefined();

    // verify both colors are strings (formatted CSS)
    expect(typeof definition?.dark).toBe('string');
    expect(typeof definition?.light).toBe('string');

    // verify the colors contain alpha information (0.1)
    expect(definition?.dark).toContain('0.1');
    expect(definition?.light).toContain('0.1');
    expect(definition?.hcDark).toContain('0.3');
    expect(definition?.hcLight).toContain('0.4');
  });
});

describe('initButton', () => {
  beforeEach(() => {
    // initButton requires item-disabled, default-text-link and default-item-hover
    // to be registered first, so we must call initCommon and initDefaults
    colorRegistry.initCommon();
    colorRegistry.initDefaults();
  });

  test('throws when prerequisite colors are missing', () => {
    // fresh registry without initCommon/initDefaults
    const freshRegistry = new TestColorRegistry(apiSender, configurationRegistry);
    expect(() => freshRegistry.initButton()).toThrow(
      'item-disabled, default-text-link and default-item-hover colors must be defined before button colors',
    );
  });

  test('registers primary-bg with correct values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const lightColor = lightColors.find(c => c.id === 'button-primary-bg');
    const darkColor = darkColors.find(c => c.id === 'button-primary-bg');

    expect(lightColor?.value).toBe(tailwindColorPalette.accent1[500]);
    expect(darkColor?.value).toBe(tailwindColorPalette.accent1[500]);
  });

  test('registers primary-hover-bg with accent1[400]', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(lightColors.find(c => c.id === 'button-primary-hover-bg')?.value).toBe(tailwindColorPalette.accent1[400]);
    expect(darkColors.find(c => c.id === 'button-primary-hover-bg')?.value).toBe(tailwindColorPalette.accent1[400]);
  });

  test('registers primary-border with alpha transparency', () => {
    const spyOnRegisterColorDefinition = vi.spyOn(colorRegistry, 'registerColorDefinition');

    colorRegistry.initButton();

    const primaryBorderCall = spyOnRegisterColorDefinition.mock.calls.find(
      call => call?.[0]?.id === 'button-primary-border',
    );
    expect(primaryBorderCall).toBeDefined();

    const definition = primaryBorderCall?.[0];
    expect(definition?.dark).toContain('0.4');
    expect(definition?.light).toBe('transparent');
  });

  test('registers primary-text as white for all themes', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(lightColors.find(c => c.id === 'button-primary-text')?.value).toBe(tailwindColorPalette.white);
    expect(darkColors.find(c => c.id === 'button-primary-text')?.value).toBe(tailwindColorPalette.white);
  });

  test('registers secondary-bg with stone/accent1 values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-secondary-bg')?.value).toBe(tailwindColorPalette.stone[700]);
    expect(lightColors.find(c => c.id === 'button-secondary-bg')?.value).toBe(tailwindColorPalette.accent1[100]);
  });

  test('registers deprecated button-secondary with same values as secondary-bg', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-secondary')?.value).toBe(tailwindColorPalette.stone[700]);
    expect(lightColors.find(c => c.id === 'button-secondary')?.value).toBe(tailwindColorPalette.accent1[100]);
  });

  test('registers secondary-hover-bg with slate/accent1 values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-secondary-hover-bg')?.value).toBe(tailwindColorPalette.slate[600]);
    expect(lightColors.find(c => c.id === 'button-secondary-hover-bg')?.value).toBe(tailwindColorPalette.accent1[50]);
  });

  test('registers secondary-border with alpha transparency', () => {
    const spyOnRegisterColorDefinition = vi.spyOn(colorRegistry, 'registerColorDefinition');

    colorRegistry.initButton();

    const secondaryBorderCall = spyOnRegisterColorDefinition.mock.calls.find(
      call => call?.[0]?.id === 'button-secondary-border',
    );
    expect(secondaryBorderCall).toBeDefined();

    const definition = secondaryBorderCall?.[0];
    expect(definition?.dark).toContain('0.4');
  });

  test('registers secondary-text with correct values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-secondary-text')?.value).toBe(tailwindColorPalette.gray[200]);
    expect(lightColors.find(c => c.id === 'button-secondary-text')?.value).toBe(tailwindColorPalette.accent1[500]);
  });

  test('registers disabled-bg with stone values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-disabled-bg')?.value).toBe(tailwindColorPalette.stone[700]);
    expect(lightColors.find(c => c.id === 'button-disabled-bg')?.value).toBe(tailwindColorPalette.stone[300]);
  });

  test('registers disabled-text referencing item-disabled color', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const disabledTextLight = lightColors.find(c => c.id === 'button-disabled-text');
    const disabledTextDark = darkColors.find(c => c.id === 'button-disabled-text');
    const itemDisabledLight = lightColors.find(c => c.id === 'item-disabled');
    const itemDisabledDark = darkColors.find(c => c.id === 'item-disabled');

    expect(disabledTextLight?.value).toBe(itemDisabledLight?.value);
    expect(disabledTextDark?.value).toBe(itemDisabledDark?.value);
  });

  test('registers danger-bg with red values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-danger-bg')?.value).toBe(tailwindColorPalette.red[700]);
    expect(lightColors.find(c => c.id === 'button-danger-bg')?.value).toBe(tailwindColorPalette.red[200]);
  });

  test('registers danger-border with red values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-danger-border')?.value).toBe(tailwindColorPalette.red[550]);
    expect(lightColors.find(c => c.id === 'button-danger-border')?.value).toBe(tailwindColorPalette.red[800]);
  });

  test('registers danger-text with white/red values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-danger-text')?.value).toBe(tailwindColorPalette.white);
    expect(lightColors.find(c => c.id === 'button-danger-text')?.value).toBe(tailwindColorPalette.red[800]);
  });

  test('registers danger-hover-bg with red values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-danger-hover-bg')?.value).toBe(tailwindColorPalette.red[600]);
    expect(lightColors.find(c => c.id === 'button-danger-hover-bg')?.value).toBe(tailwindColorPalette.red[100]);
  });

  test('registers link-bg as transparent', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(lightColors.find(c => c.id === 'button-link-bg')?.value).toBe('transparent');
    expect(darkColors.find(c => c.id === 'button-link-bg')?.value).toBe('transparent');
  });

  test('registers link-text referencing default-text-link color', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const linkTextLight = lightColors.find(c => c.id === 'button-link-text');
    const linkTextDark = darkColors.find(c => c.id === 'button-link-text');
    const textLinkLight = lightColors.find(c => c.id === 'default-text-link');
    const textLinkDark = darkColors.find(c => c.id === 'default-text-link');

    expect(linkTextLight?.value).toBe(textLinkLight?.value);
    expect(linkTextDark?.value).toBe(textLinkDark?.value);
  });

  test('registers link-hover-bg referencing default-item-hover color', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const linkHoverBgLight = lightColors.find(c => c.id === 'button-link-hover-bg');
    const linkHoverBgDark = darkColors.find(c => c.id === 'button-link-hover-bg');
    const hoverItemLight = lightColors.find(c => c.id === 'default-item-hover');
    const hoverItemDark = darkColors.find(c => c.id === 'default-item-hover');

    expect(linkHoverBgLight?.value).toBe(hoverItemLight?.value);
    expect(linkHoverBgDark?.value).toBe(hoverItemDark?.value);
  });

  test('registers focus-ring referencing default-text-link color', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const focusRingLight = lightColors.find(c => c.id === 'button-focus-ring');
    const focusRingDark = darkColors.find(c => c.id === 'button-focus-ring');
    const textLinkLight = lightColors.find(c => c.id === 'default-text-link');
    const textLinkDark = darkColors.find(c => c.id === 'default-text-link');

    expect(focusRingLight?.value).toBe(textLinkLight?.value);
    expect(focusRingDark?.value).toBe(textLinkDark?.value);
  });

  test('registers focus-ring-danger with red values', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    expect(darkColors.find(c => c.id === 'button-focus-ring-danger')?.value).toBe(tailwindColorPalette.red[550]);
    expect(lightColors.find(c => c.id === 'button-focus-ring-danger')?.value).toBe(tailwindColorPalette.red[750]);
  });

  test('registers tab-border-selected referencing default-text-link color', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const tabBorderSelectedLight = lightColors.find(c => c.id === 'button-tab-border-selected');
    const tabBorderSelectedDark = darkColors.find(c => c.id === 'button-tab-border-selected');
    const textLinkLight = lightColors.find(c => c.id === 'default-text-link');
    const textLinkDark = darkColors.find(c => c.id === 'default-text-link');

    expect(tabBorderSelectedLight?.value).toBe(textLinkLight?.value);
    expect(tabBorderSelectedDark?.value).toBe(textLinkDark?.value);
  });

  test('registers tab-text and tab-text-selected referencing default-text-link', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const textLinkLight = lightColors.find(c => c.id === 'default-text-link');
    const textLinkDark = darkColors.find(c => c.id === 'default-text-link');

    expect(lightColors.find(c => c.id === 'button-tab-text')?.value).toBe(textLinkLight?.value);
    expect(darkColors.find(c => c.id === 'button-tab-text')?.value).toBe(textLinkDark?.value);

    expect(lightColors.find(c => c.id === 'button-tab-text-selected')?.value).toBe(textLinkLight?.value);
    expect(darkColors.find(c => c.id === 'button-tab-text-selected')?.value).toBe(textLinkDark?.value);
  });

  test('registers tab-hover-border referencing default-item-hover', () => {
    colorRegistry.initButton();

    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const tabHoverBorderLight = lightColors.find(c => c.id === 'button-tab-hover-border');
    const tabHoverBorderDark = darkColors.find(c => c.id === 'button-tab-hover-border');
    const hoverItemLight = lightColors.find(c => c.id === 'default-item-hover');
    const hoverItemDark = darkColors.find(c => c.id === 'default-item-hover');

    expect(tabHoverBorderLight?.value).toBe(hoverItemLight?.value);
    expect(tabHoverBorderDark?.value).toBe(hoverItemDark?.value);
  });
});

describe('initStatusColors', () => {
  beforeEach(() => {
    vi.spyOn(colorRegistry, 'registerColor').mockReturnValue(undefined);
    vi.spyOn(colorRegistry, 'registerColorDefinition').mockReturnValue(undefined);

    colorRegistry.initStatusColors();
  });

  test.each([
    { id: 'status-running-bg', description: 'green alpha background' },
    { id: 'status-stopped-bg', description: 'gray/charcoal alpha background' },
    { id: 'status-terminated-bg', description: 'red alpha background' },
    { id: 'status-starting-bg', description: 'green alpha background' },
    { id: 'status-unknown-bg', description: 'gray/charcoal alpha background' },
  ])('registers $id with $description', ({ id }) => {
    const call = vi.mocked(colorRegistry.registerColorDefinition).mock.calls.find(c => c?.[0]?.id === id);
    expect(call).toBeDefined();
    const definition = call?.[0];
    expect(definition?.id).toBe(id);
    expect(definition?.light).toBeDefined();
    expect(definition?.dark).toBeDefined();
    expect(definition?.light).toContain('0.2');
    expect(definition?.dark).toContain('0.2');
  });

  test('registers exactly 5 color definitions for status backgrounds', () => {
    expect(vi.mocked(colorRegistry.registerColorDefinition)).toHaveBeenCalledTimes(5);
  });

  test.each([
    'status-running',
    'status-terminated',
    'status-waiting',
    'status-starting',
    'status-stopped',
    'status-exited',
    'status-not-running',
    'status-paused',
    'status-degraded',
    'status-created',
    'status-dead',
    'status-unknown',
    'status-connected',
    'status-disconnected',
    'status-updated',
    'status-ready',
  ])('registers %s with all four theme values', (id: string) => {
    const call = vi.mocked(colorRegistry.registerColor).mock.calls.find(c => c?.[0] === id);
    expect(call, `${id} should be registered`).toBeDefined();
    const definition = call?.[1];
    expect(definition?.dark, `${id} should have dark value`).toBeDefined();
    expect(definition?.light, `${id} should have light value`).toBeDefined();
    expect(definition?.hcDark, `${id} should have hcDark value`).toBeDefined();
    expect(definition?.hcLight, `${id} should have hcLight value`).toBeDefined();
  });

  test('registers status-paused with gray/charcoal values matching stopped status', () => {
    const call = vi.mocked(colorRegistry.registerColor).mock.calls.find(c => c?.[0] === 'status-paused');
    expect(call).toBeDefined();
    const definition = call?.[1];
    expect(definition?.dark).toBe(tailwindColorPalette.gray[500]);
    expect(definition?.light).toBe(tailwindColorPalette.charcoal[300]);
    expect(definition?.hcDark).toBe(tailwindColorPalette.white);
    expect(definition?.hcLight).toBe(tailwindColorPalette.black);
  });

  test('registers status-contrast with dark and light values', () => {
    const call = vi.mocked(colorRegistry.registerColor).mock.calls.find(c => c?.[0] === 'status-contrast');
    expect(call).toBeDefined();
    const definition = call?.[1];
    expect(definition?.dark).toBeDefined();
    expect(definition?.light).toBeDefined();
  });

  test('registers exactly 17 solid status colors', () => {
    expect(vi.mocked(colorRegistry.registerColor)).toHaveBeenCalledTimes(17);
  });
});

describe('registerColorDefinition', () => {
  test('registers color using definition with id', () => {
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    colorRegistry.registerColorDefinition({
      id: 'test-def-color',
      light: '#ffffff',
      dark: '#000000',
    });

    // Verify color was registered
    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const lightColor = lightColors.find(c => c.id === 'test-def-color');
    const darkColor = darkColors.find(c => c.id === 'test-def-color');

    expect(lightColor).toBeDefined();
    expect(lightColor?.value).toBe('#ffffff');
    expect(darkColor).toBeDefined();
    expect(darkColor?.value).toBe('#000000');
  });

  test('calls registerColor internally', () => {
    const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.registerColorDefinition({
      id: 'internal-test',
      light: '#fff',
      dark: '#000',
    });

    expect(spyOnRegisterColor).toHaveBeenCalledWith('internal-test', {
      light: '#fff',
      dark: '#000',
    });
  });

  test('passes hcDark and hcLight to registerColor when provided', () => {
    const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.registerColorDefinition({
      id: 'hc-def-test',
      light: '#fff',
      dark: '#000',
      hcDark: '#hcDarkValue',
      hcLight: '#hcLightValue',
    });

    expect(spyOnRegisterColor).toHaveBeenCalledWith('hc-def-test', {
      light: '#fff',
      dark: '#000',
      hcDark: '#hcDarkValue',
      hcLight: '#hcLightValue',
    });
  });

  test('does not pass hcDark and hcLight to registerColor when not provided', () => {
    const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.registerColorDefinition({
      id: 'no-hc-def-test',
      light: '#fff',
      dark: '#000',
    });

    expect(spyOnRegisterColor).toHaveBeenCalledWith('no-hc-def-test', {
      light: '#fff',
      dark: '#000',
    });
  });

  test('throws error for duplicate color id', () => {
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    colorRegistry.registerColorDefinition({
      id: 'duplicate-color',
      light: '#fff',
      dark: '#000',
    });

    expect(() =>
      colorRegistry.registerColorDefinition({
        id: 'duplicate-color',
        light: '#aaa',
        dark: '#bbb',
      }),
    ).toThrow('Color duplicate-color already registered');
  });
});

describe('color() fluent API', () => {
  test('returns a ColorBuilder instance', () => {
    const builder = colorRegistry.color('fluent-test');
    expect(builder).toBeInstanceOf(ColorBuilder);
  });

  test('registers color when build() is called and passed to registerColorDefinition', () => {
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    colorRegistry.registerColorDefinition(
      colorRegistry
        .color('fluent-color')
        .withLight(colorPaletteHelper('#ffffff'))
        .withDark(colorPaletteHelper('#000000'))
        .build(),
    );

    // Verify color was registered
    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const lightColor = lightColors.find(c => c.id === 'fluent-color');
    const darkColor = darkColors.find(c => c.id === 'fluent-color');

    expect(lightColor).toBeDefined();
    expect(darkColor).toBeDefined();
  });

  test('registers color with alpha when opacity is specified', () => {
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    colorRegistry.registerColorDefinition(
      colorRegistry
        .color('fluent-alpha-color')
        .withLight(colorPaletteHelper('#ffffff').withAlpha(0.5))
        .withDark(colorPaletteHelper('#000000').withAlpha(0.8))
        .build(),
    );

    // Verify color was registered with alpha
    const lightColors = colorRegistry.listColors('light');
    const darkColors = colorRegistry.listColors('dark');

    const lightColor = lightColors.find(c => c.id === 'fluent-alpha-color');
    const darkColor = darkColors.find(c => c.id === 'fluent-alpha-color');

    expect(lightColor).toBeDefined();
    expect(darkColor).toBeDefined();
    // Verify alpha is embedded in the color value (culori uses color(srgb ... / alpha) format)
    expect(lightColor?.value).toMatch(/\/ 0\.5\)?$/);
    expect(darkColor?.value).toMatch(/\/ 0\.8\)?$/);
  });

  test('does not register until build() is called and passed to registerColorDefinition', () => {
    const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');

    // Only set colors but don't call build() or register
    colorRegistry
      .color('partial-color')
      .withLight(colorPaletteHelper('#ffffff'))
      .withDark(colorPaletteHelper('#000000'));

    // Should not have registered since build() was not called and passed to register
    expect(spyOnRegisterColor).not.toHaveBeenCalled();
  });

  test('supports reverse order (dark first, then light)', () => {
    const spyOnNotifyUpdate = vi.spyOn(colorRegistry, 'notifyUpdate');
    spyOnNotifyUpdate.mockReturnValue(undefined);

    colorRegistry.registerColorDefinition(
      colorRegistry
        .color('reverse-order-color')
        .withDark(colorPaletteHelper('#000000'))
        .withLight(colorPaletteHelper('#ffffff'))
        .build(),
    );

    // Verify color was registered
    const lightColors = colorRegistry.listColors('light');
    const lightColor = lightColors.find(c => c.id === 'reverse-order-color');

    expect(lightColor).toBeDefined();
  });

  test('build throws error when light color is missing', () => {
    const builder = colorRegistry.color('incomplete-color').withDark(colorPaletteHelper('#000000'));

    expect(() => builder.build()).toThrow('Color definition for incomplete-color is incomplete.');
  });

  test('build throws error when dark color is missing', () => {
    const builder = colorRegistry.color('incomplete-color').withLight(colorPaletteHelper('#ffffff'));

    expect(() => builder.build()).toThrow('Color definition for incomplete-color is incomplete.');
  });

  test('build throws error for invalid color string', () => {
    const builder = colorRegistry
      .color('invalid-color')
      .withLight(colorPaletteHelper('not-a-color').withAlpha(0.5))
      .withDark(colorPaletteHelper('#000000'));

    expect(() => builder.build()).toThrow('Failed to parse color not-a-color');
  });
});

describe('initProviderInfo', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;

  beforeEach(() => {
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.initProviderInfo();
  });

  test('registers provider-podman with purple', () => {
    expect(spyOnRegisterColor).toBeCalledWith('provider-podman', {
      dark: tailwindColorPalette.purple[600],
      light: tailwindColorPalette.purple[600],
      hcDark: tailwindColorPalette.purple[400],
      hcLight: tailwindColorPalette.purple[700],
    });
  });

  test('registers provider-docker with sky blue', () => {
    expect(spyOnRegisterColor).toBeCalledWith('provider-docker', {
      dark: tailwindColorPalette.sky[400],
      light: tailwindColorPalette.sky[400],
      hcDark: tailwindColorPalette.sky[300],
      hcLight: tailwindColorPalette.sky[600],
    });
  });

  test('registers provider-kubernetes with sky blue', () => {
    expect(spyOnRegisterColor).toBeCalledWith('provider-kubernetes', {
      dark: tailwindColorPalette.sky[600],
      light: tailwindColorPalette.sky[600],
      hcDark: tailwindColorPalette.sky[400],
      hcLight: tailwindColorPalette.sky[700],
    });
  });

  test('registers provider-unknown with gray', () => {
    expect(spyOnRegisterColor).toBeCalledWith('provider-unknown', {
      dark: tailwindColorPalette.gray[900],
      light: tailwindColorPalette.gray[900],
      hcDark: tailwindColorPalette.white,
      hcLight: tailwindColorPalette.black,
    });
  });
});

describe('initToast', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;

  beforeEach(() => {
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.initToast();
  });

  test('registers toast-success-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-success-bg', {
      dark: tailwindColorPalette.green[600],
      light: tailwindColorPalette.green[500],
      hcDark: tailwindColorPalette.green[400],
      hcLight: tailwindColorPalette.green[600],
    });
  });

  test('registers toast-success-color', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-success-color', {
      dark: tailwindColorPalette.white,
      light: tailwindColorPalette.white,
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.white,
    });
  });

  test('registers toast-success-bar-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-success-bar-bg', {
      dark: tailwindColorPalette.green[500],
      light: tailwindColorPalette.green[400],
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.white,
    });
  });

  test('registers toast-error-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-error-bg', {
      dark: tailwindColorPalette.red[700],
      light: tailwindColorPalette.red[600],
      hcDark: tailwindColorPalette.red[400],
      hcLight: tailwindColorPalette.red[800],
    });
  });

  test('registers toast-error-color', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-error-color', {
      dark: tailwindColorPalette.white,
      light: tailwindColorPalette.white,
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.white,
    });
  });

  test('registers toast-error-bar-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-error-bar-bg', {
      dark: tailwindColorPalette.red[500],
      light: tailwindColorPalette.red[400],
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.white,
    });
  });

  test('registers toast-warning-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-warning-bg', {
      dark: tailwindColorPalette.yellow[500],
      light: tailwindColorPalette.yellow[500],
      hcDark: tailwindColorPalette.yellow[400],
      hcLight: tailwindColorPalette.yellow[500],
    });
  });

  test('registers toast-warning-color', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-warning-color', {
      dark: tailwindColorPalette.black,
      light: tailwindColorPalette.black,
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.black,
    });
  });

  test('registers toast-warning-bar-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-warning-bar-bg', {
      dark: tailwindColorPalette.yellow[600],
      light: tailwindColorPalette.yellow[600],
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.black,
    });
  });

  test('registers toast-info-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-info-bg', {
      dark: tailwindColorPalette.accent1[600],
      light: tailwindColorPalette.accent1[500],
      hcDark: tailwindColorPalette.accent1[300],
      hcLight: tailwindColorPalette.accent1[800],
    });
  });

  test('registers toast-info-color', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-info-color', {
      dark: tailwindColorPalette.white,
      light: tailwindColorPalette.white,
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.white,
    });
  });

  test('registers toast-info-bar-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('toast-info-bar-bg', {
      dark: tailwindColorPalette.accent1[400],
      light: tailwindColorPalette.accent1[300],
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.white,
    });
  });
});

describe('initProgressBar', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;

  beforeEach(() => {
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.initProgressBar();
  });

  test('registers progressBar-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('progressBar-bg', {
      dark: tailwindColorPalette.stone[600],
      light: tailwindColorPalette.stone[300],
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.white,
    });
  });

  test('registers progressBar-in-progress-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('progressBar-in-progress-bg', {
      dark: tailwindColorPalette.stone[100],
      light: tailwindColorPalette.stone[700],
      hcDark: tailwindColorPalette.white,
      hcLight: tailwindColorPalette.black,
    });
  });

  test('registers progressBar-in-progress-border', () => {
    expect(spyOnRegisterColor).toBeCalledWith('progressBar-in-progress-border', {
      dark: tailwindColorPalette.stone[800],
      light: tailwindColorPalette.white,
      hcDark: tailwindColorPalette.black,
      hcLight: tailwindColorPalette.white,
    });
  });

  test('registers progressBar-hc-line-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('progressBar-hc-line-bg', {
      dark: tailwindColorPalette.transparent,
      light: tailwindColorPalette.transparent,
      hcDark: tailwindColorPalette.white,
      hcLight: tailwindColorPalette.black,
    });
  });

  test('registers progressBar-text', () => {
    expect(spyOnRegisterColor).toBeCalledWith('progressBar-text', {
      dark: tailwindColorPalette.accent1[400],
      light: tailwindColorPalette.accent1[500],
      hcDark: tailwindColorPalette.white,
      hcLight: tailwindColorPalette.black,
    });
  });
});

describe('initSlider', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;

  beforeEach(() => {
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.initSlider();
  });

  test('registers input-slider-track-bg', () => {
    expect(spyOnRegisterColor).toBeCalledWith('input-slider-track-bg', {
      dark: tailwindColorPalette.stone[600],
      light: tailwindColorPalette.stone[300],
      hcDark: tailwindColorPalette.stone[600],
      hcLight: tailwindColorPalette.stone[300],
    });
  });
});

describe('initActionButton', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;

  beforeEach(() => {
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);

    colorRegistry.initActionButton();
  });

  test('registers action-button-primary-text with hcDark and hcLight', () => {
    expect(spyOnRegisterColor).toBeCalledWith('action-button-primary-text', {
      dark: tailwindColorPalette.gray[275],
      light: tailwindColorPalette.accent1[500],
      hcDark: tailwindColorPalette.accent1[500],
      hcLight: tailwindColorPalette.accent1[700],
    });
  });

  test('registers action-button-primary-hover-text with hcDark and hcLight', () => {
    expect(spyOnRegisterColor).toBeCalledWith('action-button-primary-hover-text', {
      dark: tailwindColorPalette.gray[275],
      light: tailwindColorPalette.accent1[500],
      hcDark: tailwindColorPalette.accent1[500],
      hcLight: tailwindColorPalette.accent1[700],
    });
  });
});

// Until ListItemButtonIcon (issue 19060) and the other direct usages (issue 19415) are migrated, both families
// must resolve to identical values. Remove this block together with initActionButton().
describe('action-button tokens stay in sync with their button-* replacements', () => {
  const ACTION_BUTTON_REPLACEMENTS: [string, string][] = [
    ['action-button-text', 'button-icon-text'],
    ['action-button-hover-text', 'button-icon-hover-text'],
    ['action-button-hover-bg', 'button-icon-hover-bg'],
    ['action-button-disabled-text', 'button-icon-disabled-text'],
    ['action-button-bg', 'button-icon-bg'],
    ['action-button-primary-text', 'button-icon-primary-text'],
    ['action-button-primary-hover-text', 'button-icon-primary-hover-text'],
    ['action-button-details-text', 'button-detailed-text'],
    ['action-button-details-bg', 'button-detailed-bg'],
    ['action-button-details-hover-text', 'button-detailed-hover-text'],
    ['action-button-details-disabled-text', 'button-detailed-disabled-text'],
    ['action-button-details-disabled-bg', 'button-detailed-disabled-bg'],
    ['action-button-spinner', 'button-spinner'],
  ];

  beforeEach(() => {
    colorRegistry.initCommon();
    colorRegistry.initDefaults();
    colorRegistry.initButton();
    colorRegistry.initActionButton();
  });

  test.each(ACTION_BUTTON_REPLACEMENTS)('%s -> %s', (oldId, newId) => {
    for (const theme of colorRegistry.listThemes()) {
      const byId = new Map(colorRegistry.listColors(theme).map(c => [c.id, c.value]));

      expect(byId.get(oldId), `${oldId} missing in ${theme}`).toBeDefined();
      expect(byId.get(newId), `${newId} in ${theme}`).toBe(byId.get(oldId));
    }
  });
});

describe('initInvertContent', () => {
  let spyOnRegisterColor: MockInstance<(colorId: string, definition: ColorDefinition) => void>;
  let spyOnRegisterColorDefinition: MockInstance<(definition: ColorDefinitionWithId) => void>;

  beforeEach(() => {
    vi.resetAllMocks();
    spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
    spyOnRegisterColor.mockReturnValue(undefined);
    spyOnRegisterColorDefinition = vi.spyOn(colorRegistry, 'registerColorDefinition');
    spyOnRegisterColorDefinition.mockReturnValue(undefined);
    colorRegistry.initInvertContent();
  });

  test('registers invert-content-table-row-stripe with alpha transparency', () => {
    const stripeCall = spyOnRegisterColorDefinition.mock.calls.find(
      call => call?.[0]?.id === 'invert-content-table-row-stripe',
    );
    expect(stripeCall).toBeDefined();

    const definition = stripeCall?.[0];
    expect(definition?.id).toBe('invert-content-table-row-stripe');
    expect(definition?.dark).toBeDefined();
    expect(definition?.light).toBeDefined();
    expect(definition?.hcDark).toBeDefined();
    expect(definition?.hcLight).toBeDefined();

    // verify 4% opacity applied across all themes
    expect(definition?.dark).toContain('0.04');
    expect(definition?.light).toContain('0.04');
    expect(definition?.hcDark).toContain('0.04');
    expect(definition?.hcLight).toContain('0.04');
  });

  test('registers solid invert-content colors via registerColor', () => {
    expect(spyOnRegisterColor).toHaveBeenCalledWith('invert-content-bg', expect.any(Object));
    expect(spyOnRegisterColor).toHaveBeenCalledWith('invert-content-divider', expect.any(Object));
  });
});
