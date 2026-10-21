/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import TroubleshootingRepairCleanup from './TroubleshootingRepairCleanup.svelte';

test('displays what the cleanup action will and will not delete', () => {
  render(TroubleshootingRepairCleanup);

  expect(screen.getByText('Proceeding with this action will result in data loss.')).toBeInTheDocument();
  expect(screen.getByText('It will delete:')).toBeInTheDocument();
  expect(screen.getByText('The current Podman machine')).toBeInTheDocument();
  expect(screen.getByText('Containers, images, volumes, configuration files')).toBeInTheDocument();
  expect(screen.getByText('SSH keys')).toBeInTheDocument();
  expect(screen.getByText('It will not delete:')).toBeInTheDocument();
  expect(screen.getByText('Podman logs')).toBeInTheDocument();
});

test('Check cleanupProviders is called and button is in progress', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Clear / Purge Data' });

  render(TroubleshootingRepairCleanup);

  // expect to have the cleanup button
  const cleanupButton = screen.getByRole('button', { name: 'Clear / Purge Data' });
  expect(cleanupButton).toBeInTheDocument();

  // mock the cleanup as waiting for 10ms
  vi.mocked(window.cleanupProviders).mockReturnValue(new Promise(resolve => setTimeout(resolve, 10)));

  // click on the cleanup button
  expect(cleanupButton).toBeEnabled();
  await fireEvent.click(cleanupButton);

  await waitFor(() => {
    // button should be in progress
    expect(cleanupButton).toBeDisabled();
  });

  // svg should be inside the button
  const svg = cleanupButton.querySelector('svg');
  expect(svg).toBeInTheDocument();

  await waitFor(() => {
    // button should not be in progress anymore
    expect(cleanupButton).toBeEnabled();
  });

  // check that we asked for confirmation
  expect(window.showMessageBox).toBeCalledWith({
    buttons: ['Clear / Purge Data', 'Cancel'],
    type: 'danger',
    message: 'This action will delete data and cannot be undone. Proceed?',
    title: 'Clear / Purge Data?',
  });

  // check that we're calling the vi.mocked(window.cleanupProviders)
  expect(vi.mocked(window.cleanupProviders)).toBeCalled();
});

test('Check errors are displayed with clipboard button', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Clear / Purge Data' });

  render(TroubleshootingRepairCleanup);

  // expect to have the cleanup button
  const cleanupButton = screen.getByRole('button', { name: 'Clear / Purge Data' });
  expect(cleanupButton).toBeInTheDocument();

  // mock the cleanup as waiting for 2 seconds
  vi.mocked(window.cleanupProviders).mockRejectedValue(new Error('test error'));

  // click on the cleanup button
  expect(cleanupButton).toBeEnabled();
  await fireEvent.click(cleanupButton);

  // check that we asked for confirmation
  expect(window.showMessageBox).toBeCalledWith({
    buttons: ['Clear / Purge Data', 'Cancel'],
    type: 'danger',
    message: 'This action will delete data and cannot be undone. Proceed?',
    title: 'Clear / Purge Data?',
  });

  // check that we're calling the vi.mocked(window.cleanupProviders)
  expect(vi.mocked(window.cleanupProviders)).toBeCalled();

  // check errors are displayed
  const alterSection = screen.getByRole('alert');
  expect(alterSection).toBeInTheDocument();
  expect(alterSection).toHaveTextContent('1 failures');
  expect(alterSection).not.toHaveAttribute('aria-label');
  // the decorative icon is hidden from assistive tech and exposes no image role
  expect(alterSection.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  expect(within(alterSection).queryByRole('img')).not.toBeInTheDocument();
});
