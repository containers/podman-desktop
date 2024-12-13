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

import type { Unsubscriber } from 'svelte/store';
import { afterEach, expect, test, vi } from 'vitest';

import type { ContextHealth } from '/@api/kubernetes-contexts-healths';

import { kubernetesContextsHealths } from './kubernetes-context-health';

const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

Object.defineProperty(global, 'window', {
  value: {
    kubernetesGetContextsHealths: vi.fn(),
    addEventListener: eventEmitter.receive,
    events: {
      receive: eventEmitter.receive,
    },
  },
  writable: true,
});

let unsubscribe: Unsubscriber;

afterEach(() => {
  unsubscribe?.();
});

test('kubernetesContextsHealths', async () => {
  let states: ContextHealth[] = [];

  const initialValues = [
    {
      contextName: 'context1',
      checking: true,
      reachable: false,
    },
    {
      contextName: 'context2',
      checking: false,
      reachable: true,
    },
  ];

  const nextValues = [
    {
      contextName: 'context1',
      checking: false,
      reachable: true,
    },
    {
      contextName: 'context2',
      checking: false,
      reachable: true,
    },
  ];

  vi.mocked(window.kubernetesGetContextsHealths).mockResolvedValue(initialValues);
  unsubscribe = kubernetesContextsHealths.subscribe(value => {
    states = value;
  });

  // check initial value
  await vi.waitFor(() => {
    expect(states).toEqual(initialValues);
  });

  // update object via an event
  const event = 'kubernetes-contexts-healths';
  const callback = callbacks.get(event);
  expect(callback).toBeDefined();
  await callback(nextValues);

  // check data is updated with event's data
  await vi.waitFor(() => {
    expect(states).toEqual(nextValues);
  });
});
