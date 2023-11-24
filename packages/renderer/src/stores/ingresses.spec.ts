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
import { beforeAll, expect, test, vi } from 'vitest';
import type { V1Ingress } from '@kubernetes/client-node';
import { fetchIngressesWithData, ingresses, ingressesEventStore } from './ingresses';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listIngressesMock: Mock<any, Promise<V1Ingress[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    kubernetesListIngresses: listIngressesMock,
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

test('ingresses should be updated in case of a extension is removed', async () => {
  // initial ingresses
  listIngressesMock.mockResolvedValue([
    {
      metadata: {
        name: 'my-ingress',
        namespace: 'test-namespace',
      },
      spec: {
        rules: [
          {
            host: 'foo.bar.com',
            http: {
              paths: [
                {
                  path: '/foo',
                  pathType: 'Prefix',
                  backend: {
                    resource: {
                      name: 'bucket',
                      kind: 'StorageBucket',
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    } as unknown as V1Ingress,
  ]);
  ingressesEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // now ready to fetch ingresses
  await fetchIngressesWithData();

  // now get list
  const listIngresses = get(ingresses);
  expect(listIngresses.length).toBe(1);
  expect(listIngresses[0].metadata?.name).toBe('my-ingress');

  // ok now mock the listIngresses function to return an empty list
  listIngressesMock.mockResolvedValue([]);

  // call 'extension-stopped' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  expect(extensionStoppedCallback).toBeDefined();
  await extensionStoppedCallback();

  // wait debounce
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the ingresses are updated
  const ingresses2 = get(ingresses);
  expect(ingresses2.length).toBe(0);
});
