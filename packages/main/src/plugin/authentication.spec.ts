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

import type {
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  AuthenticationSessionAccountInformation,
  Event,
} from '@podman-desktop/api';
import { beforeAll, expect, test, vi } from 'vitest';
import { ApiSenderType } from './api';
import { AuthenticationImpl } from './authentication';
import { Dialogs } from './dialog-impl';
import { Emitter as EventEmitter } from './events/emitter';

function randomNumber(n = 5) {
  return Math.round(Math.random() * 10 * n);
}

class RandomAuthenticationSession implements AuthenticationSession {
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

class AuthenticationProviderSingleAccout implements AuthenticationProvider {
  private _onDidChangeSession = new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  private session: AuthenticationSession | undefined;
  onDidChangeSessions: Event<AuthenticationProviderAuthenticationSessionsChangeEvent> = this._onDidChangeSession.event;
  async getSessions(scopes?: string[] | undefined): Promise<readonly AuthenticationSession[]> {
    if (scopes) {
      return [this.session ? this.session : (this.session = await this.createSession(scopes))];
    }
    return this.session ? [this.session] : [];
  }
  async createSession(scopes: string[]): Promise<AuthenticationSession> {
    return new RandomAuthenticationSession(scopes);
  }
  async removeSession(sessionId: string): Promise<void> {
    this.session = undefined;
  }
}

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const dialogs: Dialogs = {
  showDialog: vi.fn(),
}

let authModule: AuthenticationImpl;

beforeAll(function () {
  authModule = new AuthenticationImpl(
    apiSender, dialogs);
});

test('Registered authentication provider stored in autentication module', async () => {
  const authProvidrer1 = new AuthenticationProviderSingleAccout();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  const providersInfo = await authModule.getAuthenticationProvidersInfo();
  expect(providersInfo).length(1, 'Provider was not registered');
});

test("Getting an authentication session with 'createIfNone = true' creates new one if not created yet", async () => {
  
});
