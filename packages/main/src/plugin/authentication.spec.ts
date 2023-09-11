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
import { beforeEach, afterEach, expect, test, vi, suite } from 'vitest';
import type { Mock } from 'vitest';
import type { ApiSenderType } from './api.js';
import { AuthenticationImpl } from './authentication.js';
import type { CommandRegistry } from './command-registry.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import { Emitter as EventEmitter } from './events/emitter.js';
import { ExtensionLoader } from './extension-loader.js';
import type { FilesystemMonitoring } from './filesystem-monitoring.js';
import type { ImageRegistry } from './image-registry.js';
import type { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import type { KubernetesClient } from './kubernetes-client.js';
import type { MenuRegistry } from './menu-registry.js';
import type { MessageBox } from './message-box.js';
import type { NotificationImpl } from './notification-impl.js';
import type { ProgressImpl } from './progress-impl.js';
import type { ProviderRegistry } from './provider-registry.js';
import type { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';
import type { TrayMenuRegistry } from './tray-menu-registry.js';
import type { Proxy } from './proxy.js';
import type { IconRegistry } from './icon-registry.js';
import type { Directories } from './directories.js';
import type { CustomPickRegistry } from './custompick/custompick-registry.js';
import type { ViewRegistry } from './view-registry.js';
import type { Context } from './context/context.js';
import type { OnboardingRegistry } from './onboarding-registry.js';
import { getBase64Image } from '../util.js';
import type { Exec } from './util/exec.js';

vi.mock('../util.js', async () => {
  return {
    getBase64Image: vi.fn(),
  };
});

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

class AuthenticationProviderSingleAccount implements AuthenticationProvider {
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

let authModule: AuthenticationImpl;

const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
} as unknown as Directories;

beforeEach(function () {
  authModule = new AuthenticationImpl(apiSender);
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

suite('Authentication', () => {
  let extLoader: ExtensionLoader;
  let authentication: AuthenticationImpl;
  let providerMock: AuthenticationProvider;
  beforeEach(() => {
    authentication = new AuthenticationImpl(apiSender);
    extLoader = new ExtensionLoader(
      vi.fn() as unknown as CommandRegistry,
      vi.fn() as unknown as MenuRegistry,
      vi.fn() as unknown as ProviderRegistry,
      vi.fn() as unknown as ConfigurationRegistry,
      vi.fn() as unknown as ImageRegistry,
      vi.fn() as unknown as ApiSenderType,
      vi.fn() as unknown as TrayMenuRegistry,
      vi.fn() as unknown as MessageBox,
      vi.fn() as unknown as ProgressImpl,
      vi.fn() as unknown as NotificationImpl,
      vi.fn() as unknown as StatusBarRegistry,
      vi.fn() as unknown as KubernetesClient,
      vi.fn() as unknown as FilesystemMonitoring,
      vi.fn() as unknown as Proxy,
      vi.fn() as unknown as ContainerProviderRegistry,
      vi.fn() as unknown as InputQuickPickRegistry,
      vi.fn() as unknown as CustomPickRegistry,
      authentication,
      vi.fn() as unknown as IconRegistry,
      vi.fn() as unknown as OnboardingRegistry,
      vi.fn() as unknown as Telemetry,
      vi.fn() as unknown as ViewRegistry,
      vi.fn() as unknown as Context,
      directories,
      vi.fn() as unknown as Exec,
    );
    providerMock = {
      onDidChangeSessions: vi.fn(),
      getSessions: vi.fn().mockResolvedValue([]),
      createSession: vi.fn(),
      removeSession: vi.fn(),
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const BASE64ENCODEDIMAGE = 'BASE64ENCODEDIMAGE';

  test('allows images option to be undefined or empty', async () => {
    (getBase64Image as Mock).mockReturnValue(BASE64ENCODEDIMAGE);
    const api = extLoader.createApi('/path', {});
    expect(api).toBeDefined();
    api.authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock);
    let providers = await authentication.getAuthenticationProvidersInfo();
    const provider1 = providers.find(item => item.id === 'provider1.id');
    expect(provider1).toBeDefined();
    expect(provider1?.images).toBeUndefined();

    api.authentication.registerAuthenticationProvider('provider2.id', 'Provider2 Label', providerMock, {
      images: {},
    });
    providers = await authentication.getAuthenticationProvidersInfo();
    const provider2 = providers.find(item => item.id === 'provider2.id');
    expect(provider2).toBeDefined();
    expect(provider2?.images).toBeDefined();
    expect(provider2?.images?.logo).toBeUndefined();
    expect(provider2?.images?.icon).toBeUndefined();
  });

  test('converts images.icon path to base 64 image when registering provider', async () => {
    (getBase64Image as Mock).mockReturnValue(BASE64ENCODEDIMAGE);
    const api = extLoader.createApi('/path', {});
    expect(api).toBeDefined();
    api.authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock, {
      images: {
        icon: './image.png',
        logo: './image.png',
      },
    });
    const providers = await authentication.getAuthenticationProvidersInfo();
    const provider = providers.find(item => item.id === 'provider1.id');
    expect(provider).toBeDefined();
    expect(provider?.images?.icon).equals(BASE64ENCODEDIMAGE);
    expect(provider?.images?.icon).equals(BASE64ENCODEDIMAGE);
  });

  test('converts images.icon with themes path to base 64 image when registering provider', async () => {
    (getBase64Image as Mock).mockReturnValue(BASE64ENCODEDIMAGE);
    const api = extLoader.createApi('/path', {});
    expect(api).toBeDefined();
    api.authentication.registerAuthenticationProvider('provider2.id', 'Provider2 Label', providerMock, {
      images: {
        icon: {
          light: './image.png',
          dark: './image.png',
        },
        logo: {
          light: './image.png',
          dark: './image.png',
        },
      },
    });
    const providers = await authentication.getAuthenticationProvidersInfo();
    const provider = providers.find(item => item.id === 'provider2.id');
    expect(provider).toBeDefined();
    const themeIcon = typeof provider?.images?.icon === 'string' ? undefined : provider?.images?.icon;
    expect(themeIcon).toBeDefined();
    expect(themeIcon?.light).equals(BASE64ENCODEDIMAGE);
    expect(themeIcon?.dark).equals(BASE64ENCODEDIMAGE);
    const themeLogo = typeof provider?.images?.logo === 'string' ? undefined : provider?.images?.logo;
    expect(themeLogo).toBeDefined();
    expect(themeLogo?.light).equals(BASE64ENCODEDIMAGE);
    expect(themeLogo?.dark).equals(BASE64ENCODEDIMAGE);
  });
});
