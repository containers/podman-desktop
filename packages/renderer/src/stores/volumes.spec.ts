/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { VolumeInspectInfo } from '../../../main/src/plugin/api/volume-info';
import { fetchVolumesWithData, volumeListInfos, volumesEventStore } from './volumes';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any): void => {
    callbacks.set(message, callback);
  },
};

const listVolumesMock: Mock<any, Promise<VolumeInspectInfo[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    listVolumes: listVolumesMock,
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

test('volumes should be updated in case of a container is removed', async () => {
  // initial volume
  listVolumesMock.mockResolvedValue([
    {
      Volumes: [
        {
          Name: 'volume1',
          Driver: 'driver1',
          Mountpoint: 'mountpoint1',
        },
      ],
    } as unknown as VolumeInspectInfo,
  ]);
  volumesEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // now ready to fetch volumes
  await fetchVolumesWithData();

  // now get list
  const volumes = get(volumeListInfos);
  expect(volumes.length).toBe(1);
  expect(volumes[0].Volumes.length).toBe(1);

  // ok now mock the listVolumes function to return an empty list
  listVolumesMock.mockResolvedValue([]);

  // call 'container-removed-event' event
  const containerRemovedCallback = callbacks.get('container-removed-event');
  expect(containerRemovedCallback).toBeDefined();
  await containerRemovedCallback();

  // wait debounce
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the volumes are updated
  const volumes2 = get(volumeListInfos);
  expect(volumes2.length).toBe(0);
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
])('fetch volumes when receiving event %s', async eventName => {
  // fast delays (10 & 10ms)
  volumesEventStore.setupWithDebounce(10, 10);

  // empty list
  listVolumesMock.mockResolvedValue([]);

  // mark as ready to receive updates
  callbacks.get('extensions-already-started')();

  // clear mock calls
  listVolumesMock.mockClear();

  // now, setup listVolumesMock
  listVolumesMock.mockResolvedValue([
    {
      Volumes: [
        {
          Name: 'volume1',
          Driver: 'driver1',
          Mountpoint: 'mountpoint1',
        },
      ],
    } as unknown as VolumeInspectInfo,
  ]);

  // send event
  const callback = callbacks.get(eventName);
  expect(callback).toBeDefined();
  await callback();

  // wait listContainersMock is called
  while (listVolumesMock.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // now get list
  const volumeListResult = get(volumeListInfos);
  expect(volumeListResult.length).toBe(1);
  expect(volumeListResult[0].Volumes[0].Name).toEqual('volume1');
});
