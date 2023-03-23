/**********************************************************************
 * Copyright (C) 2022 - 2023 Red Hat, Inc.
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
import { RedHatAuthenticationService } from './authentication-service';
const menuItemsRegistered: extensionApi.Disposable[] = [];

const SignUpMenuItem = (enabled = true) => ({
  id: 'redhat.authentication.signup',
  label: 'Sign Up',
  enabled
});

const SignInMenuItem = (enabled = true) => ({
  id: 'redhat.authentication.signin',
  label: 'Sign In',
  enabled
});

const SignOutMenuItem = (enabled = false) =>({
  id: 'redhat.authentication.signout',
  label: 'Sign Out',
  enabled
});

const Separator: extensionApi.MenuItem = {
  type: 'separator',
  id: 'redhat.authentication.separator',
};

const AuthMenuItem: extensionApi.MenuItem = {
  id: 'redhat.authentication',
  label: 'Red Hat',
};

async function initMenu(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  AuthMenuItem.
    submenu = [SignInMenuItem(), SignOutMenuItem(), Separator, SignUpMenuItem()];

  const subscription = extensionApi.tray.registerMenuItem(AuthMenuItem);
  extensionContext.subscriptions.push(subscription);
}

let loginService:RedHatAuthenticationService;

async function getAutenticatonService() {
  if (!loginService) {
    const config = await getAuthConfig();
    loginService = await RedHatAuthenticationService.build(config);
  } 
  return loginService;
}

const _onDidChangeSessions = new extensionApi.Emitter<extensionApi.AuthenticationProviderSessionChangeEvent>();

export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  console.log('starting extension redhat-authentication');
  
  await initMenu(extensionContext);
  
  extensionApi.authentication.registerAuthenticationProvider({
    onDidChangeSessions: _onDidChangeSessions.event,
    createSession: function (): Promise<extensionApi.AuthenticationSession> {
      throw new Error('Function not implemented.');
    },
    getSessions: function (): Promise<extensionApi.AuthenticationSession[]> {
      throw new Error('Function not implemented.');
    },
    removeSession: function (id: string): Promise<void> {
      throw new Error('Function not implemented.');
    },
    id: 'redhat.autentication-provider',
    displayName: 'Red Hat',
  });

  setInterval(()=>{
    _onDidChangeSessions.fire({})
  }, 100);

  const SignInCommand = extensionApi.commands.registerCommand('redhat.authentication.signin', async () => {
    const service = await getAutenticatonService();
    const session = await service.createSession('openid');

    AuthMenuItem.label = `Red Hat (${session.account.label})`;
    AuthMenuItem.
      submenu = [SignInMenuItem(false), SignOutMenuItem(true), Separator, SignUpMenuItem()];
    const subscription = extensionApi.tray.registerMenuItem(AuthMenuItem);
    extensionContext.subscriptions.push(subscription);
  });

  const SignOutCommand = extensionApi.commands.registerCommand('redhat.authentication.signout', async () => {
    loginService = undefined;
    AuthMenuItem.label = `Red Hat`;
    AuthMenuItem.
      submenu = [SignInMenuItem(true), SignOutMenuItem(false), Separator, SignUpMenuItem()];
    const subscription = extensionApi.tray.registerMenuItem(AuthMenuItem);
    extensionContext.subscriptions.push(subscription);
  });

  const SignUpCommand = extensionApi.commands.registerCommand('redhat.authentication.signup', async () => {
    extensionApi.window.showModalWindow('https://developers.redhat.com/articles/faqs-no-cost-red-hat-enterprise-linux#general');
  });

  extensionContext.subscriptions.push(SignInCommand, SignOutCommand, SignUpCommand);
}

export function deactivate(): void {
  console.log('stopping kube-context extension');
}
