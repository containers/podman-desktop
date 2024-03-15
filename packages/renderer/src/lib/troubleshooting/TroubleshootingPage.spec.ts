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

import TroubleshootingPage from './TroubleshootingPage.svelte';

const getDevtoolsConsoleLogsMock = vi.fn();
// fake the window object
beforeAll(() => {
  (window as any).getDevtoolsConsoleLogs = getDevtoolsConsoleLogsMock;
});

test('Check Troubleshooting Page', async () => {
  getDevtoolsConsoleLogsMock.mockReturnValue([]);
  render(TroubleshootingPage, {});

  // click on the first tab
  const repairConnectionsLink = screen.getByRole('link', { name: 'Repair & Connections' });
  expect(repairConnectionsLink).toBeInTheDocument();
  await fireEvent.click(repairConnectionsLink);

  // check we have the container connections role
  const containerConnections = screen.getByRole('status', { name: 'container connections' });
  expect(containerConnections).toBeInTheDocument();

  // click on the stores tab
  const storesLink = screen.getByRole('link', { name: 'Stores' });
  expect(storesLink).toBeInTheDocument();
  await fireEvent.click(storesLink);

  // check we have stores displayed
  const stores = screen.getByRole('status', { name: 'stores' });
  expect(stores).toBeInTheDocument();
});
