/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import * as extensionApi from '@tmpwip/extension-api';
import { getAuthConfig } from './configuration';
import { shell } from 'electron';

const menuItemsRegistered: extensionApi.Disposable[] = [];

const SignUpMenuItem: extensionApi.MenuItem = {
  id: 'redhat.authentication.signup',
  label: 'Sign Up',
};

const SignInMenuItem: extensionApi.MenuItem = {
  id: 'redhat.authentication.signin',
  label: 'Sign In',
};

const SignOutMenuItem: extensionApi.MenuItem = {
  id: 'redhat.authentication.signup',
  label: 'Sign Out',
  enabled: false,
};

const Separator: extensionApi.MenuItem = {
  type: 'separator',
  id: 'redhat.authentication.separator',
};

async function initMenu(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  const item: extensionApi.MenuItem = {
    id: 'redhat.authentication',
    label: 'Red Hat',
    submenu: [SignInMenuItem, SignOutMenuItem, Separator, SignUpMenuItem],
  };

  const subscription = extensionApi.tray.registerMenuItem(item);
  menuItemsRegistered.push(subscription);
  extensionContext.subscriptions.push(subscription);
}

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  console.log('starting extension redhat-authentication');
  const config = await getAuthConfig();

  await initMenu(extensionContext);
  const command = extensionApi.commands.registerCommand('redhat.authentication.signin', async () => {});

  extensionContext.subscriptions.push(command);
}

export function deactivate(): void {
  console.log('stopping kube-context extension');
}
