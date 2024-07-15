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

import '@testing-library/jest-dom/vitest';

import type { ContainerInfo, Port } from '@podman-desktop/api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import type { V1Route } from '/@api/openshift-types';

import PodActions from './PodActions.svelte';
import type { PodInfoUI } from './PodInfoUI';

const podmanPod: PodInfoUI = {
  id: 'pod',
  containers: [{ Id: 'pod' }],
  status: 'RUNNING',
  kind: 'podman',
} as PodInfoUI;

const kubernetesPod: PodInfoUI = {
  id: 'pod',
  name: 'name',
  containers: [{ Id: 'pod' }],
  status: 'RUNNING',
  kind: 'kubernetes',
} as PodInfoUI;

const listContainersMock = vi.fn();
const getContributedMenusMock = vi.fn();
const updateMock = vi.fn();
const showMessageBoxMock = vi.fn();
const kubernetesGetCurrentNamespaceMock = vi.fn();
const kubernetesReadNamespacedPodMock = vi.fn();

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeEach(() => {
  (window as any).ResizeObserver = ResizeObserver;
  (window as any).showMessageBox = showMessageBoxMock;
  (window as any).kubernetesDeletePod = vi.fn();
  (window as any).listContainers = listContainersMock;
  (window as any).startPod = vi.fn();
  (window as any).stopPod = vi.fn();
  (window as any).restartPod = vi.fn();
  (window as any).removePod = vi.fn();
  (window as any).kubernetesGetCurrentNamespace = kubernetesGetCurrentNamespaceMock;
  (window as any).kubernetesReadNamespacedPod = kubernetesReadNamespacedPodMock;
  (window as any).kubernetesListRoutes = vi.fn();

  vi.resetAllMocks();

  vi.mocked(window.kubernetesListRoutes).mockResolvedValue([]);

  listContainersMock.mockResolvedValue([
    { Id: 'pod', Ports: [{ PublicPort: 8080 } as Port] as Port[] } as ContainerInfo,
  ]);

  kubernetesGetCurrentNamespaceMock.mockResolvedValue('ns');
  kubernetesReadNamespacedPodMock.mockResolvedValue({ metadata: { labels: { app: 'foo' } } });

  (window as any).getContributedMenus = getContributedMenusMock;
  getContributedMenusMock.mockResolvedValue([]);
});

test('Expect no error and status starting pod', async () => {
  listContainersMock.mockResolvedValue([]);

  render(PodActions, { pod: podmanPod, onUpdate: updateMock });

  // click on start button
  const startButton = screen.getByRole('button', { name: 'Start Pod' });
  await fireEvent.click(startButton);

  expect(podmanPod.status).toEqual('STARTING');
  expect(podmanPod.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status stopping pod', async () => {
  listContainersMock.mockResolvedValue([]);

  render(PodActions, { pod: podmanPod, onUpdate: updateMock });

  // click on stop button
  const stopButton = screen.getByRole('button', { name: 'Stop Pod' });
  await fireEvent.click(stopButton);

  expect(podmanPod.status).toEqual('STOPPING');
  expect(podmanPod.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status restarting pod', async () => {
  listContainersMock.mockResolvedValue([]);

  render(PodActions, { pod: podmanPod, onUpdate: updateMock });

  // click on restart button
  const restartButton = screen.getByRole('button', { name: 'Restart Pod' });
  await fireEvent.click(restartButton);

  expect(podmanPod.status).toEqual('RESTARTING');
  expect(podmanPod.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status deleting pod', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  listContainersMock.mockResolvedValue([]);

  render(PodActions, { pod: podmanPod, onUpdate: updateMock });
  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  expect(podmanPod.status).toEqual('DELETING');
  expect(podmanPod.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect kubernetes route to be displayed', async () => {
  const routeName = 'route.name';
  const routeHost = 'host.local';
  const openExternalSpy = vi.fn();

  vi.mocked(window.kubernetesListRoutes).mockResolvedValue([
    { metadata: { labels: { app: 'foo' }, name: routeName }, spec: { host: routeHost } } as unknown as V1Route,
  ]);
  (window as any).openExternal = openExternalSpy;

  render(PodActions, { pod: kubernetesPod });

  const openRouteButton = await screen.findByRole('button', { name: `Open ${routeName}` });
  expect(openRouteButton).toBeVisible();

  await fireEvent.click(openRouteButton);

  expect(openExternalSpy).toHaveBeenCalledWith(`http://${routeHost}`);
});

test('Expect kubernetes route to be displayed but disabled', async () => {
  render(PodActions, { pod: kubernetesPod });

  const openRouteButton = await screen.findByRole('button', { name: `Open Browser` });
  expect(openRouteButton).toBeVisible();
  expect(openRouteButton).toBeDisabled();
});

test('Expect kubernetes routes kebab menu to be displayed', async () => {
  vi.mocked(window.kubernetesListRoutes).mockResolvedValue([
    { metadata: { labels: { app: 'foo' }, name: 'route1.name' }, spec: { host: 'host1.local' } } as unknown as V1Route,
    { metadata: { labels: { app: 'foo' }, name: 'route2.name' }, spec: { host: 'host2.local' } } as unknown as V1Route,
  ]);

  render(PodActions, { pod: kubernetesPod });

  const openRouteButton = await screen.findByRole('button', { name: 'Open Kubernetes Routes' });
  expect(openRouteButton).toBeVisible();

  await fireEvent.click(openRouteButton);

  const routesDropDownMenu = await screen.findByTitle('Drop Down Menu Items');
  expect(routesDropDownMenu).toBeVisible();
});
