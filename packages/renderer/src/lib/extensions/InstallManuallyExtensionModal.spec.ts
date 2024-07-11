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
import { beforeEach, expect, test, vi } from 'vitest';

import InstallManuallyExtensionModal from './InstallManuallyExtensionModal.svelte';

const closeCallback = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).extensionInstallFromImage = vi.fn();
});

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

test('expect able to download an extension', async () => {
  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const button = screen.getByRole('button', { name: 'Install' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);

  expect(window.extensionInstallFromImage).toBeCalledWith(
    'my-custom-image.io/foo',
    expect.anything(),
    expect.anything(),
  );

  // expect button done is there now
  const buttonDone = screen.getByRole('button', { name: 'Done' });
  expect(buttonDone).toBeInTheDocument();

  // click on the button
  await userEvent.click(buttonDone);

  // expect close callback to be called
  expect(closeCallback).toBeCalled();
});

function mockExtensionInstallFromImage(): {
  resolve: () => void;
  reject: (error: unknown) => void;
  logCallback: (data: string) => void;
  errorCallback: (data: string) => void;
} {
  const resolve = vi.fn();
  const reject = vi.fn();
  const logCallback = vi.fn<[string], void>();
  const errorCallback = vi.fn<[string], void>();
  vi.mocked(window.extensionInstallFromImage).mockImplementation((_image, mLogCallback, mErrorCallback) => {
    logCallback.mockImplementation((content: string) => mLogCallback(content));
    errorCallback.mockImplementation((content: string) => mErrorCallback(content));
    return new Promise((mResolve, mReject) => {
      resolve.mockImplementation(() => mResolve());
      reject.mockImplementation((err: unknown) => mReject(err));
    });
  });
  return { resolve, reject, logCallback, errorCallback };
}

test('install button should always be disable when extensionInstallFromImage is pending', async () => {
  const { logCallback } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const installButton = screen.getByRole('button', { name: 'Install' });
  expect(installButton).toBeInTheDocument();
  expect(installButton).toBeEnabled();

  await userEvent.click(installButton);

  logCallback('Downloading sha256:random-sha256.tar - 100% - (55132/521578)');

  const progressBar = screen.getByRole('progressbar', { name: 'Installation progress' });
  await vi.waitFor(() => {
    expect(progressBar.getAttribute('style')).toBe('width: 100%');
  });

  // expect button done to be disabled
  expect(installButton).toBeDisabled();
});

test('rejected installation should make the button visible', async () => {
  const { reject } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const installButton = screen.getByRole('button', { name: 'Install' });
  await userEvent.click(installButton);

  await vi.waitFor(() => {
    expect(installButton).toBeDisabled();
  });

  reject(new Error('random error'));

  await vi.waitFor(() => {
    expect(installButton).toBeEnabled();
  });
});

test('progressbar should match latest log', async () => {
  const { logCallback } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const installButton = screen.getByRole('button', { name: 'Install' });
  expect(installButton).toBeInTheDocument();
  expect(installButton).toBeEnabled();

  await userEvent.click(installButton);

  const progressBar = screen.getByRole('progressbar', { name: 'Installation progress' });
  for (let i = 0; i < 64; i += 8) {
    logCallback(`Downloading sha256:random-sha256.tar - ${i}% - (${i}/64)`);

    await vi.waitFor(() => {
      expect(progressBar.getAttribute('style')).toBe(`width: ${i}%`);
    });
  }
});

test('install button should be enable while extensionInstallFromImage is resolved', async () => {
  const { resolve, logCallback } = mockExtensionInstallFromImage();

  render(InstallManuallyExtensionModal, { closeCallback });

  // enter the name quay.io/foobar
  const input = screen.getByRole('textbox', { name: 'Image name to install custom extension' });
  expect(input).toBeInTheDocument();
  // now enter the text 'my-custom-image.io/foo'
  await userEvent.type(input, 'my-custom-image.io/foo');

  // click on the button
  const installButton = screen.getByRole('button', { name: 'Install' });
  expect(installButton).toBeInTheDocument();
  expect(installButton).toBeEnabled();

  await userEvent.click(installButton);

  // log 100%
  logCallback('Downloading sha256:random-sha256.tar - 100% - (521578/521578)');
  const progressBar = screen.getByRole('progressbar', { name: 'Installation progress' });
  await vi.waitFor(() => {
    expect(progressBar.getAttribute('style')).toBe('width: 100%');
  });

  // resolve extensionInstallFromImage
  resolve();

  // done button should be visible after resolution
  await vi.waitFor(() => {
    const doneButton = screen.getByRole('button', { name: 'Done' });
    expect(doneButton).toBeInTheDocument();
  });

  // install button should not be visible after resolution
  expect(screen.queryByRole('button', { name: 'Install' })).toBeNull();
});
