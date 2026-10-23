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
import { afterEach, expect, test, vi } from 'vitest';

import ConnectionStatus from './ConnectionStatus.svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

const connectionStatusLabel = 'Connection Status Label';
const connectionStatusIcon = 'Connection Status Icon';

afterEach(() => {
  vi.useRealTimers();
});

test('Expect green text and icon when connection is running', async () => {
  render(ConnectionStatus, { status: 'started' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-running)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-running)]');
  expect(label).toHaveTextContent('RUNNING');
});

test('Expect green text and icon when connection is starting', async () => {
  render(ConnectionStatus, { status: 'starting' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-starting)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-starting)]');
  expect(label).toHaveTextContent('STARTING');
});

test('Expect green text and icon when connection is stopped', async () => {
  render(ConnectionStatus, { status: 'stopped' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-stopped)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-stopped)]');
  expect(label).toHaveTextContent('OFF');
});

test('Expect green text and icon when connection is stopping', async () => {
  render(ConnectionStatus, { status: 'stopping' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-terminated)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-terminated)]');
  expect(label).toHaveTextContent('STOPPING');
});

test('Expect green text and icon when connection is unknown', async () => {
  render(ConnectionStatus, { status: 'unknown' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-unknown)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-unknown)]');
  expect(label).toHaveTextContent('UNKNOWN');
});

test('Expect duration displayed when connection is started and started timestamp is passed', async () => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  render(ConnectionStatus, { status: 'started', started: fiveMinutesAgo });
  const duration = screen.getByLabelText('Connection Duration');
  expect(duration).toBeInTheDocument();
  expect(duration).toHaveTextContent('5 minutes');
});

test('Expect no duration displayed when connection is stopped even if started timestamp is passed', async () => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  render(ConnectionStatus, { status: 'stopped', started: fiveMinutesAgo });
  const duration = screen.queryByLabelText('Connection Duration');
  expect(duration).not.toBeInTheDocument();
});

test('does not display a duration for an invalid started timestamp', () => {
  render(ConnectionStatus, { status: 'started', started: Number.POSITIVE_INFINITY });

  expect(screen.queryByLabelText('Connection Duration')).not.toBeInTheDocument();
});

test('retries the duration when the started timestamp is in the future', async () => {
  vi.useFakeTimers();
  const now = new Date('2025-01-01T00:00:00.000Z');
  vi.setSystemTime(now);

  render(ConnectionStatus, { status: 'started', started: now.getTime() + 1000 });
  expect(screen.queryByLabelText('Connection Duration')).not.toBeInTheDocument();

  await vi.advanceTimersByTimeAsync(1000);

  expect(screen.getByLabelText('Connection Duration').textContent).not.toBe('');
});

test('refreshes the rounded duration at the next displayed-unit boundary', async () => {
  vi.useFakeTimers();
  const now = new Date('2025-01-01T00:00:00.000Z');
  vi.setSystemTime(now);

  render(ConnectionStatus, { status: 'started', started: now.getTime() - 90_000 });
  expect(screen.getByLabelText('Connection Duration')).toHaveTextContent('1 minute');

  await vi.advanceTimersByTimeAsync(30_000);

  expect(screen.getByLabelText('Connection Duration')).toHaveTextContent('2 minutes');
});
