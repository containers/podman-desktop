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

import { render, screen } from '@testing-library/svelte';
import * as xterm from '@xterm/xterm';
import { beforeAll, expect, test, vi } from 'vitest';

import ContainerDetailsLogs from './ContainerDetailsLogs.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

vi.mock('@xterm/xterm', () => {
  const writeMock = vi.fn();
  return {
    writeMock,
    Terminal: vi.fn().mockReturnValue({
      loadAddon: vi.fn(),
      open: vi.fn().mockImplementation((div: HTMLDivElement) => {
        // create a dummy div element
        const h = document.createElement('H1');
        const t = document.createTextNode('dummy element');
        h.appendChild(t);
        div.appendChild(h);
      }),
      write: writeMock,
      clear: vi.fn(),
      dispose: vi.fn(),
    }),
  };
});

beforeAll(() => {
  // Mock returned values with fake ones
  const mockComputedStyle = {
    getPropertyValue: vi.fn().mockReturnValue('#ffffff'),
  };
  Object.defineProperty(global, 'window', {
    value: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      logsContainer: vi.fn(),
      getConfigurationValue: vi.fn(),
      getComputedStyle: vi.fn().mockReturnValue(mockComputedStyle),
      dispatchEvent: vi.fn(),
    },
    writable: true,
  });
});

const container: ContainerInfoUI = {
  id: 'foo',
} as unknown as ContainerInfoUI;

test('Render container logs ', async () => {
  // grab the xterm mock
  let writeMock: unknown | undefined;
  if ('writeMock' in xterm) {
    writeMock = xterm.writeMock;
  }

  // Mock compose has no containers, so expect No Log to appear
  render(ContainerDetailsLogs, { container });

  // expect a call to logsContainer
  await vi.waitFor(() => {
    expect(window.logsContainer).toHaveBeenCalled();
  });
  // now, get the callback of the method
  const params = vi.mocked(window.logsContainer).mock.calls[0][0];
  // call the callback with an empty array
  params.callback('data', 'hello world');

  // expect logs to have been called
  await vi.waitFor(() => {
    expect(vi.mocked(writeMock)).toHaveBeenCalled();
  });

  // expect the button to clear
  const clearButton = screen.getByRole('button', { name: 'Clear logs' });
  expect(clearButton).toBeInTheDocument();
});
