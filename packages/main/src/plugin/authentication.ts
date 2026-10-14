/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { AuthenticationProviderInfo, SessionRequestInfo } from '@desktop-framework/api/authentication';
import { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type {
  AuthenticationGetSessionOptions,
  AuthenticationProvider,
  AuthenticationProviderOptions,
  AuthenticationSession,
  AuthenticationSessionsChangeEvent,
  Disposable,
  Event,
} from '@desktop-framework/extension-api';
import { inject, injectable, postConstruct } from 'inversify';
import * as z from 'zod';

import { Emitter } from './events/emitter.js';
import { MessageBox } from './message-box.js';

// Sign Out dialog buttons
export const SIGN_OUT_CANCEL = 'Cancel';
export const SIGN_OUT_CONFIRM = 'Sign Out';

// Allow Access dialog buttons
export const ALLOW_ACCESS_ALLOW = 'Allow';
export const ALLOW_ACCESS_DENY = 'Deny';

// Sign In dialog buttons
export const SIGN_IN_CANCEL = 'Cancel';
export const SIGN_IN_ALLOW = 'Allow';

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

export interface ExtensionInfo {
  id: string;
  label: string;
  icon?: string | { light: string; dark: string };
}

export const AllowedExtensionSchema = z.object({
  id: z.string(),
  name: z.string(),
  allowed: z.boolean().optional(),
});

export type AllowedExtension = z.output<typeof AllowedExtensionSchema>;

export const AllowedExtensionRecordSchema = z.record(z.string(), z.array(AllowedExtensionSchema));

interface AccountUsageRecord {
  providerId: string;
  sessionId: string;
  extensionId: string;
  extensionName: string;
}

export interface SessionRequest {
  [scopes: string]: string[]; // maps string with scopes to extension id's
}

export type MenuInfo = AuthenticationRequestMenuInfo | AuthenticationSessionMenuInfo;

interface AuthenticationRequestMenuInfo {
  label: string;
  requestId: string;
}

interface AuthenticationSessionMenuInfo {
  label: string;
  providerId: string;
  sessionId: string;
}

@injectable()
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
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(MessageBox)
    private messageBox: MessageBox,
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
  ) {}

  @postConstruct()
  init(): void {
    this.configurationRegistry.registerConfigurations([
      {
        id: 'authentication',
        title: 'Authentication',
        type: 'object',
        properties: {
          'authentication.trustedExtensions': {
            type: 'object',
            default: {},
            hidden: true,
            description: 'Trusted extensions for authentication providers',
          },
        },
      },
    ]);
  }

  /**
   * Reads trusted extensions from configuration. Expected JSON shape:
   * {
   *   "providerId:accountId": [
   *     { "id": "ext.one", "name": "Extension One", "allowed": true },
   *     { "id": "ext.two", "name": "Extension Two", "allowed": false }
   *   ]
   * }
   */
  private get extensionAllowances(): Record<string, AllowedExtension[]> {
    const config = this.configurationRegistry.getConfiguration('authentication');
    const raw = config.get<unknown>('trustedExtensions');

    const { data, success, error } = AllowedExtensionRecordSchema.safeParse(raw);
    if (success) {
      return data;
    }

    console.error('configuration registry has invalid trustedExtensions', z.prettifyError(error));
    return {};
  }

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
        const accountDisplayName = session.account.label || session.account.id; // Fallback to id if label is empty
        const accountMessage = `The account '${accountDisplayName}' has been used by:`;
        const extensionNames: string[] = this._accountUsageData.reduce((prev: string[], current) => {
          if (current.providerId === providerId && current.sessionId === session.id) {
            prev.push(current.extensionName);
          }
          return prev;
        }, []);
        const message = `${accountMessage}\n\n\t${extensionNames.join('\n\t')}\n\nSign out from ${multiple ? 'these' : 'this'} extension${multiple ? 's' : ''}?`;
        const choice = await this.messageBox.showMessageBox({
          title: 'Sign Out?',
          message,
          buttons: ['Cancel', 'Sign Out'],
        });
        if (choice.response === SIGN_OUT_CONFIRM) {
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

  /**
   * Builds a stable key for storing per-account extension allowances.
   * The accountId is a provider-specific stable user identifier (e.g. OIDC `sub`
   * claim for Red Hat SSO, numeric user ID for GitHub) that remains constant
   * across sessions and scopes.
   */
  private getAllowanceKey(providerId: string, accountId: string): string {
    return `${providerId}:${accountId}`;
  }

  updateAllowedExtension(
    providerId: string,
    accountId: string,
    extensionId: string,
    extensionName: string,
    isAllowed: boolean,
  ): void {
    const key = this.getAllowanceKey(providerId, accountId);
    const allAllowances = this.extensionAllowances;
    const allowances = allAllowances[key] ?? [];

    const existingIndex = allowances.findIndex(ext => ext.id === extensionId);
    if (existingIndex > -1) {
      allowances[existingIndex] = { id: extensionId, name: extensionName, allowed: isAllowed };
    } else {
      allowances.push({ id: extensionId, name: extensionName, allowed: isAllowed });
    }

    allAllowances[key] = allowances;
    const config = this.configurationRegistry.getConfiguration('authentication');
    config.update('trustedExtensions', allAllowances).catch((err: unknown) => {
      console.error('Failed to persist trusted extensions to settings', err);
    });
    this.apiSender.send('authentication-provider-update', { id: providerId });
  }

  /**
   * Check extension access to an account
   * @param providerId The id of the authentication provider
   * @param accountId The unique identifier of the account that access is checked for
   * @param extensionId The id of the extension requesting access
   * @returns Returns true or false if the user has opted to permanently grant or disallow access, and undefined
   * if they haven't made a choice yet
   */
  isAccessAllowed(providerId: string, accountId: string, extensionId: string): boolean | undefined {
    const key = this.getAllowanceKey(providerId, accountId);
    const allowances = this.extensionAllowances[key];

    if (!allowances) {
      return undefined;
    }

    const extensionAllowance = allowances.find(ext => ext.id === extensionId);
    return extensionAllowance?.allowed;
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
    const sortedScopes = [...scopes].sort((a, b) => a.localeCompare(b));

    const sessions = providerData ? await providerData.provider.getSessions(sortedScopes) : [];

    if (sessions.length > 0 && sessions[0]) {
      const session = sessions[0];
      const accountId = session.account.id;
      const accountLabel = session.account.label || accountId; // Fallback to accountId if label is empty
      const accessAllowed = this.isAccessAllowed(providerId, accountId, requestingExtension.id);

      // If explicitly denied, don't return the session
      if (accessAllowed === false) {
        return undefined;
      }

      // If not yet decided (undefined), ask for permission (unless silent)
      if (accessAllowed === undefined) {
        if (options.silent) {
          // Cannot prompt in silent mode, return undefined
          return undefined;
        }

        const allowRsp = await this.messageBox.showMessageBox({
          title: 'Allow Access',
          message: `The extension '${requestingExtension.label}' wants to access the ${providerData?.label ?? providerId} account '${accountLabel}'.`,
          buttons: ['Allow', 'Deny'],
          type: 'info',
        });

        const isAllowed = allowRsp.response === ALLOW_ACCESS_ALLOW;

        // Only store allowance when user allows, not when they deny
        // This way, denying will prompt again next time instead of permanently blocking
        if (isAllowed) {
          this.updateAllowedExtension(providerId, accountId, requestingExtension.id, requestingExtension.label, true);
        } else {
          return undefined;
        }
      }

      // If allowed (true), return the session
      // add account usage to show confirmation on sign out request
      this.addAccountUsage(providerId, session.id, requestingExtension.id, requestingExtension.label);
      return session;
    }

    if (options.createIfNone) {
      if (providerData) {
        const allowRsp = await this.messageBox.showMessageBox({
          title: 'Sign In?',
          message: `The extension '${requestingExtension.label}' wants to sign in using ${providerData.label}.`,
          buttons: ['Cancel', 'Allow'],
          type: 'info',
        });
        if (allowRsp.response === SIGN_IN_CANCEL) {
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
        // Auto-allow the creating extension to access its own session
        this.updateAllowedExtension(
          providerId,
          newSession.account.id,
          requestingExtension.id,
          requestingExtension.label,
          true,
        );
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
        const existingRequests = providerRequests[scopesList] ?? [];
        providerRequests[scopesList] = [...existingRequests, requestingExtension.id];
      } else {
        this._signInRequests.set(providerId, { [scopesList]: [requestingExtension.id] });
      }
      this.apiSender.send('authentication-provider-update', { id: providerId });
    }
    return undefined;
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
      this.updateAllowedExtension(data.providerId, session.account.id, data.extensionId, data.extensionLabel, true);
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
