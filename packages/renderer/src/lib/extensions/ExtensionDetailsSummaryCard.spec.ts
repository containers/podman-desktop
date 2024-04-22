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
import { beforeEach, expect, test, vi } from 'vitest';

import type { ExtensionDetailsUI } from './extension-details-ui';
import ExtensionDetailsSummaryCard from './ExtensionDetailsSummaryCard.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect to have text of the card including version, release date, publisher and categories', async () => {
  const extensionDetails: ExtensionDetailsUI = {
    displayName: 'my display name',
    description: 'my description',
    type: 'pd',
    removable: false,
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
