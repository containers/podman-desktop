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
import { beforeEach, expect, test, vi } from 'vitest';

import type { ExtensionDetailsUI } from './extension-details-ui';
import ExtensionDetailsSummaryCard from './ExtensionDetailsSummaryCard.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.openExternal).mockResolvedValue(undefined);
});

test('Expect to have text of the card including version, release date, publisher and categories', async () => {
  const extensionDetails: ExtensionDetailsUI = {
    displayName: 'my display name',
    description: 'my description',
    type: 'pd',
    removable: false,
    devMode: false,
    bundled: false,
    state: 'started',
    name: 'foo',
    icon: 'fooIcon',
    readme: { content: '' },
    releaseDate: '2024-01-01',
    categories: ['cat1', 'cat2'],
    publisherDisplayName: 'my publisher',
    version: 'v1.2.3',
    id: 'myId',
    fetchable: true,
    fetchLink: 'myLink',
    fetchVersion: 'v3.4.5',
  };

  render(ExtensionDetailsSummaryCard, { extensionDetails });

  // should contain the version v1.2.3
  const version = screen.getByText('v1.2.3');
  expect(version).toBeInTheDocument();

  // should contain the publisher my publisher
  const publisher = screen.getByText('my publisher');
  expect(publisher).toBeInTheDocument();

  // release date
  const releaseDate = screen.getByText('2024-01-01');
  expect(releaseDate).toBeInTheDocument();

  // categories
  const categories = screen.getByText('cat1, cat2');
  expect(categories).toBeInTheDocument();
});

test('Expect repository link to open external URL', async () => {
  const extensionDetails: ExtensionDetailsUI = {
    displayName: 'my display name',
    description: 'my description',
    type: 'pd',
    removable: false,
    devMode: false,
    bundled: false,
    state: 'started',
    name: 'foo',
    icon: 'fooIcon',
    readme: { content: '' },
    releaseDate: '2024-01-01',
    categories: [],
    publisherDisplayName: 'my publisher',
    version: 'v1.2.3',
    id: 'myId',
    fetchable: true,
    fetchLink: 'myLink',
    fetchVersion: 'v3.4.5',
    repository: 'https://github.com/example/repo',
  };

  render(ExtensionDetailsSummaryCard, { extensionDetails });

  expect(screen.getByText('resources')).toBeInTheDocument();
  const repoLink = screen.getByText('Repository');
  expect(repoLink).toBeInTheDocument();

  await fireEvent.click(repoLink);
  expect(window.openExternal).toHaveBeenCalledWith('https://github.com/example/repo');
});

test('Expect repository object link to open external URL', async () => {
  const extensionDetails: ExtensionDetailsUI = {
    displayName: 'my display name',
    description: 'my description',
    type: 'pd',
    removable: false,
    devMode: false,
    bundled: false,
    state: 'started',
    name: 'foo',
    icon: 'fooIcon',
    readme: { content: '' },
    releaseDate: '2024-01-01',
    categories: [],
    publisherDisplayName: 'my publisher',
    version: 'v1.2.3',
    id: 'myId',
    fetchable: true,
    fetchLink: 'myLink',
    fetchVersion: 'v3.4.5',
    repository: {
      type: 'git',
      url: 'https://github.com/example/repo-object',
      directory: 'extensions/example',
    },
  };

  render(ExtensionDetailsSummaryCard, { extensionDetails });

  const repoLink = screen.getByText('Repository');
  expect(repoLink).toBeInTheDocument();

  await fireEvent.click(repoLink);
  expect(window.openExternal).toHaveBeenCalledWith('https://github.com/example/repo-object');
});

