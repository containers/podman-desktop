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

import type { V1PersistentVolumeClaim } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import PVCDetailsSummary from './PVCDetailsSummary.svelte';

const pvc: V1PersistentVolumeClaim = {
  apiVersion: 'v1',
  kind: 'PersistentVolumeClaim',
  metadata: {
    name: 'my-pvc',
    namespace: 'default',
  },
} as V1PersistentVolumeClaim;

const kubeError = 'Error retrieving PersistentVolumeClaim';

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect to render PVC details when PVC data is available', async () => {
  render(PVCDetailsSummary, { pvc: pvc });

  expect(screen.getByText('my-pvc')).toBeInTheDocument();
});

test('Expect to show error message when there is a kube error', async () => {
  render(PVCDetailsSummary, { pvc: pvc, kubeError: kubeError });

  const errorMessage = screen.getByText(kubeError);
  expect(errorMessage).toBeInTheDocument();
});

test('Expect to show loading indicator when PVC data is not available', async () => {
  render(PVCDetailsSummary, {});

  const loadingMessage = screen.getByText('Loading ...');
  expect(loadingMessage).toBeInTheDocument();
});
