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

import type { BrowserWindow } from 'electron';
import { Menu } from 'electron';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import { AuthenticationImpl } from './authentication.js';
import { AuthenticationProviderSingleAccount } from './authentication.spec.js';
import { showAccountsMenu } from './authentication-menu.js';
import type { MessageBox } from './message-box.js';
import type { NavigationManager } from './navigation/navigation-manager.js';

const menu = {
  popup: vi.fn(),
} as unknown as Menu;

vi.mock('electron', () => ({
  Menu: {
    buildFromTemplate: (): Menu => menu,
  },
  BrowserWindow: {
    getFocusedWindow: (): BrowserWindow =>
      ({
        webContents: {
          getZoomFactor: (): number => 1.3,
        },
      }) as unknown as BrowserWindow,
  },
}));

const navigationManager = {
  navigateToAuthentication: vi.fn(),
} as unknown as NavigationManager;

let authModule: AuthenticationImpl;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const messageBox: MessageBox = {
  showMessageBox: () => Promise.resolve({ response: 1 }),
} as unknown as MessageBox;

beforeEach(function () {
  authModule = new AuthenticationImpl(apiSender, messageBox);
});

afterEach(() => {
  vi.resetAllMocks();
});

test('showAccountsMenu creates menu with authentication requests and current sessions', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  const authProvidrer2 = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider1', 'Provider 1', authProvidrer1);
  authModule.registerAuthenticationProvider('company.auth-provider2', 'Provider 2', authProvidrer2);

  const session1 = await authModule.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider2',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );
  expect(session1).toBeDefined();

  const session2 = await authModule.getSession(
    { id: 'ext2', label: 'Ext 2' },
    'company.auth-provider1',
    ['scope1', 'scope2'],
    { silent: false },
  );
  expect(session2).toBeUndefined();

  const session3 = await authModule.getSession(
    { id: 'ext3', label: 'Ext 3' },
    'company.auth-provider1',
    ['scope1', 'scope2'],
    { silent: false },
  );
  expect(session3).toBeUndefined();

  expect(authModule.getSessionRequests()).length(2);

  const buildFromTemplateSpy = vi.spyOn(Menu, 'buildFromTemplate');

  await showAccountsMenu(10, 10, authModule, navigationManager);

  expect(menu.popup).toBeCalledWith({ x: 13, y: 13 });
  expect(buildFromTemplateSpy).toBeCalledWith(
    expect.arrayContaining([
      expect.objectContaining({
        label: 'Manage authentication',
      }),
      expect.objectContaining({
        type: 'separator',
      }),
      expect.objectContaining({
        label: 'Sign in with Provider 1 to use Ext 2',
      }),
      expect.objectContaining({
        label: 'Sign in with Provider 1 to use Ext 3',
      }),
      expect.objectContaining({
        label: `${session1?.account.label} (Provider 2)`,
        submenu: expect.arrayContaining([
          expect.objectContaining({
            label: 'Sign out',
          }),
        ]),
      }),
    ]),
  );
});
