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
import { beforeEach, expect, test, vi } from 'vitest';
import { buildApiSender } from '.';

vi.mock('electron', async () => {
  return {
    contextBridge: {
      exposeInMainWorld: vi.fn(),
    },
    ipcRenderer: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
    },
    ipcMain: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('build Api Sender', () => {
  const apiSender = buildApiSender();

  expect(apiSender).toBeDefined();

  // add a receiver
  const received: string[] = [];
  const disposable = apiSender.receive('channel', (...val: unknown[]) => {
    received.push(String(val));
  });

  // send a message
  apiSender.send('channel', 'message');
  expect(received.length).toBe(1);
  expect(received[0]).toBe('message');

  // send another message
  apiSender.send('channel', 'message2');
  expect(received.length).toBe(2);
  expect(received[1]).toBe('message2');

  // dispose the receiver
  disposable.dispose();

  // send another message
  apiSender.send('channel', 'message3');
  // should not be received anymore as we disposed the listener
  expect(received.length).toBe(2);
});
