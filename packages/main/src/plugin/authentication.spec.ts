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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type {
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  AuthenticationSessionAccountInformation,
  Event,
} from '@desktop-framework/extension-api';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import {
  ALLOW_ACCESS_ALLOW,
  ALLOW_ACCESS_DENY,
  AuthenticationImpl,
  SIGN_IN_ALLOW,
  SIGN_IN_CANCEL,
  SIGN_OUT_CANCEL,
  SIGN_OUT_CONFIRM,
} from './authentication.js';
import { Emitter as EventEmitter } from './events/emitter.js';
import type { MessageBox } from './message-box.js';

function createAuthenticationConfigMock(
  initialTrustedExtensions: Record<string, { id: string; name: string; allowed?: boolean }[]> = {},
): { get: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> } {
  let trustedExtensions: Record<string, { id: string; name: string; allowed?: boolean }[]> = {
    ...initialTrustedExtensions,
  };
  return {
    get: vi.fn().mockImplementation((key: string) => {
      if (key === 'trustedExtensions') {
        return trustedExtensions;
      }
      return undefined;
    }),
    update: vi.fn().mockImplementation((key: string, value: unknown) => {
      if (key === 'trustedExtensions') {
        trustedExtensions = value as Record<string, { id: string; name: string; allowed?: boolean }[]>;
      }
      return Promise.resolve();
    }),
  };
}

function createMockConfigurationRegistry(
  trustedExtensions: Record<string, { id: string; name: string; allowed?: boolean }[]> = {},
): IConfigurationRegistry {
  const config = createAuthenticationConfigMock(trustedExtensions);
  return {
    registerConfigurations: vi.fn(),
    getConfiguration: vi.fn().mockReturnValue(config),
  } as unknown as IConfigurationRegistry;
}

function createMockConfigurationRegistryWithConfig(
  trustedExtensions: Record<string, { id: string; name: string; allowed?: boolean }[]> = {},
): {
  registry: IConfigurationRegistry;
  config: ReturnType<typeof createAuthenticationConfigMock>;
} {
  const config = createAuthenticationConfigMock(trustedExtensions);
  const registry = {
    registerConfigurations: vi.fn(),
    getConfiguration: vi.fn().mockReturnValue(config),
  } as unknown as IConfigurationRegistry;
  return { registry, config };
}

function createAuthenticationImpl(
  api: ApiSenderType,
  mb: MessageBox,
  configurationRegistry: IConfigurationRegistry = createMockConfigurationRegistry(),
): AuthenticationImpl {
  const impl = new AuthenticationImpl(api, mb, configurationRegistry);
  impl.init();
  return impl;
}

function randomNumber(n = 5): number {
  // eslint-disable-next-line sonarjs/pseudo-random
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
  showMessageBox: () => Promise.resolve({ response: SIGN_IN_ALLOW }),
} as unknown as MessageBox;

let authModule: AuthenticationImpl;

