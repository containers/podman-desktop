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

import type { Context } from '@kubernetes/client-node';
import { expect, test } from 'vitest';

import { clearKubeUIContextError, clearKubeUIContextErrors, setKubeUIContextError } from './KubeContextUI';

const contexts: (Context & { error: string })[] = [
  {
    name: 'context1',
    user: 'user1',
    cluster: 'cluster1',
    error: 'an error 1',
  },
  {
    name: 'context2',
    user: 'user2',
    cluster: 'cluster2',
    error: 'an error 2',
  },
  {
    name: 'context3',
    user: 'user3',
    cluster: 'cluster3',
    error: 'an error 3',
  },
];

test('clearKubeUIContextError', () => {
  const result = clearKubeUIContextError(contexts, 'context1');
  expect(result).toEqual([
    {
      name: 'context1',
      user: 'user1',
      cluster: 'cluster1',
    },
    {
      name: 'context2',
      user: 'user2',
      cluster: 'cluster2',
      error: 'an error 2',
    },
    {
      name: 'context3',
      user: 'user3',
      cluster: 'cluster3',
      error: 'an error 3',
    },
  ]);
});

test('clearKubeUIContextErrors', () => {
  const result = clearKubeUIContextErrors(contexts);
  expect(result).toEqual([
    {
      name: 'context1',
      user: 'user1',
      cluster: 'cluster1',
    },
    {
      name: 'context2',
      user: 'user2',
      cluster: 'cluster2',
    },
    {
      name: 'context3',
      user: 'user3',
      cluster: 'cluster3',
    },
  ]);
});

test('setKubeUIContextError', () => {
  const result = setKubeUIContextError(contexts, 'context1', new Error('another error 1'));
  expect(result).toEqual([
    {
      name: 'context1',
      user: 'user1',
      cluster: 'cluster1',
      error: 'Error: another error 1',
    },
    {
      name: 'context2',
      user: 'user2',
      cluster: 'cluster2',
      error: 'an error 2',
    },
    {
      name: 'context3',
      user: 'user3',
      cluster: 'cluster3',
      error: 'an error 3',
    },
  ]);
});
