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
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import ExtensionDetailsLink from './ExtensionDetailsLink.svelte';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect to have link with displayIcon', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'myId',
    name: 'foo',
    description: 'my description',
    displayName: 'This is the display name',
    publisher: '',
    removable: false,
    version: 'v1.2.3',
    state: 'started',
    path: '',
    readme: '',
    icon: 'iconOfMyExtension.png',
  };

  render(ExtensionDetailsLink, { extension });

  const detailsButton = screen.getByRole('button', { name: 'foo extension details' });
  expect(detailsButton).toBeInTheDocument();

  // check text of the button
  expect(detailsButton).toHaveTextContent('This is the display name');

  // click the button
  await fireEvent.click(detailsButton);

  // expect the router to be called
  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/extensions/details/myId/');
});

test('Expect to have link with spaces', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'my Id with spaces',
    name: 'foo',
    description: 'my description',
    displayName: 'This is the display name',
    publisher: '',
    removable: false,
    version: 'v1.2.3',
    state: 'started',
    path: '',
    readme: '',
    icon: 'iconOfMyExtension.png',
  };

  render(ExtensionDetailsLink, { extension });

  const detailsButton = screen.getByRole('button', { name: 'foo extension details' });
  expect(detailsButton).toBeInTheDocument();

  // click the button
  await fireEvent.click(detailsButton);

  // expect the router to be called
  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/extensions/details/my%20Id%20with%20spaces/');
});
