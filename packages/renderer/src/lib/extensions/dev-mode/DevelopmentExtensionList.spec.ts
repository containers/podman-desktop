/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { ExtensionInfo } from '@desktop-framework/api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import { extensionDevelopmentFolders } from '/@/stores/extensionDevelopmentFolders';
import { extensionInfos } from '/@/stores/extensions';

import DevelopmentExtensionList from './DevelopmentExtensionList.svelte';

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();
  extensionDevelopmentFolders.set([]);
  extensionInfos.set([]);
});

const devModeNotEnabledText = 'Enable Preferences > Extensions > Development Mode to test local extensions';

test('Expect empty list if dev mode is not enabled', async () => {
  // not enabled
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);

  render(DevelopmentExtensionList);

  // wait the getConfigurationValue to be called
  await vi.waitFor(() => expect(window.getConfigurationValue).toHaveBeenCalled());

  // expect to find the text devModeNotEnabledText
  expect(screen.getByText(devModeNotEnabledText)).toBeInTheDocument();
});

test('Expect no empty screen if dev mode is enabled but table is empty', async () => {
  // enabled
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

  render(DevelopmentExtensionList);

  // wait the getConfigurationValue to be called
  await vi.waitFor(() => expect(window.getConfigurationValue).toHaveBeenCalled());

  // expect the text devModeNotEnabledText is not there
  await vi.waitFor(() => expect(screen.queryByText(devModeNotEnabledText)).not.toBeInTheDocument());

  // expect No extension for now to be displayed
  expect(screen.getByText('No extension for now')).toBeInTheDocument();
});

test('expect addLocalFolderExtension is working', async () => {
  // enabled
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

  render(DevelopmentExtensionList);

  // mock openDialog and returning the foo folder
  vi.mocked(window.openDialog).mockResolvedValue(['foo']);

  // wait the button 'Add a local folder extension is there
  await vi.waitFor(() =>
    expect(screen.getByRole('button', { name: 'Add a local folder extension...' })).toBeInTheDocument(),
  );

  const addButton = screen.getByRole('button', { name: 'Add a local folder extension...' });
  await userEvent.click(addButton);

  // check it call trackExtensionFolder with the foo folder
  await vi.waitFor(() => expect(window.trackExtensionFolder).toHaveBeenCalledWith('foo'));
});

test('expect report error of addLocalFolderExtension', async () => {
  // enabled
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

  render(DevelopmentExtensionList);

  // mock openDialog and returning the foo folder
  vi.mocked(window.openDialog).mockResolvedValue(['foo']);

  // mock trackExtensionFolder to throw an error
  vi.mocked(window.trackExtensionFolder).mockRejectedValue(new Error('dummy error'));

  // wait the button 'Add a local folder extension is there
  await vi.waitFor(() =>
    expect(screen.getByRole('button', { name: 'Add a local folder extension...' })).toBeInTheDocument(),
  );

  const addButton = screen.getByRole('button', { name: 'Add a local folder extension...' });
  await userEvent.click(addButton);

  // check it call trackExtensionFolder with the foo folder
  await vi.waitFor(() => expect(window.trackExtensionFolder).toHaveBeenCalledWith('foo'));

  // expect the error to be displayed
  await vi.waitFor(() => expect(vi.mocked(window.showMessageBox).mock.calls[0][0].message).toContain('dummy error'));
});

test('expect list displayed if enabled', async () => {
  // create a folder and an extension having the same path
  extensionDevelopmentFolders.set([{ path: 'foo' }]);
  extensionInfos.set([{ id: 'extensionid', name: 'extension A', path: 'foo' } as ExtensionInfo]);

  // enabled
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

  render(DevelopmentExtensionList);

  // wait the text "extension A" to be displayed
  await vi.waitFor(() => expect(screen.getByText('extension A')).toBeInTheDocument());
});
