/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import * as kubeContexts from '/@/stores/kubernetes-contexts';

import type { KubeContext } from '../../../../main/src/plugin/kubernetes-context';
import ProviderInfo from './ProviderInfo.svelte';

const getProviderInfosMock = vi.fn();

beforeAll(() => {
  (window as any).getProviderInfos = getProviderInfosMock;
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

vi.mock('/@/stores/kubernetes-contexts', async () => {
  return {
    kubernetesContexts: vi.fn(),
  };
});

test('Expect podman is purple', async () => {
  const provider = 'podman';
  render(ProviderInfo, {
    provider,
  });
  const label = screen.getByText(provider);
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('bg-purple-600');
});

test('Expect Podman (different case) is purple', async () => {
  const provider = 'Podman';
  render(ProviderInfo, {
    provider,
  });
  const label = screen.getByText(provider);
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('bg-purple-600');
});

test('Expect docker is blue', async () => {
  const provider = 'docker';
  render(ProviderInfo, {
    provider,
  });
  const label = screen.getByText(provider);
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('bg-sky-400');
});

test('Expect to use Kubernetes provider name', async () => {
  const name = 'my-kube';
  const context = {
    name: name,
    cluster: 'test',
    user: 'test',
    currentContext: true,
    clusterInfo: {
      name: 'test',
      server: 'https://127.0.0.1/mycluster',
    },
  } as KubeContext;
  const contexts = writable<KubeContext[]>([context]);
  vi.mocked(kubeContexts).kubernetesContexts = contexts;
  getProviderInfosMock.mockReturnValue([
    { name: name, kubernetesConnections: [{ endpoint: { apiURL: 'https://localhost/mycluster' } }] },
  ]);

  render(ProviderInfo, {
    props: {
      provider: 'kubernetes',
      context: 'test',
    },
  });

  await new Promise(resolve => setTimeout(resolve, 10));
  const label = screen.getByText(name);
  expect(label).toBeInTheDocument();
});

test('Expect to use container provider name', async () => {
  const name = 'Podman4ever';
  const providerId = 'podman1';
  getProviderInfosMock.mockReturnValue([{ name: name, id: providerId }]);
  render(ProviderInfo, {
    props: {
      provider: 'podman',
      context: providerId + '.connection',
    },
  });

  await new Promise(resolve => setTimeout(resolve, 10));
  const label = screen.getByText(name);
  expect(label).toBeInTheDocument();
});

test('Expect connection name when there are multiple connections', async () => {
  const connectionName = 'my-podman';
  const providerId = 'podman1';
  getProviderInfosMock.mockReturnValue([
    { id: providerId, containerConnections: [{ name: connectionName }, { name: 'my-other-podman' }] },
  ]);
  render(ProviderInfo, {
    props: {
      provider: 'podman',
      context: providerId + '.' + connectionName,
    },
  });

  await new Promise(resolve => setTimeout(resolve, 10));
  const label = screen.getByText(connectionName);
  expect(label).toBeInTheDocument();
});
