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

import { get } from 'svelte/store';
import type { Mock } from 'vitest';
import { beforeAll, expect, test, vi } from 'vitest';

import type { PodInfo } from '../../../main/src/plugin/api/pod-info';
import { podsEventStore, podsInfos } from './pods';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listPodsMock: Mock<any, Promise<PodInfo[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    listPods: listPodsMock,
    kubernetesListPods: vi.fn().mockImplementation(() => Promise.resolve([])),
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
});

test.each([
  ['container-created-event'],
  ['container-stopped-event'],
  ['container-kill-event'],
  ['container-die-event'],
  ['container-init-event'],
  ['container-started-event'],
  ['container-created-event'],
  ['container-removed-event'],
])('fetch pods when receiving event %s', async eventName => {
  // fast delays (10 & 10ms)
  podsEventStore.setupWithDebounce(10, 10);

  // empty list
  listPodsMock.mockResolvedValue([]);

  // mark as ready to receive updates
  callbacks.get('extensions-already-started')();

  // clear mock calls
  listPodsMock.mockClear();

  // now, setup at least one container
  listPodsMock.mockResolvedValue([
    {
      Id: 'id123',
    } as unknown as PodInfo,
  ]);

  // send event
  const callback = callbacks.get(eventName);
  expect(callback).toBeDefined();
  await callback();

  // wait listContainersMock is called
  while (listPodsMock.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // now get list
  const podListResult = get(podsInfos);
  expect(podListResult.length).toBe(1);
  expect(podListResult[0].Id).toEqual('id123');
});
