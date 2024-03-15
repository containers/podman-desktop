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

import type { Context, Informer, KubernetesObject } from '@kubernetes/client-node';
import { expect, test, vi } from 'vitest';

import { KubernetesInformerManager } from './kubernetes-informer-registry.js';

const informerManager = new KubernetesInformerManager();
const context: Context = {
  cluster: 'cluster',
  name: 'name',
  user: 'user',
};

test('Add informer should create new id and add it to registry', async () => {
  const id = informerManager.addInformer({} as unknown as Informer<KubernetesObject>, context, 'INGRESS');
  const informer = informerManager.getInformerInfo(id);
  expect(informer).not.toBeUndefined();
});

test('Add informer should create new id and add it to registry', async () => {
  const newContext: Context = {
    cluster: 'cluster1',
    name: 'name1',
    user: 'user',
  };
  const id = informerManager.addInformer({} as unknown as Informer<KubernetesObject>, context, 'INGRESS');
  let informer = informerManager.getInformerInfo(id);
  expect(informer).not.toBeUndefined();
  expect(informer?.context.cluster).equal('cluster');
  expect(informer?.context.name).equal('name');
  expect(informer?.context.user).equal('user');

  informerManager.updateInformer(id, {} as unknown as Informer<KubernetesObject>, newContext);
  informer = informerManager.getInformerInfo(id);
  expect(informer?.context.cluster).equal('cluster1');
  expect(informer?.context.name).equal('name1');
  expect(informer?.context.user).equal('user');
});

test('Stop informer should stop the informer', async () => {
  const informer = {} as unknown as Informer<KubernetesObject>;
  const stopMock = vi.fn();
  informer.stop = stopMock;
  const id = informerManager.addInformer(informer, context, 'INGRESS');
  await informerManager.stopInformer(id);
  expect(stopMock).toBeCalled();
});
