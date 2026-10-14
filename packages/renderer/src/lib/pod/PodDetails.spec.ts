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

import type { PodInfo } from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { router, type TinroRoute } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { podsInfos } from '/@/stores/pods';

import PodDetails from './PodDetails.svelte';

vi.mock(import('@xterm/xterm'));
vi.mock(import('@xterm/addon-search'));
vi.mock(import('/@/stores/navigation-history.svelte'), () => ({
  replaceCurrentUrl: (url: string): void => {
    router.goto(url);
  },
}));

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

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
  vi.mocked(window.listContainers).mockResolvedValue([]);
  vi.mocked(window.getConfigurationProperties).mockResolvedValue({});
  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);
});

test('Expect redirect to previous page if pod is deleted', async () => {
  // Mock the showMessageBox to return 0 (yes)
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  const routerGotoSpy = vi.spyOn(router, 'goto');
  vi.mocked(window.listPods).mockResolvedValue([myPod]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(podsInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // remove myPod from the store when we call 'removePod'
  // it will then refresh the store and update PodsDetails page
  vi.mocked(window.removePod).mockImplementation(async () => {
    podsInfos.update(pods => pods.filter(pod => pod.id !== myPod.Id));
  });

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(PodDetails, { podName: 'myPod', engineId: 'engine0' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/logs');

  // click on delete pod button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  // check that remove method has been called
  expect(window.removePod).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});

test('Expect redirect to logs', async () => {
  // Mock the showMessageBox to return 0 (yes)
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  const routerGotoSpy = vi.spyOn(router, 'goto');
  const subscribeSpy = vi.spyOn(router, 'subscribe');
  subscribeSpy.mockImplementation(listener => {
    listener({ path: '/pods/podman/myPod/engine0/' } as unknown as TinroRoute);
    return (): void => {};
  });
  vi.mocked(window.listPods).mockResolvedValue([myPod]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(podsInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // render the component
  render(PodDetails, { podName: 'myPod', engineId: 'engine0' });

  await waitFor(() => {
    expect(routerGotoSpy).toHaveBeenCalledWith('/pods/podman/myPod/engine0/logs');
  });
});
