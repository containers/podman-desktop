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
import type { ZoomLevelHandler } from './plugin/zoom-level-handler.js';

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

const zoomLevelHandlerMock = {} as unknown as ZoomLevelHandler;

let applicationMenuBuilder: ApplicationMenuBuilder;

beforeEach(() => {
  vi.resetAllMocks();
  applicationMenuBuilder = new ApplicationMenuBuilder(zoomLevelHandlerMock);
});

test('check about menu is added', () => {
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
  vi.mocked(Menu.buildFromTemplate).mockReturnValue({} as unknown as Menu);
  const menu = applicationMenuBuilder.build();
  expect(menu).toBeDefined();
  expect(vi.mocked(Menu.buildFromTemplate)).toHaveBeenCalledWith(expect.arrayContaining([{ label: 'About' }]));
});

test('check zoom menu are added', () => {
  // set a menu
  vi.mocked(Menu.getApplicationMenu).mockReturnValue({
    items: [
      {
        role: 'viewmenu',
        submenu: {
          items: [
            {
              label: 'Zoom In',
            },
            {
              label: 'Zoom Out',
            },
            {
              label: 'Actual Size',
            },
          ],
        },
      },
    ],
  } as unknown as Menu);

  // mock aboutMenuItem
  vi.mocked(aboutMenuItem).mockReturnValue({
    label: 'About',
  });
  vi.mocked(Menu.buildFromTemplate).mockReturnValue({ items: [] } as unknown as Menu);
  const menu = applicationMenuBuilder.build();
  expect(menu).toBeDefined();

  // check alt menus
  expect(vi.mocked(Menu.buildFromTemplate)).toHaveBeenCalledWith(
    expect.arrayContaining([
      { label: 'Zoom In alt', visible: false, accelerator: 'CommandOrControl+numadd', click: expect.any(Function) },
    ]),
  );
  expect(vi.mocked(Menu.buildFromTemplate)).toHaveBeenCalledWith(
    expect.arrayContaining([
      { label: 'Zoom Out alt', visible: false, accelerator: 'CommandOrControl+numsub', click: expect.any(Function) },
    ]),
  );
  expect(vi.mocked(Menu.buildFromTemplate)).toHaveBeenCalledWith(
    expect.arrayContaining([
      { label: 'Actual Size alt', visible: false, accelerator: 'CommandOrControl+num0', click: expect.any(Function) },
    ]),
  );

  // and check the main menus being replaced
  expect(vi.mocked(Menu.buildFromTemplate)).toHaveBeenCalledWith(
    expect.arrayContaining([{ label: 'Zoom In', accelerator: 'CommandOrControl+Plus', click: expect.any(Function) }]),
  );
  expect(vi.mocked(Menu.buildFromTemplate)).toHaveBeenCalledWith(
    expect.arrayContaining([{ label: 'Zoom Out', accelerator: 'CommandOrControl+-', click: expect.any(Function) }]),
  );
  expect(vi.mocked(Menu.buildFromTemplate)).toHaveBeenCalledWith(
    expect.arrayContaining([{ label: 'Actual Size', accelerator: 'CommandOrControl+0', click: expect.any(Function) }]),
  );
});
