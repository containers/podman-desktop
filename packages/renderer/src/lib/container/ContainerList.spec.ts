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

import type { ContainerInfo, ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render, type RenderResult, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
/* eslint-disable import/no-duplicates */
import { type Component, type ComponentProps, tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { CONTAINER_LIST_VIEW } from '/@/lib/view/views';
import { containersInfos } from '/@/stores/containers';
import { providerInfos } from '/@/stores/providers';
import { viewsContributions } from '/@/stores/views';

import ContainerList from './ContainerList.svelte';

vi.mock(import('tinro'));

beforeEach(() => {
  vi.resetAllMocks();
  // vi.resetAllMocks does not touch Svelte stores; a test that sets one would
  // otherwise leak its contributions into every test declared after it
  viewsContributions.set([]);
  vi.mocked(window.listPods).mockResolvedValue([]);
  vi.mocked(window.listViewsContributions).mockResolvedValue([]);
  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);
  vi.mocked(window.onDidUpdateProviderStatus).mockResolvedValue(undefined);
  vi.mocked(window.listContainers).mockResolvedValue([]);
  vi.mocked(window.getProviderInfos).mockResolvedValue([
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
    } as ProviderInfo,
  ]);
  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });
});

async function waitRender(
  customProperties: object,
): Promise<RenderResult<Component<ComponentProps<typeof ContainerList>>>> {
  const result = render(ContainerList, { ...customProperties });
  await tick();
  return result;
}

test('Expect no container engines being displayed', async () => {
  render(ContainerList);
  const noEngine = screen.getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();
});

test('Expect no containers being displayed', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
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
    } as ProviderInfo,
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
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
  vi.mocked(window.getProviderInfos).mockResolvedValue([
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
    } as ProviderInfo,
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({});

  const searchField = screen.getByPlaceholderText('Search...');
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
  vi.mocked(window.getProviderInfos).mockResolvedValue([
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
    } as ProviderInfo,
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({});

  const searchField = screen.getByPlaceholderText('Search...');
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
  vi.mocked(window.getProviderInfos).mockResolvedValue([
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
    } as ProviderInfo,
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
    singleContainer as ContainerInfo,
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
    } as unknown as ContainerInfo,
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
    } as ContainerInfo,
  ];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait store are populated
  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
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
  expect(window.removePod).toHaveBeenCalledWith('podman', podId);

  // wait window.deleteContainer is called
  while (vi.mocked(window.deleteContainer).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // and then only the container that is not inside a pod
  expect(window.deleteContainer).toBeCalledWith('podman', singleContainer.Id);
  expect(window.deleteContainer).toBeCalledTimes(1);
});

test('Try to delete a container without deleting pods', async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  await waitFor(() => expect(get(containersInfos)).toHaveLength(0));

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
    singleContainer as ContainerInfo,
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
    } as ContainerInfo,
  ];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));

  await waitRender({});

  // select the standalone container checkbox
  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle container' });
  expect(checkboxes[0]).toBeInTheDocument();
  await fireEvent.click(checkboxes[0]);

  // click on the delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete selected containers and pods' });
  expect(deleteButton).toBeInTheDocument();
  await fireEvent.click(deleteButton);

  // wait until window.deleteContainer is called
  while (vi.mocked(window.deleteContainer).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // expect that the container has been deleted
  expect(window.deleteContainer).toBeCalledWith('podman', singleContainer.Id);

  // but not the other container
  expect(window.deleteContainer).toHaveBeenCalledOnce();

  // and not the pod
  expect(window.removePod).not.toBeCalled();
});

test('Try to delete a pod without deleting container', async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  await waitFor(() => expect(get(containersInfos)).toHaveLength(0));
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
    singleContainer as ContainerInfo,
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
    } as ContainerInfo,
  ];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));

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
  while (vi.mocked(window.removePod).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // expect that the pod has been removed
  expect(window.removePod).toHaveBeenCalledWith('podman', podId);
  expect(window.removePod).toHaveBeenCalledOnce();

  // and the standalone container has not been deleted
  expect(window.deleteContainer).not.toHaveBeenCalled();
});

test('Expect filter empty screen', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
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
    } as ProviderInfo,
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
  const mockedContainers = [singleContainer as ContainerInfo];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait store are populated
  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

