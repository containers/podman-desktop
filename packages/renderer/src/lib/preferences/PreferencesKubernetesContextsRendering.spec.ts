/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';
import { beforeAll, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PreferencesKubernetesContextsRendering from './PreferencesKubernetesContextsRendering.svelte';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import type { KubeContextUI } from '../kube/KubeContextUI';

// Create a fake KubeContextUI
const mockContext: KubeContextUI = {
  name: 'context-name',
  cluster: 'cluster-name',
  user: 'user-name',
  clusterInfo: {
    name: 'cluster-name',
    server: 'https://server-name',
  },
};

beforeAll(() => {
  kubernetesContexts.set([mockContext]);
});

test('test that name, cluster and the server is displayed when rendering', async () => {
  (window as any).kubernetesGetCurrentContextName = vi.fn().mockResolvedValue('my-current-context');
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('context-name')).toBeInTheDocument();
  expect(await screen.findByText('cluster-name')).toBeInTheDocument();
  expect(await screen.findByText('user-name')).toBeInTheDocument();
  expect(await screen.findByText('https://server-name')).toBeInTheDocument();
});

test('If nothing is returned for contexts, expect that the page shows a message', async () => {
  (window as any).kubernetesGetContexts = vi.fn().mockResolvedValue([]);
  (window as any).kubernetesGetClusters = vi.fn().mockResolvedValue([]);
  (window as any).kubernetesGetCurrentContextName = vi.fn().mockResolvedValue('my-current-context');
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('No Kubernetes contexts found')).toBeInTheDocument();
});
