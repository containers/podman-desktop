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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import type { EventStoreInfo } from '/@/stores/event-store';

import TroubleshootingPageStoreDetails from './TroubleshootingPageStoreDetails.svelte';

beforeAll(() => {});

test('Check details are displayed and works', async () => {
  const clearEventsMock = vi.fn();
  const fetchMock = vi.fn();
  const closeCallback = vi.fn();

  const bufferEvent = {
    name: 'my-test-event',
    args: [],
    length: 5,
    date: new Date().getTime(),
    skipped: false,
  };

  const eventStoreInfo: EventStoreInfo = {
    name: 'my-test-store',
    size: 3,
    bufferEvents: [bufferEvent],
    clearEvents: clearEventsMock,
    fetch: fetchMock,
  };

  render(TroubleshootingPageStoreDetails, { eventStoreInfo, closeCallback });

  // find the label with name size
  const sizeStatus = screen.getByRole('status', { name: 'size' });
  expect(sizeStatus).toBeInTheDocument();
  // value should be 3
  expect(sizeStatus).toHaveTextContent('3');

  // and check we have buffer events
  const bufferEvents = screen.getByRole('list', { name: 'buffer-events' });
  expect(bufferEvents).toBeInTheDocument();

  // expect to have li item in the list
  const bufferEvent1 = screen.getByRole('listitem', { name: 'my-test-event' });
  expect(bufferEvent1).toBeInTheDocument();
  // now check the text content
  expect(bufferEvent1).toHaveTextContent(`Grab ${bufferEvent.length} items from '${bufferEvent.name}' event`);
});

test('Check close button', async () => {
  const clearEventsMock = vi.fn();
  const fetchMock = vi.fn();
  const closeCallback = vi.fn();

  const eventStoreInfo: EventStoreInfo = {
    name: 'my-test-store',
    size: 3,
    bufferEvents: [],
    clearEvents: clearEventsMock,
    fetch: fetchMock,
  };

  render(TroubleshootingPageStoreDetails, { eventStoreInfo, closeCallback });

  // expect to have the close button
  const closeButton = screen.getByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();

  // click on close button and expect close callback to be called
  expect(closeCallback).not.toBeCalled();
  await fireEvent.click(closeButton);
  expect(closeCallback).toBeCalled();
});

test('Check Cancel button', async () => {
  const clearEventsMock = vi.fn();
  const fetchMock = vi.fn();
  const closeCallback = vi.fn();

  const eventStoreInfo: EventStoreInfo = {
    name: 'my-test-store',
    size: 3,
    bufferEvents: [],
    clearEvents: clearEventsMock,
    fetch: fetchMock,
  };

  render(TroubleshootingPageStoreDetails, { eventStoreInfo, closeCallback });

  // expect to have the close button
  const cancelButton = screen.getByRole('button', { name: 'Cancel' });
  expect(cancelButton).toBeInTheDocument();

  // click on Cancel button and expect close callback to be called
  expect(closeCallback).not.toBeCalled();
  await fireEvent.click(cancelButton);
  expect(closeCallback).toBeCalled();
});

test('Check ESC key', async () => {
  const clearEventsMock = vi.fn();
  const fetchMock = vi.fn();
  const closeCallback = vi.fn();

  const eventStoreInfo: EventStoreInfo = {
    name: 'my-test-store',
    size: 3,
    bufferEvents: [],
    clearEvents: clearEventsMock,
    fetch: fetchMock,
  };

  render(TroubleshootingPageStoreDetails, { eventStoreInfo, closeCallback });

  // click on Cancel button and expect close callback to be called
  expect(closeCallback).not.toBeCalled();
  // now, press the ESC key
  await userEvent.keyboard('{Escape}');
  expect(closeCallback).toBeCalled();
});
