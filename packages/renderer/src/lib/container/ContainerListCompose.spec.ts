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
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { beforeAll, expect, test, vi } from 'vitest';

import { containersInfos } from '/@/stores/containers';
import { providerInfos } from '/@/stores/providers';

import ContainerList from './ContainerList.svelte';

// Mocked window methods
beforeAll(() => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  vi.mocked(window.listViewsContributions).mockResolvedValue([]);
  vi.mocked(window.onDidUpdateProviderStatus).mockResolvedValue(undefined);
  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });
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

test('Delete a group of compose containers successfully', async () => {
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

  const groupName = 'compose-group';
  const mockedContainers = [
    {
      Id: 'container1',
      Image: 'docker.io/kindest/node:foobar',
      Labels: { 'com.docker.compose.project': groupName },
      Names: ['container1'],
      State: 'RUNNING',
      engineId: 'podman',
      engineType: 'podman',
      ImageID: 'dummy-image-id',
    } as unknown as ContainerInfo,
    {
      Id: 'container2',
      Image: 'docker.io/kindest/node:foobar',
      Labels: { 'com.docker.compose.project': groupName },
      Names: ['container2'],
      State: 'RUNNING',
      engineId: 'podman',
      engineType: 'podman',
      ImageID: 'dummy-image-id',
    } as unknown as ContainerInfo,
  ];
  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  // Send over custom events to simulate PD being started
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // Wait for the store to get populated
  while (get(containersInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  await waitRender({});

  // Find the 'Delete Compose' button for the compose group
  const deleteButton = screen.getByRole('button', { name: 'Delete Compose' });
  expect(deleteButton).toBeInTheDocument();

  // Click on it
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  // wait deleteContainerMock is called
  while (vi.mocked(window.deleteContainersByLabel).mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Expect deleteContainerMock to be called / successfully clicked
  expect(window.deleteContainersByLabel).toBeCalledWith('podman', 'com.docker.compose.project', groupName);
  expect(window.deleteContainersByLabel).toBeCalledTimes(1);
});
