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
import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PodActions from './PodActions.svelte';
import type { PodInfoUI } from './PodInfoUI';
import type { ContainerInfo, Port } from '@podman-desktop/api';

const pod: PodInfoUI = {
  id: 'pod',
  containers: [{ Id: 'pod' }],
  status: 'RUNNING',
  kind: 'podman',
} as PodInfoUI;

const listContainersMock = vi.fn();
const getContributedMenusMock = vi.fn();
const updateMock = vi.fn();

beforeEach(() => {
  (window as any).kubernetesDeletePod = vi.fn();
  (window as any).listContainers = listContainersMock;
  (window as any).startPod = vi.fn();
  (window as any).stopPod = vi.fn();
  (window as any).restartPod = vi.fn();
  (window as any).removePod = vi.fn();

  listContainersMock.mockResolvedValue([
    { Id: 'pod', Ports: [{ PublicPort: 8080 } as Port] as Port[] } as ContainerInfo,
  ]);

  (window as any).getContributedMenus = getContributedMenusMock;
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error and status starting pod', async () => {
  listContainersMock.mockResolvedValue([]);

  const { component } = render(PodActions, { pod });
  component.$on('update', updateMock);

  // click on start button
  const startButton = screen.getByRole('button', { name: 'Start Pod' });
  await fireEvent.click(startButton);

  expect(pod.status).toEqual('STARTING');
  expect(pod.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status stopping pod', async () => {
  listContainersMock.mockResolvedValue([]);

  const { component } = render(PodActions, { pod });
  component.$on('update', updateMock);

  // click on stop button
  const stopButton = screen.getByRole('button', { name: 'Stop Pod' });
  await fireEvent.click(stopButton);

  expect(pod.status).toEqual('STOPPING');
  expect(pod.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status restarting pod', async () => {
  listContainersMock.mockResolvedValue([]);

  const { component } = render(PodActions, { pod });
  component.$on('update', updateMock);

  // click on restart button
  const restartButton = screen.getByRole('button', { name: 'Restart Pod' });
  await fireEvent.click(restartButton);

  expect(pod.status).toEqual('RESTARTING');
  expect(pod.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status deleting pod', async () => {
  listContainersMock.mockResolvedValue([]);

  const { component } = render(PodActions, { pod });
  component.$on('update', updateMock);

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);

  expect(pod.status).toEqual('DELETING');
  expect(pod.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});
