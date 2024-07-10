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

import type {
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  AuthenticationSessionAccountInformation,
  Event,
} from '@podman-desktop/api';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import { AuthenticationImpl } from './authentication.js';
import { Emitter as EventEmitter } from './events/emitter.js';
import type { MessageBox } from './message-box.js';

function randomNumber(n = 5): number {
  return Math.round(Math.random() * 10 * n);
}

export class RandomAuthenticationSession implements AuthenticationSession {
  id: string;
  accessToken: string;
  account: AuthenticationSessionAccountInformation;
  constructor(public readonly scopes: readonly string[]) {
    this.id = `id${randomNumber()}`;
    this.accessToken = `accessToken${randomNumber()}`;
    this.account = {
      id: `${randomNumber()}`,
      label: `label${randomNumber()}`,
    };
  }
}

export class AuthenticationProviderSingleAccount implements AuthenticationProvider {
  private _onDidChangeSession = new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  private session: AuthenticationSession | undefined;
  onDidChangeSessions: Event<AuthenticationProviderAuthenticationSessionsChangeEvent> = this._onDidChangeSession.event;
  constructor() {}
  async getSessions(scopes?: string[]): Promise<readonly AuthenticationSession[]> {
    if (scopes) {
      return this.session ? [this.session] : [];
    }
    return this.session ? [this.session] : [];
  }
  async createSession(scopes: string[]): Promise<AuthenticationSession> {
    this.session = new RandomAuthenticationSession(scopes);
    return this.session;
  }
  async removeSession(): Promise<void> {
    this.session = undefined;
  }
}

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const messageBox: MessageBox = {
  showMessageBox: () => Promise.resolve({ response: 1 }),
} as unknown as MessageBox;

let authModule: AuthenticationImpl;

beforeEach(function () {
  authModule = new AuthenticationImpl(apiSender, messageBox);
});

afterEach(() => {
  vi.resetAllMocks();
});

test('Registered authentication provider stored in authentication module', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  const providersInfo = await authModule.getAuthenticationProvidersInfo();
  expect(providersInfo).length(1, 'Provider was not registered');
});

test('Session request with option silent===false does not fail if there is no provider with requested ID', async () => {
  const err = await authModule
    .getSession({ id: 'ext1', label: 'Ext 1' }, 'company.auth-provider', ['scope1', 'scope2'], { silent: false })
    .catch((err: unknown) => Promise.resolve(err));
  expect(err).toBeUndefined();
});

test('Authentication provider does not creates session when silent options is false', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  const sessions = await authModule.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: false },
  );
  expect(sessions).toBeUndefined();
});

test('Authentication creates new auth request when silent is true and session for requested provider does not exist', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);

  const session2 = await authModule.getSession(
    { id: 'ext2', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: false },
  );

  expect(session2).toBeUndefined();
  expect(authModule.getSessionRequests()).length(1);
});

test('Authentication does not create new auth request when silent is true and session exists', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  const session1 = await authModule.getSession(
    { id: 'ext1', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session1).toBeDefined();

  const session2 = await authModule.getSession(
    { id: 'ext2', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: false },
  );

  expect(session2).toBeDefined();
  expect(authModule.getSessionRequests()).length(0);
});

test('Authentication does not create session if user has not allowed it', async () => {
  const mb = {
    showMessageBox: () => Promise.resolve({ response: 0 }),
  } as unknown as MessageBox;
  const authentication = new AuthenticationImpl(apiSender, mb);
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  const session1 = await authentication.getSession(
    { id: 'ext1', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session1).toBeUndefined();
});

test('Authentication creates one auth request per extension', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  const session1 = await authModule.getSession(
    { id: 'ext1', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: false },
  );

  expect(session1).toBeUndefined();

  const session2 = await authModule.getSession(
    { id: 'ext2', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: false },
  );

  expect(session2).toBeUndefined();
  expect(authModule.getSessionRequests()).length(2);
});

test('Authentication does not creates auth request when request for the same extension and scopes exists', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  const session1 = await authModule.getSession(
    { id: 'ext1', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: false },
  );

  expect(session1).toBeUndefined();

  const session2 = await authModule.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: false },
  );

  expect(session2).toBeUndefined();
  expect(authModule.getSessionRequests()).length(1);
});

