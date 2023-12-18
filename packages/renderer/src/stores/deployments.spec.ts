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
import type { V1Deployment } from '@kubernetes/client-node';
import { deployments, deploymentsEventStore } from './deployments';

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

const v1Deployment: V1Deployment = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: 'deployment',
  },
  spec: {
    replicas: 2,
    selector: {},
    template: {},
  },
};

const v2Deployment: V1Deployment = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: 'deployment',
  },
  spec: {
    replicas: 3,
    selector: {},
    template: {},
  },
};

test('deployments should be updated when informer sends signals', async () => {
  deploymentsEventStore.setup();

  // get list
  const listDeploymentes = get(deployments);
  expect(listDeploymentes.length).toBe(0);

  // call 'kubernetes-deployment-add' event
  const DeploymentAddCallback = callbacks.get('kubernetes-deployment-add');
  expect(DeploymentAddCallback).toBeDefined();
  await DeploymentAddCallback(v1Deployment);

  // wait
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the deployments are updated
  const deployments2 = get(deployments);
  expect(deployments2.length).toBe(1);
  expect(deployments2[0].metadata?.name).equal('deployment');
  expect(deployments2[0].spec?.replicas).equal(2);

  // call 'kubernetes-deployment-update' event - update the deployment
  const DeploymentUpdateCallback = callbacks.get('kubernetes-deployment-update');
  expect(DeploymentUpdateCallback).toBeDefined();
  await DeploymentUpdateCallback(v2Deployment);

  // check if the deployments are updated
  const deployments3 = get(deployments);
  expect(deployments3.length).toBe(1);
  expect(deployments3[0].metadata?.name).equal('deployment');
  expect(deployments3[0].spec?.replicas).equal(3);

  // call 'kubernetes-deployment-deleted' event
  const DeploymentDeleteCallback = callbacks.get('kubernetes-deployment-deleted');
  expect(DeploymentDeleteCallback).toBeDefined();
  await DeploymentDeleteCallback(v1Deployment);

  // wait
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the deployments are updated
  const deployments4 = get(deployments);
  expect(deployments4.length).toBe(0);
});
