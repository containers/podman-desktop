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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '/@/plugin/api.js';
import type { ColorDefinition } from '/@/plugin/api/color-info.js';
import type { RawThemeContribution } from '/@/plugin/api/theme-info.js';
import { AppearanceSettings } from '/@/plugin/appearance-settings.js';
import type { ConfigurationRegistry, IConfigurationChangeEvent } from '/@/plugin/configuration-registry.js';
import { Emitter } from '/@/plugin/events/emitter.js';
import type { AnalyzedExtension } from '/@/plugin/extension-loader.js';
import { Disposable } from '/@/plugin/types/disposable.js';

import colorPalette from '../../../../tailwind-color-palette.json';
import { ColorRegistry } from './color-registry.js';

class TestColorRegistry extends ColorRegistry {
  notifyUpdate(): void {
    super.notifyUpdate();
  }
  initColors(): void {
    super.initColors();
  }

  trackChanges(): void {
    super.trackChanges();
  }

  setDone(): void {
    super.setDone();
  }

  registerColor(colorId: string, definition: ColorDefinition): void {
    super.registerColor(colorId, definition);
  }

  initTitlebar(): void {
    super.initTitlebar();
  }

  initCardContent(): void {
    super.initCardContent();
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
    const callback = spyOnDidChange.mock.calls[0][0];
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
    const callback = spyOnDidChange.mock.calls[0][0];
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
  // mock the registerColor
  const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
  spyOnRegisterColor.mockReturnValue(undefined);

  colorRegistry.initColors();

  expect(spyOnRegisterColor).toHaveBeenCalled();

  // at least > 20 times
  expect(spyOnRegisterColor.mock.calls.length).toBeGreaterThan(20);
});

test('initTitlebar', async () => {
  // mock the registerColor
  const spyOnRegisterColor = vi.spyOn(colorRegistry, 'registerColor');
  spyOnRegisterColor.mockReturnValue(undefined);

  colorRegistry.initTitlebar();

  expect(spyOnRegisterColor).toHaveBeenCalled();

  // at least 3 times
  expect(spyOnRegisterColor.mock.calls.length).toBeGreaterThanOrEqual(3);

  // check the first call
  expect(spyOnRegisterColor.mock.calls[0][0]).toStrictEqual('titlebar-bg');
  expect(spyOnRegisterColor.mock.calls[0][1].light).toBe('#f9fafb');
  expect(spyOnRegisterColor.mock.calls[0][1].dark).toBe('#0f0f11');
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
  expect(spyOnRegisterColor.mock.calls[0][0]).toStrictEqual('card-bg');
  expect(spyOnRegisterColor.mock.calls[0][1].light).toBe(colorPalette.gray[300]);
  expect(spyOnRegisterColor.mock.calls[0][1].dark).toBe(colorPalette.charcoal[800]);
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
    expect(lightColors[0].id).toBe('dummyColor');
    expect(lightColors[0].value).toBe('lightColor');

    const darkColors = colorRegistry.listColors('dark');
    expect(darkColors).toBeDefined();
    expect(darkColors).toHaveLength(1);
    expect(darkColors[0].id).toBe('dummyColor');
    expect(darkColors[0].value).toBe('darkColor');
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
});

describe('listColors', () => {
  test('listColors provides default theme if unknown', async () => {
    // register the color first
    colorRegistry.registerColor('dummy-color', { light: 'lightColor', dark: 'darkColor' });

    // ask for a theme that does not exit, should reply with dark theme
    const colors = colorRegistry.listColors('unknownTheme');
    expect(colors).toBeDefined();
    expect(colors).toHaveLength(1);
    expect(colors[0].id).toBe('dummy-color');
    expect(colors[0].cssVar).toBe('--pd-dummy-color');
    expect(colors[0].value).toBe('darkColor');
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

  test('light', async () => {
    const isDark = colorRegistry.isDarkTheme('light');
    expect(isDark).toBeFalsy();
  });

  test('dark', async () => {
    const isDark = colorRegistry.isDarkTheme('dark');
    expect(isDark).toBeTruthy();
  });

  test('custom with parent being dark', async () => {
    const isDark = colorRegistry.isDarkTheme('dark-theme1');
    expect(isDark).toBeTruthy();
  });

  test('custom with parent being light', async () => {
    const isDark = colorRegistry.isDarkTheme('light-theme1');
    expect(isDark).toBeFalsy();
  });

  test('unknown theme should be dark', async () => {
    const isDark = colorRegistry.isDarkTheme('unknown-theme');
    expect(isDark).toBeTruthy();
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
    expect(titlebarTextColorLight?.value).toBe('#37255d');
  });

  test('check dispose', async () => {
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

  test('invalid theme (missing id) should throw error', async () => {
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
