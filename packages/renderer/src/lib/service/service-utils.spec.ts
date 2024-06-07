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

import type { V1Service } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import { ServiceUtils } from './service-utils';

let serviceUtils: ServiceUtils;

beforeEach(() => {
  vi.clearAllMocks();
  serviceUtils = new ServiceUtils();
});

test('expect basic UI conversion', async () => {
  const service = {
    metadata: {
      name: 'my-service',
      namespace: 'test-namespace',
    },
    status: {},
  } as V1Service;
  const serviceUI = serviceUtils.getServiceUI(service);
  expect(serviceUI.name).toEqual('my-service');
  expect(serviceUI.namespace).toEqual('test-namespace');
});

test('expect no loadBalancerIPs when it is not set in V1Service ingress', async () => {
  const service = {
    metadata: {
      name: 'my-service',
      namespace: 'test-namespace',
    },
    status: {
      loadBalancer: {
        ingress: [],
      },
    },
  } as V1Service;
  const serviceUI = serviceUtils.getServiceUI(service);
  expect(serviceUI.loadBalancerIPs).toEqual('');
});

test('expect a loadBalancerIPs if set in service', async () => {
  const service = {
    metadata: {
      name: 'my-service',
      namespace: 'test-namespace',
    },
    status: {
      loadBalancer: {
        ingress: [
          {
            ip: '10.0.0.1',
          },
        ],
      },
    },
  } as V1Service;
  const serviceUI = serviceUtils.getServiceUI(service);
  expect(serviceUI.loadBalancerIPs).toEqual('10.0.0.1');
});

test('if a nodeport is also set, expect it to appear as <port>:<nodePort>/protocol', async () => {
  const service = {
    metadata: {
      name: 'my-service',
      namespace: 'test-namespace',
    },
    spec: {
      ports: [
        {
          port: 80,
          nodePort: 30080,
          protocol: 'TCP',
        },
      ],
    },
    status: {
      loadBalancer: {
        ingress: [
          {
            ip: '10.0.0.1',
          },
        ],
      },
    },
  } as V1Service;
  const serviceUI = serviceUtils.getServiceUI(service);
  expect(serviceUI.ports).toEqual('80:30080/TCP');
});
