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
import { test, expect, vi, beforeAll } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import ContainerDetails from './ContainerDetails.svelte';
import { get } from 'svelte/store';
import { containersInfos } from '/@/stores/containers';
import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';

import { router } from 'tinro';
import { lastPage } from '/@/stores/breadcrumb';

const listContainersMock = vi.fn();

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
};

const deleteContainerMock = vi.fn();

beforeAll(() => {
  (window as any).listContainers = listContainersMock;
  (window as any).deleteContainer = deleteContainerMock;
});

test('Expect redirect to previous page if container is deleted', async () => {
  const routerGotoSpy = vi.spyOn(router, 'goto');
  listContainersMock.mockResolvedValue([myContainer]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(containersInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // remove myContainer from the store when we call 'deleteContainer'
  // it will then refresh the store and update ContainerDetails page
  deleteContainerMock.mockImplementation(() => {
    containersInfos.update(containers => containers.filter(container => container.Id !== myContainer.Id));
  });

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(ContainerDetails, { containerID: 'myContainer' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  // click on delete container button
  const deleteButton = screen.getByRole('button', { name: 'Delete Container' });
  await fireEvent.click(deleteButton);

  // check that delete method has been called
  expect(deleteContainerMock).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});
