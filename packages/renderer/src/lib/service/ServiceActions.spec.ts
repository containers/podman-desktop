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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import ServiceActions from './ServiceActions.svelte';
import type { ServiceUI } from './ServiceUI';

const updateMock = vi.fn();
const deleteMock = vi.fn();
const showMessageBoxMock = vi.fn();

class ServiceUIImpl {
  #status: string;
  constructor(
    public uid: string,
    public name: string,
    initStatus: string,
    public namespace: string,
    public selected: boolean,
    public type: string,
    public clusterIP: string,
    public ports: string,
  ) {
    this.#status = initStatus;
  }

  set status(status: string) {
    this.#status = status;
  }

  get status(): string {
    return this.#status;
  }
}

const service: ServiceUI = new ServiceUIImpl('123', 'my-service', 'RUNNING', '', false, '', '', '');

beforeEach(() => {
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
  Object.defineProperty(window, 'kubernetesDeleteService', { value: deleteMock });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error and status deleting service', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  render(ServiceActions, { service, onUpdate: updateMock });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Service' });
  await fireEvent.click(deleteButton);

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(service.status).toEqual('DELETING');
  expect(updateMock).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalled();
});
