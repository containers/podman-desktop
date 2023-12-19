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
import { beforeAll, expect, test, vi } from 'vitest';
import type { V1Ingress } from '@kubernetes/client-node';
import { ingresses, ingressesEventStore } from './ingresses';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

Object.defineProperty(global, 'window', {
  value: {
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

const v1Ingress: V1Ingress = {
  apiVersion: 'networking.k8s.io/v1',
  kind: 'Ingress',
  metadata: {
    name: 'ingress',
  },
  spec: {
    ingressClassName: 'class',
  },
};

const v2Ingress: V1Ingress = {
  apiVersion: 'networking.k8s.io/v1',
  kind: 'Ingress',
  metadata: {
    name: 'ingress',
  },
  spec: {
    ingressClassName: 'class2',
  },
};

test('ingresses should be updated in case informer send signals', async () => {
  ingressesEventStore.setup();

  // get list
  const listIngresses = get(ingresses);
  expect(listIngresses.length).toBe(0);

  // call 'kubernetes-ingress-add' event
  const IngressAddCallback = callbacks.get('kubernetes-ingress-add');
  expect(IngressAddCallback).toBeDefined();
  await IngressAddCallback(v1Ingress);

  // wait
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the ingresses are updated
  const ingresses2 = get(ingresses);
  expect(ingresses2.length).toBe(1);
  expect(ingresses2[0].metadata?.name).equal('ingress');
  expect(ingresses2[0].spec?.ingressClassName).equal('class');

  // call 'kubernetes-ingress-update' event - update the ingress
  const IngressUpdateCallback = callbacks.get('kubernetes-ingress-update');
  expect(IngressUpdateCallback).toBeDefined();
  await IngressUpdateCallback(v2Ingress);

  // check if the ingresses are updated
  const ingresses3 = get(ingresses);
  expect(ingresses3.length).toBe(1);
  expect(ingresses3[0].metadata?.name).equal('ingress');
  expect(ingresses3[0].spec?.ingressClassName).equal('class2');

  // call 'kubernetes-ingress-deleted' event
  const IngressDeleteCallback = callbacks.get('kubernetes-ingress-deleted');
  expect(IngressDeleteCallback).toBeDefined();
  await IngressDeleteCallback(v1Ingress);

  // wait
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the ingresses are updated
  const ingresses4 = get(ingresses);
  expect(ingresses4.length).toBe(0);
});
