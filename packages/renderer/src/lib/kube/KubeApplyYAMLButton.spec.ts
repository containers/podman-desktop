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

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import KubeApplyYamlButton from './KubeApplyYAMLButton.svelte';

const currentContext: string = 'test-context';
const currentNamespace: string = 'test-namespace';
const openDialogMock = vi.fn();
const kubernetesApplyResourcesFromFileMock = vi.fn();
const showMessageBoxMock = vi.fn();

// fake the window object
beforeAll(() => {
  Object.defineProperty(window, 'openDialog', { value: openDialogMock });
  Object.defineProperty(window, 'kubernetesGetCurrentNamespace', {
    value: vi.fn().mockResolvedValue(currentNamespace),
  });
  Object.defineProperty(window, 'kubernetesGetCurrentContextName', {
    value: vi.fn().mockResolvedValue(currentContext),
  });
  Object.defineProperty(window, 'kubernetesApplyResourcesFromFile', { value: kubernetesApplyResourcesFromFileMock });
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
});

test('Verify clicking button will open file dialog and canceling will exit', async () => {
  render(KubeApplyYamlButton);

  openDialogMock.mockResolvedValue([]);

  const button = screen.getByRole('button', { name: 'Apply YAML' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);

  expect(openDialogMock).toHaveBeenCalled();
  expect(kubernetesApplyResourcesFromFileMock).not.toHaveBeenCalled();
});

test('Verify selected file will be applied', async () => {
  render(KubeApplyYamlButton);

  const filename = 'service.yaml';
  openDialogMock.mockResolvedValue([filename]);

  const button = screen.getByRole('button', { name: 'Apply YAML' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);

  expect(openDialogMock).toHaveBeenCalled();
  expect(kubernetesApplyResourcesFromFileMock).toHaveBeenCalledWith(currentContext, [filename], currentNamespace);
});

test('Verify success will open an info dialog', async () => {
  render(KubeApplyYamlButton);

  const filename = 'service.yaml';
  openDialogMock.mockResolvedValue([filename]);
  kubernetesApplyResourcesFromFileMock.mockReturnValue([{}]);

  const button = screen.getByRole('button', { name: 'Apply YAML' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);

  expect(openDialogMock).toHaveBeenCalled();
  expect(kubernetesApplyResourcesFromFileMock).toHaveBeenCalledWith(currentContext, [filename], currentNamespace);

  expect(showMessageBoxMock).toHaveBeenCalled();
  expect(showMessageBoxMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'info' }));
});

test('Verify multiple file success will open an info dialog', async () => {
  render(KubeApplyYamlButton);

  const filename1 = 'service1.yaml';
  const filename2 = 'service2.yaml';
  openDialogMock.mockResolvedValue([filename1, filename2]);
  kubernetesApplyResourcesFromFileMock.mockReturnValue([{}]);

  const button = screen.getByRole('button', { name: 'Apply YAML' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);

  expect(openDialogMock).toHaveBeenCalled();
  expect(kubernetesApplyResourcesFromFileMock).toHaveBeenCalledWith(
    currentContext,
    [filename1, filename2],
    currentNamespace,
  );

  expect(showMessageBoxMock).toHaveBeenCalled();
  expect(showMessageBoxMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'info' }));
});

test('Verify no results will open a warning dialog', async () => {
  render(KubeApplyYamlButton);

  const filename = 'service.yaml';
  openDialogMock.mockResolvedValue([filename]);
  kubernetesApplyResourcesFromFileMock.mockReturnValue([]);

  const button = screen.getByRole('button', { name: 'Apply YAML' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);

  expect(openDialogMock).toHaveBeenCalled();
  expect(kubernetesApplyResourcesFromFileMock).toHaveBeenCalledWith(currentContext, [filename], currentNamespace);

  expect(showMessageBoxMock).toHaveBeenCalled();
  expect(showMessageBoxMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'warning' }));
});

test('Verify failure will open an error dialog', async () => {
  render(KubeApplyYamlButton);

  const filename = 'service.yaml';
  openDialogMock.mockResolvedValue([filename]);
  kubernetesApplyResourcesFromFileMock.mockRejectedValue('error');

  const button = screen.getByRole('button', { name: 'Apply YAML' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);

  expect(openDialogMock).toHaveBeenCalled();
  expect(kubernetesApplyResourcesFromFileMock).toHaveBeenCalledWith(currentContext, [filename], currentNamespace);

  expect(showMessageBoxMock).toHaveBeenCalled();
  expect(showMessageBoxMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
});
