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

import { get } from 'svelte/store';
import { beforeAll, expect, test, vi } from 'vitest';

import { kubernetesContextsHealths, kubernetesContextsHealthsStore } from './kubernetes-context-health';

// We need to have separate tests files to run different tests, as there are global variables in the store file, which cannot be reset between tests

// This file can be removed as soon as the experimental states mode is adopted as non experimental

const callbacks = new Map<string, () => Promise<void>>();
const eventEmitter = {
  receive: (message: string, callback: () => Promise<void>) => {
    callbacks.set(message, callback);
  },
};

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      kubernetesGetContextsHealths: vi.fn(),
      getConfigurationValue: vi.fn(),
      addEventListener: eventEmitter.receive,
      events: {
        receive: eventEmitter.receive,
      },
    },
  });
});

test('kubernetesContextsHealths not in experimental states mode', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);
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

  vi.mocked(window.kubernetesGetContextsHealths).mockResolvedValue(initialValues);

  kubernetesContextsHealthsStore.setup();

  // send 'extensions-already-started' event
  const callbackExtensionsStarted = callbacks.get('extensions-already-started');
  expect(callbackExtensionsStarted).toBeDefined();
  await callbackExtensionsStarted!();

  // values are never fetched
  await new Promise(resolve => setTimeout(resolve, 500));
  const currentValue = get(kubernetesContextsHealths);
  expect(currentValue).toEqual([]);
  expect(vi.mocked(window.kubernetesGetContextsHealths)).not.toHaveBeenCalled();
});
