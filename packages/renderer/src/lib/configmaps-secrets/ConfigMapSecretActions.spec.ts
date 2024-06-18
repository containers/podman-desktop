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

import ConfigMapSecretActions from './ConfigMapSecretActions.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

const updateMock = vi.fn();
const deleteMock = vi.fn();
const showMessageBoxMock = vi.fn();

const fakeConfigMap: ConfigMapSecretUI = {
  name: 'my-configmap',
  namespace: '',
  selected: false,
  type: 'ConfigMap',
  status: '',
  keys: [],
};

const fakeSecret: ConfigMapSecretUI = {
  name: 'my-secret',
  namespace: '',
  selected: false,
  type: 'Secret',
  status: '',
  keys: [],
};

beforeEach(() => {
  (window as any).showMessageBox = showMessageBoxMock;
  (window as any).kubernetesDeleteConfigMap = deleteMock;
  (window as any).kubernetesDeleteSecret = deleteMock;
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect no error when deleting configmap', async () => {
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  const { component } = render(ConfigMapSecretActions, { configMapSecret: fakeConfigMap });
  component.$on('update', updateMock);

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete ConfigMap' });
  await fireEvent.click(deleteButton);

  // wait for the delete function to be called
  await waitFor(() => expect(deleteMock).toHaveBeenCalled());
});

test('Expect no error when deleting secret', async () => {
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  const { component } = render(ConfigMapSecretActions, { configMapSecret: fakeSecret });
  component.$on('update', updateMock);

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Secret' });
  await fireEvent.click(deleteButton);

  // wait for the delete function to be called
  await waitFor(() => expect(deleteMock).toHaveBeenCalled());
});
