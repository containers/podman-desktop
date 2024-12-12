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

import { beforeEach, expect, test, vi } from 'vitest';

import type { BuildImageCallback } from './build-image-task';
import { disconnectUI, eventCollect, reconnectUI, startBuild } from './build-image-task';

beforeEach(() => {
  vi.clearAllMocks();
});

test('check start build', async () => {
  const dummyCallback: BuildImageCallback = {
    onStream: vi.fn(),
    onError: vi.fn(),
    onEnd: vi.fn(),
  };

  const key = startBuild(dummyCallback);
  expect(key).toBeDefined();
});

test('check reconnect', async () => {
  const dummyCallback: BuildImageCallback = {
    onStream: vi.fn(),
    onError: vi.fn(),
    onEnd: vi.fn(),
  };

  const newCallback: BuildImageCallback = {
    onStream: vi.fn(),
    onError: vi.fn(),
    onEnd: vi.fn(),
  };

  const firstKey = startBuild(dummyCallback);

  // stream some stuff
  eventCollect(firstKey.buildImageKey, 'stream', 'hello');
  eventCollect(firstKey.buildImageKey, 'stream', 'world');

  disconnectUI(firstKey.buildImageKey);

  // send event while there is no UI connected
  eventCollect(firstKey.buildImageKey, 'stream', 'during disconnect');
  eventCollect(firstKey.buildImageKey, 'finish', '');

  reconnectUI(firstKey.buildImageKey, newCallback);

  // check that we've replayed everything (including events that happened while there was no UI connected)
  expect(newCallback.onStream).toHaveBeenCalledWith('hello\rworld\rduring disconnect\r');
  expect(newCallback.onEnd).toHaveBeenCalledTimes(1);
});

// If we error, then we should be able to see the error displayed
test('check error', async () => {
  const dummyCallback: BuildImageCallback = {
    onStream: vi.fn(),
    onError: vi.fn(),
    onEnd: vi.fn(),
  };

  const key = startBuild(dummyCallback);

  eventCollect(key.buildImageKey, 'stream', 'hello');
  eventCollect(key.buildImageKey, 'error', 'world');

  expect(dummyCallback.onStream).toHaveBeenCalledWith('hello');
  expect(dummyCallback.onError).toHaveBeenCalledWith('world');
});
