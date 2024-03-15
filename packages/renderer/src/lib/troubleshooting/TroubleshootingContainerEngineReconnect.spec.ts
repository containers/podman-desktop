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

import TroubleshootingContainerEngineReconnect from './TroubleshootingContainerEngineReconnect.svelte';

const reconnectContainerProvidersMock = vi.fn();

// fake the window object
beforeAll(() => {
  (window as any).reconnectContainerProviders = reconnectContainerProvidersMock;
});

test('Check reconnect button is available and click on it', async () => {
  render(TroubleshootingContainerEngineReconnect, {});

  // expect to have the ping button
  const reconnectButton = screen.getByRole('button', { name: 'Reconnect providers' });
  expect(reconnectButton).toBeInTheDocument();
  // click on the ping button
  expect(reconnectButton).toBeEnabled();
  await fireEvent.click(reconnectButton);

  // check that we have the ping result
  const reconnectResult = screen.getByRole('status', { name: '' });
  expect(reconnectResult).toBeInTheDocument();
  expect(reconnectResult).toHaveTextContent('Done');

  // and no error
  const errorMesssage = screen.queryByRole('alert', { name: 'Error Message Content' });
  expect(errorMesssage).not.toBeInTheDocument();
});

test('Check reconnect button is available and get error', async () => {
  reconnectContainerProvidersMock.mockImplementation(() => {
    throw new Error('Unable to ping container engine');
  });
  render(TroubleshootingContainerEngineReconnect);

  // expect to have the ping button
  const reconnectButton = screen.getByRole('button', { name: 'Reconnect providers' });
  expect(reconnectButton).toBeInTheDocument();
  // click on the ping button
  expect(reconnectButton).toBeEnabled();
  await fireEvent.click(reconnectButton);

  // check that we have the reconnect result
  const reconnectResult = screen.getByRole('status', { name: '' });
  expect(reconnectResult).toBeInTheDocument();
  expect(reconnectResult).toHaveTextContent('Done');

  // and no error
  const errorMesssage = screen.getByRole('alert', { name: 'Error Message Content' });
  expect(errorMesssage).toBeInTheDocument();
  expect(errorMesssage).toHaveTextContent('Unable to ping container engine');
});
