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
  AuthenticationGetSessionOptions,
  AuthenticationProvider,
  AuthenticationProviderOptions,
  AuthenticationSession,
  AuthenticationSessionAccountInformation,
  AuthenticationSessionsChangeEvent,
  Disposable,
  Event,
  ProviderImages,
} from '@podman-desktop/api';

import type { ApiSenderType } from './api.js';
import { Emitter } from './events/emitter.js';
import type { MessageBox } from './message-box.js';

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
  sessionRequests?: SessionRequestInfo[];
  images?: ProviderImages;
}

export interface ExtensionInfo {
  id: string;
  label: string;
  icon?: string | { light: string; dark: string };
}

export interface AllowedExtension {
  id: string;
  name: string;
  allowed?: boolean;
}

interface AccountUsageRecord {
  providerId: string;
  sessionId: string;
  extensionId: string;
  extensionName: string;
}

export interface SessionRequest {
  [scopes: string]: string[]; // maps string with scopes to extension id's
}

export interface SessionRequestInfo {
  id: string;
  providerId: string;
  scopes: string[];
  extensionId: string;
  extensionLabel: string;
}

export type MenuInfo = AuthenticationRequestMenuInfo | AuthenticationSessionMenuInfo;

export interface AuthenticationRequestMenuInfo {
  label: string;
  requestId: string;
}

export interface AuthenticationSessionMenuInfo {
  label: string;
  providerId: string;
  sessionId: string;
}

export class AuthenticationImpl {
  async getAccountsMenuInfo(): Promise<MenuInfo[]> {
    const requestsMenuInfo: MenuInfo[] = this.getSessionRequests().reduce((prev: MenuInfo[], current) => {
      const provider = this._authenticationProviders.get(current.providerId);
      if (provider) {
        prev.push({
          label: `Sign in with ${provider.label} to use ${current.extensionLabel}`,
          requestId: current.id,
        });
      }
      return prev;
    }, []);

    const providersInfo = await this.getAuthenticationProvidersInfo();
    const sessionMenuInfo: MenuInfo[] = providersInfo.reduce((prev: MenuInfo[], current) => {
      current.accounts.forEach(account => {
        prev.push({
          label: `${account.label} (${current.displayName})`,
          providerId: current.id,
          sessionId: account.id,
        });
      });
      return prev;
    }, []);

    return [...sessionMenuInfo, ...requestsMenuInfo];
  }

  private _authenticationProviders: Map<string, ProviderWithMetadata> = new Map<string, ProviderWithMetadata>();
  // map of scopes to extension ids
  private _signInRequests: Map<string, SessionRequest> = new Map();
  // map id to getSession call
  private _signInRequestsData: Map<string, SessionRequestInfo> = new Map();
  // store account usage to show confirmation when sign out requested
  private _accountUsageData: AccountUsageRecord[] = [];

  constructor(
    private apiSender: ApiSenderType,
    private messageBox: MessageBox,
  ) {}

  public async getAuthenticationProvidersInfo(): Promise<AuthenticationProviderInfo[]> {
    const values = Array.from(this._authenticationProviders.values());
    const providers = values.map(meta => {
      return meta.provider.getSessions().then(sessions => {
        const sessionRequests = sessions.length
          ? []
          : Array.from(this._signInRequestsData.values()).filter(request => request.providerId === meta.id);
        return {
          id: meta.id,
          displayName: meta.label,
          accounts: sessions.map(session => ({ id: session.id, label: session.account.label })),
          sessionRequests,
          images: meta.options.images,
        };
      });
    });

    return await Promise.all(providers);
  }