test('Expect clear filter in empty screen to clear search term, except is:...', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
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
    } as ProviderInfo,
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
  const mockedContainers = [singleContainer as ContainerInfo];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait store are populated
  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({});

  const searchField = screen.getByPlaceholderText('Search...');
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

test('Expect to display running / stopped containers depending on tab', { timeout: 20_000 }, async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  await vi.waitFor(() => expect(get(containersInfos).length).toBe(0), { timeout: 5_000 });

  vi.mocked(window.getProviderInfos).mockResolvedValue([
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
    } as ProviderInfo,
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
    } as ContainerInfo,
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
    } as ContainerInfo,

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
    } as ContainerInfo,
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
    } as ContainerInfo,

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
    } as ContainerInfo,
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
    } as ContainerInfo,
  ];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until store is populated
  await vi.waitFor(() => expect(get(containersInfos).length).toBe(6), { timeout: 5_000 });
  await vi.waitFor(() => expect(get(providerInfos).length).toBe(1), { timeout: 5_000 });

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
      await vi.waitFor(() => {
        expect(screen.getByRole('button', { name: presentCell })).toBeInTheDocument();
      });
    }
    for (const absentCell of tt.absentLabels) {
      await vi.waitFor(() => {
        expect(screen.queryByText(absentCell)).not.toBeInTheDocument();
      });
    }
  }
});

test('Sort containers based on selected parameter', async () => {
  vi.mocked(window.listContainers).mockResolvedValue([]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  await waitFor(() => expect(get(containersInfos)).toHaveLength(0));

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
    } as unknown as ContainerInfo,
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
    } as unknown as ContainerInfo,
  ];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));

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
  vi.mocked(window.listContainers).mockResolvedValue([]);
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  await vi.waitUntil(() => get(containersInfos).length === 0);

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
    } as ContainerInfo,
  ];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  await vi.waitUntil(() => get(containersInfos).length > 0);

  await waitRender({});

  // select the standalone container checkbox
  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle container' });
  await fireEvent.click(checkboxes[0]);

  const deleteButton = await vi.waitFor(() =>
    screen.getByRole('button', { name: 'Delete selected containers and pods' }),
  );
  await fireEvent.click(deleteButton);

  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  await vi.waitFor(() => expect(window.deleteContainer).toHaveBeenCalled());
});

test('Try to run pods in bulk', async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait for the store to be cleared
  await waitFor(() => expect(get(containersInfos)).toHaveLength(0));

  const podId = 'pod-id3';
  const containerId = 'sha256:56789012345';

  const singleContainer = {
    Id: containerId,
    Image: 'sha256:567',
    Names: ['foo'],
    Status: 'Stopped',
    engineId: 'podman',
    engineName: 'podman',
    ImageID: 'dummy-image-id',
  };

  // one single container and a container as part of a pod
  const mockedContainers = [
    singleContainer as ContainerInfo,
    {
      Id: 'sha256:7897891234567890123',
      Image: 'sha256:345',
      Names: ['container-in-pod'],
      Status: 'Stopped',
      pod: {
        name: 'my-pod3',
        id: podId,
        status: 'Stopped',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    } as ContainerInfo,
  ];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));

  await waitRender({});

  // select the pod checkbox
  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle container' });
  expect(checkboxes[0]).toBeInTheDocument();
  expect(checkboxes[1]).toBeInTheDocument();
  await fireEvent.click(checkboxes[0]);
  await fireEvent.click(checkboxes[1]);

  // click on the bulk run button
  const runBulkButton = screen.getByRole('button', { name: 'Run selected containers and pods' });
  expect(runBulkButton).toBeInTheDocument();
  await fireEvent.click(runBulkButton);

  // wait until startPodMock is called
  while (vi.mocked(window.startPod).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // wait until startContainerMock is called
  while (vi.mocked(window.startContainer).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // expect that the pod is running
  expect(window.startPod).toHaveBeenCalledWith('podman', podId);
  expect(window.startPod).toHaveBeenCalledOnce();

  // expect that the container is running
  expect(window.startContainer).toHaveBeenCalledWith('podman', containerId);
  expect(window.startContainer).toHaveBeenCalledOnce();
});

