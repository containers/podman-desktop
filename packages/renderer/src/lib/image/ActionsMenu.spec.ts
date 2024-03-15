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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import ActionsMenu from './ActionsMenu.svelte';

test('Expect the dropdownmenu button is displayed if the dropdown variable is true', async () => {
  render(ActionsMenu, {
    dropdownMenu: true,
  });

  const buildButton = screen.getByRole('button', { name: 'kebab menu' });
  expect(buildButton).toBeInTheDocument();
});

test('Expect the dropdownmenu button NOT to be displayed if the dropdown variable is false', async () => {
  render(ActionsMenu, {
    dropdownMenu: false,
  });

  const buildButton = screen.queryByRole('button', { name: 'kebab menu' });
  expect(buildButton).not.toBeInTheDocument();
});
