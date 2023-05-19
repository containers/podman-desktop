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

import '@testing-library/jest-dom';
import { beforeAll, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import MessageBox from './MessageBox.svelte';
import type { MessageBoxOptions } from './messagebox-input';

const sendShowMessageBoxValuesMock = vi.fn();
const receiveFunctionMock = vi.fn();

// mock some methods of the window object
beforeAll(() => {
  (window.events as unknown) = {
    receive: receiveFunctionMock,
  };
  (window as any).sendShowMessageBoxValues = sendShowMessageBoxValuesMock;
});

describe('MessageBox', () => {
  test('Expect that title, message, and buttons are displayed', async () => {
    const idRequest = 123;

    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'My custom title',
      message: 'My message',
      detail: 'A more detailed message',
      buttons: ['OK', 'Not OK'],
    };

    receiveFunctionMock.mockImplementation((message: string, callback: (options: MessageBoxOptions) => void) => {
      if (message === 'showMessageBox:open') {
        callback(messageBoxOptions);
      }
    });

    render(MessageBox, {});

    const title = await screen.findByText(messageBoxOptions.title);
    expect(title).toBeInTheDocument();
    const message = await screen.findByText(messageBoxOptions.message);
    expect(message).toBeInTheDocument();
    const detail = await screen.findByText(messageBoxOptions.detail);
    expect(detail).toBeInTheDocument();
    const button1 = await screen.findByText(messageBoxOptions.buttons[0]);
    expect(button1).toBeInTheDocument();
    const button2 = await screen.findByText(messageBoxOptions.buttons[1]);
    expect(button2).toBeInTheDocument();
  });

  test('Expect that default OK button is displayed', async () => {
    const idRequest = 234;

    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'My custom title',
      message: 'My message',
    };

    receiveFunctionMock.mockImplementation((message: string, callback: (options: MessageBoxOptions) => void) => {
      if (message === 'showMessageBox:open') {
        callback(messageBoxOptions);
      }
    });

    render(MessageBox, {});

    const ok = await screen.findByText('OK');
    expect(ok).toBeInTheDocument();
  });
});
