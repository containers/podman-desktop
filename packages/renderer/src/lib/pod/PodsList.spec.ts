/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type {
  ContextGeneralState,
  PodInfo,
  ProviderContainerConnectionInfo,
  ProviderInfo,
} from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { router } from 'tinro';
import { beforeAll, expect, test, vi } from 'vitest';

import PodsList from '/@/lib/pod/PodsList.svelte';
import { filtered, podsInfos } from '/@/stores/pods';
import { providerInfos } from '/@/stores/providers';

const provider: ProviderInfo = {
  canStart: false,
  canStop: false,
  containerConnections: [
    {
      connectionType: 'container',
      name: 'MyConnection',
      displayName: 'MyConnection',
      status: 'started',
      endpoint: { socketPath: 'dummy' },
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
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
  vmConnections: [],
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  name: 'MyProvider',
  status: 'started',
  warnings: [],
  extensionId: '',
  cleanupSupport: false,
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

// Pod with 11 containers that shows all the different statuses
// running, terminated, waiting, stopped, paused, exited, dead, created, degraded
// this makes it so that we "group" them as more than 10 containers equals grouping
const manyPod: PodInfo = {
  Cgroup: '',
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
      Status: 'waiting',
    },
    {
      Names: 'container4',
      Id: 'container4',
      Status: 'stopped',
    },
    {
      Names: 'container5',
      Id: 'container5',
      Status: 'paused',
    },
    {
      Names: 'container6',
      Id: 'container6',
      Status: 'exited',
    },
    {
      Names: 'container7',
      Id: 'container7',
      Status: 'dead',
    },
    {
      Names: 'container8',
      Id: 'container8',
      Status: 'created',
    },
    {
      Names: 'container9',
      Id: 'container9',
      Status: 'degraded',
    },
    {
      Names: 'container10',
      Id: 'container10',
      Status: 'running',
    },
    {
      Names: 'container11',
      Id: 'container11',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'manyPod',
  Labels: {},
  Name: 'manyPod',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
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
  engineName: 'podman',
  kind: 'podman',
};

beforeAll(() => {
  vi.mocked(window.kubernetesGetContextsGeneralState).mockResolvedValue(new Map());
  vi.mocked(window.kubernetesGetCurrentContextGeneralState).mockResolvedValue({} as ContextGeneralState);
  vi.mocked(window.listContainers).mockResolvedValue([]);
  vi.mocked(window.onDidUpdateProviderStatus).mockResolvedValue(undefined);
  vi.mocked(window.kubernetesGetDetailedContexts).mockResolvedValue([]);
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);

  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });

  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
});

async function waitRender(customProperties: object): Promise<void> {
  render(PodsList, { ...customProperties });
  await tick();
}

test('Expect no pods being displayed', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await vi.waitUntil(() => get(providerInfos).length !== 0);

  render(PodsList);
  const noPods = screen.getByText(/No pods/);
  expect(noPods).toBeInTheDocument();
});

test('Expect single podman pod being displayed', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([pod1]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 1, { timeout: 5000 });

  render(PodsList);
  const pod1Details = screen.getByRole('cell', { name: 'pod1 beab2512' });
  expect(pod1Details).toBeInTheDocument();

  // Expect to have three "tooltips" which are the "dots".
  const pod1Row = screen.getByRole('row', {
    name: `${pod1.Name}`,
  });
  expect(pod1Row).toBeInTheDocument();

  const env = screen.getByRole('cell', { name: 'Provider info circle podman' });
  expect(env).toBeInTheDocument();
});

test('Expect 2 podman pods being displayed', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([pod1, pod2]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 2, { timeout: 5000 });

  render(PodsList);
  const pod1Details = screen.getByRole('cell', { name: 'pod1 beab2512' });
  expect(pod1Details).toBeInTheDocument();
  const pod1Row = screen.getByRole('row', {
    name: `${pod1.Name}`,
  });
  expect(pod1Row).toBeInTheDocument();
  const pod2Row = screen.getByRole('row', {
    name: `${pod2.Name}`,
  });
  expect(pod2Row).toBeInTheDocument();
});

test('Expect filter empty screen', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([pod1]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 1, { timeout: 5000 });

  render(PodsList, { searchTerm: 'No match' });
  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

test('Expect the route to a pod details page is correctly encoded with an engineId containing / characters', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([ocppod]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1, { timeout: 5000 });

  await vi.waitUntil(
    () => {
      const infos = get(podsInfos);
      return infos.length === 1 && infos[0].name === ocppod.Name;
    },
    { timeout: 5000 },
  );
  render(PodsList);
  const podDetails = screen.getByText('ocppod');
  expect(podDetails).toBeInTheDocument();

  const podRow = screen.getByRole('row', {
    name: `${ocppod.Name}`,
  });
  expect(podRow).toBeInTheDocument();

  const routerGotoMock = vi.fn();
  router.goto = routerGotoMock;
  await fireEvent.click(podDetails);
  expect(routerGotoMock).toHaveBeenCalledWith(
    '/pods/podman/ocppod/userid-dev%2Fapi-sandbox-123-openshiftapps-com%3A6443%2FuserId/',
  );
});

