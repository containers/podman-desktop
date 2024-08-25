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

import type { Configuration } from '@podman-desktop/api';
import type { BrowserWindow, Display, Rectangle } from 'electron';
import { screen } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';

import { WindowHandler } from './window-handler.js';
import { WindowSettings } from './window-settings.js';

let windowHandler: WindowHandler;

const configurationMock = {
  get: vi.fn(),
  update: vi.fn(),
} as unknown as Configuration;

const getConfigurationMock = vi.fn();

const configurationRegistryMock = {
  getConfiguration: getConfigurationMock,
  registerConfigurations: vi.fn(),
} as unknown as ConfigurationRegistry;

const browserWindowMock = {
  setSize: vi.fn(),
  setPosition: vi.fn(),
  getBounds: vi.fn(),
} as unknown as BrowserWindow;

vi.mock('electron', async () => {
  return {
    screen: {
      getDisplayMatching: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  getConfigurationMock.mockReturnValue(configurationMock);
  windowHandler = new WindowHandler(configurationRegistryMock, browserWindowMock);
});

describe('restore window', () => {
  const initialBounds = { height: 768, width: 1024, x: 100, y: 200 };

  test('perform restore should be skipped if configuration is disabled', async () => {
    vi.mocked(configurationMock.get).mockReturnValueOnce(false);

    windowHandler.restore(initialBounds);

    // should be the directory provided as env var
    expect(configurationRegistryMock.getConfiguration).toBeCalledWith('window');

    // first call should be false
    expect(getConfigurationMock).toBeCalledWith('window');

    // only one call to get the configuration
    expect(vi.mocked(configurationMock.get)).toBeCalledTimes(1);

    expect(vi.mocked(browserWindowMock).setPosition).not.toBeCalled();
    expect(vi.mocked(browserWindowMock).setSize).not.toBeCalled();
  });

  test('perform restore if configuration is enabled', async () => {
    const savedBounds: Rectangle = { height: 500, width: 1000, x: 50, y: 250 };
    vi.mocked(screen.getDisplayMatching).mockReturnValue({
      workArea: { x: 0, y: 0, width: 1920, height: 1080 },
    } as Display);
    vi.mocked(configurationMock.get).mockReturnValueOnce(true);
    vi.mocked(configurationMock.get).mockReturnValueOnce(savedBounds);

    windowHandler.restore(initialBounds);

    // should be the directory provided as env var
    expect(configurationRegistryMock.getConfiguration).toBeCalledWith('window');

    // first call should be false
    expect(getConfigurationMock).toBeCalledWith('window');

    // 5 calls to get the configuration
    expect(vi.mocked(configurationMock.get)).toBeCalledTimes(2);

    expect(vi.mocked(browserWindowMock).setSize).toBeCalledWith(savedBounds.width, savedBounds.height);
    expect(vi.mocked(browserWindowMock).setPosition).toBeCalledWith(savedBounds.x, savedBounds.y);
  });

  test('perform restore if configuration is enabled but screen is different with saved width/height', async () => {
    const savedBounds: Rectangle = { height: 500, width: 1000, x: 2000, y: 2000 };
    const display = {
      workArea: { x: 0, y: 0, width: 1920, height: 1080 },
    } as Display;
    vi.mocked(screen.getDisplayMatching).mockReturnValue(display);
    vi.mocked(configurationMock.get).mockReturnValueOnce(true);
    vi.mocked(configurationMock.get).mockReturnValueOnce(savedBounds);

    windowHandler.restore(initialBounds);

    // should be the directory provided as env var
    expect(configurationRegistryMock.getConfiguration).toBeCalledWith('window');

    // first call should be false
    expect(getConfigurationMock).toBeCalledWith('window');

    // 5 calls to get the configuration
    expect(vi.mocked(configurationMock.get)).toBeCalledTimes(2);

    // expect we got the centered bounds with existing width and height as current width and height fit
    const centeredBounds = {
      ...savedBounds,
    };
    centeredBounds.x = Math.floor(display.workArea.x + (display.workArea.width - savedBounds.width) / 2);
    centeredBounds.y = Math.floor(display.workArea.y + (display.workArea.height - savedBounds.height) / 2);

    expect(vi.mocked(browserWindowMock).setSize).toBeCalledWith(centeredBounds.width, centeredBounds.height);
    expect(vi.mocked(browserWindowMock).setPosition).toBeCalledWith(centeredBounds.x, centeredBounds.y);
  });

  test('perform restore if configuration is enabled but screen is different with initial width/height', async () => {
    const savedBounds: Rectangle = { height: 800, width: 1000, x: 2000, y: 2000 };
    // display is too small to fit the saved window
    const display = {
      workArea: { x: 0, y: 0, width: 780, height: 1080 },
    } as Display;
    vi.mocked(screen.getDisplayMatching).mockReturnValue(display);
    vi.mocked(configurationMock.get).mockReturnValueOnce(true);
    vi.mocked(configurationMock.get).mockReturnValueOnce(savedBounds);

    windowHandler.restore(initialBounds);

    // should be the directory provided as env var
    expect(configurationRegistryMock.getConfiguration).toBeCalledWith('window');

    // first call should be false
    expect(getConfigurationMock).toBeCalledWith('window');

    // 5 calls to get the configuration
    expect(vi.mocked(configurationMock.get)).toBeCalledTimes(2);

    // expect we got the initial bounds as it is not fitting

    expect(vi.mocked(browserWindowMock).setSize).toBeCalledWith(1024, 768);
    expect(vi.mocked(browserWindowMock).setPosition).toBeCalledWith(100, 200);
  });
});

describe('save window', () => {
  test('perform save', async () => {
    const bounds = { height: 768, width: 1024, x: 100, y: 200 };
    vi.mocked(screen.getDisplayMatching).mockReturnValue({
      workArea: { x: 0, y: 0, width: 1920, height: 1080 },
    } as Display);
    vi.mocked(browserWindowMock.getBounds).mockReturnValue(bounds);
    vi.mocked(configurationMock.get).mockReturnValueOnce(false);

    // perform 5 save in a row
    windowHandler.savePositionAndSize();
    windowHandler.savePositionAndSize();
    windowHandler.savePositionAndSize();
    windowHandler.savePositionAndSize();
    windowHandler.savePositionAndSize();

    // wait that this.#browserWindow.getBounds is called
    await vi.waitFor(() => expect(vi.mocked(browserWindowMock.getBounds)).toHaveBeenCalled());

    expect(configurationMock.update).toBeCalledWith(WindowSettings.Bounds, bounds);
  });
});

test('should register a configuration', async () => {
  // register configuration
  windowHandler.init();

  // should be the directory provided as env var
  expect(configurationRegistryMock.registerConfigurations).toBeCalled();

  // take first argument of first call
  const configurationNode = vi.mocked(configurationRegistryMock).registerConfigurations.mock.calls[0]?.[0][0];
  expect(configurationNode?.id).toBe('preferences.savePosition');
  expect(configurationNode?.title).toBe('Window');
  expect(configurationNode?.type).toBe('object');
  expect(configurationNode?.properties).toBeDefined();
  expect(configurationNode?.properties?.['window.bounds']).toBeDefined();
  expect(configurationNode?.properties?.['window.bounds']?.description).toBe('bounds of the window');
  expect(configurationNode?.properties?.['window.restorePosition']?.type).toBe('boolean');
  expect(configurationNode?.properties?.['window.restorePosition']?.description).toBe(
    'Restore position and size of the window after a restart',
  );
  expect(configurationNode?.properties?.['window.restorePosition']?.default).toBeTruthy();
});
