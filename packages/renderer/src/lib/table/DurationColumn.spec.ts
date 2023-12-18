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
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import SimpleDurationColumn from './DurationColumn.svelte';

test('Expect simple column styling', async () => {
  const obj = new Date();
  render(SimpleDurationColumn, { object: obj });

  const text = screen.getByText('');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-sm');
  expect(text).toHaveClass('text-gray-700');
});

test('Expect 2s refresh on values less than a minute', async () => {
  const { component } = render(SimpleDurationColumn);
  expect(component.computeInterval(500)).toEqual(2000);
});

test('Expect 2s refresh on values less than a minute (2)', async () => {
  const { component } = render(SimpleDurationColumn);
  expect(component.computeInterval(53400)).toEqual(2000);
});

test('Expect to refresh 59.9s on next minute', async () => {
  const { component } = render(SimpleDurationColumn);
  // 59.999s = should refresh in 1ms
  expect(component.computeInterval(59999)).toEqual(1);
});

test('Expect to refresh 60s on next minute', async () => {
  const { component } = render(SimpleDurationColumn);
  // 60s = 1m - should refresh in 1m
  expect(component.computeInterval(60000)).toEqual(60000);
});

test('Expect to refresh 61s on next minute', async () => {
  const { component } = render(SimpleDurationColumn);
  // 61s = 1m1s - should refresh in 59s
  expect(component.computeInterval(61000)).toEqual(59000);
});

test('Expect to refresh 89s on next minute', async () => {
  const { component } = render(SimpleDurationColumn);
  // 89s = 1m19s - should refresh in 31s (at 2m)
  expect(component.computeInterval(89000)).toEqual(31000);
});

test('Expect to refresh 1h on next hour', async () => {
  const { component } = render(SimpleDurationColumn);
  // 362s = 1h2s - should refresh in 58m (at 2h)
  expect(component.computeInterval(3600000)).toEqual(60 * 60000);
});

test('Expect to refresh 3h25m on next hour', async () => {
  const { component } = render(SimpleDurationColumn);
  // 3h25m - should refresh in 35m (at 4h)
  expect(component.computeInterval(12300000)).toEqual(2100000);
});

test('Expect to refresh 1d on next day', async () => {
  const { component } = render(SimpleDurationColumn);
  expect(component.computeInterval(86400000)).toEqual(86400000);
});

test('Expect to refresh 1d1m on next day', async () => {
  const { component } = render(SimpleDurationColumn);
  expect(component.computeInterval(86460000)).toEqual(86340000);
});
