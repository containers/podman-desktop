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
import { expect, test } from 'vitest';

import StatusDot from './StatusDot.svelte';

const renderStatusDot = (containerStatus: string) => {
  return render(StatusDot, { name: 'foobar', status: containerStatus });
};

test('Expect the dot to have the correct color for running status', () => {
  renderStatusDot('running');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-[var(--pd-status-running)]');
});

test('Expect the dot to have the correct color for terminated status', () => {
  renderStatusDot('terminated');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-[var(--pd-status-terminated)]');
});

test('Expect the dot to have the correct color for waiting status', () => {
  renderStatusDot('waiting');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-[var(--pd-status-waiting)]');
});

test('Expect the dot to have the correct color for stopped status', () => {
  renderStatusDot('stopped');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('outline-[var(--pd-status-stopped)]');
});

test('Expect the dot to have the correct color for paused status', () => {
  renderStatusDot('paused');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-[var(--pd-status-paused)]');
});

test('Expect the dot to have the correct color for exited status', () => {
  renderStatusDot('exited');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('outline-[var(--pd-status-exited)]');
});

test('Expect the dot to have the correct color for dead status', () => {
  renderStatusDot('dead');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-[var(--pd-status-dead)]');
});

test('Expect the dot to have the correct color for created status', () => {
  renderStatusDot('created');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('outline-[var(--pd-status-created)]');
});

test('Expect the dot to have the correct color for degraded status', () => {
  renderStatusDot('degraded');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-[var(--pd-status-degraded)]');
});

test('Expect the dot to have the correct color for unknown status', () => {
  renderStatusDot('unknown');
  const dot = screen.getByTestId('status-dot');
  expect(dot).toHaveClass('bg-[var(--pd-status-unknown)]');
});