test('Authentication provider creates session when session request is executed', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  const createSessionSpy = vi.spyOn(authProvidrer1, 'createSession');

  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  await authModule.getSession({ id: 'ext1', label: 'Ext 1' }, 'company.auth-provider', ['scope1', 'scope2'], {
    silent: false,
  });

  expect(authModule.getSessionRequests()).length(1);

  const [signInRequest] = authModule.getSessionRequests();
  await authModule.executeSessionRequest(signInRequest.id);
  expect(createSessionSpy).toBeCalledTimes(1);
});

test('Authentication removes session request when session requested programmatically', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  const createSessionSpy = vi.spyOn(authProvidrer1, 'createSession');

  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  await authModule.getSession({ id: 'ext1', label: 'Ext 1' }, 'company.auth-provider', ['scope1', 'scope2'], {
    silent: false,
  });

  expect(authModule.getSessionRequests()).length(1);

  await authModule.getSession({ id: 'ext1', label: 'Ext 1' }, 'company.auth-provider', ['scope1', 'scope2'], {
    createIfNone: true,
    silent: false,
  });

  expect(createSessionSpy).toBeCalledTimes(1);
  expect(authModule.getSessionRequests()).length(0);
});

test('getAuthenticationProvidersInfo', async () => {
  const authentication = new AuthenticationImpl(apiSender, messageBox);

  const providerMock = {
    onDidChangeSessions: vi.fn(),
    getSessions: vi.fn().mockResolvedValue([]),
    createSession: vi.fn(),
    removeSession: vi.fn(),
  };
  authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock);
  let providers = await authentication.getAuthenticationProvidersInfo();
  const provider1 = providers.find(item => item.id === 'provider1.id');
  expect(provider1).toBeDefined();
  expect(provider1?.images).toBeUndefined();

  authentication.registerAuthenticationProvider('provider2.id', 'Provider2 Label', providerMock, {
    images: {},
  });
  providers = await authentication.getAuthenticationProvidersInfo();
  const provider2 = providers.find(item => item.id === 'provider2.id');
  expect(provider2).toBeDefined();
  expect(provider2?.images).toBeDefined();
  expect(provider2?.images?.logo).toBeUndefined();
  expect(provider2?.images?.icon).toBeUndefined();
});

test('authentication provider send event to update settings page', async () => {
  const authentication = new AuthenticationImpl(apiSender, messageBox);

  const providerMock = {
    onDidChangeSessions: vi.fn().mockImplementation(() => {
      return {
        dispose: vi.fn(),
      };
    }),
    getSessions: vi.fn().mockResolvedValue([]),
    createSession: vi.fn(),
    removeSession: vi.fn(),
  };
  const disposable = authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock);
  const providers = await authentication.getAuthenticationProvidersInfo();
  const provider1 = providers.find(item => item.id === 'provider1.id');
  expect(provider1).toBeDefined();

  disposable.dispose();

  expect(apiSender.send).lastCalledWith('authentication-provider-update', { id: 'provider1.id' });
});

test('authentication shows confirmation request when signing out from a session', async () => {
  const mb = {
    showMessageBox: vi.fn(),
  } as unknown as MessageBox;
  const authentication = new AuthenticationImpl(apiSender, mb);
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);

  vi.mocked(mb.showMessageBox).mockResolvedValue({ response: 1 });

  const session1 = await authentication.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  vi.mocked(mb.showMessageBox).mockReset();
  vi.mocked(mb.showMessageBox).mockResolvedValue({ response: 0 });

  await authentication.signOut('company.auth-provider', session1!.id);

  expect(mb.showMessageBox).toHaveBeenCalledWith(
    expect.objectContaining({
      message: `The account '${session1?.account.label}' has been used by Ext 1. Sign out from this extension?`,
    }),
  );

  vi.mocked(mb.showMessageBox).mockReset();
  vi.mocked(mb.showMessageBox).mockResolvedValue({ response: 1 });

  await authentication.getSession({ id: 'ext2', label: 'Ext 2' }, 'company.auth-provider', ['scope1', 'scope2'], {
    createIfNone: true,
  });

  await authentication.signOut('company.auth-provider', session1!.id);

  expect(await authProvidrer1.getSessions()).toHaveLength(0);
  expect(mb.showMessageBox).toHaveBeenCalledWith(
    expect.objectContaining({
      message: `The account '${session1?.account.label}' has been used by: Ext 1, Ext 2. Sign out from these extensions?`,
    }),
  );
});
