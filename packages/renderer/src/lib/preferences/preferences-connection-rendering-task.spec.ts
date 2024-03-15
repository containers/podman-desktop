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

import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { tasksInfo } from '/@/stores/tasks';

import type { ConnectionCallback } from './preferences-connection-rendering-task';
import {
  clearCreateTask,
  disconnectUI,
  eventCollect,
  reconnectUI,
  startTask,
} from './preferences-connection-rendering-task';

const dummyCallback: ConnectionCallback = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  onEnd: vi.fn(),
};

const newCallback: ConnectionCallback = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  onEnd: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

test('check start build', async () => {
  const id = 'ui-1';
  const key = startTask('foo', id, dummyCallback);
  expect(key).toBeDefined();
  const allTasks = get(tasksInfo);
  const matchingTask = allTasks.find(task => task.id === id);
  expect(matchingTask).toBeDefined();
  clearCreateTask(key);
  const allTasksAfter = get(tasksInfo);
  const matchingTaskAfter = allTasksAfter.find(task => task.id === id);
  expect(matchingTaskAfter).toBeUndefined();
});

test('check reconnect', async () => {
  const firstKey = startTask('bar', '2', dummyCallback);

  // stream some stuff
  eventCollect(firstKey, 'log', ['hello']);
  eventCollect(firstKey, 'log', ['world']);

  disconnectUI(firstKey);

  // send event while there is no UI connected
  eventCollect(firstKey, 'log', ['during disconnect']);
  eventCollect(firstKey, 'finish', []);

  reconnectUI(firstKey, newCallback);

  // check that we've replayed everything (including events that happened while there was no UI connected)
  expect(newCallback.log).toHaveBeenCalledWith([['hello'], ['world'], ['during disconnect']]);
  expect(newCallback.onEnd).toHaveBeenCalledTimes(1);
});

test('check events', async () => {
  const firstKey = startTask('baz', 'url', dummyCallback);

  // stream some stuff
  eventCollect(firstKey, 'log', ['hello']);
  eventCollect(firstKey, 'warn', ['world']);
  eventCollect(firstKey, 'error', ['foo']);
  eventCollect(firstKey, 'finish', []);

  expect(dummyCallback.log).toHaveBeenCalledWith(['hello']);
  expect(dummyCallback.warn).toHaveBeenCalledWith(['world']);
  expect(dummyCallback.error).toHaveBeenCalledWith(['foo']);
  expect(dummyCallback.onEnd).toHaveBeenCalled();
});
