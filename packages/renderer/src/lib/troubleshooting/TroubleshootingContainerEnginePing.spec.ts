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

import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import TroubleshootingContainerEnginePing from './TroubleshootingContainerEnginePing.svelte';

const pingContainerEngineMock = vi.fn();

// fake the window object
beforeAll(() => {
  (window as any).pingContainerEngine = pingContainerEngineMock;
});

test('Check ping button is available and click on it', async () => {
  pingContainerEngineMock.mockReturnValue('OK');

  const providerContainerEngine = {} as unknown as ProviderContainerConnectionInfo;
  render(TroubleshootingContainerEnginePing, { providerContainerEngine });

  // expect to have the ping button
  const pingButton = screen.getByRole('button', { name: 'Ping' });
  expect(pingButton).toBeInTheDocument();
  // click on the ping button
  expect(pingButton).toBeEnabled();
  await fireEvent.click(pingButton);

  // check that we have the ping result
  const pingResult = screen.getByRole('status', { name: '' });
  expect(pingResult).toBeInTheDocument();
  expect(pingResult).toHaveTextContent('Responded: OK');

  // and no error
  const errorMesssage = screen.queryByRole('alert', { name: 'Error Message Content' });
  expect(errorMesssage).not.toBeInTheDocument();
});

test('Check ping button is available and get error', async () => {
  pingContainerEngineMock.mockImplementation(() => {
    throw new Error('Unable to ping container engine');
  });

  const providerContainerEngine = {} as unknown as ProviderContainerConnectionInfo;
  render(TroubleshootingContainerEnginePing, { providerContainerEngine });

  // expect to have the ping button
  const pingButton = screen.getByRole('button', { name: 'Ping' });
  expect(pingButton).toBeInTheDocument();
  // click on the ping button
  expect(pingButton).toBeEnabled();
  await fireEvent.click(pingButton);

  // check that we have the ping result
  const pingResult = screen.getByRole('status', { name: '' });
  expect(pingResult).toBeInTheDocument();
  expect(pingResult).toHaveTextContent('Failed');

  // and no error
  const errorMesssage = screen.getByRole('alert', { name: 'Error Message Content' });
  expect(errorMesssage).toBeInTheDocument();
  expect(errorMesssage).toHaveTextContent('Unable to ping container engine');
});
