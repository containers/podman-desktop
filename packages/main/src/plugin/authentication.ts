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
  authentication,
  AuthenticationProvider,
  AuthenticationSession,
  AuthenticationProviderInfo,
  AuthenticationGetSessionOptions,
  Disposable,
  Event,
  AuthenticationProviderSessionChangeEvent,
} from '@podman-desktop/api';
import { Emitter } from './events/emitter';

type Authentication = typeof authentication;

export class AuthenticationImpl implements Authentication {

    private _authProviders: Map<string, AuthenticationProvider> = new Map<string, AuthenticationProvider>;
    private _authProvidersInfo: Map<string, AuthenticationProviderInfo> = new Map<string, AuthenticationProviderInfo>;
    private _authProviderDisposables: Map<string, Disposable> = new Map<string, Disposable>();

    constructor(private apiSender: any) {
    }

    public async signIn(providerId: string): Promise<void> {
      void this.getSession(providerId,['openid']);
    }

    public async signOut(providerId: string) {
      const provider = this._authProviders.get(providerId);
      const sessions = await provider?.getSessions();
      if (sessions?.length && sessions.length > 0) {
        this.removeSession(providerId, sessions[0].id);
      }
    }

    public getAuthenticationProvidersInfo(): readonly AuthenticationProviderInfo[] {
      return Array.from(this._authProvidersInfo.values());
    }

    registerAuthenticationProvider(id: string, displayName: string, provider: AuthenticationProvider): Disposable {
      const providerInfo = {id, displayName, accounts: []};
      this._authProvidersInfo.set(id, providerInfo);
      this._authProviders.set(id, provider);
      this.apiSender.send('authentication-provider-register');
      const onDidChangeSessionDisposable = provider.onDidChangeSessions((event: AuthenticationProviderSessionChangeEvent) => {
        // for added sessions
        event.added?.forEach(session => {
          this._authProvidersInfo.get(id)?.accounts.push(session.account)
        });
        // for removed session
        event.removed?.forEach(session => {
          const providerInfo = this._authProvidersInfo.get(id);
          if (providerInfo) {
            const removedIndex = providerInfo.accounts.indexOf(session.account);
            if (removedIndex >= 0) {
              providerInfo.accounts.splice(removedIndex, 1);
            }
          }
        });
        this._onDidChangeSessions.fire(providerInfo);
        this.apiSender.send('authentication-provider-register');  
      });
      this.apiSender.send('authentication-provider-register');
      return {
        dispose: () =>{
          onDidChangeSessionDisposable.dispose();
          this._authProviders.delete(id);
          this._authProvidersInfo.delete(id)
        }
      };
    }

    async getSession(contributorId: string, scopes: string[], _options?: AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined> {
      const contrib = this._authProviders.get(contributorId);
      if (contrib) {
        const activeSessions = await contrib.getSessions();
        if (activeSessions.length > 0) {
          return activeSessions[0];
        } else {
          return contrib.createSession(scopes);
        }
      }
    }

    async removeSession(contributorId: string, sessionId: string): Promise<void>{
      const contrib = this._authProviders.get(contributorId);
      return contrib?.removeSession(sessionId);
    }

    private readonly _onDidChangeSessions = new Emitter<AuthenticationProviderInfo>();
    readonly onDidChangeSessions: Event<AuthenticationProviderInfo> =
      this._onDidChangeSessions.event;
}