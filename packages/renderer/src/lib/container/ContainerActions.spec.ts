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
import { router } from 'tinro';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { exportContainerInfo } from '/@/stores/export-container-store';

import ContainerActions from './ContainerActions.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

const container: ContainerInfoUI = {} as ContainerInfoUI;

const getContributedMenusMock = vi.fn();
const updateMock = vi.fn();
const showMessageBoxMock = vi.fn();

beforeEach(() => {
  (window as any).showMessageBox = showMessageBoxMock;
  (window as any).startContainer = vi.fn();
  (window as any).stopContainer = vi.fn();
  (window as any).restartContainer = vi.fn();
  (window as any).deleteContainer = vi.fn();

  (window as any).getContributedMenus = getContributedMenusMock;
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error and status starting container', async () => {
  const { component } = render(ContainerActions, { container });
  component.$on('update', updateMock);

  // click on start button
  const startButton = screen.getByRole('button', { name: 'Start Container' });
  await fireEvent.click(startButton);

  expect(container.state).toEqual('STARTING');
  expect(container.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status stopping container', async () => {
  const { component } = render(ContainerActions, { container });
  component.$on('update', updateMock);

  // click on stop button
  const stopButton = screen.getByRole('button', { name: 'Stop Container' });
  await fireEvent.click(stopButton);

  expect(container.state).toEqual('STOPPING');
  expect(container.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status restarting container', async () => {
  const { component } = render(ContainerActions, { container });
  component.$on('update', updateMock);

  // click on restart button
  const restartButton = screen.getByRole('button', { name: 'Restart Container' });
  await fireEvent.click(restartButton);

  expect(container.state).toEqual('RESTARTING');
  expect(container.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status deleting container', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  const { component } = render(ContainerActions, { container });
  component.$on('update', updateMock);

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Container' });
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  expect(container.state).toEqual('DELETING');
  expect(container.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect exportContainerInfo is filled and user redirected to export container page', async () => {
  const goToMock = vi.spyOn(router, 'goto');
  const storeSetMock = vi.spyOn(exportContainerInfo, 'set');

  render(ContainerActions, { container });
  const exportButton = screen.getByRole('button', { name: 'Export Container' });
  await fireEvent.click(exportButton);

  expect(goToMock).toBeCalledWith('/containers/export');
  expect(storeSetMock).toBeCalledWith(container);
});
