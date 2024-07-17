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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { beforeAll, expect, test, vi } from 'vitest';

import { containersInfos } from '../../stores/containers';
import { providerInfos } from '../../stores/providers';
import ContainerList from './ContainerList.svelte';

const listContainersMock = vi.fn();
const getProviderInfosMock = vi.fn();
const listViewsMock = vi.fn();
const getContributedMenusMock = vi.fn();

const deleteContainerMock = vi.fn();
const removePodMock = vi.fn();
const listPodsMock = vi.fn();

const kubernetesListPodsMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  const onDidUpdateProviderStatusMock = vi.fn();
  (window as any).onDidUpdateProviderStatus = onDidUpdateProviderStatusMock;
  onDidUpdateProviderStatusMock.mockImplementation(() => Promise.resolve());
  listPodsMock.mockImplementation(() => Promise.resolve([]));
  kubernetesListPodsMock.mockImplementation(() => Promise.resolve([]));
  listViewsMock.mockImplementation(() => Promise.resolve([]));
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
  (window as any).listViewsContributions = listViewsMock;
  (window as any).listContainers = listContainersMock;
  (window as any).listPods = listPodsMock;
  (window as any).kubernetesListPods = kubernetesListPodsMock;
  (window as any).getProviderInfos = getProviderInfosMock;
  (window as any).removePod = removePodMock;
  (window as any).deleteContainer = deleteContainerMock;
  (window as any).getContributedMenus = getContributedMenusMock;
  (window as any).getConfigurationValue = vi.fn();
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);

  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

async function waitRender(customProperties: object): Promise<void> {
  render(ContainerList, { ...customProperties });
  await tick();
}

test('Expect no container engines being displayed', async () => {
  render(ContainerList);
  const noEngine = screen.getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();
});

test('Expect no containers being displayed', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({});

  const noContainers = screen.getByRole('heading', { name: 'No containers' });
  expect(noContainers).toBeInTheDocument();

  const runningTab = screen.getByRole('button', { name: 'Running' });
  await fireEvent.click(runningTab);

  const noRunningContainers = screen.getByRole('heading', { name: 'No running containers' });
  expect(noRunningContainers).toBeInTheDocument();

  const stoppedTab = screen.getByRole('button', { name: 'Stopped' });
  await fireEvent.click(stoppedTab);

  const noStoppedContainers = screen.getByRole('heading', { name: 'No stopped containers' });
  expect(noStoppedContainers).toBeInTheDocument();
});

test('Expect is:running / is:stopped is added to the filter field', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({});

  const searchField = screen.getByPlaceholderText('Search containers...');
  expect(searchField).toBeInTheDocument();
  expect(searchField).not.toHaveDisplayValue(/is:running/);
  expect(searchField).not.toHaveDisplayValue(/is:stopped/);

  const runningTab = screen.getByRole('button', { name: 'Running' });
  await fireEvent.click(runningTab);

  expect(searchField).toHaveDisplayValue(/is:running/);
  expect(searchField).not.toHaveDisplayValue(/is:stopped/);

  const stoppedTab = screen.getByRole('button', { name: 'Stopped' });
  await fireEvent.click(stoppedTab);

  expect(searchField).not.toHaveDisplayValue(/is:running/);
  expect(searchField).toHaveDisplayValue(/is:stopped/);
});

test('Expect filter is preserved between tabs', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({});

  const searchField = screen.getByPlaceholderText('Search containers...');
  expect(searchField).toBeInTheDocument();
  const user = userEvent.setup();
  await user.type(searchField, 'foobar');
  expect(searchField).toHaveDisplayValue(/foobar/);

  const runningTab = screen.getByRole('button', { name: 'Running' });
  await fireEvent.click(runningTab);
  expect(searchField).toHaveDisplayValue(/foobar/);

  const stoppedTab = screen.getByRole('button', { name: 'Stopped' });
  await fireEvent.click(stoppedTab);
  expect(searchField).toHaveDisplayValue(/foobar/);
});

