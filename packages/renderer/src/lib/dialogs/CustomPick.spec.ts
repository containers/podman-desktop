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
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import CustomPick from './CustomPick.svelte';
import type { CustomPickOptions } from './quickpick-input';

const sendCustomPickItemsOnConfirmation = vi.fn();
const closeCustomPick = vi.fn();
const receiveFunctionMock = vi.fn();

// mock some methods of the window object
beforeAll(() => {
  (window.events as unknown) = {
    receive: receiveFunctionMock,
  };
  (window as any).sendCustomPickItemsOnConfirmation = sendCustomPickItemsOnConfirmation;
  (window as any).closeCustomPick = closeCustomPick;
});

describe('CustomPick', () => {
  test('Expect that title is displayed', async () => {
    const customPickOptions: CustomPickOptions = {
      id: 1,
      title: 'My custom title',
      description: undefined,
      icon: '',
      items: [
        {
          title: 'item 1',
          markDownContent: 'content 1',
        },
        {
          title: 'item 2',
          markDownContent: 'content 2',
        },
      ],
      canSelectMany: false,
      hideItemSections: false,
    };

    receiveFunctionMock.mockImplementation((message: string, callback: (options: CustomPickOptions) => void) => {
      if (message === 'showCustomPick:add') {
        callback(customPickOptions);
      }
    });

    render(CustomPick, {});

    const title = screen.getByRole('heading', { name: 'My custom title' });
    expect(title).toBeInTheDocument();
  });

  test('Expect that item is displayed', async () => {
    const customPickOptions: CustomPickOptions = {
      id: 1,
      title: 'My custom title',
      description: undefined,
      icon: '',
      items: [
        {
          title: 'item 1',
          markDownContent: 'content 1',
        },
        {
          title: 'item 2',
          markDownContent: 'content 2',
        },
      ],
      canSelectMany: false,
      hideItemSections: false,
    };

    receiveFunctionMock.mockImplementation((message: string, callback: (options: CustomPickOptions) => void) => {
      if (message === 'showCustomPick:add') {
        callback(customPickOptions);
      }
    });

    render(CustomPick, {});

    const item1 = await screen.findByText('item 1');
    expect(item1).toBeInTheDocument();
    const item2 = await screen.findByText('item 2');
    expect(item2).toBeInTheDocument();
  });

  test('Expect that by clicking the cancel button it calls the close command', async () => {
    const customPickOptions: CustomPickOptions = {
      id: 1,
      title: 'My custom title',
      description: undefined,
      icon: '',
      items: [
        {
          title: 'item 1',
          markDownContent: 'content 1',
        },
        {
          title: 'item 2',
          markDownContent: 'content 2',
        },
      ],
      canSelectMany: false,
      hideItemSections: false,
    };

    receiveFunctionMock.mockImplementation((message: string, callback: (options: CustomPickOptions) => void) => {
      if (message === 'showCustomPick:add') {
        callback(customPickOptions);
      }
    });

    render(CustomPick, {});

    const button = screen.getByRole('button', { name: 'Cancel' });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);

    expect(closeCustomPick).toHaveBeenCalled();
  });

  test('Expect that by clicking the next button it calls the senditemms and close command', async () => {
    const customPickOptions: CustomPickOptions = {
      id: 1,
      title: 'My custom title',
      description: undefined,
      icon: '',
      items: [
        {
          title: 'item 1',
          markDownContent: 'content 1',
          selected: true,
        },
        {
          title: 'item 2',
          markDownContent: 'content 2',
        },
      ],
      canSelectMany: false,
      hideItemSections: false,
    };

    receiveFunctionMock.mockImplementation((message: string, callback: (options: CustomPickOptions) => void) => {
      if (message === 'showCustomPick:add') {
        callback(customPickOptions);
      }
    });

    render(CustomPick, {});

    const button = screen.getByRole('button', { name: 'Next' });
    expect(button).toBeInTheDocument();

    await userEvent.click(button);
    expect(sendCustomPickItemsOnConfirmation).toHaveBeenCalled();
    expect(closeCustomPick).toHaveBeenCalled();
  });
});
