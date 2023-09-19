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
import { render, screen, fireEvent } from '@testing-library/svelte';
import ContainerList from './ContainerList.svelte';
import { containersInfos } from '../stores/containers';
import { get } from 'svelte/store';
import { providerInfos } from '../stores/providers';

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

  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

async function waitRender(customProperties: object): Promise<void> {
  const result = render(ContainerList, { ...customProperties });
  // wait that result.component.$$.ctx[2] is set
  while (result.component.$$.ctx[2] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

test('Expect no container engines being displayed', async () => {
  render(ContainerList);
  const noEngine = screen.getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();
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
  const containerCheckbox = screen.getAllByRole('checkbox', { name: 'Toggle container' });
  expect(containerCheckbox[0]).toBeInTheDocument();
  await fireEvent.click(containerCheckbox[0]);

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
  const podCheckbox = screen.getByRole('checkbox', { name: 'Toggle pod' });
  expect(podCheckbox).toBeInTheDocument();
  await fireEvent.click(podCheckbox);

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
