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
import '@testing-library/jest-dom/vitest';

import type { V1ConfigMap } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import ConfigMapDetailsSummary from './ConfigMapDetailsSummary.svelte';

const configMap: V1ConfigMap = {
  metadata: {
    name: 'my-configmap',
    namespace: 'default',
  },
  data: {
    key1: 'value1',
    key2: 'value2',
  },
  binaryData: {
    key3: 'value3',
  },
};

const kubeError = 'Error retrieving node details';

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Confirm renders configmap details summary', async () => {
  render(ConfigMapDetailsSummary, { configMap });

  expect(screen.getByText('my-configmap')).toBeInTheDocument();
  expect(screen.getByText('default')).toBeInTheDocument();
  expect(screen.getByText('key1')).toBeInTheDocument();
  expect(screen.getByText('value1')).toBeInTheDocument();
  expect(screen.getByText('key2')).toBeInTheDocument();
  expect(screen.getByText('value2')).toBeInTheDocument();
  // binary data just shows the key and size, not the data
  expect(screen.getByText('key3: 6 bytes')).toBeInTheDocument();
});

test('Expect to show loading if there is no data present', async () => {
  render(ConfigMapDetailsSummary, {});

  const loadingMessage = screen.getByText('Loading ...');
  expect(loadingMessage).toBeInTheDocument();
});

test('Expect to show error message when there is a kube error', async () => {
  render(ConfigMapDetailsSummary, { configMap, kubeError: kubeError });

  const errorMessage = screen.getByText(kubeError);
  expect(errorMessage).toBeInTheDocument();
});
