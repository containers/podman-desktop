/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';
import type { TrayMenu } from '../tray-menu';
import { EventEmitter } from 'node:events';
import { PluginSystem } from './index';
import type { WebContents } from 'electron';

let pluginSystem: PluginSystem;

const emitter = new EventEmitter();
const webContents = emitter as unknown as WebContents;

// add send method
webContents.send = vi.fn();

beforeAll(() => {
  const trayMenuMock = {} as unknown as TrayMenu;
  pluginSystem = new PluginSystem(trayMenuMock);
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should queue events until we are ready', async () => {
  const apiSender = pluginSystem.getApiSender(webContents);
  expect(apiSender).toBeDefined();

  // try to send data
  apiSender.send('foo', 'hello-world');

  // data should not be sent because it is not yet ready
  expect(webContents.send).not.toBeCalled();

  // ready on server side
  pluginSystem.markAsReady();

  // notify the app is loaded on client side
  emitter.emit('dom-ready');

  // data should be sent when flushing queue
  expect(webContents.send).toBeCalledWith('api-sender', 'foo', 'hello-world');
});
