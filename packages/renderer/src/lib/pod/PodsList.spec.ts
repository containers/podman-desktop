/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';
import { beforeAll, test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PodsList from '/@/lib/pod/PodsList.svelte';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { get } from 'svelte/store';
import { providerInfos } from '/@/stores/providers';
import { podsInfos } from '/@/stores/pods';
import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import { router } from 'tinro';

const getProvidersInfoMock = vi.fn();
const listPodsMock = vi.fn();
const kubernetesListPodsMock = vi.fn();
const getContributedMenusMock = vi.fn();

const provider: ProviderInfo = {
  containerConnections: [
    {
      name: 'MyConnection',
      status: 'started',
      endpoint: { socketPath: 'dummy' },
      type: 'podman',
    },
  ],
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  detectionChecks: [],
  id: 'providerid',
  images: {},
  installationSupport: false,
  internalId: 'providerid',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
  links: [],
  name: 'MyProvider',
  status: 'started',
  warnings: [],
  extensionId: '',
};

const pod1: PodInfo = {
  Cgroup: '',
  Containers: [],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'pod1',
  Labels: {},
  Name: 'pod1',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

const pod2: PodInfo = {
  Cgroup: '',
  Containers: [],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'pod2',
  Labels: {},
  Name: 'pod2',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

const kubepod1: PodInfo = {
  Cgroup: '',
  Containers: [],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'kubepod1',
  Labels: {},
  Name: 'kubepod1',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'context1',
  engineName: 'k8s',
  kind: 'kubernetes',
};

const kubepod2: PodInfo = {
  Cgroup: '',
  Containers: [],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'kubepod2',
  Labels: {},
  Name: 'kubepod2',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'context2',
  engineName: 'k8s',
  kind: 'kubernetes',
};

const ocppod: PodInfo = {
  Cgroup: '',
  Containers: [],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'ocppod',
  Labels: {},
  Name: 'ocppod',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'userid-dev/api-sandbox-123-openshiftapps-com:6443/userId',
  engineName: 'k8s',
  kind: 'kubernetes',
};

// fake the window.events object
beforeAll(() => {
  (window as any).getProviderInfos = getProvidersInfoMock;
  (window as any).listPods = listPodsMock;
  (window as any).kubernetesListPods = kubernetesListPodsMock;
  (window as any).onDidUpdateProviderStatus = vi.fn().mockResolvedValue(undefined);
  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };

  (window as any).getContributedMenus = getContributedMenusMock;
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

test('Expect no pods being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  render(PodsList);
  const noPods = screen.getByText(/No pods/);
  expect(noPods).toBeInTheDocument();
});

test('Expect single podman pod being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([pod1]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(providerInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(podsInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  render(PodsList);
  const pod1Details = screen.getByRole('cell', { name: 'pod1 beab2512 0 container podman' });
  expect(pod1Details).toBeInTheDocument();
});

test('Expect 2 podman pods being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([pod1, pod2]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(providerInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(podsInfos).length !== 2) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  render(PodsList);
  const pod1Details = screen.getByRole('cell', { name: 'pod1 beab2512 0 container podman' });
  expect(pod1Details).toBeInTheDocument();
  const pod2Details = screen.getByRole('cell', { name: 'pod2 e8129c57 0 container podman' });
  expect(pod2Details).toBeInTheDocument();
});

test('Expect single kubernetes pod being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([]);
  kubernetesListPodsMock.mockResolvedValue([kubepod1]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(providerInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(podsInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  render(PodsList);
  const pod1Details = screen.getByRole('cell', { name: 'kubepod1 beab2512 0 container k8s context1 tooltip' });
  expect(pod1Details).toBeInTheDocument();
});

test('Expect 2 kubernetes pods being displayed', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([]);
  kubernetesListPodsMock.mockResolvedValue([kubepod1, kubepod2]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(providerInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(podsInfos).length !== 2) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  render(PodsList);
  const pod1Details = screen.getByRole('cell', { name: 'kubepod1 beab2512 0 container k8s context1 tooltip' });
  expect(pod1Details).toBeInTheDocument();
  const pod2Details = screen.getByRole('cell', { name: 'kubepod2 e8129c57 0 container k8s context2 tooltip' });
  expect(pod2Details).toBeInTheDocument();
});

test('Expect filter empty screen', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([pod1]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(providerInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(podsInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  render(PodsList, { searchTerm: 'No match' });
  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

test('Expect the route to a pod details page is correctly encoded with an engineId containing / characters', async () => {
  getProvidersInfoMock.mockResolvedValue([provider]);
  listPodsMock.mockResolvedValue([]);
  kubernetesListPodsMock.mockResolvedValue([ocppod]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(providerInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  for (;;) {
    const infos = get(podsInfos);
    if (infos.length === 1 && infos[0].Name === ocppod.Name) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  render(PodsList);
  const podDetails = screen.getByRole('cell', { name: 'ocppod e8129c57 0 container k8s userid-dev/api-s tooltip' });
  expect(podDetails).toBeInTheDocument();

  const routerGotoMock = vi.fn();
  router.goto = routerGotoMock;
  await fireEvent.click(podDetails);
  expect(routerGotoMock).toHaveBeenCalledWith(
    '/pods/kubernetes/ocppod/userid-dev%2Fapi-sandbox-123-openshiftapps-com%3A6443%2FuserId/logs',
  );
});