test.each([false, true])('Try to stop containers and pods in bulk (failure: %s)', async failure => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  let resolveStopPod: () => void;
  vi.mocked(window.stopPod).mockReturnValue(
    new Promise((resolve, reject) => {
      resolveStopPod = failure ? (): void => reject(new Error('Pod stop failed')) : resolve;
    }),
  );
  if (failure) {
    vi.mocked(window.stopContainer).mockRejectedValue(new Error('Container stop failed'));
  }

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(containersInfos)).toHaveLength(0));

  const podId = 'pod-id4';
  const containerId = 'sha256:67890123456';
  const mockedContainers = [
    {
      Id: containerId,
      Image: 'sha256:678',
      Names: ['standalone-container'],
      Status: 'Running',
      State: 'running',
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    } as ContainerInfo,
    {
      Id: 'sha256:8908901234567890123',
      Image: 'sha256:890',
      Names: ['container-in-pod'],
      Status: 'Running',
      State: 'running',
      pod: {
        name: 'my-pod4',
        id: podId,
        status: 'Running',
        engineId: 'podman',
      },
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    } as ContainerInfo,
  ];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));
  await waitRender({});

  const selectAll = screen.getByRole('checkbox', { name: 'Toggle all' });
  await fireEvent.click(selectAll);

  const stopBulkButton = screen.getByRole('button', { name: 'Stop selected containers and pods' });
  await fireEvent.click(stopBulkButton);

  await waitFor(() => expect(window.stopPod).toHaveBeenCalledWith('podman', podId));
  // the standalone container should be stopped without waiting for the pod operation to finish
  await waitFor(() => expect(window.stopContainer).toHaveBeenCalledWith('podman', containerId));
  expect(stopBulkButton).toHaveAttribute('aria-busy', 'true');

  resolveStopPod!();
  await waitFor(() => expect(stopBulkButton).toHaveAttribute('aria-busy', 'false'));

  expect(window.stopPod).toHaveBeenCalledOnce();
  expect(window.stopContainer).toHaveBeenCalledOnce();
  if (failure) {
    expect(consoleError).toHaveBeenCalledWith('error while stopping container', new Error('Container stop failed'));
    expect(consoleError).toHaveBeenCalledWith('error while stopping pod', new Error('Pod stop failed'));
    // Failed pods return to RUNNING and can be retried without stopping the failed container again.
    vi.mocked(window.stopPod).mockResolvedValue(undefined);
    await fireEvent.click(stopBulkButton);
    await waitFor(() => expect(window.stopPod).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(stopBulkButton).toHaveAttribute('aria-busy', 'false'));
    expect(window.stopContainer).toHaveBeenCalledOnce();
  }
  consoleError.mockRestore();
});

test('Ensuring the table and empty screen are not visible at the same time', async () => {
  // mock one container
  vi.mocked(window.listContainers).mockResolvedValue([
    {
      Id: 'sha256:7897891234567890123',
      Image: 'sha256:345',
      Names: ['container-in-pod'],
      Status: 'Stopped',
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'dummy-image-id',
    } as ContainerInfo,
  ]);
  // mock zero provider infos
  vi.mocked(window.getProviderInfos).mockResolvedValue([]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the stores are populated
  await vi.waitUntil(() => get(containersInfos).length === 1 && get(providerInfos).length === 0);

  const { getByRole, queryByRole } = await waitRender({});

  const noEngine = getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();

  const table = queryByRole('table');
  expect(table).toBeNull();
});

test('pods with same name on different engines should have separate group', async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  await vi.waitUntil(async () => {
    return get(containersInfos).length === 0;
  });

  const CONTAINERS_MOCK: Array<ContainerInfo> = Array.from({ length: 3 }).map((_, index) => ({
    Id: `sha256:${index}`,
    Image: 'sha256:234',
    Names: ['foo-bar-pod'], // have the same name for all
    RepoTags: ['veryold:image'],
    Status: 'Running',
    pod: {
      name: 'my-pod',
      id: `podman-engine-${index}`, // unique pod id (only pod-id is unique across all engines)
      status: 'Running',
      engineId: `podman-${index}`,
    },
    engineId: `podman-${index}`,
    engineName: 'podman',
    ImageID: 'dummy-image-id',
    engineType: 'podman',
    StartedAt: '0',
    ImageBase64RepoTag: '',
    Created: 0,
    Ports: [],
    Labels: {},
    State: '',
  }));

  vi.mocked(window.listContainers).mockResolvedValue(CONTAINERS_MOCK);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait until the store is populated
  await vi.waitUntil(async () => {
    return get(containersInfos).length > 0;
  });

  const { getAllByRole } = await waitRender({});

  await vi.waitFor(() => {
    const expandButtons = getAllByRole('button', { name: 'Collapse Row' });
    expect(expandButtons).toHaveLength(CONTAINERS_MOCK.length);
  });
});

