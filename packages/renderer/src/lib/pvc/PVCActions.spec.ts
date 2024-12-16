/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import PVCActions from './PVCActions.svelte';
import type { PVCUI } from './PVCUI';

const updateMock = vi.fn();
const deleteMock = vi.fn();
const showMessageBoxMock = vi.fn();

class StatusHolder {
  #status: string;
  constructor(initialStatus: string) {
    this.#status = initialStatus;
  }
  set status(status: string) {
    this.#status = status;
  }
  get status(): string {
    return this.#status;
  }
}

const fakePVC: PVCUI = new StatusHolder('RUNNING') as unknown as PVCUI;
fakePVC.name = 'pvc-1';
fakePVC.namespace = 'default';
fakePVC.status = 'RUNNING';
fakePVC.storageClass = 'standard';
fakePVC.accessModes = ['ReadWriteOnce'];
fakePVC.selected = false;
fakePVC.size = '1Gi';

beforeEach(() => {
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
  Object.defineProperty(window, 'kubernetesDeletePersistentVolumeClaim', { value: deleteMock });
  (window.events as unknown) = {
    receive: (_channel: string, func: () => void) => {
      func();
    },
  };
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error and status deleting PVC', async () => {
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  render(PVCActions, { pvc: fakePVC, onUpdate: updateMock });

  // click on delete buttons
  const deleteButton = screen.getByRole('button', { name: 'Delete PersistentVolumeClaim' });
  await fireEvent.click(deleteButton);

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(fakePVC.status).toEqual('DELETING');
  expect(updateMock).toHaveBeenCalled();
  expect(deleteMock).toHaveBeenCalled();
});
