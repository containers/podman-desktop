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
import type { V1Service } from '@kubernetes/client-node';
import { services, servicesEventStore } from './services';

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

const v1Service: V1Service = {
  apiVersion: 'v1',
  kind: 'Service',
  metadata: {
    name: 'service',
  },
  spec: {
    selector: {},
    ports: [],
    externalName: 'serve',
  },
};

const v2Ingress: V1Service = {
  apiVersion: 'v1',
  kind: 'Service',
  metadata: {
    name: 'service',
  },
  spec: {
    selector: {},
    ports: [],
    externalName: 'protect',
  },
};

test('services should be updated when informer sends signals', async () => {
  servicesEventStore.setup();

  // get list
  const listServices = get(services);
  expect(listServices.length).toBe(0);

  // call 'kubernetes-service-add' event
  const serviceAddCallback = callbacks.get('kubernetes-service-add');
  expect(serviceAddCallback).toBeDefined();
  await serviceAddCallback(v1Service);

  // wait
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the services are updated
  const services2 = get(services);
  expect(services2.length).toBe(1);
  expect(services2[0].metadata?.name).equal('service');
  expect(services2[0].spec?.externalName).equal('serve');

  // call 'kubernetes-service-update' event - update the service
  const serviceUpdateCallback = callbacks.get('kubernetes-service-update');
  expect(serviceUpdateCallback).toBeDefined();
  await serviceUpdateCallback(v2Ingress);

  // check if the services are updated
  const services3 = get(services);
  expect(services3.length).toBe(1);
  expect(services3[0].metadata?.name).equal('service');
  expect(services3[0].spec?.externalName).equal('protect');

  // call 'kubernetes-service-deleted' event
  const servicsDeleteCallback = callbacks.get('kubernetes-service-deleted');
  expect(servicsDeleteCallback).toBeDefined();
  await servicsDeleteCallback(v1Service);

  // wait
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the services are updated
  const services4 = get(services);
  expect(services4.length).toBe(0);
});
