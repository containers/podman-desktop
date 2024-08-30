/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import { BrowserWindow } from 'electron';
import { beforeEach, expect, test, vi } from 'vitest';

import { findWindow } from './electron-util.js';

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
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('findWindow - return window', () => {
  // check findWindow function
  const firstWindow = findWindow();

  // expect to return window
  expect(firstWindow).toBeDefined();

  // check it's the MyCustomWindow
  expect((firstWindow as any).constructor.name).toContain('MyCustomWindow');
});

test('findWindow - return undefined if none', () => {
  // override static method getAllWindows
  vi.spyOn(BrowserWindow, 'getAllWindows').mockReturnValue([]);

  // check findWindow function
  const firstWindow = findWindow();

  // expect to return window
  expect(firstWindow).toBeUndefined();
});