beforeEach(function () {
  authModule = createAuthenticationImpl(apiSender, messageBox);
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
  const mb = {
    showMessageBox: vi
      .fn()
      .mockResolvedValueOnce({ response: SIGN_IN_ALLOW })
      .mockResolvedValueOnce({ response: ALLOW_ACCESS_ALLOW }),
  } as unknown as MessageBox;
  const authentication = createAuthenticationImpl(apiSender, mb);
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);
  const session1 = await authentication.getSession(
    { id: 'ext1', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session1).toBeDefined();

  const session2 = await authentication.getSession(
    { id: 'ext2', label: 'Ext 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: false },
  );

  expect(session2).toBeDefined();
  expect(authentication.getSessionRequests()).length(0);
});

test('Authentication does not create session if user has not allowed it', async () => {
  const mb = {
    showMessageBox: () => Promise.resolve({ response: SIGN_IN_CANCEL }),
  } as unknown as MessageBox;
  const authentication = createAuthenticationImpl(apiSender, mb);
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
  if (!signInRequest) {
    throw new Error('Sign in request is not defined');
  }
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
  const authentication = createAuthenticationImpl(apiSender, messageBox);

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
  const authentication = createAuthenticationImpl(apiSender, messageBox);

  const providerMock = {
    onDidChangeSessions: vi.fn().mockReturnValue({
      dispose: vi.fn(),
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
  const authentication = createAuthenticationImpl(apiSender, mb);
  const authProvidrer1 = new AuthenticationProviderSingleAccount();
  authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvidrer1);

  vi.mocked(mb.showMessageBox).mockResolvedValue({ response: SIGN_IN_ALLOW });

  const session1 = await authentication.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  vi.mocked(mb.showMessageBox).mockReset();
  vi.mocked(mb.showMessageBox).mockResolvedValue({ response: SIGN_OUT_CANCEL });

  await authentication.signOut('company.auth-provider', session1!.id);

  expect(mb.showMessageBox).toHaveBeenCalledWith(
    expect.objectContaining({
      message: `The account '${session1?.account.label}' has been used by:\n\n\tExt 1\n\nSign out from this extension?`,
    }),
  );

  vi.mocked(mb.showMessageBox).mockReset();
  vi.mocked(mb.showMessageBox)
    .mockResolvedValueOnce({ response: ALLOW_ACCESS_ALLOW })
    .mockResolvedValueOnce({ response: SIGN_OUT_CONFIRM });

  await authentication.getSession({ id: 'ext2', label: 'Ext 2' }, 'company.auth-provider', ['scope1', 'scope2'], {
    createIfNone: true,
  });

  await authentication.signOut('company.auth-provider', session1!.id);

  expect(await authProvidrer1.getSessions()).toHaveLength(0);
  expect(mb.showMessageBox).toHaveBeenCalledWith(
    expect.objectContaining({
      message: `The account '${session1?.account.label}' has been used by:\n\n\tExt 1\n\tExt 2\n\nSign out from these extensions?`,
    }),
  );
});

test('updateAllowedExtension adds new extension allowance', () => {
  authModule.updateAllowedExtension('provider1', 'account1', 'ext1', 'Extension 1', true);

  expect(authModule.isAccessAllowed('provider1', 'account1', 'ext1')).toBe(true);
});

test('updateAllowedExtension updates existing extension allowance', () => {
  authModule.updateAllowedExtension('provider1', 'account1', 'ext1', 'Extension 1', true);
  authModule.updateAllowedExtension('provider1', 'account1', 'ext1', 'Extension 1', false);

  expect(authModule.isAccessAllowed('provider1', 'account1', 'ext1')).toBe(false);
});

test('updateAllowedExtension sends authentication-provider-update event', () => {
  authModule.updateAllowedExtension('provider1', 'account1', 'ext1', 'Extension 1', true);

  expect(apiSender.send).toHaveBeenCalledWith('authentication-provider-update', { id: 'provider1' });
});

test('isAccessAllowed returns undefined when no allowances exist', () => {
  expect(authModule.isAccessAllowed('provider1', 'account1', 'ext1')).toBeUndefined();
});

test('isAccessAllowed returns true when extension is allowed', () => {
  authModule.updateAllowedExtension('provider1', 'account1', 'ext1', 'Extension 1', true);

  expect(authModule.isAccessAllowed('provider1', 'account1', 'ext1')).toBe(true);
});

test('isAccessAllowed returns false when extension is denied', () => {
  authModule.updateAllowedExtension('provider1', 'account1', 'ext1', 'Extension 1', false);

  expect(authModule.isAccessAllowed('provider1', 'account1', 'ext1')).toBe(false);
});

test('isAccessAllowed returns undefined for unknown extension when other extensions exist', () => {
  authModule.updateAllowedExtension('provider1', 'account1', 'ext1', 'Extension 1', true);

  expect(authModule.isAccessAllowed('provider1', 'account1', 'ext2')).toBeUndefined();
});

test('getSession returns undefined when extension access is explicitly denied', async () => {
  const authProvider = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

  // First create a session
  const session = await authModule.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session).toBeDefined();

  // Now deny access for ext2 (using account.id for allowance key)
  authModule.updateAllowedExtension('company.auth-provider', session!.account.id, 'ext2', 'Extension 2', false);

  // ext2 should not get the session
  const sessionForExt2 = await authModule.getSession(
    { id: 'ext2', label: 'Extension 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: true },
  );

  expect(sessionForExt2).toBeUndefined();
});

test('getSession returns session when extension access is allowed', async () => {
  const authProvider = new AuthenticationProviderSingleAccount();
  authModule.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

  // First create a session
  const session = await authModule.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session).toBeDefined();

  // Allow access for ext2 (using account.id for allowance key)
  authModule.updateAllowedExtension('company.auth-provider', session!.account.id, 'ext2', 'Extension 2', true);

  // ext2 should get the session
  const sessionForExt2 = await authModule.getSession(
    { id: 'ext2', label: 'Extension 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: true },
  );

  expect(sessionForExt2).toBeDefined();
  expect(sessionForExt2?.id).toBe(session!.id);
});

test('getSession prompts for allowance when accessing session without prior decision', async () => {
  const mb = {
    showMessageBox: vi.fn().mockResolvedValue({ response: SIGN_IN_ALLOW }),
  } as unknown as MessageBox;
  const authentication = createAuthenticationImpl(apiSender, mb);
  const authProvider = new AuthenticationProviderSingleAccount();
  authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

  // First create a session with ext1
  const session = await authentication.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session).toBeDefined();

  // Reset mock to track only the next call
  vi.mocked(mb.showMessageBox).mockClear();
  vi.mocked(mb.showMessageBox).mockResolvedValue({ response: ALLOW_ACCESS_ALLOW });

  // ext2 tries to access the session - should prompt for allowance
  const sessionForExt2 = await authentication.getSession(
    { id: 'ext2', label: 'Extension 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
  );

  // Should have prompted the user
  expect(mb.showMessageBox).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Allow Access',
      message: expect.stringContaining('Extension 2'),
      buttons: ['Allow', 'Deny'],
    }),
  );

  // Session should be returned after user allowed
  expect(sessionForExt2).toBeDefined();
  expect(sessionForExt2?.id).toBe(session!.id);

  // Allowance should be stored (keyed by account.id)
  expect(authentication.isAccessAllowed('company.auth-provider', session!.account.id, 'ext2')).toBe(true);
});

