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
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Donut from '/@/lib/donut/Donut.svelte';

test('Expect the tooltip to be in document', async () => {
  render(Donut, { percent: 5, title: 'CPU', value: undefined });

  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toBe('5% CPU usage');
});

test('Expect the tooltip to display loading', async () => {
  render(Donut, { value: undefined, title: 'potatoes', loading: true });

  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toBe('Loading potatoes...');
});

test('Expect text being displayed when not loading', async () => {
  render(Donut, { value: 'dummy-text', loading: false });

  const text = screen.getByText('dummy-text');
  expect(text).toBeInTheDocument();
});

test('Expect text being displayed when loading', async () => {
  render(Donut, { value: 'dummy-text', loading: true });

  const text = screen.getByText('dummy-text');
  expect(text).toBeInTheDocument();
});
