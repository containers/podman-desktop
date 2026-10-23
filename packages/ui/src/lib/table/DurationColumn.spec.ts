/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import { beforeEach, expect, test, vi } from 'vitest';

import DurationColumn from './DurationColumn.svelte';

beforeEach(() => {
  vi.useRealTimers();
});

test('Expect the displayed duration to be refreshed', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

  render(DurationColumn, { object: new Date(Date.now() - 59_000) });
  expect(screen.getByText('59 seconds')).toBeInTheDocument();

  await vi.advanceTimersByTimeAsync(2000);

  expect(screen.getByText('1 minute')).toBeInTheDocument();
});

test('updates the duration immediately when the object changes', async () => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

  const { rerender } = render(DurationColumn, { object: new Date(Date.now() - 30 * 60_000) });
  expect(screen.getByText('30 minutes')).toBeInTheDocument();

  vi.setSystemTime(new Date('2026-01-01T00:03:00.000Z'));
  await rerender({ object: new Date(Date.now() - 3_599_900) });

  expect(screen.getByText('1 hour')).toBeInTheDocument();
});

test('Expect simple column styling', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

  // pick a date an hour ago
  const date = new Date(Date.now());
  date.setTime(date.getTime() - 3600000);
  render(DurationColumn, { object: date });

  const text = screen.getByText('1 hour');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-[var(--pd-table-body-text)]');
});

test('Expect an empty duration without a date', () => {
  const { container } = render(DurationColumn, { object: undefined });

  expect(container).toHaveTextContent('');
});
