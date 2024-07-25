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

import InstalledExtensionDetailsSummaryCardEntry from './InstalledExtensionDetailsSummaryCardEntry.svelte';

test('Expect to have label and value', async () => {
  render(InstalledExtensionDetailsSummaryCardEntry, { label: 'my-label', value: 'my-value' });

  // grab the label and value elements
  const label = screen.getByText('my-label');
  const value = screen.getByText('my-value');

  // expect the label and value to be in the document
  expect(label).toBeInTheDocument();
  expect(value).toBeInTheDocument();

  // expect classes to be applied
  expect(label).toHaveClass('uppercase text-sm text-[var(--pd-details-card-header)]');
  expect(value).toHaveClass('text-left font-thin text-sm text-[var(--pd-details-card-text)]');
});