test('Expect environment dropdown to appear with multiple running connections', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      id: 'podman',
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          displayName: 'Podman Machine',
          status: 'started',
          type: 'podman',
        },
      ],
    } as ProviderInfo,
    {
      id: 'docker',
      name: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'docker-context',
          displayName: 'Docker Desktop',
          status: 'started',
          type: 'docker',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listContainers).mockResolvedValue([
    {
      Id: 'container1',
      Image: 'podman-image',
      Names: ['podman-container'],
      Status: 'Running',
      State: 'running',
      engineId: 'podman.podman-machine-default',
      engineName: 'Podman Machine',
      engineType: 'podman',
      StartedAt: '2024-01-01T00:00:00Z',
      ImageBase64RepoTag: '',
      Created: 0,
      Ports: [],
      Labels: {},
      ImageID: '',
    } as unknown as ContainerInfo,
    {
      Id: 'container2',
      Image: 'docker-image',
      Names: ['docker-container'],
      Status: 'Running',
      State: 'running',
      engineId: 'docker.docker-context',
      engineName: 'Docker Desktop',
      engineType: 'docker',
      StartedAt: '2024-01-01T00:00:00Z',
      ImageBase64RepoTag: '',
      Created: 0,
      Ports: [],
      Labels: {},
      ImageID: '',
    } as unknown as ContainerInfo,
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => {
    expect(get(containersInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  // Environment dropdown should be visible
  const environmentDropdown = screen.getByLabelText('Environment');
  expect(environmentDropdown).toBeInTheDocument();
});

test('Expect environment dropdown to filter containers by selected environment', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      id: 'podman',
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          displayName: 'Podman Machine',
          status: 'started',
          type: 'podman',
        },
      ],
    } as ProviderInfo,
    {
      id: 'docker',
      name: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'docker-context',
          displayName: 'Docker Desktop',
          status: 'started',
          type: 'docker',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listContainers).mockResolvedValue([
    {
      Id: 'container1',
      Image: 'podman-image',
      Names: ['podman-container'],
      Status: 'Running',
      State: 'running',
      engineId: 'podman.podman-machine-default',
      engineName: 'Podman Machine',
      engineType: 'podman',
      StartedAt: '2024-01-01T00:00:00Z',
      ImageBase64RepoTag: '',
      Created: 0,
      Ports: [],
      Labels: {},
      ImageID: '',
    } as unknown as ContainerInfo,
    {
      Id: 'container2',
      Image: 'docker-image',
      Names: ['docker-container'],
      Status: 'Running',
      State: 'running',
      engineId: 'docker.docker-context',
      engineName: 'Docker Desktop',
      engineType: 'docker',
      StartedAt: '2024-01-01T00:00:00Z',
      ImageBase64RepoTag: '',
      Created: 0,
      Ports: [],
      Labels: {},
      ImageID: '',
    } as unknown as ContainerInfo,
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => {
    expect(get(containersInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  // Both containers should be visible initially
  expect(screen.getByText('podman-container')).toBeInTheDocument();
  expect(screen.getByText('docker-container')).toBeInTheDocument();

  // Select Podman environment from dropdown
  const dropdownContainer = screen.getByLabelText('Environment');
  const dropdownButton = within(dropdownContainer).getByRole('button');
  await fireEvent.click(dropdownButton);

  const podmanOption = await waitFor(async () => {
    await tick();
    return screen.getByRole('button', { name: 'Podman' });
  });
  await fireEvent.click(podmanOption);

  // Only podman container should be visible
  await waitFor(() => {
    expect(screen.getByText('podman-container')).toBeInTheDocument();
    expect(screen.queryByText('docker-container')).not.toBeInTheDocument();
  });
});

test('Expect create container dialog opens when Create button is clicked', async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({});

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  const createButton = screen.getByTitle('Create a container');
  await fireEvent.click(createButton);

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Create a new container' })).toBeInTheDocument();
  });
});

test('Expect create container dialog has both choice buttons styled as secondary', async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({});

  const createButton = screen.getByTitle('Create a container');
  await fireEvent.click(createButton);

  const dialog = await waitFor(() => screen.getByRole('dialog', { name: 'Create a new container' }));
  const existingImageButton = within(dialog).getByRole('button', { name: 'Use existing image' });
  const containerfileButton = within(dialog).getByRole('button', { name: 'Use Containerfile' });

  expect(existingImageButton.className).toContain('bg-[var(--pd-button-secondary-bg)]');
  expect(containerfileButton.className).toContain('bg-[var(--pd-button-secondary-bg)]');

  const dialogButtons = within(dialog).getAllByRole('button');
  const existingImageIndex = dialogButtons.indexOf(existingImageButton);
  const containerfileIndex = dialogButtons.indexOf(containerfileButton);
  expect(existingImageIndex).toBeLessThan(containerfileIndex);
});

