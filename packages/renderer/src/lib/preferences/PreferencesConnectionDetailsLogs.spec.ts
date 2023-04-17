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

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';
import { Terminal } from 'xterm';

const logsTerminal: Terminal = new Terminal();

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

test('Expect that the no logs view is displayed', async () => {
  const existSyncSpy = vi.spyOn(logsTerminal, 'open');
  existSyncSpy.mockImplementation(() => {});
  await render(PreferencesConnectionDetailsLogs, {
    logsTerminal,
    setNoLogs: () => {
      // nothing
    },
    noLog: true,
  });
  const h1Title = screen.getByRole('heading', { name: 'No Log' });
  expect(h1Title).toBeInTheDocument();
});

test('Expect that the terminal is displayed', async () => {
  const existSyncSpy = vi.spyOn(logsTerminal, 'open');
  existSyncSpy.mockImplementation(() => {});
  await render(PreferencesConnectionDetailsLogs, {
    logsTerminal,
    setNoLogs: () => {
      // nothing
    },
    noLog: false,
  });
  const divTerminal = screen.getByLabelText('terminal');
  expect(divTerminal).toBeInTheDocument();
});
