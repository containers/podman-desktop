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

import type { VolumeListInfo } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import type { VolumeInfoUI } from '/@/lib/volume/VolumeInfoUI';

import {
  fetchVolumesWithData,
  filtered,
  searchPattern,
  setVolumeStatus,
  volumeListInfos,
  volumesEventStore,
} from './volumes';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('volumes should be updated in case of a container is removed', async () => {
  // initial volume
  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Name: 'volume1',
          Driver: 'driver1',
          Mountpoint: 'mountpoint1',
        },
      ],
    } as unknown as VolumeListInfo,
  ]);
  volumesEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // now ready to fetch volumes
  await fetchVolumesWithData();

  // now get list
  const volumes = get(volumeListInfos);
  expect(volumes.length).toBe(1);
  expect(volumes[0].name).toBe('volume1');

  // ok now mock the listVolumes function to return an empty list
  vi.mocked(window.listVolumes).mockResolvedValue([]);

  // call 'container-removed-event' event
  const containerRemovedCallback = callbacks.get('container-removed-event');
  assert(containerRemovedCallback);
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
  ['container-removed-event'],
])('fetch volumes when receiving event %s', async eventName => {
  // fast delays (10 & 10ms)
  volumesEventStore.setupWithDebounce(10, 10);

  // empty list
  vi.mocked(window.listVolumes).mockResolvedValue([]);

  // mark as ready to receive updates
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // clear mock calls
  vi.mocked(window.listVolumes).mockClear();

  // now, setup listVolumes
  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Name: 'volume1',
          Driver: 'driver1',
          Mountpoint: 'mountpoint1',
        },
      ],
    } as unknown as VolumeListInfo,
  ]);

  // send event
  const callback = callbacks.get(eventName);
  assert(callback);
  await callback();

  // wait listContainersMock is called
  while (vi.mocked(window.listVolumes).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // now get list
  const volumeListResult = get(volumeListInfos);
  expect(volumeListResult.length).toBe(1);
  expect(volumeListResult[0].name).toEqual('volume1');
});

test('store holds a flat list of converted VolumeInfoUI objects across engines', async () => {
  // fast delays (10 & 10ms)
  volumesEventStore.setupWithDebounce(10, 10);

  // empty list
  vi.mocked(window.listVolumes).mockResolvedValue([]);

  // mark as ready to receive updates
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // clear mock calls
  vi.mocked(window.listVolumes).mockClear();

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Name: 'volume1',
          Driver: 'driver1',
          Mountpoint: 'mountpoint1',
          engineId: 'engine1',
          engineName: 'Podman',
        },
      ],
      Warnings: [],
      engineId: 'engine1',
      engineName: 'Podman',
    } as unknown as VolumeListInfo,
    {
      Volumes: [
        {
          Name: 'volume2',
          Driver: 'driver2',
          Mountpoint: 'mountpoint2',
          engineId: 'engine2',
          engineName: 'Docker',
        },
        {
          Name: 'volume3',
          Driver: 'driver3',
          Mountpoint: 'mountpoint3',
          engineId: 'engine2',
          engineName: 'Docker',
          Labels: { env: 'production' },
          Options: { type: 'nfs' },
        },
      ],
      Warnings: [],
      engineId: 'engine2',
      engineName: 'Docker',
    } as unknown as VolumeListInfo,
  ]);

  // send event
  const callback = callbacks.get('volume-event');
  assert(callback);
  await callback();

  await vi.waitFor(() => {
    expect(vi.mocked(window.listVolumes).mock.calls.length).not.equal(0);
    const volumeListResult = get(volumeListInfos);
    expect(volumeListResult).toHaveLength(3);
    expect(volumeListResult[0].name).toBe('volume1');
    expect(volumeListResult[0].engineId).toBe('engine1');
    expect(volumeListResult[2].name).toBe('volume3');
    expect(volumeListResult[2].engineId).toBe('engine2');
    expect(volumeListResult[2].labels).toEqual({ env: 'production' });
    expect(volumeListResult[2].options).toEqual({ type: 'nfs' });
  });
});

test('filtered matches a volume by a label value and by an option value', () => {
  const baseVolume = {
    shortName: 'short',
    mountPoint: '/mnt',
    scope: 'local',
    driver: 'local',
    created: '2023-01-01T00:00:00Z',
    age: '1 day',
    size: 0,
    humanSize: '0 B',
    engineId: 'engine1',
    engineName: 'Podman',
    selected: false,
    status: 'UNUSED',
    containersUsage: [],
  };

  const volumeWithLabel = { ...baseVolume, name: 'volume-label', labels: { env: 'production' } } as VolumeInfoUI;
  const volumeWithOption = { ...baseVolume, name: 'volume-option', options: { type: 'nfs' } } as VolumeInfoUI;
  const volumeWithNeither = { ...baseVolume, name: 'volume-plain' } as VolumeInfoUI;

  volumeListInfos.set([volumeWithLabel, volumeWithOption, volumeWithNeither]);

  searchPattern.set('production');
  const filteredByLabel = get(filtered);
  expect(filteredByLabel.map(volume => volume.name)).toContain('volume-label');
  expect(filteredByLabel.map(volume => volume.name)).not.toContain('volume-plain');

  searchPattern.set('nfs');
  const filteredByOption = get(filtered);
  expect(filteredByOption.map(volume => volume.name)).toContain('volume-option');
  expect(filteredByOption.map(volume => volume.name)).not.toContain('volume-plain');

  // reset search pattern so it does not leak into other tests
  searchPattern.set('');
});

test('setVolumeStatus updates the status', () => {
  const volume1 = {
    name: 'volume1',
    engineId: 'engine1',
    status: 'UNUSED',
    selected: true,
  } as VolumeInfoUI;
  const volume2 = { name: 'volume2', engineId: 'engine1', status: 'USED', selected: false } as VolumeInfoUI;
  volumeListInfos.set([volume1, volume2]);

  setVolumeStatus('engine1', 'volume1', 'DELETING');

  const result = get(volumeListInfos);
  expect(result[0]).not.toBe(volume1);
  expect(result[0].status).toBe('DELETING');
  expect(result[0].selected).toBe(true);
  expect(result[1]).toBe(volume2);
});

test('setVolumeStatus does not update a volume with a matching name but a different engineId', () => {
  const volume1 = { name: 'volume1', engineId: 'engine1', status: 'UNUSED', selected: false } as VolumeInfoUI;
  const volume2 = { name: 'volume1', engineId: 'engine2', status: 'UNUSED', selected: false } as VolumeInfoUI;
  volumeListInfos.set([volume1, volume2]);

  setVolumeStatus('engine1', 'volume1', 'DELETING');

  const result = get(volumeListInfos);
  expect(result[0].status).toBe('DELETING');
  expect(result[1]).toBe(volume2);
  expect(result[1].status).toBe('UNUSED');
});
