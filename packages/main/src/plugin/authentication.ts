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

import type * as containerDesktopAPI from '@tmpwip/extension-api';
import { Emitter } from './events/emitter';

type Authentication = typeof containerDesktopAPI.authentication;
type AuthenticationProvider = containerDesktopAPI.AuthenticationProvider;
type AuthenticationProviderInfo = containerDesktopAPI.AuthenticationProviderInfo;
export class AuthenticationImpl implements Authentication {

    private _authContributors: Map<string, containerDesktopAPI.AuthenticationProvider> = new Map<string, containerDesktopAPI.AuthenticationProvider>;

    constructor(private apiSender: any) {
    }

    public getAuthContributorsInfo(): readonly AuthenticationProviderInfo[] {
      return Array.from(this._authContributors.values())
        .map(provider  => ({id: provider.id, displayName: provider.displayName}));
    }

    registerAuthenticationProvider(provider: AuthenticationProvider): containerDesktopAPI.Disposable {
      this._authContributors.set(provider.id, provider);
      this.apiSender.send('authentication-provider-register');
      provider.onDidChangeSessions(() => {
        console.log('getting event form authentication provider');
      });
      return { dispose: () =>{} };
    }

    async getSession(contributorId: string): Promise<containerDesktopAPI.AuthenticationSession | undefined> {
      const contrib = this._authContributors.get(contributorId);
      return contrib ? (await contrib.getSessions())[1] : undefined;
    }

    async removeSession(contributorId: string, sessionId: string): Promise<void>{
      const contrib = this._authContributors.get(contributorId);
      return contrib?.removeSession(sessionId);
    }

    private readonly _onDidChangeSessions = new Emitter<AuthenticationProviderInfo>();
    readonly onDidChangeSessions: containerDesktopAPI.Event<AuthenticationProviderInfo> =
      this._onDidChangeSessions.event;
}
