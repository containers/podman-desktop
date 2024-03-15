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
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { afterEach, expect, test, vi } from 'vitest';

import PreferencesConnectionsEmptyRendering from './PreferencesConnectionsEmptyRendering.svelte';

afterEach(() => {
  vi.clearAllMocks();
});

const LINK_TEXT = 'link-text';
const MESSAGE = `No connections yet [${LINK_TEXT}](link-url)`;

test('Message is not visible when component is hidden ', () => {
  render(PreferencesConnectionsEmptyRendering, { message: MESSAGE, hidden: true });
  const noProvidersText = screen.queryByText(MESSAGE);
  expect(noProvidersText).not.toBeInTheDocument();
});

test('Message is visible when component is not hidden', async () => {
  render(PreferencesConnectionsEmptyRendering, { message: MESSAGE, hidden: false });
  const noProvidersText = screen.getByText(MESSAGE);
  expect(noProvidersText).toBeInTheDocument();
  const link = screen.getByText(LINK_TEXT);
  expect(link).toBeInTheDocument();
});