test('Try to delete a pod that has containers', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  const podId = 'pod-id';

  const singleContainer = {
    Id: 'sha256:1234567890123',
    Image: 'sha256:123',
    Names: ['foo'],
    Status: 'Running',
    engineId: 'podman',
    engineName: 'podman',
    ImageID: 'dummy-image-id',
  };

  // one single container and two containers part of a pod
  const mockedContainers = [
    singleContainer,
    {
      Id: 'sha256:456456456456456',
      Image: 'sha256:234',
      Names: ['internal-only-pod'],
      RepoTags: ['veryold:image'],
      Status: 'Running',
      pod: {
        name: 'my-pod',
        id: podId,
        status: 'Running',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
    {
      Id: 'sha256:7897891234567890123',
      Image: 'sha256:345',
      Names: ['container-in-pod'],
      Status: 'Running',
      pod: {
        name: 'my-pod',
        id: podId,
        status: 'Running',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
  ];

  listContainersMock.mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait store are populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({});

  // select the checkbox
  const checkbox = screen.getByRole('checkbox', { name: 'Toggle all' });
  expect(checkbox).toBeInTheDocument();

  // click on the checkbox
  await fireEvent.click(checkbox);

  // click on the delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete selected containers and pods' });
  expect(deleteButton).toBeInTheDocument();
  await fireEvent.click(deleteButton);

  // expect that we call to delete the pod first (as it's a group of containers)
  expect(removePodMock).toHaveBeenCalledWith('podman', podId);

  // wait deleteContainerMock is called
  while (deleteContainerMock.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // and then only the container that is not inside a pod
  expect(deleteContainerMock).toBeCalledWith('podman', singleContainer.Id);
  expect(deleteContainerMock).toBeCalledTimes(1);
});

test('Try to delete a container without deleting pods', async () => {
  removePodMock.mockClear();
  deleteContainerMock.mockClear();
  listContainersMock.mockResolvedValue([]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  while (get(containersInfos).length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  const podId = 'pod-id2';

  const singleContainer = {
    Id: 'sha256:21234567890123',
    Image: 'sha256:123',
    Names: ['foo'],
    Status: 'Running',
    engineId: 'podman',
    engineName: 'podman',
    ImageID: 'dummy-image-id',
  };

  // one single container and a container as part of a pod
  const mockedContainers = [
    singleContainer,
    {
      Id: 'sha256:7897891234567890123',
      Image: 'sha256:345',
      Names: ['container-in-pod'],
      Status: 'Running',
      pod: {
        name: 'my-pod2',
        id: podId,
        status: 'Running',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
  ];

  listContainersMock.mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  await waitRender({});

  // select the standalone container checkbox
  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle container' });
  expect(checkboxes[0]).toBeInTheDocument();
  await fireEvent.click(checkboxes[0]);

  // click on the delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete selected containers and pods' });
  expect(deleteButton).toBeInTheDocument();
  await fireEvent.click(deleteButton);

  // wait until deleteContainerMock is called
  while (deleteContainerMock.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // expect that the container has been deleted
  expect(deleteContainerMock).toBeCalledWith('podman', singleContainer.Id);

  // but not the other container
  expect(deleteContainerMock).toHaveBeenCalledOnce();

  // and not the pod
  expect(removePodMock).not.toBeCalled();
});

test('Try to delete a pod without deleting container', async () => {
  removePodMock.mockClear();
  deleteContainerMock.mockClear();
  listContainersMock.mockResolvedValue([]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  while (get(containersInfos).length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  const podId = 'pod-id3';

  const singleContainer = {
    Id: 'sha256:56789012345',
    Image: 'sha256:567',
    Names: ['foo'],
    Status: 'Running',
    engineId: 'podman',
    engineName: 'podman',
    ImageID: 'dummy-image-id',
  };

  // one single container and a container as part of a pod
  const mockedContainers = [
    singleContainer,
    {
      Id: 'sha256:7897891234567890123',
      Image: 'sha256:345',
      Names: ['container-in-pod'],
      Status: 'Running',
      pod: {
        name: 'my-pod3',
        id: podId,
        status: 'Running',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
  ];

  listContainersMock.mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  await waitRender({});

  // select the pod checkbox
  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle container' });
  expect(checkboxes[1]).toBeInTheDocument();
  await fireEvent.click(checkboxes[1]);

  // click on the delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete selected containers and pods' });
  expect(deleteButton).toBeInTheDocument();
  await fireEvent.click(deleteButton);

  // wait until removePodMock is called
  while (removePodMock.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // expect that the pod has been removed
  expect(removePodMock).toHaveBeenCalledWith('podman', podId);
  expect(removePodMock).toHaveBeenCalledOnce();

  // and the standalone container has not been deleted
  expect(deleteContainerMock).not.toHaveBeenCalled();
});

test('Expect filter empty screen', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  const singleContainer = {
    Id: 'sha256:1234567890123',
    Image: 'sha256:123',
    Names: ['foo'],
    Status: 'Running',
    engineId: 'podman',
    engineName: 'podman',
    ImageID: 'dummy-image-id',
  };

  // one single container
  const mockedContainers = [singleContainer];

  listContainersMock.mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait store are populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

test('Expect clear filter in empty screen to clear serach term, except is:...', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  const singleContainer = {
    Id: 'sha256:1234567890123',
    Image: 'sha256:123',
    Names: ['foo'],
    Status: 'Running',
    engineId: 'podman',
    engineName: 'podman',
    ImageID: 'dummy-image-id',
  };

  // one single container
  const mockedContainers = [singleContainer];

  listContainersMock.mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait store are populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({});

  const searchField = screen.getByPlaceholderText('Search containers...');
  expect(searchField).toBeInTheDocument();
  const user = userEvent.setup();
  await user.type(searchField, 'foobar');
  expect(searchField).toHaveDisplayValue(/foobar/);

  const runningTab = screen.getByRole('button', { name: 'Running' });
  await fireEvent.click(runningTab);
  expect(searchField).toHaveDisplayValue(/foobar/);
  expect(searchField).toHaveDisplayValue(/is:running/);

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();

  await fireEvent.click(filterButton);
  expect(searchField).not.toHaveDisplayValue(/foobar/);
  expect(searchField).toHaveDisplayValue(/is:running/);
});

test('Expect to display running / stopped containers depending on tab', async () => {
  removePodMock.mockClear();
  deleteContainerMock.mockClear();
  listContainersMock.mockResolvedValue([]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  while (get(containersInfos).length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  const pod1Id = 'pod1-id';
  const pod2Id = 'pod2-id';
  const pod3Id = 'pod3-id';

  // 3 pods with 2 containers each
  const mockedContainers = [
    // 2 / 2 containers are running on this pod
    {
      Id: 'sha256:68347658374683476',
      Image: 'sha256:234',
      Names: ['container1-pod1'],
      State: 'Running',
      pod: {
        name: 'pod1',
        id: pod1Id,
        status: 'Running',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
    {
      Id: 'sha256:7897891234567890123',
      Image: 'sha256:345',
      Names: ['container2-pod1'],
      State: 'Running',
      pod: {
        name: 'pod1',
        id: pod1Id,
        status: 'Running',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },

    // 1 / 2 containers are running on this pod
    {
      Id: 'sha256:876532948235',
      Image: 'sha256:876',
      Names: ['container1-pod2'],
      State: 'Running',
      pod: {
        name: 'pod2',
        id: pod2Id,
        status: 'Running',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
    {
      Id: 'sha256:834752375490',
      Image: 'sha256:834',
      Names: ['container2-pod2'],
      State: 'Stopped',
      pod: {
        name: 'pod2',
        id: pod2Id,
        status: 'Running',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },

    // 0 / 2 containers are running on this pod
    {
      Id: 'sha256:56283769268',
      Image: 'sha256:562',
      Names: ['container1-pod3'],
      State: 'Stopped',
      pod: {
        name: 'pod3',
        id: pod3Id,
        status: 'Stopped',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
    {
      Id: 'sha256:834752375490',
      Image: 'sha256:834',
      Names: ['container2-pod3'],
      State: 'Stopped',
      pod: {
        name: 'pod3',
        id: pod3Id,
        status: 'Stopped',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
  ];

  listContainersMock.mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until store is populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({});

  const tests = [
    {
      tabLabel: undefined,
      presentCells: [
        'pod1 (pod) 2 containers',
        'container1-pod1 RUNNING',
        'container2-pod1 RUNNING',
        'pod2 (pod) 2 containers',
        'container1-pod2 RUNNING',
        'container2-pod2 STOPPED',
        'pod3 (pod) 2 containers',
        'container1-pod3 STOPPED',
        'container2-pod3 STOPPED',
      ],
      absentLabels: [],
    },
    {
      tabLabel: 'Running',
      presentCells: [
        'pod1 (pod) 2 containers',
        'container1-pod1 RUNNING',
        'container2-pod1 RUNNING',
        'pod2 (pod) 2 containers (1 filtered)',
        'container1-pod2 RUNNING',
      ],
      absentLabels: [/container2-pod2.*/, /pod3 \(pod\).*/, /container1-pod3.*/, /container2-pod3.*/],
    },
    {
      tabLabel: 'Stopped',
      presentCells: [
        'pod2 (pod) 2 containers (1 filtered)',
        'container2-pod2 STOPPED',
        'pod3 (pod) 2 containers',
        'container1-pod3 STOPPED',
        'container2-pod3 STOPPED',
      ],
      absentLabels: [/pod1 \(pod\).*/, /container1-pod1.*/, /container2-pod1.*/, /container1-pod2.*/],
    },
  ];

  for (const tt of tests) {
    if (tt.tabLabel) {
      const tab = screen.getByRole('button', { name: tt.tabLabel });
      await fireEvent.click(tab);
    }
    for (const presentCell of tt.presentCells) {
      const cell = screen.getByRole('button', { name: presentCell });
      expect(cell).toBeInTheDocument();
    }
    for (const absentCell of tt.absentLabels) {
      const cell = screen.queryByText(absentCell);
      expect(cell).not.toBeInTheDocument();
    }
  }
});

test('Sort containers based on selected parameter', async () => {
  listContainersMock.mockResolvedValue([]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  while (get(containersInfos).length !== 0) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  const mockedContainers = [
    {
      Id: 'sha256:123454321',
      Image: 'sha256:123',
      Names: ['foo1'],
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
      engineType: 'podman',
      ImageID: 'dummy-image-id',
      startedAt: '2024-06-19T17:30:46.000Z',
    },
    {
      Id: 'sha256:223454321',
      Image: 'sha256:223',
      Names: ['foo2'],
      Status: 'Exited',
      engineId: 'docker',
      engineName: 'docker',
      engineType: 'docker',
      ImageID: 'dummy-image-id',
      startedAt: '2024-06-19T17:39:46.000Z',
    },
  ];

  listContainersMock.mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  await waitRender({});

  const status = screen.getByRole('columnheader', { name: 'Status' });
  await fireEvent.click(status);

  const container1 = screen.getByRole('cell', { name: 'foo1' });
  const container2 = screen.getByRole('cell', { name: 'foo2' });

  expect(container1).toBeInTheDocument();
  expect(container2).toBeInTheDocument();

  expect(container2.compareDocumentPosition(container1)).toBe(2);

  const environment = screen.getByRole('columnheader', { name: 'Environment' });
  await fireEvent.click(environment);

  expect(container1.compareDocumentPosition(container2)).toBe(2);

  const image = screen.getByRole('columnheader', { name: 'Image' });
  await fireEvent.click(image);

  expect(container2.compareDocumentPosition(container1)).toBe(2);
});

test('Expect user confirmation to pop up when preferences require', async () => {
  listContainersMock.mockResolvedValue([]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  await vi.waitFor(() => get(containersInfos).length === 0);

  // one single container and a container as part of a pod
  const mockedContainers = [
    {
      Id: 'sha256:123454321',
      Image: 'sha256:123',
      Names: ['foo1'],
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    },
  ];

  listContainersMock.mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  await vi.waitFor(() => get(containersInfos).length > 0);

  await waitRender({});

  // select the standalone container checkbox
  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle container' });
  await fireEvent.click(checkboxes[0]);

  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  (window as any).showMessageBox = vi.fn();
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 1 });

  const deleteButton = screen.getByRole('button', { name: 'Delete selected containers and pods' });
  await fireEvent.click(deleteButton);

  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 0 });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  vi.waitFor(() => expect(deleteContainerMock).toHaveBeenCalled());
});
