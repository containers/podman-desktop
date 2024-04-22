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
