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

import type { V1ConfigMap, V1Secret } from '@kubernetes/client-node';
import { beforeEach, expect, test, vi } from 'vitest';

import { ConfigMapSecretUtils } from './configmap-secret-utils';

let configMapSecretUtils: ConfigMapSecretUtils;

beforeEach(() => {
  vi.clearAllMocks();
  configMapSecretUtils = new ConfigMapSecretUtils();
});

test('expect configmap UI conversion', async () => {
  const configMap = {
    metadata: {
      name: 'my-configmap',
      namespace: 'test-namespace',
    },
    data: {
      key1: 'value1',
      key2: 'value2',
    },
  } as V1ConfigMap;
  const configMapUI = configMapSecretUtils.getConfigMapSecretUI(configMap);
  expect(configMapUI.name).toEqual('my-configmap');
  expect(configMapUI.namespace).toEqual('test-namespace');
  expect(configMapUI.keys).toEqual(['key1', 'key2']);
});

test('expect secret UI conversion', async () => {
  const secret = {
    metadata: {
      name: 'my-secret',
      namespace: 'test-namespace',
    },
    data: {
      key1: 'value1',
      key2: 'value2',
    },
    type: 'Opaque',
  } as V1Secret;
  const secretUI = configMapSecretUtils.getConfigMapSecretUI(secret);
  expect(secretUI.name).toEqual('my-secret');
  expect(secretUI.namespace).toEqual('test-namespace');
  expect(secretUI.keys).toEqual(['key1', 'key2']);
  expect(secretUI.type).toEqual('Opaque');
});
