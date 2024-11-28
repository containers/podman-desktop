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
import { expect, test } from 'vitest';

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

test('KubeConfigSingleContext', () => {
  const kc = new KubeConfig();
  kc.loadFromOptions(kcWith2contexts);
  const single = new KubeConfigSingleContext(kc, contexts[0]!);
  const expected = {
    contexts: [contexts[0]],
    users: [users[0]],
    clusters: [clusters[0]],
    currentContext: 'context1',
  } as KubeConfig;
  expect(single.get()).toEqual(expected);

  const kcExpected = new KubeConfig();
  kcExpected.loadFromOptions(expected);
  const expectedSingle = new KubeConfigSingleContext(expected, contexts[0]!);
  expect(single.equals(expectedSingle)).toBeTruthy();

  const otherSingle = new KubeConfigSingleContext(kc, contexts[1]!);
  expect(single.equals(otherSingle)).toBeFalsy();

  expect(single.equals(undefined)).toBeFalsy();
});
