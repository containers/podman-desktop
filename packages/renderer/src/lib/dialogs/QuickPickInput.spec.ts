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
import { render } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import QuickPickInput from './QuickPickInput.svelte';
import type { QuickPickOptions } from './quickpick-input';

const sendShowQuickPickValuesMock = vi.fn();
const sendShowInputBoxValueMock = vi.fn();
const receiveFunctionMock = vi.fn();

// mock some methods of the window object
beforeAll(() => {
  (window.events as unknown) = {
    receive: receiveFunctionMock,
  };
  (window as any).sendShowQuickPickValues = sendShowQuickPickValuesMock;
  (window as any).sendShowInputBoxValue = sendShowInputBoxValueMock;
});

describe('QuickPickInput', () => {
  test('Expect that esc key is sending an answer', async () => {
    const idRequest = 123;

    const quickPickOptions: QuickPickOptions = {
      items: ['item1', 'item2'],
      canPickMany: false,
      placeHolder: 'placeHolder',
      prompt: '',
      id: idRequest,
      onSelectCallback: false,
    };

    receiveFunctionMock.mockImplementation((message: string, callback: (options: QuickPickOptions) => void) => {
      if (message === 'showQuickPick:add') {
        callback(quickPickOptions);
      }
    });

    render(QuickPickInput, {});
    // now, press the ESC key
    await userEvent.keyboard('{Escape}');

    // check we received the answer for showQuickPick
    expect(sendShowQuickPickValuesMock).toBeCalledWith(idRequest, []);

    // and not for showInputBox
    expect(sendShowInputBoxValueMock).not.toBeCalled();
  });
});
