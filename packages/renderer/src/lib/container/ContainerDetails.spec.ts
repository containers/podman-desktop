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

import type { ContainerInfo, ContainerInspectInfo } from '@desktop-framework/api';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { containersInfos } from '/@/stores/containers';

import ContainerDetails from './ContainerDetails.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';

const myContainer: ContainerInfo = {
  Id: 'myContainer',
  Labels: {},
  Status: 'running',
  engineId: 'engine0',
  engineName: 'podman',
  engineType: 'podman',
  StartedAt: '',
  Names: ['name0'],
  Image: '',
  ImageID: '',
  Command: '',
  Created: 0,
  Ports: [],
  State: '',
  ImageBase64RepoTag: '',
};

// myContainer above is the raw backend shape returned by window.listContainers.
// myContainerUI is the same container already shaped the way the store holds it.
// They describe the same container and must be kept in sync by hand.
const myContainerUI: ContainerInfoUI = {
  id: 'myContainer',
  shortId: 'myContai',
  name: 'name0',
  image: '',
  shortImage: '',
  engineId: 'engine0',
  engineName: 'podman',
  engineType: 'podman',
  state: '',
  uptime: '',
  startedAt: '',
  ports: [],
  portsAsString: '',
  displayPort: '',
  command: '',
  hasPublicPort: false,
  openingUrl: '',
  groupInfo: {
    name: 'name0',
    type: ContainerGroupInfoTypeUI.STANDALONE,
    status: 'RUNNING',
    engineId: 'engine0',
    engineType: 'podman',
    id: 'myContainer',
    engineName: 'podman',
  },
  selected: false,
  created: 0,
  labels: {},
  icon: ContainerIcon,
  imageBase64RepoTag: '',
  imageHref: '/images//engine0',
  imageId: '',
  names: ['name0'],
};

// The store holds ContainerInfoUI, so the infra fixture is a UI object too. Upstream added
// it as a raw ContainerInfo back when the store still carried the backend shape.
const myInfraContainerUI: ContainerInfoUI = {
  ...myContainerUI,
  id: 'myInfraContainer',
  shortId: 'myInfraC',
  name: 'infra0',
  names: ['infra0'],
  isInfra: true,
  groupInfo: { ...myContainerUI.groupInfo, name: 'infra0', id: 'myInfraContainer' },
};

vi.mock(import('@xterm/xterm'));
vi.mock(import('@xterm/addon-search'));
vi.mock(import('/@/stores/navigation-history.svelte'), () => ({
  replaceCurrentUrl: (url: string): void => {
    router.goto(url);
  },
}));

const getConfigurationValueMock = vi.fn().mockReturnValue(12);

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
});

test('Expect logs when tty is not enabled', async () => {
  router.goto('/');

  containersInfos.set([myContainerUI]);

  // spy router.goto
  const routerGotoSpy = vi.spyOn(router, 'goto');

  vi.mocked(window.getContainerInspect).mockResolvedValue({
    Config: {
      Tty: false,
    },
  } as unknown as ContainerInspectInfo);

  // render the component
  render(ContainerDetails, { containerID: 'myContainer' });

  // wait router.goto is called
  while (routerGotoSpy.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // grab current route and check we have been redirected to tty
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/logs');

  expect(routerGotoSpy).toBeCalledWith('/logs');
});

test('Expect show tty if container has tty enabled', async () => {
  router.goto('/');

  containersInfos.set([myContainerUI]);

  // spy router.goto
  const routerGotoSpy = vi.spyOn(router, 'goto');

  vi.mocked(window.getContainerInspect).mockResolvedValue({
    Config: {
      Tty: true,
      OpenStdin: true,
    },
  } as unknown as ContainerInspectInfo);

  // render the component
  render(ContainerDetails, { containerID: 'myContainer' });

  await vi.waitFor(() => expect(routerGotoSpy.mock.calls.length > 0));

  // grab current route and check we have been redirected to tty
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/tty');

  expect(routerGotoSpy).toBeCalledWith('/tty');
});

test('Expect redirect to previous page if container is deleted', async () => {
  getConfigurationValueMock.mockResolvedValue(undefined);
  // Mock the showMessageBox to return 'Delete' (confirmed)
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  router.goto('/');

  vi.mocked(window.getContainerInspect).mockResolvedValue({
    Config: {},
  } as unknown as ContainerInspectInfo);
  const routerGotoSpy = vi.spyOn(router, 'goto');
  vi.mocked(window.listContainers).mockResolvedValue([myContainer]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(containersInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // remove myContainer from the store when we call 'deleteContainer'
  // it will then refresh the store and update ContainerDetails page
  vi.mocked(window.deleteContainer).mockImplementation(async (): Promise<void> => {
    containersInfos.update(containers => containers.filter(container => container.id !== myContainerUI.id));
  });

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(ContainerDetails, { containerID: 'myContainer' });

  // wait router.goto is called
  while (routerGotoSpy.mock.calls.length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/logs');

  // click on delete container button
  const deleteButton = screen.getByRole('button', { name: 'Delete Container' });
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  // check that delete method has been called
  expect(vi.mocked(window.deleteContainer)).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});

test('Expect Terminal tab to be hidden for infra containers', async () => {
  router.goto('/');

  containersInfos.set([myInfraContainerUI]);

  vi.mocked(window.getContainerInspect).mockResolvedValue({
    Config: {
      Tty: false,
    },
  } as unknown as ContainerInspectInfo);

  render(ContainerDetails, { containerID: 'myInfraContainer' });

  await vi.waitFor(() => {
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByText('Inspect')).toBeInTheDocument();
    expect(screen.queryByText('Terminal')).not.toBeInTheDocument();
    expect(screen.queryByText('TTY')).not.toBeInTheDocument();
  });
});

test('Expect Terminal tab to be visible for non-infra containers', async () => {
  router.goto('/');

  containersInfos.set([myContainerUI]);

  vi.mocked(window.getContainerInspect).mockResolvedValue({
    Config: {
      Tty: false,
    },
  } as unknown as ContainerInspectInfo);

  render(ContainerDetails, { containerID: 'myContainer' });

  await vi.waitFor(() => {
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
    expect(screen.getByText('Inspect')).toBeInTheDocument();
    expect(screen.getByText('Terminal')).toBeInTheDocument();
  });
});

test('Expect a failed action to write through to the store element', async () => {
  router.goto('/');
  const stopped: ContainerInfoUI = { ...myContainerUI, state: 'STOPPED' };
  containersInfos.set([stopped]);

  vi.mocked(window.getContainerInspect).mockResolvedValue({
    Config: {},
  } as unknown as ContainerInspectInfo);
  vi.mocked(window.startContainer).mockRejectedValue('cannot bind port');

  render(ContainerDetails, { containerID: 'myContainer' });

  const startButton = await screen.findByRole('button', { name: 'Start Container' });
  await fireEvent.click(startButton);

  // let the rejected action settle
  await vi.waitFor(() => expect(window.startContainer).toHaveBeenCalled());
  await tick();
  await tick();

  // The failure is shared through the container store.
  const inStore = get(containersInfos)[0];
  expect(inStore.actionError).toBe('cannot bind port');
  expect(inStore.state).toBe('ERROR');
});
