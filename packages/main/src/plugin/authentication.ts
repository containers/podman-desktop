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

export class AuthenticationImpl implements Authentication {

    private _authContributors: Map<string, containerDesktopAPI.AuthContributor> = new Map<string, containerDesktopAPI.AuthContributor>;

    constructor(private apiSender: any) {
    }

    public getAuthContributorsInfo(): readonly containerDesktopAPI.AuthContributorInfo[] {
      return Array.from(this._authContributors.values())
        .map(provider  => ({id: provider.id, displayName: provider.displayName}));
    }

    registerContributor(contributor: containerDesktopAPI.AuthContributor): void {
      this._authContributors.set(contributor.id, contributor);
      this._onDidRegisterContributor.fire({id: contributor.id, displayName: contributor.displayName});
      this.apiSender.send('authentication-provider-register');
    }

    async getSession(contributorId: string): Promise<containerDesktopAPI.AuthSession | undefined> {
      const contrib = this._authContributors.get(contributorId);
      return contrib?.getSession();
    }

    async deleteSession(contributorId: string, sessionId: string): Promise<void>{
      const contrib = this._authContributors.get(contributorId);
      return contrib?.deleteSession(sessionId);
    }

    private readonly _onDidRegisterContributor = new Emitter<containerDesktopAPI.AuthContributorInfo>();
    readonly onDidRegisterContributor: containerDesktopAPI.Event<containerDesktopAPI.AuthContributorInfo> =
      this._onDidRegisterContributor.event;
}
