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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import type { ExtensionInfo } from '../../../../main/src/plugin/api/extension-info';
import ExtensionIcon from './ExtensionIcon.svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

test('Expect started icon', async () => {
  const extension: ExtensionInfo = {
    id: '',
    name: 'my-extension',
    description: '',
    displayName: '',
    publisher: '',
    removable: false,
    version: '',
    state: 'started',
    readme: '',
    path: '',
    icon: 'my-icon',
  };
  render(ExtensionIcon, { extension: extension });
  const icon = screen.getByRole('img');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('src', extension.icon);
  expect(icon).not.toHaveClass('brightness-50');
});

test('Expect faded icon for other states', async () => {
  const extension: ExtensionInfo = {
    id: '',
    name: 'my-extension',
    description: '',
    displayName: '',
    publisher: '',
    removable: false,
    version: '',
    readme: '',
    state: 'stopped',
    path: '',
    icon: 'my-icon',
  };
  render(ExtensionIcon, { extension: extension });
  const icon = screen.getByRole('img');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('src', extension.icon);
  expect(icon).toHaveClass('brightness-50');
});

test('Expect puzzle for missing icon', async () => {
  const extension: ExtensionInfo = {
    id: '',
    name: 'my-extension',
    description: '',
    displayName: '',
    publisher: '',
    removable: false,
    version: '',
    readme: '',
    state: 'started',
    path: '',
    // no icon
  };
  render(ExtensionIcon, { extension: extension });
  const icon = screen.getByRole('img', { hidden: true });
  expect(icon).toBeInTheDocument();
  expect(icon).not.toHaveAttribute('src', extension.icon);
  expect(icon).toHaveClass('text-violet-600');
});
