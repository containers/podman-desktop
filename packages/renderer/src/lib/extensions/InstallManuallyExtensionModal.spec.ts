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
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import InstallManuallyExtensionModal from './InstallManuallyExtensionModal.svelte';

const closeCallback = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'extensionInstallFromImage', { value: vi.fn() });
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.mocked(window.extensionInstallFromImage).mockResolvedValue(undefined);
});

async function typeImageName(imageName: string): Promise<void> {
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  await userEvent.type(input, imageName);
}

test('expect invalid field', async () => {
  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();

  const button = screen.getByRole('button', { name: 'Install' });
  expect(button).toBeInTheDocument();

  // disabled due to error
  expect(button).toBeDisabled();
});

test('clicking Install closes the dialog and installs the trimmed image', async () => {
  render(InstallManuallyExtensionModal, { closeCallback });
  await typeImageName(' my-custom-image.io/foo ');

  await userEvent.click(screen.getByRole('button', { name: 'Install' }));

  expect(closeCallback).toHaveBeenCalled();
  expect(window.extensionInstallFromImage).toHaveBeenCalledWith(
    'my-custom-image.io/foo',
    expect.any(Function),
    expect.any(Function),
  );
});

test('pressing Enter installs a valid image', async () => {
  render(InstallManuallyExtensionModal, { closeCallback });
  await typeImageName('my-custom-image.io/foo');

  await userEvent.keyboard('{Enter}');

  expect(closeCallback).toHaveBeenCalled();
  expect(window.extensionInstallFromImage).toHaveBeenCalledWith(
    'my-custom-image.io/foo',
    expect.any(Function),
    expect.any(Function),
  );
});

test('pressing Enter without an image does not install', async () => {
  render(InstallManuallyExtensionModal, { closeCallback });

  await userEvent.keyboard('{Enter}');

  expect(closeCallback).not.toHaveBeenCalled();
  expect(window.extensionInstallFromImage).not.toHaveBeenCalled();
});

test('clicking Cancel closes the dialog without installing', async () => {
  render(InstallManuallyExtensionModal, { closeCallback });
  await typeImageName('my-custom-image.io/foo');

  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

  expect(closeCallback).toHaveBeenCalled();
  expect(window.extensionInstallFromImage).not.toHaveBeenCalled();
});

test('an error reported by the installer is logged', async () => {
  vi.mocked(window.extensionInstallFromImage).mockImplementation(async (_imageName, _logCallback, errorCallback) => {
    errorCallback('Extension is already installed');
  });
  render(InstallManuallyExtensionModal, { closeCallback });
  await typeImageName('my-custom-image.io/foo');

  await userEvent.click(screen.getByRole('button', { name: 'Install' }));

  await vi.waitFor(() =>
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      'got an error when installing my-custom-image.io/foo',
      'Extension is already installed',
    ),
  );
});

test('a rejected installation is logged', async () => {
  const error = new Error('random error');
  vi.mocked(window.extensionInstallFromImage).mockRejectedValue(error);
  render(InstallManuallyExtensionModal, { closeCallback });
  await typeImageName('my-custom-image.io/foo');

  await userEvent.click(screen.getByRole('button', { name: 'Install' }));

  await vi.waitFor(() =>
    expect(vi.mocked(console.error)).toHaveBeenCalledWith('error when installing my-custom-image.io/foo', error),
  );
});
