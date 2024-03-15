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

import DesktopIcon from './DesktopIcon.svelte';

test('Expect default size', async () => {
  render(DesktopIcon);
  const loadingIcon = screen.getByRole('img', { hidden: true, name: '' });
  expect(loadingIcon).toBeInTheDocument();
  const defaultValue = '104';

  // check the width icon is set to default
  expect(loadingIcon).toHaveAttribute('width', defaultValue);

  // check the height icon is set to default
  expect(loadingIcon).toHaveAttribute('height', defaultValue);
});

test('Expect specified size', async () => {
  const size = '20';
  render(DesktopIcon, {
    size,
  });
  const loadingIcon = screen.getByRole('img', { hidden: true, name: '' });
  expect(loadingIcon).toBeInTheDocument();

  // check the width icon is set to 20
  expect(loadingIcon).toHaveAttribute('width', '20');

  // check the height icon is set to 20
  expect(loadingIcon).toHaveAttribute('height', '20');
});
