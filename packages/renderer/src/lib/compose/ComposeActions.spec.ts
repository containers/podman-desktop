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
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { ContainerInfoUI } from '../container/ContainerInfoUI';
import ComposeActions from './ComposeActions.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

class ComposeInfoUIImpl implements ComposeInfoUI {
  #status: string = 'STOPPED';
  constructor(
    public engineId: string,
    public engineType: 'docker' | 'podman',
    public name: string,
    initialStatus: string,
    public actionInProgress: boolean,
    public actionError: string | undefined,
    public containers: ContainerInfoUI[],
  ) {}
  set status(status: string) {
    this.#status = status;
  }
  get status(): string {
    return this.#status;
  }
}

const compose: ComposeInfoUI = new ComposeInfoUIImpl(
  'podman',
  'podman',
  'my-compose-group',
  'STOPPED',
  false,
  undefined,
  [
    {
      actionInProgress: false,
      actionError: undefined,
      state: 'STOPPED',
    } as ContainerInfoUI,
  ],
);

const getContributedMenusMock = vi.fn();
const updateMock = vi.fn();
const showMessageBoxMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
  Object.defineProperty(window, 'startContainersByLabel', { value: vi.fn() });
  Object.defineProperty(window, 'stopContainersByLabel', { value: vi.fn() });
  Object.defineProperty(window, 'restartContainersByLabel', { value: vi.fn() });
  Object.defineProperty(window, 'deleteContainersByLabel', { value: vi.fn() });

  Object.defineProperty(window, 'getContributedMenus', { value: getContributedMenusMock });
});

beforeEach(() => {
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error and status starting compose', async () => {
  render(ComposeActions, { compose, onUpdate: updateMock });

  // click on start button
  const startButton = screen.getByRole('button', { name: 'Start Compose' });
  await fireEvent.click(startButton);

  expect(compose.status).toEqual('STARTING');
  expect(compose.actionError).toEqual('');
  expect(compose.containers[0].state).toEqual('STARTING');
  expect(compose.containers[0].actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status stopping compose', async () => {
  render(ComposeActions, { compose, onUpdate: updateMock });

  // click on stop button
  const stopButton = screen.getByRole('button', { name: 'Stop Compose' });
  await fireEvent.click(stopButton);

  expect(compose.status).toEqual('STOPPING');
  expect(compose.actionError).toEqual('');
  expect(compose.containers[0].state).toEqual('STOPPING');
  expect(compose.containers[0].actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status restarting compose', async () => {
  render(ComposeActions, { compose, onUpdate: updateMock });

  // click on restart button
  const restartButton = screen.getByRole('button', { name: 'Restart Compose' });
  await fireEvent.click(restartButton);

  expect(compose.status).toEqual('RESTARTING');
  expect(compose.actionError).toEqual('');
  expect(compose.containers[0].state).toEqual('RESTARTING');
  expect(compose.containers[0].actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});

test('Expect no error and status deleting compose', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  render(ComposeActions, { compose, onUpdate: updateMock });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Compose' });
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  expect(compose.status).toEqual('DELETING');
  expect(compose.actionError).toEqual('');
  expect(compose.containers[0].state).toEqual('DELETING');
  expect(compose.containers[0].actionError).toEqual('');
  expect(updateMock).toHaveBeenCalled();
});