test('Expect clicking Containerfile button navigates to build image page', async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({});

  const createButton = screen.getByTitle('Create a container');
  await fireEvent.click(createButton);

  const dialog = await waitFor(() => screen.getByRole('dialog', { name: 'Create a new container' }));
  const containerfileButton = within(dialog).getByRole('button', { name: 'Use Containerfile' });
  await fireEvent.click(containerfileButton);

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/images/build');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('Expect clicking Existing image button closes dialog', async () => {
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({});

  const createButton = screen.getByTitle('Create a container');
  await fireEvent.click(createButton);

  const dialog = await waitFor(() => screen.getByRole('dialog', { name: 'Create a new container' }));
  const existingImageButton = within(dialog).getByRole('button', { name: 'Use existing image' });
  await fireEvent.click(existingImageButton);

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

test('Expect contributed icon to be applied to the container row', async () => {
  // the containers store converts without the context and the view contributions, so this
  // icon can only appear if ContainerList overlays it after reading the store
  vi.mocked(window.listContainers).mockResolvedValue([
    {
      Id: 'sha256:iconcontainer',
      Image: 'sha256:123',
      Names: ['/icon-container'],
      State: 'RUNNING',
      ImageID: 'sha256:image-id',
      engineId: 'podman',
      engineName: 'podman',
      Labels: { 'podman-desktop.label': 'true' },
    } as unknown as ContainerInfo,
  ]);

  const contribs = [
    {
      extensionId: 'foo.bar',
      viewId: CONTAINER_LIST_VIEW,
      value: {
        icon: '${my-custom-icon}',
        when: 'podman-desktop.label in containerLabelKeys',
      },
    },
  ];
  vi.mocked(window.listViewsContributions).mockResolvedValue(contribs);
  viewsContributions.set(contribs);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));
  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));
  await waitRender({});

  const statusElement = screen.getByRole('status', { name: 'RUNNING' });
  expect(statusElement.getElementsByClassName('podman-desktop-icon-my-custom-icon')).toHaveLength(1);
});

test('Expect search not to match the raw compose-prefixed container name', async () => {
  // `names` carries the raw '/myproject-web-1'; `name` is the compose-stripped 'web-1'.
  // Search has always matched on `name`, and adding `names` to the object must not
  // silently widen it — findMatchInLeaves recurses into arrays.
  vi.mocked(window.listContainers).mockResolvedValue([
    {
      Id: 'sha256:composecontainer',
      Image: 'sha256:123',
      Names: ['/myproject-web-1'],
      State: 'RUNNING',
      ImageID: 'sha256:image-id',
      engineId: 'podman',
      engineName: 'podman',
      Labels: { 'com.docker.compose.project': 'myproject' },
    } as unknown as ContainerInfo,
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  await waitFor(() => expect(get(containersInfos)).not.toHaveLength(0));
  await waitFor(() => expect(get(providerInfos)).not.toHaveLength(0));

  // the stripped name still matches, as it did before the store held ContainerInfoUI
  const { unmount } = await waitRender({ searchTerm: 'web-1' });
  expect(screen.getByText('web-1')).toBeInTheDocument();
  unmount();

  // the raw prefixed name must not
  await waitRender({ searchTerm: 'myproject-web-1' });
  expect(screen.queryByText('web-1')).not.toBeInTheDocument();
});
