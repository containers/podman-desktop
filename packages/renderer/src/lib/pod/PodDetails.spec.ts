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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { router, type TinroRoute } from 'tinro';
import { beforeAll, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { podsInfos } from '/@/stores/pods';

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';
import PodDetails from './PodDetails.svelte';

const mocks = vi.hoisted(() => ({
  TerminalMock: vi.fn(),
}));
vi.mock('@xterm/xterm', () => ({
  Terminal: mocks.TerminalMock,
}));

const listPodsMock = vi.fn();
const listContainersMock = vi.fn();
const kubernetesListPodsMock = vi.fn();
const showMessageBoxMock = vi.fn();
const getConfigurationValueMock = vi.fn();

const myPod: PodInfo = {
  Cgroup: '',
  Containers: [],
  Created: '',
  Id: 'beab25123a40',
  InfraId: 'pod1',
  Labels: {},
  Name: 'myPod',
  Namespace: '',
  Networks: [],
  Status: 'running',
  engineId: 'engine0',
  engineName: 'podman',
  kind: 'podman',
};

const removePodMock = vi.fn();
const getContributedMenusMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
  Object.defineProperty(window, 'listPods', { value: listPodsMock });
  Object.defineProperty(window, 'listContainers', { value: listContainersMock.mockResolvedValue([]) });
  Object.defineProperty(window, 'kubernetesListPods', { value: kubernetesListPodsMock });
  Object.defineProperty(window, 'removePod', { value: removePodMock });
  Object.defineProperty(window, 'getContributedMenus', { value: getContributedMenusMock });
  Object.defineProperty(window, 'getConfigurationValue', { value: getConfigurationValueMock, writable: true });
  Object.defineProperty(window, 'addEventListener', { value: vi.fn() });
  Object.defineProperty(window, 'getConfigurationProperties', { value: vi.fn().mockResolvedValue({}) });
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn().mockResolvedValue(undefined) });
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
  mocks.TerminalMock.mockReturnValue({
    loadAddon: vi.fn(),
    open: vi.fn(),
    write: vi.fn(),
    dispose: vi.fn(),
  });
  global.ResizeObserver = vi.fn().mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });
});

test('Expect redirect to previous page if pod is deleted', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  const routerGotoSpy = vi.spyOn(router, 'goto');
  listPodsMock.mockResolvedValue([myPod]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(podsInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // remove myPod from the store when we call 'removePod'
  // it will then refresh the store and update PodsDetails page
  removePodMock.mockImplementation(() => {
    podsInfos.update(pods => pods.filter(pod => pod.Id !== myPod.Id));
  });

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(PodDetails, { podName: 'myPod', engineId: 'engine0', kind: 'podman' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/logs');

  // click on delete pod button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  // check that remove method has been called
  expect(removePodMock).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});

test('Expect redirect to logs', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  const routerGotoSpy = vi.spyOn(router, 'goto');
  const subscribeSpy = vi.spyOn(router, 'subscribe');
  subscribeSpy.mockImplementation(listener => {
    listener({ path: '/pods/podman/myPod/engine0/' } as unknown as TinroRoute);
    return () => {};
  });
  listPodsMock.mockResolvedValue([myPod]);
  kubernetesListPodsMock.mockResolvedValue([]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(podsInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // render the component
  render(PodDetails, { podName: 'myPod', engineId: 'engine0', kind: 'podman' });

  await waitFor(() => {
    expect(routerGotoSpy).toHaveBeenCalledWith('/pods/podman/myPod/engine0/logs');
  });
});
