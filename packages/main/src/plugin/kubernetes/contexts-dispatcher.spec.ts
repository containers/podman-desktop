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

import type { Cluster, Context, User } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import { ContextsDispatcher } from './contexts-dispatcher.js';
import { KubeConfigSingleContext } from './kubeconfig-single-context.js';

const contexts = [
  {
    name: 'context1',
    cluster: 'cluster1',
    user: 'user1',
  },
  {
    name: 'context2',
    cluster: 'cluster2',
    user: 'user2',
  },
] as Context[];

const clusters = [
  {
    name: 'cluster1',
  },
  {
    name: 'cluster2',
  },
] as Cluster[];

const users = [
  {
    name: 'user1',
  },
  {
    name: 'user2',
  },
] as User[];

const kcWith2contexts = {
  contexts,
  clusters,
  users,
} as unknown as KubeConfig;

const onAddMock = vi.fn();
const onUpdateMock = vi.fn();
const onDeleteMock = vi.fn();

let dispatcher: ContextsDispatcher;

beforeEach(() => {
  vi.clearAllMocks();
  dispatcher = new ContextsDispatcher();
  dispatcher.onAdd(onAddMock);
  dispatcher.onUpdate(onUpdateMock);
  dispatcher.onDelete(onDeleteMock);
});

test('first call to update calls onAdd for each context', () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  dispatcher.update(kc);
  expect(onUpdateMock).not.toHaveBeenCalled();
  expect(onDeleteMock).not.toHaveBeenCalled();
  expect(onAddMock).toHaveBeenCalledTimes(2);
  const kc1 = new KubeConfig();
  kc1.loadFromOptions({
    contexts: [contexts[0]],
    users: [users[0]],
    clusters: [clusters[0]],
    currentContext: 'context1',
  });
  expect(onAddMock).toHaveBeenCalledWith({
    contextName: 'context1',
    config: new KubeConfigSingleContext(kc1, contexts[0]!),
  });
  const kc2 = new KubeConfig();
  kc2.loadFromOptions({
    contexts: [contexts[1]],
    users: [users[1]],
    clusters: [clusters[1]],
    currentContext: 'context2',
  });
  expect(onAddMock).toHaveBeenCalledWith({
    contextName: 'context2',
    config: new KubeConfigSingleContext(kc2, contexts[1]!),
  });
});

test('call update again with same kubeconfig calls nothing', () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  dispatcher.update(kc);

  onAddMock.mockReset();
  onUpdateMock.mockReset();
  onDeleteMock.mockReset();

  dispatcher.update(kc);

  expect(onUpdateMock).not.toHaveBeenCalled();
  expect(onDeleteMock).not.toHaveBeenCalled();
  expect(onAddMock).not.toHaveBeenCalled();
});

test('call update with a missing context calls onDelete', () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  dispatcher.update(kc);

  onAddMock.mockReset();
  onUpdateMock.mockReset();
  onDeleteMock.mockReset();

  kc.loadFromOptions({
    contexts: [contexts[0]],
    users: [users[0]],
    clusters: [clusters[0]],
  });
  dispatcher.update(kc);

  expect(onUpdateMock).not.toHaveBeenCalled();
  expect(onAddMock).not.toHaveBeenCalled();
  expect(onDeleteMock).toHaveBeenCalledOnce();
  const kcDeleted = new KubeConfig();
  kcDeleted.loadFromOptions({
    contexts: [contexts[1]],
    users: [users[1]],
    clusters: [clusters[1]],
    currentContext: 'context2',
  });
  expect(onDeleteMock).toHaveBeenCalledWith({
    contextName: 'context2',
    config: new KubeConfigSingleContext(kcDeleted, contexts[1]!),
  });
});

test('call update with a new context calls onAdd', () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  dispatcher.update(kc);

  onAddMock.mockReset();
  onUpdateMock.mockReset();
  onDeleteMock.mockReset();

  const newContext = {
    name: 'context3',
    cluster: 'cluster3',
    user: 'user3',
  };
  const newUser = {
    name: 'user3',
  };
  const newCluster = {
    name: 'cluster3',
  };
  kc.loadFromOptions({
    contexts: [...contexts, newContext],
    users: [...users, newUser],
    clusters: [...clusters, newCluster],
  });
  dispatcher.update(kc);

  expect(onUpdateMock).not.toHaveBeenCalled();
  expect(onDeleteMock).not.toHaveBeenCalled();
  expect(onAddMock).toHaveBeenCalledOnce();
  const kc3 = new KubeConfig();
  kc3.loadFromOptions({
    contexts: [newContext],
    users: [newUser],
    clusters: [newCluster],
    currentContext: 'context3',
  });
  expect(onAddMock).toHaveBeenCalledWith({
    contextName: 'context3',
    config: new KubeConfigSingleContext(kc3, newContext),
  });
});

test('call update with a modifed context calls onUpdate', () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  dispatcher.update(kc);

  onAddMock.mockReset();
  onUpdateMock.mockReset();
  onDeleteMock.mockReset();

  const updatedUser = {
    name: 'user1',
    certData: 'cert',
  } as User;
  kc.loadFromOptions({
    contexts,
    users: [updatedUser, users[1]],
    clusters,
  });
  dispatcher.update(kc);

  expect(onAddMock).not.toHaveBeenCalled();
  expect(onDeleteMock).not.toHaveBeenCalled();
  expect(onUpdateMock).toHaveBeenCalledOnce();
  const kc1 = new KubeConfig();
  kc1.loadFromOptions({
    contexts: [contexts[0]],
    users: [updatedUser],
    clusters: [clusters[0]],
    currentContext: 'context1',
  });
  expect(onUpdateMock).toHaveBeenCalledWith({
    contextName: 'context1',
    config: new KubeConfigSingleContext(kc1, contexts[0]!),
  });
});