test('getSession denies access when user clicks Deny on allowance prompt without persisting denial', async () => {
  const mb = {
    showMessageBox: vi.fn().mockResolvedValue({ response: SIGN_IN_ALLOW }),
  } as unknown as MessageBox;
  const authentication = createAuthenticationImpl(apiSender, mb);
  const authProvider = new AuthenticationProviderSingleAccount();
  authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

  // First create a session with ext1
  const session = await authentication.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session).toBeDefined();

  // Reset mock - user will click "Deny" this time
  vi.mocked(mb.showMessageBox).mockClear();
  vi.mocked(mb.showMessageBox).mockResolvedValue({ response: ALLOW_ACCESS_DENY });

  // ext2 tries to access the session - user denies
  const sessionForExt2 = await authentication.getSession(
    { id: 'ext2', label: 'Extension 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
  );

  // Session should not be returned
  expect(sessionForExt2).toBeUndefined();

  // Denial should NOT be stored - allows prompting again next time (keyed by account.id)
  expect(authentication.isAccessAllowed('company.auth-provider', session!.account.id, 'ext2')).toBeUndefined();
});

test('getSession auto-allows creating extension to reuse its own session in silent mode', async () => {
  const mb = {
    showMessageBox: vi.fn().mockResolvedValue({ response: SIGN_IN_ALLOW }),
  } as unknown as MessageBox;
  const authentication = createAuthenticationImpl(apiSender, mb);
  const authProvider = new AuthenticationProviderSingleAccount();
  authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

  // ext1 creates a session
  const session = await authentication.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session).toBeDefined();

  // Creating extension should be auto-allowed (keyed by account.id)
  expect(authentication.isAccessAllowed('company.auth-provider', session!.account.id, 'ext1')).toBe(true);

  // Reset mock to ensure no prompts happen
  vi.mocked(mb.showMessageBox).mockClear();

  // Same extension should be able to reuse session in silent mode
  const sessionAgain = await authentication.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: true },
  );

  // Should NOT have prompted (silent mode with existing allowance)
  expect(mb.showMessageBox).not.toHaveBeenCalled();

  // Session should be returned
  expect(sessionAgain).toBeDefined();
  expect(sessionAgain?.id).toBe(session!.id);
});

