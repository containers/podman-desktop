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

import { beforeEach } from 'node:test';

import type { BrowserWindow, ContextMenuParams, MenuItem } from 'electron';
import { describe, expect, test, vi } from 'vitest';

import { buildDevelopmentMenu } from './development-menu-builder.js';

const browserWindow = {
  webContents: {
    send: vi.fn(),
  },
} as unknown as BrowserWindow;

describe('Open DevTools Menu builder creates menu item for', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  test('/contribs/extension navigation', async () => {
    const parameters: ContextMenuParams = {
      linkURL: '/contribs/ExtensionId',
    } as unknown as ContextMenuParams;
    const menuItems = buildDevelopmentMenu(parameters, browserWindow, true);
    expect(menuItems).toHaveLength(1);
    expect(menuItems[0]).toHaveProperty('label');
    expect(menuItems[0]?.label).toBe('Open DevTools of ExtensionId Extension');
    expect(menuItems[0]?.click).toBeDefined();
    menuItems[0]!.click!(undefined as unknown as MenuItem, undefined, undefined as unknown as Electron.KeyboardEvent);
    expect(browserWindow.webContents.send).toBeCalledWith('dev-tools:open-extension', 'ExtensionId');
  });

  test('/webviews/WebviewId navigation', () => {
    const parameters: ContextMenuParams = {
      linkURL: '/webviews/WebviewId',
    } as unknown as ContextMenuParams;
    const menuItems = buildDevelopmentMenu(parameters, browserWindow, true);
    expect(menuItems).toHaveLength(1);
    expect(menuItems[0]).toHaveProperty('label');
    expect(menuItems[0]?.label).toBe(`Open DevTools of the webview`);
    expect(menuItems[0]?.click).toBeDefined();
    menuItems[0]!.click!(undefined as unknown as MenuItem, undefined, undefined as unknown as Electron.KeyboardEvent);
    expect(browserWindow.webContents.send).toBeCalledWith('dev-tools:open-webview', 'WebviewId');
  });

  test('no menu created on other navigation items', () => {
    const parameters: ContextMenuParams = {
      linkURL: '/images',
    } as unknown as ContextMenuParams;
    const menuItems = buildDevelopmentMenu(parameters, browserWindow, true);
    expect(menuItems).toHaveLength(0);
  });
});
