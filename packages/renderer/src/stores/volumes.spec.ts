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
import { expect, test, vi } from 'vitest';
import type { VolumeInspectInfo } from '../../../main/src/plugin/api/volume-info';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
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

// do the import now to make sure the window object is initialized before
import { volumeListInfos } from './volumes';

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

  const callback = callbacks.get('system-ready');
  // send 'system-ready' event
  expect(callback).toBeDefined();
  await callback();
  const volumes = get(volumeListInfos);
  expect(volumes.length).toBe(1);
  expect(volumes[0].Volumes.length).toBe(1);

  // ok now mock the listVolumes function to return an empty list
  listVolumesMock.mockResolvedValue([]);

  // call 'container-removed-event' event
  const containerRemovedCallback = callbacks.get('container-removed-event');
  expect(containerRemovedCallback).toBeDefined();
  await containerRemovedCallback();

  // check if the volumes are updated
  const volumes2 = get(volumeListInfos);
  expect(volumes2.length).toBe(0);
});
