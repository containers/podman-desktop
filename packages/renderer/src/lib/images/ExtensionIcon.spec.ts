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
import { expect, test } from 'vitest';

import ExtensionIcon from './ExtensionIcon.svelte';

test('Expect default size', async () => {
  render(ExtensionIcon);
  const extensionIcon = screen.getByRole('img', { hidden: true, name: '' });
  expect(extensionIcon).toBeInTheDocument();
  const defaultValue = '40';

  // check the width icon is set to default
  expect(extensionIcon).toHaveAttribute('width', defaultValue);

  // check the height icon is set to default
  expect(extensionIcon).toHaveAttribute('height', defaultValue);
});

test('Expect specified size', async () => {
  const size = '20';
  render(ExtensionIcon, {
    size,
  });
  const extensionIcon = screen.getByRole('img', { hidden: true, name: '' });
  expect(extensionIcon).toBeInTheDocument();

  // check the width icon is set to 20
  expect(extensionIcon).toHaveAttribute('width', '20');

  // check the height icon is set to 20
  expect(extensionIcon).toHaveAttribute('height', '20');
});