test('getSession returns undefined in silent mode when no allowance decision exists', async () => {
  const mb = {
    showMessageBox: vi.fn().mockResolvedValue({ response: SIGN_IN_ALLOW }),
  } as unknown as MessageBox;
  const authentication = createAuthenticationImpl(apiSender, mb);
  const authProvider = new AuthenticationProviderSingleAccount();
  authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

  // First create a session with ext1
  const session = await authentication.getSession(
    { id: 'ext1', label: 'Ext 1' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { createIfNone: true },
  );

  expect(session).toBeDefined();

  // Reset mock
  vi.mocked(mb.showMessageBox).mockClear();

  // ext2 tries to access the session in silent mode
  const sessionForExt2 = await authentication.getSession(
    { id: 'ext2', label: 'Extension 2' },
    'company.auth-provider',
    ['scope1', 'scope2'],
    { silent: true },
  );

  // Should NOT have prompted (silent mode)
  expect(mb.showMessageBox).not.toHaveBeenCalled();

  // Session should not be returned in silent mode without prior allowance
  expect(sessionForExt2).toBeUndefined();
});

describe('trusted extensions', () => {
  test('saves trusted extensions after user grants access from getSession allowance dialog', async () => {
    const mb = {
      showMessageBox: vi.fn().mockResolvedValueOnce({ response: SIGN_IN_ALLOW }),
    } as unknown as MessageBox;
    const { registry, config } = createMockConfigurationRegistryWithConfig();
    const authentication = createAuthenticationImpl(apiSender, mb, registry);
    const authProvider = new AuthenticationProviderSingleAccount();
    authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

    const session = await authentication.getSession(
      { id: 'ext1', label: 'Ext 1' },
      'company.auth-provider',
      ['scope1', 'scope2'],
      { createIfNone: true },
    );
    expect(session).toBeDefined();

    vi.mocked(mb.showMessageBox).mockClear();
    vi.mocked(mb.showMessageBox).mockResolvedValue({ response: ALLOW_ACCESS_ALLOW });

    await authentication.getSession({ id: 'ext2', label: 'Extension 2' }, 'company.auth-provider', [
      'scope1',
      'scope2',
    ]);

    await vi.waitFor(() => expect(config.update).toHaveBeenCalled());
    const allowanceKey = `company.auth-provider:${session!.account.id}`;
    expect(config.update).toHaveBeenLastCalledWith(
      'trustedExtensions',
      expect.objectContaining({
        [allowanceKey]: expect.arrayContaining([
          expect.objectContaining({ id: 'ext1', name: 'Ext 1', allowed: true }),
          expect.objectContaining({ id: 'ext2', name: 'Extension 2', allowed: true }),
        ]),
      }),
    );
  });

  test('serializes trustedExtensions as a record keyed by providerId:accountId after mixed provider updates', async () => {
    const { registry, config } = createMockConfigurationRegistryWithConfig();
    const authentication = createAuthenticationImpl(apiSender, messageBox, registry);

    authentication.updateAllowedExtension('prov-a', 'account-a', 'ext-grant', 'Grant', true);
    authentication.updateAllowedExtension('prov-b', 'account-b', 'ext-deny', 'Deny', false);

    await vi.waitFor(() => expect(config.update).toHaveBeenCalled());

    expect(config.update).toHaveBeenLastCalledWith('trustedExtensions', {
      'prov-a:account-a': [{ id: 'ext-grant', name: 'Grant', allowed: true }],
      'prov-b:account-b': [{ id: 'ext-deny', name: 'Deny', allowed: false }],
    });
  });

  test('persists map from updateAllowedExtension via config.update', async () => {
    const { registry, config } = createMockConfigurationRegistryWithConfig();
    const authentication = createAuthenticationImpl(apiSender, messageBox, registry);

    authentication.updateAllowedExtension('provider1', 'account1', 'ext1', 'Extension 1', true);

    await vi.waitFor(() =>
      expect(config.update).toHaveBeenCalledWith('trustedExtensions', {
        'provider1:account1': [{ id: 'ext1', name: 'Extension 1', allowed: true }],
      }),
    );
  });

  test('each config update reflects cumulative allowances when updateAllowedExtension is invoked repeatedly', async () => {
    const { registry, config } = createMockConfigurationRegistryWithConfig();
    const authentication = createAuthenticationImpl(apiSender, messageBox, registry);

    authentication.updateAllowedExtension('p1', 'a1', 'e1', 'E1', true);
    authentication.updateAllowedExtension('p1', 'a1', 'e2', 'E2', true);
    authentication.updateAllowedExtension('p1', 'a1', 'e3', 'E3', false);

    await vi.waitFor(() => expect(config.update).toHaveBeenCalledTimes(3));

    expect(config.update).toHaveBeenLastCalledWith('trustedExtensions', {
      'p1:a1': [
        { id: 'e1', name: 'E1', allowed: true },
        { id: 'e2', name: 'E2', allowed: true },
        { id: 'e3', name: 'E3', allowed: false },
      ],
    });
  });

  test('loads trustedExtensions from configuration before isAccessAllowed without persisting again', () => {
    const persisted = {
      'oauth.test:uid-1': [{ id: 'ext-z', name: 'Ext Z', allowed: true }],
    };
    const { registry, config } = createMockConfigurationRegistryWithConfig(persisted);
    const authentication = createAuthenticationImpl(apiSender, messageBox, registry);

    expect(authentication.isAccessAllowed('oauth.test', 'uid-1', 'ext-z')).toBe(true);
    expect(authentication.isAccessAllowed('oauth.test', 'uid-1', 'other')).toBeUndefined();
    expect(config.update).not.toHaveBeenCalled();
  });

  test('allows multiple extensions for the same provider/account (both reflected in persisted trustedExtensions)', async () => {
    const mb = {
      showMessageBox: vi.fn().mockResolvedValueOnce({ response: SIGN_IN_ALLOW }),
    } as unknown as MessageBox;
    const { registry, config } = createMockConfigurationRegistryWithConfig();
    const authentication = createAuthenticationImpl(apiSender, mb, registry);
    const authProvider = new AuthenticationProviderSingleAccount();
    authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

    const session = await authentication.getSession(
      { id: 'ext-a', label: 'Extension A' },
      'company.auth-provider',
      ['scope1', 'scope2'],
      { createIfNone: true },
    );
    expect(session).toBeDefined();

    vi.mocked(mb.showMessageBox).mockClear();
    vi.mocked(mb.showMessageBox).mockResolvedValue({ response: ALLOW_ACCESS_ALLOW });

    await authentication.getSession({ id: 'ext-b', label: 'Extension B' }, 'company.auth-provider', [
      'scope1',
      'scope2',
    ]);

    await vi.waitFor(() => expect(config.update).toHaveBeenCalled());

    await Promise.resolve(); // flush microtasks for async saves

    const allowanceKey = `company.auth-provider:${session!.account.id}`;
    expect(authentication.isAccessAllowed('company.auth-provider', session!.account.id, 'ext-a')).toBe(true);
    expect(authentication.isAccessAllowed('company.auth-provider', session!.account.id, 'ext-b')).toBe(true);

    const lastPayload = vi.mocked(config.update).mock.calls.at(-1)?.[1] as Record<
      string,
      { id: string; name: string; allowed?: boolean }[]
    >;
    expect(lastPayload?.[allowanceKey]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'ext-a', name: 'Extension A', allowed: true }),
        expect.objectContaining({ id: 'ext-b', name: 'Extension B', allowed: true }),
      ]),
    );
    expect(lastPayload?.[allowanceKey]).toHaveLength(2);
  });

  test('config.update trustedExtensions includes every allowed extension entry for provider:account when multiple grants exist', async () => {
    const mb = {
      showMessageBox: vi.fn().mockResolvedValueOnce({ response: SIGN_IN_ALLOW }),
    } as unknown as MessageBox;
    const { registry, config } = createMockConfigurationRegistryWithConfig();
    const authentication = createAuthenticationImpl(apiSender, mb, registry);
    const authProvider = new AuthenticationProviderSingleAccount();
    authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

    const session = await authentication.getSession(
      { id: 'ext-a', label: 'Extension A' },
      'company.auth-provider',
      ['scope1', 'scope2'],
      { createIfNone: true },
    );
    expect(session).toBeDefined();

    vi.mocked(mb.showMessageBox).mockClear();
    vi.mocked(mb.showMessageBox).mockResolvedValue({ response: ALLOW_ACCESS_ALLOW });

    await authentication.getSession({ id: 'ext-b', label: 'Extension B' }, 'company.auth-provider', [
      'scope1',
      'scope2',
    ]);

    await vi.waitFor(() => expect(config.update).toHaveBeenCalled());
    await Promise.resolve();

    const allowanceKey = `company.auth-provider:${session!.account.id}`;
    const expectedRow = [
      { id: 'ext-a', name: 'Extension A', allowed: true },
      { id: 'ext-b', name: 'Extension B', allowed: true },
    ];

    expect(vi.mocked(config.update).mock.calls.at(-1)).toEqual([
      'trustedExtensions',
      {
        [allowanceKey]: expectedRow,
      },
    ]);
  });

  test('revoking one extension does not remove another trusted extension for same provider/account', async () => {
    const mb = {
      showMessageBox: vi.fn().mockResolvedValueOnce({ response: SIGN_IN_ALLOW }),
    } as unknown as MessageBox;
    const { registry, config } = createMockConfigurationRegistryWithConfig();
    const authentication = createAuthenticationImpl(apiSender, mb, registry);
    const authProvider = new AuthenticationProviderSingleAccount();
    authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

    const session = await authentication.getSession(
      { id: 'ext-a', label: 'Extension A' },
      'company.auth-provider',
      ['scope1', 'scope2'],
      { createIfNone: true },
    );
    expect(session).toBeDefined();

    vi.mocked(mb.showMessageBox).mockClear();
    vi.mocked(mb.showMessageBox).mockResolvedValue({ response: ALLOW_ACCESS_ALLOW });

    await authentication.getSession({ id: 'ext-b', label: 'Extension B' }, 'company.auth-provider', [
      'scope1',
      'scope2',
    ]);

    await vi.waitFor(() => expect(config.update).toHaveBeenCalled());
    vi.mocked(config.update).mockClear();

    authentication.updateAllowedExtension('company.auth-provider', session!.account.id, 'ext-a', 'Extension A', false);

    await vi.waitFor(() => expect(config.update).toHaveBeenCalled());
    await Promise.resolve();

    expect(authentication.isAccessAllowed('company.auth-provider', session!.account.id, 'ext-a')).toBe(false);
    expect(authentication.isAccessAllowed('company.auth-provider', session!.account.id, 'ext-b')).toBe(true);

    const allowanceKey = `company.auth-provider:${session!.account.id}`;
    expect(config.update).toHaveBeenCalledWith(
      'trustedExtensions',
      expect.objectContaining({
        [allowanceKey]: [
          { id: 'ext-a', name: 'Extension A', allowed: false },
          { id: 'ext-b', name: 'Extension B', allowed: true },
        ],
      }),
    );
  });

  test('shows allowance dialog for a third extension when two others already have access', async () => {
    const mb = {
      showMessageBox: vi.fn().mockResolvedValueOnce({ response: SIGN_IN_ALLOW }),
    } as unknown as MessageBox;
    const authentication = createAuthenticationImpl(apiSender, mb);
    const authProvider = new AuthenticationProviderSingleAccount();
    authentication.registerAuthenticationProvider('company.auth-provider', 'Provider 1', authProvider);

    const sessionA = await authentication.getSession(
      { id: 'ext-a', label: 'Extension A' },
      'company.auth-provider',
      ['scope1', 'scope2'],
      { createIfNone: true },
    );

    vi.mocked(mb.showMessageBox).mockResolvedValue({ response: ALLOW_ACCESS_ALLOW });

    await authentication.getSession({ id: 'ext-b', label: 'Extension B' }, 'company.auth-provider', [
      'scope1',
      'scope2',
    ]);

    vi.mocked(mb.showMessageBox).mockClear();

    vi.mocked(mb.showMessageBox).mockResolvedValue({ response: ALLOW_ACCESS_ALLOW });

    await authentication.getSession({ id: 'ext-c', label: 'Extension C' }, 'company.auth-provider', [
      'scope1',
      'scope2',
    ]);

    expect(mb.showMessageBox).toHaveBeenCalledTimes(1);
    expect(mb.showMessageBox).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Allow Access',
        message: expect.stringContaining('Extension C'),
        buttons: ['Allow', 'Deny'],
      }),
    );

    await Promise.resolve(); // flush microtasks

    const accountId = sessionA!.account.id;
    expect(authentication.isAccessAllowed('company.auth-provider', accountId, 'ext-c')).toBe(true);
  });
});
