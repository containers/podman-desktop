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

import { render, screen, within } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { EventUI } from '../../events/EventUI';
import EventsTable from './EventsTable.svelte';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('expect the events are displayed reactively', async () => {
  const events: EventUI[] = [
    {
      count: 1,
      type: 'Normal',
      reason: 'FirstReason',
      reportingComponent: 'a-controller',
      message: 'a first message',
      firstTimestamp: new Date(),
      lastTimestamp: new Date(),
    },
    {
      count: 2,
      type: 'Warning',
      reason: 'SecondReason',
      reportingComponent: 'another-controller',
      message: 'a second message',
      firstTimestamp: new Date(),
    },
  ];

  vi.advanceTimersByTime(5_000);
  events[1].lastTimestamp = new Date();

  vi.advanceTimersByTime(20_000);

  const rendered = render(EventsTable, {
    props: {
      events: events,
    },
  });
  const table = await screen.findByRole('table');
  expect(table).toBeDefined();
  let rows = await within(table).findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(3);

  expect(within(rows[1]).getByText('25 seconds')).toBeInTheDocument();
  expect(within(rows[1]).getByText('Normal')).toBeInTheDocument();
  expect(within(rows[1]).getByText('FirstReason')).toBeInTheDocument();
  expect(within(rows[1]).getByText('a-controller')).toBeInTheDocument();
  expect(within(rows[1]).getByText('a first message')).toBeInTheDocument();

  expect(within(rows[2]).getByText('20 seconds (2x over 25 seconds)')).toBeInTheDocument();
  expect(within(rows[2]).getByText('Warning')).toBeInTheDocument();
  expect(within(rows[2]).getByText('SecondReason')).toBeInTheDocument();
  expect(within(rows[2]).getByText('another-controller')).toBeInTheDocument();
  expect(within(rows[2]).getByText('a second message')).toBeInTheDocument();

  // refresh the component
  events.push({
    count: 1,
    type: 'Normal',
    reason: 'ThirdReason',
    reportingComponent: 'a-controller',
    message: 'a third message',
    firstTimestamp: new Date(),
    lastTimestamp: new Date(),
  });
  vi.advanceTimersByTime(10_000);
  await rendered.rerender({ events: events });
  rows = await within(table).findAllByRole('row');
  expect(rows.length).toBe(4);

  expect(within(rows[1]).getByText('35 seconds')).toBeInTheDocument();
  expect(within(rows[2]).getByText('30 seconds (2x over 35 seconds)')).toBeInTheDocument();

  expect(within(rows[3]).getByText('10 seconds')).toBeInTheDocument();
  expect(within(rows[3]).getByText('Normal')).toBeInTheDocument();
  expect(within(rows[3]).getByText('ThirdReason')).toBeInTheDocument();
  expect(within(rows[3]).getByText('a-controller')).toBeInTheDocument();
  expect(within(rows[3]).getByText('a third message')).toBeInTheDocument();
});
