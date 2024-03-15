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
import { beforeAll, expect, test, vi } from 'vitest';

import type { EventStoreInfo } from '/@/stores/event-store';

import TroubleshootingPageStore from './TroubleshootingPageStore.svelte';

beforeAll(() => {});

test('Check store info is displayed and clicking on buttons works', async () => {
  const clearEventsMock = vi.fn();
  const fetchMock = vi.fn();

  const eventStoreInfo: EventStoreInfo = {
    name: 'my-test-store',
    size: 3,
    bufferEvents: [],
    clearEvents: clearEventsMock,
    fetch: fetchMock,
  };

  render(TroubleshootingPageStore, { eventStoreInfo });

  // expect to have the Refresh button
  const refreshButton = screen.getByRole('button', { name: 'Refresh' });
  expect(refreshButton).toBeInTheDocument();

  // click on it
  await fireEvent.click(refreshButton);

  // expect to have fetch method called
  expect(fetchMock).toHaveBeenCalled();

  // check we have open details button
  const openDetailsButton = screen.getByRole('button', { name: 'Open Details' });
  expect(openDetailsButton).toBeInTheDocument();

  // click on it
  await fireEvent.click(openDetailsButton);

  // expect to have dialog being displayed when clicking on the button
  const details = screen.getByRole('dialog', { name: 'Details of my-test-store' });

  expect(details).toBeInTheDocument();

  // expect to have the Cancel button
  const cancelButton = screen.getByRole('button', { name: 'Cancel' });
  expect(cancelButton).toBeInTheDocument();

  // click on it
  await fireEvent.click(cancelButton);

  // dialog should be hidden now
  expect(details).not.toBeInTheDocument();
});
