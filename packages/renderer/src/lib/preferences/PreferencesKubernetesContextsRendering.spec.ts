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
import { expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PreferencesKubernetesContextsRendering from './PreferencesKubernetesContextsRendering.svelte';
import type { Cluster, Context } from '@kubernetes/client-node';

// Create a fake Context
const mockContext = {
  name: 'context-name',
  cluster: 'cluster-name',
  user: 'user-name',
  namespace: 'namespace-name',
} as Context;

// Create a fake Cluster
const mockCluster = {
  name: 'cluster-name',
  server: 'server-name',
} as Cluster;

test('test that name, cluster and the server is displayed when rendering', async () => {
  (window as any).kubernetesGetContexts = vi.fn().mockResolvedValue([mockContext]);
  (window as any).kubernetesGetClusters = vi.fn().mockResolvedValue([mockCluster]);
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('context-name')).toBeInTheDocument();
  expect(await screen.findByText('cluster-name')).toBeInTheDocument();
  expect(await screen.findByText('server-name')).toBeInTheDocument();
});

test('If nothing is returned for contexts, expect that the page shows a message', async () => {
  (window as any).kubernetesGetContexts = vi.fn().mockResolvedValue([]);
  (window as any).kubernetesGetClusters = vi.fn().mockResolvedValue([]);
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('No Kubernetes contexts found')).toBeInTheDocument();
});