test('Expect the pod1 row to have 3 status dots with the correct colors and the pod2 row to have 1 status dot', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([pod1, pod2]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 2, { timeout: 5000 });

  await waitRender(PodsList);

  // Should render 4 status dots.
  // 3 for the first pod, 1 for the second pod
  // this should also appear REORGANIZED and in a different order.
  const statusDots = screen.getAllByTestId('status-dot');
  expect(statusDots.length).toBe(4);

  expect(statusDots[0].title).toBe('container1: Running');
  expect(statusDots[1].title).toBe('container3: Exited');
  expect(statusDots[2].title).toBe('container2: Terminated');
  expect(statusDots[3].title).toBe('container4: Running');
});

test('Expect the manyPod row to show 9 dots representing every status', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([manyPod]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 1, { timeout: 5000 });

  await waitRender(PodsList);

  // Should render 9 status dots representing all statuses from the 11 containers provided
  // due to the functoin organizeContainers it will be reorganized and the order will be different
  // it should be organized as follows:
  // running, created, paused, waiting, degraded, exited, stopped, terminated, dead
  const statusDots = screen.getAllByTestId('status-dot');
  expect(statusDots.length).toBe(9);

  expect(statusDots[0].title).toBe('Running: 3');
  expect(statusDots[1].title).toBe('Created: 1');
  expect(statusDots[2].title).toBe('Paused: 1');
  expect(statusDots[3].title).toBe('Waiting: 1');
  expect(statusDots[4].title).toBe('Degraded: 1');
  expect(statusDots[5].title).toBe('Exited: 1');
  expect(statusDots[6].title).toBe('Stopped: 1');
  expect(statusDots[7].title).toBe('Terminated: 1');
  expect(statusDots[8].title).toBe('Dead: 1');
});

const runningPod: PodInfo = {
  Cgroup: '',
  // Three containers within the pod, one running, one terminated, one exited
  Containers: [
    {
      Names: 'container1',
      Id: 'container1',
      Status: 'running',
    },
  ],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'pod1',
  Labels: {},
  Name: 'pod1',
  Namespace: '',
  Networks: [],
  Status: 'Running',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

const stoppedPod: PodInfo = {
  Cgroup: '',
  Containers: [
    {
      Names: 'container4',
      Id: 'container4',
      Status: 'stopped',
    },
  ],
  Created: '',
  Id: 'e8129c5720b3',
  InfraId: 'pod2',
  Labels: {},
  Name: 'pod2',
  Namespace: '',
  Networks: [],
  Status: 'Stopped',
  engineId: 'podman',
  engineName: 'podman',
  kind: 'podman',
};

test('Expect All tab to show all pods running and stopped (not running)', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([stoppedPod, runningPod]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  render(PodsList);

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(filtered).length === 2, { timeout: 5000 });

  expect(get(filtered)).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ status: 'RUNNING' }),
      expect.objectContaining({ status: 'STOPPED' }),
    ]),
  );
});

test('Expect Running tab to show running pods only', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([stoppedPod, runningPod]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  render(PodsList);

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(filtered).length === 2, { timeout: 5000 });

  const runningTab = screen
    .getAllByRole('button', { name: /Running/ })
    .find(el => el.textContent?.trim() === 'Running');
  expect(runningTab).toBeDefined();

  await userEvent.click(runningTab!);

  await vi.waitUntil(() => get(filtered).length === 1, { timeout: 5000 });

  expect(get(filtered)).toEqual(expect.arrayContaining([expect.objectContaining({ status: 'RUNNING' })]));
});

test('Expect Stopped tab to show stopped (not running) pods only', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([stoppedPod, runningPod]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  render(PodsList);

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(filtered).length === 2, { timeout: 5000 });

  const stoppedTab = screen
    .getAllByRole('button', { name: /Stopped/ })
    .find(el => el.textContent?.trim() === 'Stopped');
  expect(stoppedTab).toBeDefined();

  await userEvent.click(stoppedTab!);

  await vi.waitUntil(() => get(filtered).length === 1, { timeout: 5000 });

  expect(get(filtered)).toEqual(expect.arrayContaining([expect.objectContaining({ status: 'STOPPED' })]));
});

test('Expect tab filtering to not duplicate filter condition in the search bar', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([stoppedPod, runningPod]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  render(PodsList);

  const runningTab = screen
    .getAllByRole('button', { name: /Running/ })
    .find(el => el.textContent?.trim() === 'Running');
  expect(runningTab).toBeDefined();

  await userEvent.click(runningTab!);
  await userEvent.click(runningTab!);
  await userEvent.click(runningTab!);

  const searchInput = screen.getByPlaceholderText('Search...') as HTMLInputElement;
  expect(searchInput.value).toBe('is:running');
});

test('Expect user confirmation to pop up when preferences require', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);
  vi.mocked(window.listPods).mockResolvedValue([pod1]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(providerInfos).length === 1 && get(podsInfos).length === 1, { timeout: 5000 });

  render(PodsList);

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle pod' });
  await fireEvent.click(checkboxes[0]);

  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);

  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  await vi.waitFor(() => expect(window.removePod).toHaveBeenCalled());
});

