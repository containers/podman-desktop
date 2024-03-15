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

import { get } from 'svelte/store';
import type { Mock } from 'vitest';
import { beforeAll, expect, test, vi } from 'vitest';

import type { CommandInfo } from '../../../main/src/plugin/api/command-info';
import { commandsEventStore, commandsEventStoreInfo, commandsInfos } from './commands';

// first, patch window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const getCommandPaletteCommandsMock: Mock<any, Promise<CommandInfo[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    getCommandPaletteCommands: getCommandPaletteCommandsMock,
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
  commandsEventStore.setup();
});

test('commands should be updated', async () => {
  // initial command is empty
  getCommandPaletteCommandsMock.mockResolvedValue([]);

  // get list and expect nothing there
  const commands = get(commandsInfos);
  expect(commands.length).toBe(0);

  getCommandPaletteCommandsMock.mockReset();
  getCommandPaletteCommandsMock.mockResolvedValue([
    {
      id: 'first.extension1',
      title: 'test1',
    },
    {
      id: 'second.extension2',
      title: 'test2',
    },
  ]);

  const callback = callbacks.get('system-ready');
  // send 'system-ready' event
  expect(callback).toBeDefined();
  await callback();

  // check that getCommandPaletteCommands is called
  expect(getCommandPaletteCommandsMock).toBeCalled();

  // fetch manually
  await commandsEventStoreInfo.fetch();

  // check if the commands has been updated
  const afterCommands = get(commandsInfos);
  expect(afterCommands.length).toBe(2);
});
