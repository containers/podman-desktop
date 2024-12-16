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
import { afterEach, beforeAll, expect, test, vi } from 'vitest';

import DeploymentActions from './DeploymentActions.svelte';
import type { DeploymentUI } from './DeploymentUI';

const updateMock = vi.fn();
const deleteMock = vi.fn();

class DeploymentfUIImpl {
  #status: string;
  constructor(
    public name: string,
    initialStatus: string,
    public namespace: string,
    public replicas: number,
    public ready: number,
    public selected: boolean,
    public conditions: unknown[],
  ) {
    this.#status = initialStatus;
  }
  set status(status: string) {
    this.#status = status;
  }
  get status(): string {
    return this.#status;
  }
}

const deployment: DeploymentUI = new DeploymentfUIImpl(
  'my-deployment',
  'RUNNING',
  '',
  0,
  0,
  false,
  [],
) as unknown as DeploymentUI;

const showMessageBoxMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'kubernetesDeleteDeployment', { value: deleteMock });
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error and status deleting deployment', async () => {
  showMessageBoxMock.mockResolvedValue({ response: 0 });

  render(DeploymentActions, { deployment, onUpdate: updateMock });

  // click on delete buttons
  const deleteButton = screen.getByRole('button', { name: 'Delete Deployment' });
  await fireEvent.click(deleteButton);
  expect(showMessageBoxMock).toHaveBeenCalledOnce();

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

  expect(deployment.status).toEqual('DELETING');
  expect(updateMock).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalled();
});
