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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Menu } from 'electron';
import { aboutMenuItem } from 'electron-util/main';
import { beforeEach, expect, test, vi } from 'vitest';

import { ApplicationMenuBuilder } from './application-menu-builder.js';

vi.mock('electron', async () => {
  class MyCustomWindow {
    static readonly singleton = new MyCustomWindow();

    loadURL(): void {}
    setBounds(): void {}

    on(): void {}

    show(): void {}
    focus(): void {}
    isMinimized(): boolean {
      return false;
    }
    isDestroyed(): boolean {
      return false;
    }

    static getAllWindows(): unknown[] {
      return [MyCustomWindow.singleton];
    }
  }

  return {
    BrowserWindow: MyCustomWindow,
    Menu: {
      buildFromTemplate: vi.fn(),
      getApplicationMenu: vi.fn(),
      setApplicationMenu: vi.fn(),
    },
  };
});

vi.mock('electron-util/main', async () => {
  return {
    aboutMenuItem: vi.fn(),
  };
});

let applicationMenuBuilder: ApplicationMenuBuilder;

beforeEach(() => {
  vi.resetAllMocks();
  applicationMenuBuilder = new ApplicationMenuBuilder();
});

test('check about menu is added', () => {
  vi.mocked(Menu.buildFromTemplate).mockImplementation(a => {
    return a as unknown as Menu;
  });

  // set a menu
  vi.mocked(Menu.getApplicationMenu).mockReturnValue({
    items: [
      {
        role: 'help',
        submenu: {
          items: [],
        },
      },
    ],
  } as unknown as Menu);

  // mock aboutMenuItem
  vi.mocked(aboutMenuItem).mockReturnValue({
    label: 'About',
  });

  const menu = applicationMenuBuilder.build();
  expect(menu).toBeDefined();

  const items = menu?.items[0]?.submenu as unknown as any[];
  expect(items).toBeDefined();

  // expect to have the about menu
  expect(items[1]?.label).toBe('About');
});
