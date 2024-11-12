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

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { KubernetesObject } from '@kubernetes/client-node';
import type { Readable } from 'svelte/store';
import type { Mock } from 'vitest';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ResourceName } from '/@api/kubernetes-contexts-states';

import {
  kubernetesCurrentContextDeployments,
  kubernetesCurrentContextNodes,
  kubernetesCurrentContextPods,
  kubernetesCurrentContextServices,
} from './kubernetes-contexts-state';

// define mocks and event callback
const kubernetesRegisterGetCurrentContextResourcesMock: Mock<
  (resourceName: ResourceName) => Promise<KubernetesObject[]>
> = vi.fn();
const kubernetesUnregisterGetCurrentContextResourcesMock: Mock<(resourceName: ResourceName) => Promise<[]>> = vi.fn();

const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

// patch window object
Object.defineProperty(global, 'window', {
  value: {
    kubernetesRegisterGetCurrentContextResources: kubernetesRegisterGetCurrentContextResourcesMock,
    kubernetesUnregisterGetCurrentContextResources: kubernetesUnregisterGetCurrentContextResourcesMock,
    addEventListener: eventEmitter.receive,
    events: {
      receive: eventEmitter.receive,
    },
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
});

test.each(['nodes', 'pods', 'deployments', 'services'])('confirm %s store is receiving events', async resourceName => {
  switch (resourceName) {
    case 'nodes': {
      await testKubernetesStore(resourceName, kubernetesCurrentContextNodes);
      break;
    }
    case 'pods': {
      await testKubernetesStore(resourceName, kubernetesCurrentContextPods);
      break;
    }
    case 'deployments': {
      await testKubernetesStore(resourceName, kubernetesCurrentContextDeployments);
      break;
    }
    case 'services': {
      await testKubernetesStore(resourceName, kubernetesCurrentContextServices);
      break;
    }
  }
});

async function testKubernetesStore(resourceName: string, store: Readable<KubernetesObject[]>): Promise<void> {
  const event = `kubernetes-current-context-${resourceName}-update`;

  const object1: KubernetesObject = {
    Id: 'id123',
  } as unknown as KubernetesObject;
  const object2: KubernetesObject = {
    Id: 'id246',
  } as unknown as KubernetesObject;

  // start with one object in resources and subscribe
  kubernetesRegisterGetCurrentContextResourcesMock.mockImplementation(type =>
    Promise.resolve(type === resourceName ? [object1] : []),
  );

  let resources: KubernetesObject[] = [];
  const unsubscribe = store.subscribe(value => {
    resources = value;
  });

  // confirm store has the correct initial data
  await vi.waitFor(() => {
    expect(resources).toHaveLength(1);
  });
  expect(resources[0]).toBe(object1);

  // update object via an event
  const callback = callbacks.get(event);
  expect(callback).toBeDefined();
  await callback();

  callbacks.get(event)([object2, object1]);

  // wait for data to be updated
  await vi.waitFor(() => {
    expect(resources).toHaveLength(2);
  });

  // confirm correct data
  expect(resources[0]).toBe(object2);
  expect(resources[1]).toBe(object1);

  // unsubscribe
  unsubscribe();
}
