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

import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { WindowHandler } from './window-handler.js';
import type { BrowserWindow } from 'electron';
import type { Configuration } from '@podman-desktop/api';
import { WindowSettings } from './window-settings.js';

let windowHandler: WindowHandler;

const configurationMock = {
  get: vi.fn(),
  update: vi.fn(),
} as unknown as Configuration;

const getConfigurationMock = vi.fn();

const configurationRegistryMock = {
  getConfiguration: getConfigurationMock,
} as unknown as ConfigurationRegistry;

const browserWindowMock = {
  setSize: vi.fn(),
  setPosition: vi.fn(),
  getSize: vi.fn(),
  getPosition: vi.fn(),
} as unknown as BrowserWindow;

beforeEach(() => {
  vi.resetAllMocks();
  getConfigurationMock.mockReturnValue(configurationMock);
  windowHandler = new WindowHandler(browserWindowMock, configurationRegistryMock);
});

describe('restore window', () => {
  test('perform restore should be skipped if configuration is disabled', async () => {
    vi.mocked(configurationMock.get).mockReturnValueOnce(false);

    windowHandler.restore();

    // should be the directory provided as env var
    expect(configurationRegistryMock.getConfiguration).toBeCalledWith('window');

    // first call should be false
    expect(getConfigurationMock).toBeCalledWith('window');

    // only one call to get the configuration
    expect(vi.mocked(configurationMock.get)).toBeCalledTimes(1);

    expect(vi.mocked(browserWindowMock).setSize).not.toBeCalled();
    expect(vi.mocked(browserWindowMock).setPosition).not.toBeCalled();
  });

  test('perform restore if configuration is enabled', async () => {
    vi.mocked(configurationMock.get).mockReturnValueOnce(true);
    vi.mocked(configurationMock.get).mockReturnValueOnce(1024);
    vi.mocked(configurationMock.get).mockReturnValueOnce(768);
    vi.mocked(configurationMock.get).mockReturnValueOnce(100);
    vi.mocked(configurationMock.get).mockReturnValueOnce(200);

    windowHandler.restore();

    // should be the directory provided as env var
    expect(configurationRegistryMock.getConfiguration).toBeCalledWith('window');

    // first call should be false
    expect(getConfigurationMock).toBeCalledWith('window');

    // 5 calls to get the configuration
    expect(vi.mocked(configurationMock.get)).toBeCalledTimes(5);

    expect(vi.mocked(browserWindowMock).setSize).toBeCalledWith(1024, 768);
    expect(vi.mocked(browserWindowMock).setPosition).toBeCalledWith(100, 200);
  });
});

describe('save window', () => {
  test('perform save', async () => {
    vi.mocked(browserWindowMock.getSize).mockReturnValue([1024, 768]);
    vi.mocked(browserWindowMock.getPosition).mockReturnValue([100, 200]);
    vi.mocked(configurationMock.get).mockReturnValueOnce(false);

    // perform 5 save in a row
    windowHandler.savePositionAndSize();
    windowHandler.savePositionAndSize();
    windowHandler.savePositionAndSize();
    windowHandler.savePositionAndSize();
    windowHandler.savePositionAndSize();

    // wait that this.#browserWindow.getSize is called
    await vi.waitFor(() => expect(vi.mocked(browserWindowMock.getSize)).toHaveBeenCalled());

    expect(configurationMock.update).toBeCalledWith(WindowSettings.Width, 1024);
    expect(configurationMock.update).toBeCalledWith(WindowSettings.Height, 768);
    expect(configurationMock.update).toBeCalledWith(WindowSettings.XPosition, 100);
    expect(configurationMock.update).toBeCalledWith(WindowSettings.YPosition, 200);
  });
});
