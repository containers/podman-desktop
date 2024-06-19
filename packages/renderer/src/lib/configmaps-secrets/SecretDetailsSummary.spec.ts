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

import type { V1Secret } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import SecretDetailsSummary from './SecretDetailsSummary.svelte';

const secret: V1Secret = {
  metadata: {
    name: 'my-secret',
    namespace: 'default',
  },
  data: {
    key1: 'value1',
    key2: 'value2',
  },
  type: 'Opaque',
};

const kubeError = 'Error retrieving node details';

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Confirm renders secret details summary', async () => {
  render(SecretDetailsSummary, { secret });

  expect(screen.getByText('my-secret')).toBeInTheDocument();
  expect(screen.getByText('default')).toBeInTheDocument();
  expect(screen.getByText('key1')).toBeInTheDocument();
  expect(screen.getByText('value1')).toBeInTheDocument();
  expect(screen.getByText('key2')).toBeInTheDocument();
  expect(screen.getByText('value2')).toBeInTheDocument();

  // expect type to be shown
  expect(screen.getByText('Opaque')).toBeInTheDocument();
});

test('Expect to show loading if there is no data present', async () => {
  render(SecretDetailsSummary, {});

  const loadingMessage = screen.getByText('Loading ...');
  expect(loadingMessage).toBeInTheDocument();
});

test('Expect to show error message when there is a kube error', async () => {
  render(SecretDetailsSummary, { secret, kubeError: kubeError });

  const errorMessage = screen.getByText(kubeError);
  expect(errorMessage).toBeInTheDocument();
});