test('Expect repository link to strip git+ prefix before opening', async () => {
  const extensionDetails: ExtensionDetailsUI = {
    displayName: 'my display name',
    description: 'my description',
    type: 'pd',
    removable: false,
    devMode: false,
    bundled: false,
    state: 'started',
    name: 'foo',
    icon: 'fooIcon',
    readme: { content: '' },
    releaseDate: '2024-01-01',
    categories: [],
    publisherDisplayName: 'my publisher',
    version: 'v1.2.3',
    id: 'myId',
    fetchable: true,
    fetchLink: 'myLink',
    fetchVersion: 'v3.4.5',
    repository: {
      type: 'git',
      url: 'git+https://github.com/example/repo-with-git-plus.git',
      directory: 'extensions/example',
    },
  };

  render(ExtensionDetailsSummaryCard, { extensionDetails });

  const repoLink = screen.getByText('Repository');
  expect(repoLink).toBeInTheDocument();

  await fireEvent.click(repoLink);
  expect(window.openExternal).toHaveBeenCalledWith('https://github.com/example/repo-with-git-plus.git');
});

test('Expect homepage link to open external URL', async () => {
  const extensionDetails: ExtensionDetailsUI = {
    displayName: 'my display name',
    description: 'my description',
    type: 'pd',
    removable: false,
    devMode: false,
    bundled: false,
    state: 'started',
    name: 'foo',
    icon: 'fooIcon',
    readme: { content: '' },
    releaseDate: '2024-01-01',
    categories: [],
    publisherDisplayName: 'my publisher',
    version: 'v1.2.3',
    id: 'myId',
    fetchable: true,
    fetchLink: 'myLink',
    fetchVersion: 'v3.4.5',
    homepage: 'https://example.com',
  };

  render(ExtensionDetailsSummaryCard, { extensionDetails });

  expect(screen.getByText('resources')).toBeInTheDocument();
  const homepageLink = screen.getByText('Homepage');
  expect(homepageLink).toBeInTheDocument();

  await fireEvent.click(homepageLink);
  expect(window.openExternal).toHaveBeenCalledWith('https://example.com');
});

test('Expect no repository or homepage when not provided', async () => {
  const extensionDetails: ExtensionDetailsUI = {
    displayName: 'my display name',
    description: 'my description',
    type: 'pd',
    removable: false,
    devMode: false,
    bundled: false,
    state: 'started',
    name: 'foo',
    icon: 'fooIcon',
    readme: { content: '' },
    releaseDate: '2024-01-01',
    categories: [],
    publisherDisplayName: 'my publisher',
    version: 'v1.2.3',
    id: 'myId',
    fetchable: true,
    fetchLink: 'myLink',
    fetchVersion: 'v3.4.5',
  };

  render(ExtensionDetailsSummaryCard, { extensionDetails });

  expect(screen.queryByText('resources')).not.toBeInTheDocument();
  expect(screen.queryByText('Repository')).not.toBeInTheDocument();
  expect(screen.queryByText('Homepage')).not.toBeInTheDocument();
});

test('Expect the auto-update entry of an installed extension', async () => {
  const extensionDetails: ExtensionDetailsUI = {
    displayName: 'my display name',
    description: 'my description',
    type: 'pd',
    removable: true,
    devMode: false,
    bundled: false,
    state: 'started',
    name: 'foo',
    icon: 'fooIcon',
    readme: { content: '' },
    releaseDate: '2024-01-01',
    categories: [],
    publisherDisplayName: 'my publisher',
    version: 'v1.2.3',
    id: 'myId',
    fetchable: true,
    fetchLink: 'myLink',
    fetchVersion: 'v3.4.5',
    installedExtension: {
      id: 'myId',
      name: 'foo',
      description: 'my description',
      displayName: 'my display name',
      publisher: 'my publisher',
      removable: true,
      devMode: false,
      bundled: false,
      version: 'v1.2.3',
      state: 'started',
      path: '/plugins/foo',
      readme: '',
      type: 'pd',
      autoUpdateDisabled: true,
    },
  };

  render(ExtensionDetailsSummaryCard, { extensionDetails });

  const autoUpdate = screen.getByRole('region', { name: 'Auto-update' });
  expect(autoUpdate).toHaveTextContent('Disabled');
});
