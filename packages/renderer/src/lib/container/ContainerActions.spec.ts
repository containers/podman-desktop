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
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { context } from '/@/stores/context';

import { ContextUI } from '../context/context';
import ContainerActions from './ContainerActions.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

class ContainerInfoUIImpl {
  #actionError: string = '';
  constructor(
    public id: string,
    public engineId: string,
  ) {}
  set actionError(error: string) {
    this.#actionError = error;
  }
  get actionError(): string {
    return this.#actionError;
  }
}

const container: ContainerInfoUI = new ContainerInfoUIImpl(
  'container-id',
  'container-engine-id',
) as unknown as ContainerInfoUI;

const getContributedMenusMock = vi.fn();
const updateMock = vi.fn();
const showMessageBoxMock = vi.fn();

vi.mock('/@/lib/actions/ContributionActions.svelte');

beforeAll(() => {
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
  Object.defineProperty(window, 'startContainer', { value: vi.fn() });
  Object.defineProperty(window, 'stopContainer', { value: vi.fn() });
  Object.defineProperty(window, 'restartContainer', { value: vi.fn() });
  Object.defineProperty(window, 'deleteContainer', { value: vi.fn() });

  Object.defineProperty(window, 'getContributedMenus', { value: getContributedMenusMock });
});

beforeEach(() => {
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error and status starting container', async () => {
  render(ContainerActions, { container, onUpdate: updateMock });

  // click on start button
  const startButton = screen.getByRole('button', { name: 'Start Container' });
  await fireEvent.click(startButton);

  expect(container.state).toEqual('STARTING');
  expect(container.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status stopping container', async () => {
  render(ContainerActions, { container, onUpdate: updateMock });

  // click on stop button
  const stopButton = screen.getByRole('button', { name: 'Stop Container' });
  await fireEvent.click(stopButton);

  expect(container.state).toEqual('STOPPING');
  expect(container.actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status restarting container', async () => {
  render(ContainerActions, { container, onUpdate: updateMock });

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
  render(ContainerActions, { container, onUpdate: updateMock });

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

  render(ContainerActions, { container });
  const exportButton = screen.getByRole('button', { name: 'Export Container' });
  await fireEvent.click(exportButton);

  expect(goToMock).toBeCalledWith('/containers/container-id/export');
});

test('Expect Deploy to Kubernetes to redirect to expected page', async () => {
  const goToMock = vi.spyOn(router, 'goto');

  render(ContainerActions, { container });
  const deployButton = screen.getByRole('button', { name: 'Deploy to Kubernetes' });
  await fireEvent.click(deployButton);

  expect(goToMock).toBeCalledWith(`/deploy-to-kube/container-id/container-engine-id`);
});

test('Expect Generate Kube to redirect to expected page', async () => {
  const goToMock = vi.spyOn(router, 'goto');

  render(ContainerActions, { container });
  const deployButton = screen.getByRole('button', { name: 'Generate Kube' });
  await fireEvent.click(deployButton);

  expect(goToMock).toBeCalledWith(`/containers/container-id/kube`);
});

test('Expect ContributionsAction component is created with a contextUI containing containerImageName', async () => {
  const contributionActionsMock = vi.mocked(ContributionActions);
  const containerWithImageName = new ContainerInfoUIImpl(
    'container-id',
    'container-engine-id',
  ) as unknown as ContainerInfoUI;
  containerWithImageName.image = 'quay.io/user/my-image';
  const ctx = new ContextUI();
  ctx.setValue('key1', 'value1');
  context.set(ctx);
  render(ContainerActions, { container: containerWithImageName });
  await vi.waitFor(() => {
    expect(contributionActionsMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        contextUI: {
          _value: {
            containerImageName: 'quay.io/user/my-image',
            key1: 'value1',
          },
        },
      }),
    );
  });
});
