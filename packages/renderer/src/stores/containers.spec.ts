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

import type { ContainerInfo } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import type { ContainerInfoUI } from '/@/lib/container/ContainerInfoUI';

import {
  clearContainerActionInProgress,
  containersEventStore,
  containersInfos,
  setContainerActionError,
  setContainerStatus,
} from './containers';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test.each([
  ['container-created-event'],
  ['container-stopped-event'],
  ['container-kill-event'],
  ['container-die-event'],
  ['container-init-event'],
  ['container-started-event'],
  ['container-removed-event'],
])('fetch containers when receiving event %s', async eventName => {
  // fast delays (10 & 10ms)
  containersEventStore.setupWithDebounce(10, 10);

  // empty list
  vi.mocked(window.listContainers).mockResolvedValue([]);

  // mark as ready to receive updates
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // clear mock calls
  vi.mocked(window.listContainers).mockClear();

  // now, setup at least one container
  // the store converts through ContainerUtils, so the mocked backend object has to be
  // complete enough for the conversion: getName reads Names, getState reads State, and
  // an absent field throws inside the updater rather than failing an assertion
  vi.mocked(window.listContainers).mockResolvedValue([
    {
      Id: 'id123',
      Names: ['/container'],
      Image: 'docker.io/library/nginx:latest',
      ImageID: 'sha256:abcdef0123456789',
      State: 'running',
      Labels: {},
      engineId: 'engine',
      engineName: 'podman',
    } as unknown as ContainerInfo,
  ]);

  // send event
  const callback = callbacks.get(eventName);
  assert(callback);
  await callback();

  // wait vi.mocked(window.listContainers) is called
  while (vi.mocked(window.listContainers).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  // now get list
  const containerListResult = get(containersInfos);
  expect(containerListResult.length).toBe(1);
  expect(containerListResult[0].id).toEqual('id123');
});

function container(id: string, engineId: string, state = 'RUNNING'): ContainerInfoUI {
  return { id, engineId, state, actionInProgress: false, actionError: '', selected: false } as ContainerInfoUI;
}

test('container action helpers update only the matching container', () => {
  containersInfos.set([container('one', 'engine-a'), container('two', 'engine-a'), container('one', 'engine-b')]);

  setContainerStatus('engine-a', 'one', 'STARTING');

  const result = get(containersInfos);
  expect(result[0]).toMatchObject({ state: 'STARTING', actionInProgress: true, actionError: '' });
  expect(result[1]).toMatchObject({ state: 'RUNNING', actionInProgress: false });
  expect(result[2]).toMatchObject({ state: 'RUNNING', actionInProgress: false });
});

test('container action helpers clear progress and set errors', () => {
  containersInfos.set([container('one', 'engine-a', 'STARTING')]);

  setContainerActionError('engine-a', 'one', 'failed');
  expect(get(containersInfos)[0]).toMatchObject({ state: 'ERROR', actionInProgress: false, actionError: 'failed' });

  setContainerStatus('engine-a', 'one', 'STOPPING');
  clearContainerActionInProgress('engine-a', 'one');
  expect(get(containersInfos)[0]).toMatchObject({ state: 'STOPPING', actionInProgress: false, actionError: '' });
});

test('container action helpers ignore missing containers', () => {
  containersInfos.set([container('one', 'engine-a')]);
  const before = get(containersInfos)[0];

  setContainerStatus('missing-engine', 'missing', 'STARTING');
  clearContainerActionInProgress('missing-engine', 'missing');
  setContainerActionError('missing-engine', 'missing', 'failed');

  expect(get(containersInfos)[0]).toBe(before);
});
