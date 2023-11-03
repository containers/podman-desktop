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
  // Three containers within the pod, one running, one terminated, one exited
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
    {
      Names: 'container2',
      Id: 'container2',
      Status: 'terminated',
    },
    {
      Names: 'container3',
      Id: 'container3',
      Status: 'exited',
    },
  ],
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
  Containers: [
    {
      Names: 'container4',
      Id: 'container4',
      Status: 'running',
    },
  ],
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
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'kubepod1',
  Labels: {},
  Name: 'kubepod1',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'context1',
  engineName: 'Kubernetes',
  kind: 'kubernetes',
};

const kubepod2: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'kubepod2',
  Labels: {},
  Name: 'kubepod2',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'context2',
  engineName: 'Kubernetes',
  kind: 'kubernetes',
};

const ocppod: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'ocppod',
  Labels: {},
  Name: 'ocppod',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'userid-dev/api-sandbox-123-openshiftapps-com:6443/userId',
  engineName: 'Kubernetes',
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

async function waitRender(customProperties: object): Promise<void> {
  const result = render(PodsList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

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
  const pod1Details = screen.getByRole('cell', { name: 'pod1 beab2512 podman' });
  expect(pod1Details).toBeInTheDocument();
  const pod1Row = screen.getByRole('row', {
    name: 'Toggle pod pod1 beab2512 0 container podman 0 seconds spinner spinner spinner',
  });
  expect(pod1Row).toBeInTheDocument();
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
  const pod1Details = screen.getByRole('cell', { name: 'pod1 beab2512 0 container' });
  expect(pod1Details).toBeInTheDocument();
  const pod1Row = screen.getByRole('row', {
    name: 'Toggle pod pod1 beab2512 0 container podman 0 seconds spinner spinner spinner',
  });
  expect(pod1Row).toBeInTheDocument();
  const pod2Row = screen.getByRole('row', {
    name: 'Toggle pod pod2 e8129c57 0 container podman 0 seconds spinner spinner spinner',
  });
  expect(pod2Row).toBeInTheDocument();
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
  const pod1Details = screen.getByRole('row', {
    name: 'Toggle pod kubepod1 beab2512 0 container kubernetes 0 seconds spinner',
  });
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
  const pod1Details = screen.getByRole('row', {
    name: 'Toggle pod kubepod1 beab2512 0 container kubernetes 0 seconds spinner',
  });
  expect(pod1Details).toBeInTheDocument();
  const pod2Details = screen.getByRole('row', {
    name: 'Toggle pod kubepod2 e8129c57 0 container kubernetes 0 seconds spinner',
  });
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
  const podDetails = screen.getByRole('cell', { name: 'ocppod e8129c57 k8s userid-dev/api-s tooltip' });
  expect(podDetails).toBeInTheDocument();

  const podRow = screen.getByRole('row', {
    name: 'Toggle pod ocppod e8129c57 0 container kubernetes 0 seconds spinner',
  });
  expect(podRow).toBeInTheDocument();

  const routerGotoMock = vi.fn();
  router.goto = routerGotoMock;
  await fireEvent.click(podDetails);
  expect(routerGotoMock).toHaveBeenCalledWith(
    '/pods/kubernetes/ocppod/userid-dev%2Fapi-sandbox-123-openshiftapps-com%3A6443%2FuserId/logs',
  );
});

test('Expect the pod1 row to have 3 status dots with the correct colors and the pod2 row to have 1 status dot', async () => {
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

  waitRender(PodsList);

  // Should render 4 status dots.
  // 3 for the first pod, 1 for the second pod
  const statusDots = screen.getAllByTestId('status-dot');
  expect(statusDots.length).toBe(4);

  // Check that container1 is running / has green
  expect(statusDots[0].title).toBe('container1: running');
  expect(statusDots[0]).toHaveClass('bg-green-500');

  // Check that container2 is terminated / has red
  expect(statusDots[1].title).toBe('container2: terminated');
  expect(statusDots[1]).toHaveClass('bg-red-500');

  // Check that container3 is exited / has red
  expect(statusDots[2].title).toBe('container3: exited');
  expect(statusDots[2]).toHaveClass('bg-red-300');

  // Check that container4 is running / has green
  expect(statusDots[3].title).toBe('container4: running');
  expect(statusDots[3]).toHaveClass('bg-green-500');
});
