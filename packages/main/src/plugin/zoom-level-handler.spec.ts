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
import type { BrowserWindow } from 'electron';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { AppearanceSettings } from './appearance-settings.js';
import type {
  ConfigurationRegistry,
  IConfigurationChangeEvent,
  IConfigurationPropertyRecordedSchema,
} from './configuration-registry.js';
import { Emitter } from './events/emitter.js';
import { ZoomLevelHandler } from './zoom-level-handler.js';

let zoomLevelHandler: TestZoomLevelHandler;

class TestZoomLevelHandler extends ZoomLevelHandler {
  override saveValue(): void {
    super.saveValue();
  }
}

const registerConfigurationsMock = vi.fn();
let _onDidChangeConfiguration: Emitter<IConfigurationChangeEvent>;

const browserWindowMock = {
  webContents: {},
} as unknown as BrowserWindow;

const setZoomLevelMock = vi.fn();
const getZoomLevelMock = vi.fn();
Object.defineProperty(browserWindowMock.webContents, 'zoomLevel', {
  get: getZoomLevelMock,
  set: setZoomLevelMock,
});

let configurationRegistryMock: ConfigurationRegistry;

beforeEach(() => {
  vi.resetAllMocks();
  _onDidChangeConfiguration = new Emitter<IConfigurationChangeEvent>();
  configurationRegistryMock = {
    onDidChangeConfiguration: _onDidChangeConfiguration.event,
    registerConfigurations: registerConfigurationsMock,
    updateConfigurationValue: vi.fn().mockResolvedValue({}),
    getConfigurationProperties: vi.fn().mockReturnValue({}),
    getConfiguration: vi.fn().mockReturnValue({
      get: vi.fn(),
    }),
  } as unknown as ConfigurationRegistry;
  zoomLevelHandler = new TestZoomLevelHandler(browserWindowMock, configurationRegistryMock);
});

afterEach(() => {
  _onDidChangeConfiguration.dispose();
  zoomLevelHandler.dispose();
});

test('should set zoom selected level', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({ get: () => 5 } as unknown as Configuration);

  // register configuration
  zoomLevelHandler.init();

  // check we tried to set the zoom level to 5
  expect(setZoomLevelMock).toBeCalledWith(5);
});

test('should set zoom selected if configuration change', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({ get: () => 5 } as unknown as Configuration);

  // register configuration
  zoomLevelHandler.init();

  // reset the call to set the zoom level
  setZoomLevelMock.mockClear();

  // throw a configuration but not with right key, nothing should happen
  _onDidChangeConfiguration.fire({ key: 'dummy.key', value: 10, scope: 'DEFAULT' });
  expect(setZoomLevelMock).not.toBeCalled();

  // now, update the configuration and see if the zoom level is updated
  _onDidChangeConfiguration.fire({
    key: `${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`,
    value: 10,
    scope: 'DEFAULT',
  });

  // check we tried to set the zoom level to 10
  expect(setZoomLevelMock).toBeCalledWith(10);
});

test('should zoom in and save config', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({ get: () => 5 } as unknown as Configuration);
  vi.spyOn(zoomLevelHandler, 'saveValue').mockReturnValue();

  // init
  zoomLevelHandler.init();

  setZoomLevelMock.mockClear();

  getZoomLevelMock.mockReturnValue(0);

  // call zoom in
  zoomLevelHandler.zoomIn();

  // increment of 0.5 by default
  expect(setZoomLevelMock).toBeCalledWith(0.5);

  // expect we save the value once it's done
  expect(zoomLevelHandler.saveValue).toBeCalled();
});

test('should zoom in with custom step', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({ get: () => 5 } as unknown as Configuration);

  vi.mocked(configurationRegistryMock.getConfigurationProperties).mockClear();
  vi.mocked(configurationRegistryMock.getConfigurationProperties).mockReturnValue({
    [`${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`]: {
      step: 1,
    } as unknown as IConfigurationPropertyRecordedSchema,
  });

  // init
  zoomLevelHandler.init();

  setZoomLevelMock.mockClear();

  getZoomLevelMock.mockReturnValue(0);

  // call zoom in
  zoomLevelHandler.zoomIn();

  // increment of 10 and not default 0.5
  expect(setZoomLevelMock).toBeCalledWith(1);

  // expect we save the value once it's done
  expect(vi.mocked(configurationRegistryMock.updateConfigurationValue)).toBeCalledWith(
    `${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`,
    expect.any(Number),
  );
});

test('should zoom out and save config', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({ get: () => 5 } as unknown as Configuration);
  vi.spyOn(zoomLevelHandler, 'saveValue').mockReturnValue();

  // init
  zoomLevelHandler.init();

  setZoomLevelMock.mockClear();

  getZoomLevelMock.mockReturnValue(0);

  // call zoom in
  zoomLevelHandler.zoomOut();

  // decrement of 0.5 by default
  expect(setZoomLevelMock).toBeCalledWith(-0.5);

  // expect we save the value once it's done
  expect(zoomLevelHandler.saveValue).toBeCalled();
});

test('should zoom reset and save config', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({ get: () => 5 } as unknown as Configuration);
  vi.spyOn(zoomLevelHandler, 'saveValue').mockReturnValue();

  // init
  zoomLevelHandler.init();

  setZoomLevelMock.mockClear();

  getZoomLevelMock.mockReturnValue(0);

  // call zoom in
  zoomLevelHandler.resetZoom();

  // decrement of 0.5 by default
  expect(setZoomLevelMock).toBeCalledWith(0);

  // expect we save the value once it's done
  expect(zoomLevelHandler.saveValue).toBeCalled();
});

test('should not zoom if > maximum', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({ get: () => 5 } as unknown as Configuration);
  vi.mocked(configurationRegistryMock.getConfigurationProperties).mockClear();
  vi.mocked(configurationRegistryMock.getConfigurationProperties).mockReturnValue({
    [`${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`]: {
      step: 10,
    } as unknown as IConfigurationPropertyRecordedSchema,
  });

  // init
  zoomLevelHandler.init();
  setZoomLevelMock.mockClear();
  getZoomLevelMock.mockReturnValue(0);

  // call zoom in
  zoomLevelHandler.zoomIn();

  // increment of 10 but no call to set the zoom level as it's outside of the range
  expect(setZoomLevelMock).not.toBeCalled();
});

test('should not zoom if < minimum', async () => {
  vi.mocked(configurationRegistryMock.getConfiguration).mockReturnValue({ get: () => 5 } as unknown as Configuration);
  vi.mocked(configurationRegistryMock.getConfigurationProperties).mockClear();
  vi.mocked(configurationRegistryMock.getConfigurationProperties).mockReturnValue({
    [`${AppearanceSettings.SectionName}.${AppearanceSettings.ZoomLevel}`]: {
      step: 10,
    } as unknown as IConfigurationPropertyRecordedSchema,
  });

  // init
  zoomLevelHandler.init();
  setZoomLevelMock.mockClear();
  getZoomLevelMock.mockReturnValue(0);

  // call zoom out
  zoomLevelHandler.zoomOut();

  // decrement of 10 but no call to set the zoom level as it's outside of the range
  expect(setZoomLevelMock).not.toBeCalled();
});
