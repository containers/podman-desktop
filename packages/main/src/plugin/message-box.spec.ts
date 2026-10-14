/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { DropdownType, IconButtonType } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { describe, expect, test, vi } from 'vitest';

import { MessageBox } from './message-box.js';

test('Should return first item if button clicked is the first', async () => {
  const messageBox = new MessageBox({} as ApiSenderType);
  vi.spyOn(messageBox, 'showMessageBox').mockResolvedValue({
    response: 'ok',
  });
  const result = await messageBox.showDialog('info', 'title', 'message', ['ok', 'cancel']);
  expect(result).toBe('ok');
});

test('Should return second item if button clicked is the second', async () => {
  const messageBox = new MessageBox({} as ApiSenderType);
  vi.spyOn(messageBox, 'showMessageBox').mockResolvedValue({
    response: 'cancel',
  });
  const result = await messageBox.showDialog('info', 'title', 'message', ['ok', 'cancel']);
  expect(result).toBe('cancel');
});

test('Should return option one if dropdown clicked is the first', async () => {
  const messageBox = new MessageBox({} as ApiSenderType);
  vi.spyOn(messageBox, 'showMessageBox').mockResolvedValue({
    response: 'dropdown',
    dropdownIndex: 1,
  });

  const dropdown: DropdownType = {
    heading: 'dropdown',
    buttons: ['Monday', 'Tuesday', 'Wednesday'],
    type: 'dropdownButton',
  };

  const result = await messageBox.showDialog('info', 'title', 'message', [dropdown, 'ok']);
  expect(result).toBe('Tuesday');
});

test('Should return option one if dropdown clicked is the second', async () => {
  const messageBox = new MessageBox({} as ApiSenderType);
  vi.spyOn(messageBox, 'showMessageBox').mockResolvedValue({
    response: 'dropdown',
    dropdownIndex: 0,
  });

  const dropdown: DropdownType = {
    heading: 'dropdown',
    buttons: ['Monday', 'Tuesday', 'Wednesday'],
    type: 'dropdownButton',
  };

  const result = await messageBox.showDialog('info', 'title', 'message', ['ok', dropdown]);
  expect(result).toBe('Monday');
});

describe('showMessageBox + onDidSelectButton integration', () => {
  function createMessageBox(): { messageBox: MessageBox; getLastId: () => number } {
    const apiSender = { send: vi.fn() } as unknown as ApiSenderType;
    const messageBox = new MessageBox(apiSender);
    return {
      messageBox,
      getLastId: () => (vi.mocked(apiSender.send).mock.calls.at(-1)?.[1] as Record<string, unknown>)?.['id'] as number,
    };
  }

  test('should resolve with string button label when string button is selected', async () => {
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      buttons: ['OK', 'Cancel'],
      type: 'info',
    });
    await messageBox.onDidSelectButton(getLastId(), 0);
    const result = await promise;
    expect(result.response).toBe('OK');
  });

  test('should resolve with second string button label', async () => {
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      buttons: ['OK', 'Cancel'],
      type: 'info',
    });
    await messageBox.onDidSelectButton(getLastId(), 1);
    const result = await promise;
    expect(result.response).toBe('Cancel');
  });

  test('should resolve with dropdown heading when dropdown button is selected', async () => {
    const dropdown: DropdownType = {
      heading: 'Choose day',
      buttons: ['Mon', 'Tue'],
      type: 'dropdownButton',
    };
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      buttons: ['OK', dropdown],
      type: 'info',
    });
    await messageBox.onDidSelectButton(getLastId(), 1, 0);
    const result = await promise;
    expect(result.response).toBe('Choose day');
    expect(result.dropdownIndex).toBe(0);
  });

  test('should resolve with icon button label when icon button is selected', async () => {
    const iconButton: IconButtonType = {
      label: 'Delete',
      icon: 'trash-icon',
      type: 'iconButton',
    };
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      buttons: [iconButton, 'Cancel'],
      type: 'info',
    });
    await messageBox.onDidSelectButton(getLastId(), 0);
    const result = await promise;
    expect(result.response).toBe('Delete');
  });

  test('should resolve with undefined response when selectedIndex is undefined', async () => {
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      buttons: ['OK'],
      type: 'info',
    });
    await messageBox.onDidSelectButton(getLastId());
    const result = await promise;
    expect(result.response).toBeUndefined();
  });

  test('should resolve with undefined response when selectedIndex is out of bounds', async () => {
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      buttons: ['OK'],
      type: 'info',
    });
    await messageBox.onDidSelectButton(getLastId(), 5);
    const result = await promise;
    expect(result.response).toBeUndefined();
  });

  test('should resolve with undefined response when selectedIndex is negative', async () => {
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      buttons: ['OK'],
      type: 'info',
    });
    await messageBox.onDidSelectButton(getLastId(), -1);
    const result = await promise;
    expect(result.response).toBeUndefined();
  });

  test('should not throw when callback id is unknown', async () => {
    const { messageBox } = createMessageBox();
    await expect(messageBox.onDidSelectButton(9999, 0)).resolves.toBeUndefined();
  });

  test('should remove callback after resolving', async () => {
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      buttons: ['OK'],
      type: 'info',
    });
    const id = getLastId();
    await messageBox.onDidSelectButton(id, 0);
    await promise;
    await expect(messageBox.onDidSelectButton(id, 0)).resolves.toBeUndefined();
  });

  test('should store buttons from options and default to empty array', async () => {
    const { messageBox, getLastId } = createMessageBox();
    const promise = messageBox.showMessageBox({
      title: 'Test',
      message: 'msg',
      type: 'info',
    });
    await messageBox.onDidSelectButton(getLastId(), 0);
    const result = await promise;
    expect(result.response).toBeUndefined();
  });
});

describe('showDialog without mocking showMessageBox', () => {
  test('should return dropdown sub-button when dropdown is selected with dropdownIndex', async () => {
    const apiSender = { send: vi.fn() } as unknown as ApiSenderType;
    const messageBox = new MessageBox(apiSender);

    const dropdown: DropdownType = {
      heading: 'Options',
      buttons: ['Alpha', 'Beta', 'Gamma'],
      type: 'dropdownButton',
    };

    const promise = messageBox.showDialog('info', 'title', 'message', [dropdown, 'cancel']);

    const id = (vi.mocked(apiSender.send).mock.calls[0]?.[1] as Record<string, unknown>)?.['id'] as number;
    await messageBox.onDidSelectButton(id, 0, 1);

    const result = await promise;
    expect(result).toBe('Beta');
  });

  test('should return response string directly when no dropdownIndex', async () => {
    const apiSender = { send: vi.fn() } as unknown as ApiSenderType;
    const messageBox = new MessageBox(apiSender);

    const promise = messageBox.showDialog('info', 'title', 'message', ['ok', 'cancel']);

    const id = (vi.mocked(apiSender.send).mock.calls[0]?.[1] as Record<string, unknown>)?.['id'] as number;
    await messageBox.onDidSelectButton(id, 1);

    const result = await promise;
    expect(result).toBe('cancel');
  });
});
