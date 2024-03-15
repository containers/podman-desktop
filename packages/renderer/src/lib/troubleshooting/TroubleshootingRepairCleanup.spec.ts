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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import TroubleshootingRepairCleanup from './TroubleshootingRepairCleanup.svelte';

const showMessageBoxMock = vi.fn();
const cleanupProvidersMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).window.showMessageBox = showMessageBoxMock;
  (window as any).window.cleanupProviders = cleanupProvidersMock;
});

test('Check cleanupProviders is called and button is in progress', async () => {
  showMessageBoxMock.mockResolvedValue({ response: 0 });

  render(TroubleshootingRepairCleanup);

  // expect to have the cleanup button
  const cleanupButton = screen.getByRole('button', { name: 'Cleanup' });
  expect(cleanupButton).toBeInTheDocument();

  // mock the cleanup as waiting for 2 seconds
  cleanupProvidersMock.mockResolvedValue(new Promise(resolve => setTimeout(resolve, 2000)));

  // click on the cleanup button
  expect(cleanupButton).toBeEnabled();
  await fireEvent.click(cleanupButton);

  // wait next tick
  await new Promise(resolve => setTimeout(resolve, 100));

  // button should be in progress
  expect(cleanupButton).toBeDisabled();
  // svg should be inside the button
  const svg = cleanupButton.querySelector('svg');
  expect(svg).toBeInTheDocument();

  // wait 2s for the cleanup to finish
  await new Promise(resolve => setTimeout(resolve, 2000));

  // button should not be in progress anymore
  expect(cleanupButton).toBeEnabled();

  // check that we asked for confirmation
  expect(showMessageBoxMock).toBeCalledWith({
    buttons: ['Yes', 'Cancel'],
    message: 'This action may delete data. Proceed ?',
    title: 'Cleanup',
  });

  // check that we're calling the cleanupProvidersMock
  expect(cleanupProvidersMock).toBeCalled();
});

test('Check errors are displayed with clipboard button', async () => {
  showMessageBoxMock.mockResolvedValue({ response: 0 });

  render(TroubleshootingRepairCleanup);

  // expect to have the cleanup button
  const cleanupButton = screen.getByRole('button', { name: 'Cleanup' });
  expect(cleanupButton).toBeInTheDocument();

  // mock the cleanup as waiting for 2 seconds
  cleanupProvidersMock.mockRejectedValue(new Error('test error'));

  // click on the cleanup button
  expect(cleanupButton).toBeEnabled();
  await fireEvent.click(cleanupButton);

  // wait next tick
  await new Promise(resolve => setTimeout(resolve, 100));

  // check that we asked for confirmation
  expect(showMessageBoxMock).toBeCalledWith({
    buttons: ['Yes', 'Cancel'],
    message: 'This action may delete data. Proceed ?',
    title: 'Cleanup',
  });

  // check that we're calling the cleanupProvidersMock
  expect(cleanupProvidersMock).toBeCalled();

  // check errors are displayed
  const alterSection = screen.getByRole('alert');
  expect(alterSection).toBeInTheDocument();
  expect(alterSection).toHaveTextContent('1 failures');
});