  public async signOut(providerId: string, sessionId: string): Promise<void> {
    const providerData = this._authenticationProviders.get(providerId);
    if (providerData) {
      const sessions = await providerData?.provider.getSessions();
      const session = sessions.find(entry => entry.id === sessionId);
      if (session) {
        // show confirmation to sign out with all affected extensions
        const multiple = this._accountUsageData.length > 1;
        const accountMessage = `The account '${session.account.label}' has been used by${multiple ? ':' : ''}`;
        const extensionNames: string[] = this._accountUsageData.reduce((prev: string[], current) => {
          if (current.providerId === providerId && current.sessionId === session.id) {
            prev.push(current.extensionName);
          }
          return prev;
        }, []);
        const message = `${accountMessage} ${extensionNames.join(', ')}. Sign out from ${multiple ? 'these' : 'this'} extension${multiple ? 's' : ''}?`;
        const choice = await this.messageBox.showMessageBox({
          title: 'Sign Out Request',
          message,
          buttons: ['Cancel', 'Sign Out'],
        });
        if (choice.response) {
          await this.removeSession(providerId, sessionId);
          this.removeAccountUsage(providerId, sessionId);
        }
      }
    }
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
    this.apiSender.send('authentication-provider-update', { id });
    const onDidChangeSessionDisposable = provider.onDidChangeSessions(() => {
      this._onDidChangeSessions.fire({ provider: { id, label } });
      this.apiSender.send('authentication-provider-update', { id });
    });
    return {
      dispose: (): void => {
        onDidChangeSessionDisposable.dispose();
        this._authenticationProviders.delete(id);
        this.apiSender.send('authentication-provider-update', { id });
      },
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addAccountUsage(providerId: string, sessionId: string, extensionId: string, extensionName: string): void {
    if (
      !this._accountUsageData.find(
        entry => entry.providerId === providerId && entry.sessionId === sessionId && entry.extensionId === extensionId,
      )
    ) {
      this._accountUsageData.push({
        providerId,
        sessionId,
        extensionId,
        extensionName,
      });
    }
  }

  removeAccountUsage(providerId: string, sessionId: string): void {
    this._accountUsageData = this._accountUsageData.filter(
      entry => entry.providerId !== providerId || entry.sessionId !== sessionId,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  readAllowedExtensions(providerId: string, accountName: string): AllowedExtension[] {
    throw new Error('The method is not implemented!');
  }

  updateAllowedExtension(
    providerId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    accountName: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    extensionId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    extensionName: string, // eslint-disable-line @typescript-eslint/no-unused-vars
    isAllowed: boolean, // eslint-disable-line @typescript-eslint/no-unused-vars
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (options.clearSessionPreference) {
      throw new Error('Option is not supported. Please remove clearSessionPreference option.');
    }
    if (options.createIfNone && options.silent) {
      throw new Error('Invalid combination of options. Please remove one of the following: createIfNone, silent');
    }

    const providerData = this._authenticationProviders.get(providerId);
    const sortedScopes = [...scopes].sort();

    const sessions = providerData ? await providerData.provider.getSessions(sortedScopes) : [];

    if (sessions.length && this.isAccessAllowed(providerId, sessions[0].account.label, requestingExtension.id)) {
      // add account usage to show confirmation on sign out request
      this.addAccountUsage(providerId, sessions[0].id, requestingExtension.id, requestingExtension.label);
      return sessions[0];
    }

    if (options.createIfNone) {
      if (providerData) {
        const allowRsp = await this.messageBox.showMessageBox({
          title: 'Sign In Request',
          message: `The extension '${requestingExtension.label}' wants to sign in using ${providerData.label}.`,
          buttons: ['Cancel', 'Allow'],
          type: 'info',
        });
        if (!allowRsp.response) {
          return;
        }
        const newSession = await providerData.provider.createSession(sortedScopes);
        const request = Array.from(this._signInRequestsData.values()).find(request => {
          return request.extensionId === requestingExtension.id;
        });
        if (request) {
          this._signInRequestsData.delete(request.id);
          this._signInRequests.delete(providerId);
        }
        this.addAccountUsage(providerId, newSession.id, requestingExtension.id, requestingExtension.label);
        return newSession;
      } else {
        throw new Error(`Requested authentication provider ${providerId} is not installed.`);
      }
    }

    if (!options.silent) {
      const providerRequests = this._signInRequests.get(providerId);
      const scopesList = sortedScopes.join(' ');
      const extHasRequests = providerRequests?.[scopesList]?.includes(requestingExtension.id);
      if (extHasRequests) {
        // request was added already by this extension
        return;
      }
      const requestId = `${providerId}:${requestingExtension.id}:signIn${Object.keys(providerRequests ?? []).length}`;
      this._signInRequestsData.set(requestId, {
        id: requestId,
        providerId,
        extensionId: requestingExtension.id,
        extensionLabel: requestingExtension.label,
        scopes: sortedScopes,
      });

      if (providerRequests) {
        const existingRequests = providerRequests[scopesList] || [];
        providerRequests[scopesList] = [...existingRequests, requestingExtension.id];
      } else {
        this._signInRequests.set(providerId, { [scopesList]: [requestingExtension.id] });
      }
      this.apiSender.send('authentication-provider-update', { id: providerId });
    }
  }

  getSessionRequests(): SessionRequestInfo[] {
    return Array.from(this._signInRequestsData.values());
  }

  // called by the UI to indicate that the user has requested a sing-in
  async executeSessionRequest(id: string): Promise<void> {
    const data = this._signInRequestsData.get(id);
    if (!data) {
      throw new Error(`Session request '${id}' is not found.`);
    }

    const provider = this._authenticationProviders.get(data.providerId)?.provider;
    if (!provider) {
      throw new Error(`Requested authentication provider '${data.providerId}' is not installed.`);
    }

    const session = await provider.createSession(data.scopes);
    if (session) {
      this._signInRequestsData.delete(id);
      this._signInRequests.delete(data.providerId);
    }
  }

  async removeSession(providerId: string, sessionId: string): Promise<void> {
    const provider = this._authenticationProviders.get(providerId)?.provider;
    if (!provider) {
      throw new Error(`Requested authentication provider ${providerId} is not installed.`);
    }
    return provider.removeSession(sessionId);
  }

  private readonly _onDidChangeSessions = new Emitter<AuthenticationSessionsChangeEvent>();
  readonly onDidChangeSessions: Event<AuthenticationSessionsChangeEvent> = this._onDidChangeSessions.event;
}
