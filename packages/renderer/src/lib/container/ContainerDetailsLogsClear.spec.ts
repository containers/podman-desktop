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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { Terminal } from '@xterm/xterm';
import { expect, test, vi } from 'vitest';

import ContainerDetailsLogsClear from './ContainerDetailsLogsClear.svelte';

vi.mock('@xterm/xterm', () => {
  const writeMock = vi.fn();
  return {
    writeMock,
    Terminal: vi
      .fn()
      .mockReturnValue({ loadAddon: vi.fn(), open: vi.fn(), write: writeMock, clear: vi.fn(), dispose: vi.fn() }),
  };
});

test('expect clear button is working', async () => {
  const terminal = new Terminal();

  render(ContainerDetailsLogsClear, { terminal });

  // expect the button to clear
  const clearButton = screen.getByRole('button', { name: 'Clear logs' });
  expect(clearButton).toBeInTheDocument();

  // click the button
  await fireEvent.click(clearButton);

  // check we have called the clear function
  await waitFor(() => expect(terminal.clear).toHaveBeenCalled());
});
