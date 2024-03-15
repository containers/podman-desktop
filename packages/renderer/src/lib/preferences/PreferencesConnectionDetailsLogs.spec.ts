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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';
import { Terminal } from 'xterm';

import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

const containerConnection: ProviderContainerConnectionInfo = {
  name: 'connection',
  endpoint: {
    socketPath: 'socket',
  },
  status: 'started',
  type: 'podman',
};

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).startReceiveLogs = vi.fn();
  Terminal.prototype.open = vi.fn();
});

test('Expect that the no logs view is displayed', async () => {
  render(PreferencesConnectionDetailsLogs, {
    connectionInfo: containerConnection,
    setNoLogs: () => {
      // nothing
    },
    noLog: true,
  });
  const h1Title = screen.getByRole('heading', { name: 'No Log' });
  expect(h1Title).toBeInTheDocument();
});

test('Expect that the terminal is displayed', async () => {
  render(PreferencesConnectionDetailsLogs, {
    connectionInfo: containerConnection,
    setNoLogs: () => {
      // nothing
    },
    noLog: false,
  });
  const divTerminal = screen.getByLabelText('terminal');
  expect(divTerminal).toBeInTheDocument();
});
