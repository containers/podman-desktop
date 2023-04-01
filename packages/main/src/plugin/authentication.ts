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
  AuthenticationSessionsChangeEvent,
  AuthenticationGetSessionOptions,
  Event,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSessionAccountInformation,
  AuthenticationProviderOptions,
  Disposable,
} from '@podman-desktop/api';
// import { window } from '@podman-desktop/api';
import { Emitter } from './events/emitter';
import type { ApiSenderType } from './api';
import { Dialogs } from './dialog-impl';

type Authentication = typeof authentication;

/**
 * Structure to save authentication provider information
 * with additional metadata
 */
export interface ProviderWithMetadata {
  id: string;
  label: string;
  provider: AuthenticationProvider;
  options: AuthenticationProviderOptions;
}

export interface AuthenticationProviderInfo {
  id: string;
  displayName: string;
  accounts: AuthenticationSessionAccountInformation[];
}

export interface ExtensionInfo {
  id: string;
  label: string;
}

export interface AllowedExtension {
  id: string;
  name: string;
  allowed?: boolean;
}

export class AuthenticationImpl {
  private _authenticationProviders: Map<string, ProviderWithMetadata> = new Map<string, ProviderWithMetadata>();

  constructor(private apiSender: ApiSenderType, private dialogs: Dialogs) {}

  public async getAuthenticationProvidersInfo(): Promise<AuthenticationProviderInfo[]> {
    const values = Array.from(this._authenticationProviders.values());
    const sessionsRequests = values.map(meta => {
      return meta.provider.getSessions().then(sessions => {
        return {
          id: meta.id,
          displayName: meta.label,
          accounts: sessions.map(session => ({ id: session.id, label: session.account.label })),
        };
      });
    });

    return await Promise.all(sessionsRequests);
  }

  public async signOut(providerId: string, sessionId: string) {
    this.removeSession(providerId, sessionId);
  }

  registerAuthenticationProvider(
    id: string,
    label: string,
    provider: AuthenticationProvider,
    options?: AuthenticationProviderOptions,
  ): Disposable {
    if (this._authenticationProviders.get(id)) {
      throw new Error(`An authentication provider with id '${id}' is already registered.`);
    }
    this._authenticationProviders.set(id, {
      id,
      label,
      provider,
      options: options ?? { supportsMultipleAccounts: false },
    });
    this.apiSender.send('authentication-provider-update', {id});
    const onDidChangeSessionDisposable = provider.onDidChangeSessions(
      (event: AuthenticationProviderAuthenticationSessionsChangeEvent) => {
        this._onDidChangeSessions.fire({ provider: { id, label } });
        this.apiSender.send('authentication-provider-update', {id});
      },
    );
    return {
      dispose: () => {
        onDidChangeSessionDisposable.dispose();
        this._authenticationProviders.delete(id);
      },
    };
  }

  addAccountUsage(providerId: string, accountLabel: string, extensionId: string, extensionName: string): void {
    throw new Error('The method is not implemented!');
  }

  readAllowedExtensions(providerId: string, accountName: string): AllowedExtension[] {
    throw new Error('The method is not implemented!');
  }

  updateAllowedExtension(
    providerId: string,
    accountName: string,
    extensionId: string,
    extensionName: string,
    isAllowed: boolean,
  ): void {
    throw new Error('The method is not implemented!');
  }

  /**
   * Check extension access to an account
   * @param providerId The id of the authentication provider
   * @param accountName The account name that access is checked for
   * @param extensionId The id of the extension requesting access
   * @returns Returns true or false if the user has opted to permanently grant or disallow access, and undefined
   * if they haven't made a choice yet
   */
  isAccessAllowed(providerId: string, accountName: string, extensionId: string): boolean | undefined {
    return true; // To be implemented later
  }

  async getSession(
    requestingExtension: ExtensionInfo,
    providerId: string,
    scopes: string[],
    options: AuthenticationGetSessionOptions & { createIfNone: true },
  ): Promise<AuthenticationSession | undefined>;
  async getSession(
    requestingExtension: ExtensionInfo,
    providerId: string,
    scopes: string[],
    options?: AuthenticationGetSessionOptions,
  ): Promise<AuthenticationSession | undefined>;
  async getSession(
    requestingExtension: ExtensionInfo,
    providerId: string,
    scopes: string[],
    options: AuthenticationGetSessionOptions = {},
  ): Promise<AuthenticationSession | undefined> {
    // Error cases
    if (options.forceNewSession) {
      throw new Error('Option is not supported. Please remove forceNewSession option.');
    }
    if (options.silent) {
      throw new Error('Option is not supported. Please remove silent option.');
    }
    if (options.clearSessionPreference) {
      throw new Error('Option is not supported. Please remove clearSessionPreference option.');
    }

    const provider = this._authenticationProviders.get(providerId)?.provider;
    if (!provider) {
        await this.dialogs.showDialog('error', 'Authentication Error', `Requested authentication provider ${providerId} is not installed.`, ['Close']);
    } else {
      const sessions = await provider.getSessions(scopes);
      if (sessions.length > 0 && this.isAccessAllowed(providerId, sessions[0].account.label, requestingExtension.id)) {
        return sessions[0];
      } else {
        return provider.createSession(scopes);
      }
    }
    return;
  }

  async removeSession(providerId: string, sessionId: string): Promise<void> {
    const provider = this._authenticationProviders.get(providerId)?.provider;
    return provider?.removeSession(sessionId);
  }

  private readonly _onDidChangeSessions = new Emitter<AuthenticationSessionsChangeEvent>();
  readonly onDidChangeSessions: Event<AuthenticationSessionsChangeEvent> = this._onDidChangeSessions.event;
}