test('Expect to see empty page and no table when no container engine is running', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'stopped',
          canStart: false,
          canStop: false,
          canEdit: false,
          canDelete: false,
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);
  vi.mocked(window.listPods).mockResolvedValue([pod1]);

  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // wait imageInfo store is populated
  await vi.waitUntil(() => get(podsInfos).length > 0);

  await waitRender({});

  const table = screen.queryByRole('table');
  expect(table).toBeNull();

  const noContainerEngine = screen.getByText('No Container Engine');
  expect(noContainerEngine).toBeInTheDocument();
});

test('Expect environment column sorted by engineId', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([provider]);

  const podA = { ...pod1, Name: 'pod-aaa', engineId: 'engine-zzz', engineName: 'name-aaa' };
  const podB = { ...pod2, Name: 'pod-bbb', engineId: 'engine-aaa', engineName: 'name-zzz' };

  vi.mocked(window.listPods).mockResolvedValue([podA, podB]);
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await waitFor(() => {
    expect(get(providerInfos)).toHaveLength(1);
    expect(get(podsInfos)).toHaveLength(2);
  });

  render(PodsList);

  const environment = screen.getByRole('columnheader', { name: 'Environment' });
  await fireEvent.click(environment);

  const cells = screen.getAllByRole('cell', { name: /pod-/ });
  expect(cells[0]).toHaveTextContent('pod-bbb');
  expect(cells[1]).toHaveTextContent('pod-aaa');
});

test('Expect environment dropdown to appear with multiple running connections', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      ...provider,
      id: 'podman',
      name: 'podman',
      containerConnections: [
        {
          name: 'podman-machine-default',
          displayName: 'Podman Machine',
          status: 'started',
          type: 'podman',
          canStart: false,
          canStop: false,
          canEdit: false,
          canDelete: false,
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
    {
      ...provider,
      id: 'docker',
      name: 'docker',
      containerConnections: [
        {
          name: 'docker-context',
          displayName: 'Docker Desktop',
          status: 'started',
          type: 'docker',
          canStart: false,
          canStop: false,
          canEdit: false,
          canDelete: false,
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  const podmanPod = {
    ...pod1,
    Name: 'podman-pod',
    engineId: 'podman.podman-machine-default',
    engineName: 'Podman Machine',
  };
  const dockerPod = { ...pod2, Name: 'docker-pod', engineId: 'docker.docker-context', engineName: 'Docker Desktop' };

  vi.mocked(window.listPods).mockResolvedValue([podmanPod, dockerPod]);

  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await waitFor(() => {
    expect(get(providerInfos)).toHaveLength(2);
    expect(get(podsInfos)).toHaveLength(2);
  });

  render(PodsList);
  await tick();

  // Environment dropdown should be visible
  const environmentDropdown = screen.getByLabelText('Environment');
  expect(environmentDropdown).toBeInTheDocument();
});

test('Expect environment dropdown to filter pods by selected environment', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      ...provider,
      id: 'podman',
      name: 'podman',
      containerConnections: [
        {
          name: 'podman-machine-default',
          displayName: 'Podman Machine',
          status: 'started',
          type: 'podman',
          canStart: false,
          canStop: false,
          canEdit: false,
          canDelete: false,
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
    {
      ...provider,
      id: 'docker',
      name: 'docker',
      containerConnections: [
        {
          name: 'docker-context',
          displayName: 'Docker Desktop',
          status: 'started',
          type: 'docker',
          canStart: false,
          canStop: false,
          canEdit: false,
          canDelete: false,
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  const podmanPod = {
    ...pod1,
    Name: 'podman-pod',
    engineId: 'podman.podman-machine-default',
    engineName: 'Podman Machine',
  };
  const dockerPod = { ...pod2, Name: 'docker-pod', engineId: 'docker.docker-context', engineName: 'Docker Desktop' };

  vi.mocked(window.listPods).mockResolvedValue([podmanPod, dockerPod]);

  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await waitFor(() => {
    expect(get(providerInfos)).toHaveLength(2);
    expect(get(podsInfos)).toHaveLength(2);
  });

  render(PodsList);
  await tick();

  // Both pods should be visible initially
  expect(screen.getByText('podman-pod')).toBeInTheDocument();
  expect(screen.getByText('docker-pod')).toBeInTheDocument();

  // Select Podman environment from dropdown
  const dropdownContainer = screen.getByLabelText('Environment');
  const dropdownButton = within(dropdownContainer).getByRole('button');
  await fireEvent.click(dropdownButton);

  const podmanOption = await waitFor(async () => {
    await tick();
    return screen.getByRole('button', { name: 'Podman' });
  });
  await fireEvent.click(podmanOption);

  // Only podman pod should be visible
  await waitFor(() => {
    expect(screen.getByText('podman-pod')).toBeInTheDocument();
    expect(screen.queryByText('docker-pod')).not.toBeInTheDocument();
  });
});
