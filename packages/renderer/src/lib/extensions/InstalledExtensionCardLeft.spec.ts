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

import { render } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import InstalledExtensionCardLeft from './InstalledExtensionCardLeft.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn() });
  Object.defineProperty(window, 'ddExtensionDelete', { value: vi.fn() });
  Object.defineProperty(window, 'removeExtension', { value: vi.fn() });
});

test('Expect to see icon, link, badge and actions', async () => {
  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: '',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: false,
    devMode: false,
    bundled: true,
    version: 'v1.2.3',
    state: 'started',
    path: '',
    readme: '',
    icon: 'iconOfMyExtension.png',
  };
  const { findByRole, findByText } = render(InstalledExtensionCardLeft, { extension });

  // get actions be there
  const actions = await findByRole('group', { name: 'Extension Actions' });
  expect(actions).toBeInTheDocument();

  // check status
  const statusLabel = await findByText('Installed');
  expect(statusLabel).toBeInTheDocument();

  // get role Extension Badge
  const badge = await findByRole('region', { name: 'Extension Badge' });
  expect(badge).toBeInTheDocument();
  expect(badge).toHaveTextContent('Bundled extension');

  // check icon
  const icon = await findByRole('img');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('src', 'iconOfMyExtension.png');

  // and the link
  const detailsButton = await findByRole('button', { name: 'foo extension details' });
  expect(detailsButton).toBeInTheDocument();
});
