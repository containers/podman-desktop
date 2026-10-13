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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { assert, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import { catalogListFilters } from './catalog-list-filters.svelte';
import CatalogExtensionList from './CatalogExtensionList.svelte';
import CatalogExtensionPage from './CatalogExtensionPage.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'extensionInstallFromImage', { value: vi.fn() });
  Object.defineProperty(window, 'refreshCatalogExtensions', { value: vi.fn() });
});

beforeEach(() => {
  vi.resetAllMocks();
  catalogListFilters.reset();
});

const extensionA: CatalogExtensionInfoUI = {
  id: 'myId1',
  displayName: 'This is the display name1',
  isFeatured: false,
  fetchable: false,
  fetchLink: '',
  fetchVersion: '',
  publisherDisplayName: 'Foo publisher',
  isInstalled: false,
  shortDescription: 'my description1',
  categories: [],
  keywords: [],
};

const extensionB: CatalogExtensionInfoUI = {
  id: 'myId2',
  displayName: 'This is the display name2',
  isFeatured: false,
  fetchable: false,
  fetchLink: '',
  fetchVersion: '',
  publisherDisplayName: 'Foo publisher',
  isInstalled: false,
  shortDescription: 'my description2',
  categories: [],
  keywords: [],
};
test('Check with empty', async () => {
  render(CatalogExtensionList, { catalogExtensions: [] });

  // no 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).not.toBeInTheDocument();

  // check we have the empty screen and the button to refresh the catalog
  const emptyScreen = screen.getByText('No extensions in the catalog');
  expect(emptyScreen).toBeInTheDocument();

  const refreshButton = screen.getByRole('button', { name: 'Refresh the catalog' });
  expect(refreshButton).toBeInTheDocument();

  // make the refresh throwing an error
  vi.mocked(window.refreshCatalogExtensions).mockRejectedValue(new Error('fake error'));

  // click on the button
  await fireEvent.click(refreshButton);

  // check the function was called
  expect(window.refreshCatalogExtensions).toHaveBeenCalled();

  // check error message is displayed
  expect(window.showMessageBox).toHaveBeenCalledWith({
    detail: 'Error: fake error',
    message: 'Failed to refresh the catalog',
    title: 'Refresh Catalog Failed',
    type: 'error',
    buttons: ['Dismiss'],
  });
});

test('Check with 2 extensions', async () => {
  render(CatalogExtensionList, { catalogExtensions: [extensionA, extensionB] });

  // 'Available extensions' text
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).toBeInTheDocument();

  // get region role with text 'Catalog Extensions'
  const region = screen.getByRole('region', { name: 'Catalog Extensions' });
  expect(region).toBeInTheDocument();

  // get div using aria-label 'This is the display name1'
  const extensionWidgetA = screen.getByRole('group', { name: 'This is the display name1' });
  expect(extensionWidgetA).toBeInTheDocument();

  const extensionWidgetB = screen.getByRole('group', { name: 'This is the display name2' });
  expect(extensionWidgetB).toBeInTheDocument();

  // expect to see the refresh button
  const refreshButton = screen.getByRole('button', { name: 'Refresh the catalog' });
  expect(refreshButton).toBeInTheDocument();
});

test('non default title', async () => {
  render(CatalogExtensionList, { title: 'Another title', catalogExtensions: [extensionA, extensionB] });
  const availableExtensions = screen.queryByText('Available extensions');
  expect(availableExtensions).not.toBeInTheDocument();

  const title = screen.queryByText('Another title');
  expect(title).toBeInTheDocument();
});

test('empty catalog, do not hide if empty (default)', async () => {
  render(CatalogExtensionList, { catalogExtensions: [] });

  const emptyMsg = screen.queryByText('No extensions in the catalog');
  expect(emptyMsg).toBeInTheDocument();
});

test('empty catalog, hide if empty', async () => {
  render(CatalogExtensionList, { showEmptyScreen: false, catalogExtensions: [] });

  const emptyMsg = screen.queryByText('No extensions in the catalog');
  expect(emptyMsg).not.toBeInTheDocument();
});

test('toolbar search filters the visible extensions', async () => {
  render(CatalogExtensionPage, { catalogExtensions: [extensionA, extensionB] });

  const searchInput = screen.getByRole('textbox', { name: 'search extensions' });
  await fireEvent.input(searchInput, { target: { value: 'name2' } });

  expect(screen.queryByRole('group', { name: 'This is the display name1' })).not.toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'This is the display name2' })).toBeInTheDocument();
});

test('shows no-match empty screen when filters exclude everything', async () => {
  render(CatalogExtensionPage, { catalogExtensions: [extensionA, extensionB] });

  const searchInput = screen.getByRole('textbox', { name: 'search extensions' });
  await fireEvent.input(searchInput, { target: { value: 'does-not-exist' } });

  expect(screen.getByText('No extensions match your filters')).toBeInTheDocument();
});

test('no-match empty screen offers an inline Clear filters button that restores every extension', async () => {
  render(CatalogExtensionPage, { catalogExtensions: [extensionA, extensionB] });

  const searchInput = screen.getByRole('textbox', { name: 'search extensions' });
  await fireEvent.input(searchInput, { target: { value: 'does-not-exist' } });
  expect(screen.getByText('No extensions match your filters')).toBeInTheDocument();

  // the empty screen provides a prominent reset action (not just the toolbar link)
  const clearFiltersButton = screen.getByRole('button', { name: 'Clear filters' });
  await fireEvent.click(clearFiltersButton);

  // filters are reset: the search input is emptied and both extensions are visible again
  expect(searchInput).toHaveValue('');
  expect(screen.getByRole('group', { name: 'This is the display name1' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'This is the display name2' })).toBeInTheDocument();
});

test('Clear resets the search term and filters back to their defaults', async () => {
  render(CatalogExtensionPage, { catalogExtensions: [extensionA, extensionB] });

  // type a search term that hides everything
  const searchInput = screen.getByRole('textbox', { name: 'search extensions' });
  await fireEvent.input(searchInput, { target: { value: 'does-not-exist' } });
  expect(searchInput).toHaveValue('does-not-exist');
  expect(screen.getByText('No extensions match your filters')).toBeInTheDocument();

  // click Clear
  const clearButton = screen.getByRole('button', { name: 'Clear' });
  await fireEvent.click(clearButton);

  // the search input is emptied and both extensions are visible again
  expect(searchInput).toHaveValue('');
  expect(screen.getByRole('group', { name: 'This is the display name1' })).toBeInTheDocument();
  expect(screen.getByRole('group', { name: 'This is the display name2' })).toBeInTheDocument();
});

test('Clear resets the install-status dropdown label back to its default', async () => {
  render(CatalogExtensionPage, { catalogExtensions: [extensionA, extensionB] });

  // open the install-status dropdown and pick "Installed"
  const installDropdown = screen.getByLabelText('Filter by install status');
  const installButton = installDropdown.querySelector('button');
  assert(installButton);
  await fireEvent.click(installButton);
  await fireEvent.click(screen.getByRole('button', { name: 'Installed' }));

  // the dropdown now shows the selected value, not the default
  expect(installDropdown).toHaveTextContent('Installed');
  expect(installDropdown).not.toHaveTextContent('All statuses');

  // click Clear
  await fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

  // the dropdown label is restored to the default
  const installDropdownAfter = screen.getByLabelText('Filter by install status');
  expect(installDropdownAfter).toHaveTextContent('All statuses');
});
