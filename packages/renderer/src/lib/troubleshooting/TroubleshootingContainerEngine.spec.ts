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

import { render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import TroubleshootingContainerEngine from './TroubleshootingContainerEngine.svelte';

const listContainersFromEngineMock = vi.fn();

// fake the window object
beforeAll(() => {
  (window as any).listContainersFromEngine = listContainersFromEngineMock;
});

test('Check containers button is available and click on it', async () => {
  const socketPath = '/foo/socket.path';
  const name = 'fooEngine';
  const status = 'Running';
  const containerEngineRunning = {
    name,
    status,
    endpoint: {
      socketPath,
    },
  } as unknown as ProviderContainerConnectionInfo;
  render(TroubleshootingContainerEngine, { containerEngineRunning });

  // expect to have the name label
  const nameHeading = screen.getByRole('heading', { name: 'name' });
  expect(nameHeading).toBeInTheDocument();
  expect(nameHeading).toHaveTextContent(name);

  // expect to have the status label
  const statusHeading = screen.getByRole('heading', { name: 'status' });
  expect(statusHeading).toBeInTheDocument();
  expect(statusHeading).toHaveTextContent(status);

  // expect to have the socket path label
  const socketPathHeading = screen.getByRole('heading', { name: 'socket path' });
  expect(socketPathHeading).toBeInTheDocument();
  expect(socketPathHeading).toHaveTextContent(socketPath);
});
