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

import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import { render, screen, waitFor } from '@testing-library/svelte';
import { Terminal } from '@xterm/xterm';
import type { Mock } from 'vitest';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';

const containerConnection: ProviderContainerConnectionInfo = {
  connectionType: 'container',
  name: 'connection',
  displayName: 'connection',
  endpoint: {
    socketPath: 'socket',
  },
  status: 'started',
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
  type: 'podman',
};

beforeAll(async () => {
  vi.mocked(window.getConfigurationValue).mockImplementation(async (key: string) => {
    if (key === 'terminal.integrated.scrollback') {
      return 1000;
    }
    return undefined;
  });

  Terminal.prototype.open = vi.fn();
  Terminal.prototype.write = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
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

test('connectionInfo passed to startReceiveLogs survives structuredClone (IPC guard)', async () => {
  render(PreferencesConnectionDetailsLogs, {
    providerInternalId: 'abc123',
    connectionInfo: containerConnection,
    setNoLogs: () => {},
    noLog: false,
  });

  await waitFor(() => expect(window.startReceiveLogs).toHaveBeenCalledTimes(1));

  const passedConnectionInfo = (window.startReceiveLogs as Mock).mock.calls[0][4];
  expect(() => structuredClone(passedConnectionInfo)).not.toThrow();
});

test('Should call startReceiveLogs with empty colour codes', async () => {
  render(PreferencesConnectionDetailsLogs, {
    providerInternalId: 'abc123',
    connectionInfo: containerConnection,
    setNoLogs: () => {
      // nothing
    },
    noLog: false,
  });

  await waitFor(() => expect(window.startReceiveLogs).toHaveBeenCalledTimes(1));

  const args = (window.startReceiveLogs as Mock).mock.calls[0];
  const [id, cb1, cb2, cb3] = args;
  expect(id).toBe('abc123');
  [cb1, cb2, cb3].forEach(cb => expect(typeof cb).toBe('function'));

  cb1(['first']);
  cb2(['second']);
  cb3(['third']);

  expect(Terminal.prototype.write).toHaveBeenCalledTimes(4);

  //disable cursor
  expect((Terminal.prototype.write as Mock).mock.calls[0][0]).toBe('\x1b[?25l');

  //expected calls
  expect((Terminal.prototype.write as Mock).mock.calls[1][0]).toBe('first\r');
  expect((Terminal.prototype.write as Mock).mock.calls[2][0]).toBe('second\r');
  expect((Terminal.prototype.write as Mock).mock.calls[3][0]).toBe('third\r');
});
