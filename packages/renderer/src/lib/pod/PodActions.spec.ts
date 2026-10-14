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

import type { ContainerInfo, Port } from '@desktop-framework/extension-api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { setPodStatus } from '/@/stores/pods';

import PodActions from './PodActions.svelte';
import type { PodInfoUI } from './PodInfoUI';

vi.mock(import('/@/stores/pods'), async importOriginal => {
  const original = await importOriginal();
  return {
    ...original,
    setPodStatus: vi.fn(),
    clearPodActionInProgress: vi.fn(),
    setPodActionError: vi.fn(),
  };
});

const podmanPod: PodInfoUI = {
  id: 'pod',
  shortId: 'pod',
  name: 'my-pod',
  engineId: 'engine1',
  engineName: 'podman',
  status: 'RUNNING',
  age: '1 day',
  created: '2025-01-01',
  selected: false,
  containers: [{ Id: 'pod', Names: 'container1', Status: 'running' }],
};

const listContainersMock = vi.fn();
const getContributedMenusMock = vi.fn();
const openExternalSpy = vi.fn();

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeAll(() => {
  Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserver });
  Object.defineProperty(window, 'listContainers', { value: listContainersMock });
  Object.defineProperty(window, 'startPod', { value: vi.fn() });
  Object.defineProperty(window, 'unpausePod', { value: vi.fn() });
  Object.defineProperty(window, 'stopPod', { value: vi.fn() });
  Object.defineProperty(window, 'restartPod', { value: vi.fn() });
  Object.defineProperty(window, 'removePod', { value: vi.fn() });
  Object.defineProperty(window, 'getContributedMenus', { value: getContributedMenusMock });
  Object.defineProperty(window, 'openExternal', { value: openExternalSpy });
});

beforeEach(() => {
  vi.resetAllMocks();

  listContainersMock.mockResolvedValue([
    { Id: 'pod', Ports: [{ PublicPort: 8080 } as Port] as Port[] } as ContainerInfo,
  ]);

  getContributedMenusMock.mockResolvedValue([]);
});

test('Expect setPodStatus called with STARTING when starting pod', async () => {
  listContainersMock.mockResolvedValue([]);

  render(PodActions, { pod: podmanPod });

  // click on start button
  const startButton = screen.getByRole('button', { name: 'Start Pod' });
  await fireEvent.click(startButton);

  expect(setPodStatus).toHaveBeenCalledWith('engine1', 'pod', 'STARTING');
});

test('Expect unpausePod called when pod has paused containers', async () => {
  listContainersMock.mockResolvedValue([]);

  // set status to paused
  podmanPod.containers[0].Status = 'paused';

  render(PodActions, { pod: podmanPod });
  // click on start button
  const startButton = screen.getByRole('button', { name: 'Start Pod' });
  await fireEvent.click(startButton);

  expect(setPodStatus).toHaveBeenCalledWith('engine1', 'pod', 'STARTING');
  expect(window.unpausePod).toHaveBeenCalledWith('engine1', 'pod');
  expect(window.startPod).not.toHaveBeenCalled();
});

test('Expect setPodStatus called with STOPPING when stopping pod', async () => {
  listContainersMock.mockResolvedValue([]);

  render(PodActions, { pod: podmanPod });

  const stopButton = screen.getByRole('button', { name: 'Stop Pod' });
  await fireEvent.click(stopButton);

  expect(setPodStatus).toHaveBeenCalledWith('engine1', 'pod', 'STOPPING');
});

test('Expect setPodStatus called with RESTARTING when restarting pod', async () => {
  listContainersMock.mockResolvedValue([]);

  render(PodActions, { pod: podmanPod });

  // click on restart button
  const restartButton = screen.getByRole('button', { name: 'Restart Pod' });
  await fireEvent.click(restartButton);

  expect(setPodStatus).toHaveBeenCalledWith('engine1', 'pod', 'RESTARTING');
});

test('Expect setPodStatus called with DELETING when deleting pod', async () => {
  // Mock the showMessageBox to return 'Delete' (confirmed)
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  listContainersMock.mockResolvedValue([]);

  render(PodActions, { pod: podmanPod });
  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  // Wait for confirmation modal to disappear after clicking on delete
  expect(setPodStatus).toHaveBeenCalledWith('engine1', 'pod', 'DELETING');
});
