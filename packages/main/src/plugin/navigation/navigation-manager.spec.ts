/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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
  OnboardingInfo,
  ProviderContainerConnectionInfo,
  ProviderKubernetesConnectionInfo,
  ProviderVmConnectionInfo,
  WebviewInfo,
} from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { ProviderContainerConnection } from '@desktop-framework/extension-api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { CommandRegistry } from '/@/plugin/command-registry.js';
import type { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import type { ContributionManager } from '/@/plugin/contribution-manager.js';
import type { OnboardingRegistry } from '/@/plugin/onboarding-registry.js';
import type { ProviderRegistry } from '/@/plugin/provider-registry.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import type { WebviewRegistry } from '/@/plugin/webview/webview-registry.js';

import { NavigationManager } from './navigation-manager.js';

let navigationManager: TestNavigationManager;

class TestNavigationManager extends NavigationManager {
  override assertContributionExist(name: string): void {
    return super.assertContributionExist(name);
  }
  override assertWebviewExist(webviewId: string): void {
    return super.assertWebviewExist(webviewId);
  }
}

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const containerRegistry = {
  imageExist: vi.fn(),
} as unknown as ContainerProviderRegistry;

const contributionManager = {
  listContributions: vi.fn(),
} as unknown as ContributionManager;

const providerRegistry = {
  getMatchingProviderInternalId: vi.fn(),
} as unknown as ProviderRegistry;

const webviewRegistry = {
  listWebviews: vi.fn(),
} as unknown as WebviewRegistry;

const commandRegistry: CommandRegistry = {
  hasCommand: vi.fn(),
  executeCommand: vi.fn(),
  registerCommand: vi.fn(),
  registerCommandPalette: vi.fn(),
} as unknown as CommandRegistry;

const onboardingRegistry: OnboardingRegistry = {
  getOnboarding: vi.fn(),
} as unknown as OnboardingRegistry;

beforeEach(() => {
  vi.resetAllMocks();
  navigationManager = new TestNavigationManager(
    apiSender,
    containerRegistry,
    contributionManager,
    providerRegistry,
    webviewRegistry,
    commandRegistry,
    onboardingRegistry,
  );
});

test('check contribution does not exist', async () => {
  vi.mocked(contributionManager.listContributions).mockReturnValue([]);

  expect(() => navigationManager.assertContributionExist('dummy')).toThrow(
    'Contribution with name dummy cannot be found',
  );
});

test('check webview exist', async () => {
  vi.mocked(webviewRegistry.listWebviews).mockReturnValue([{ id: 'validId' } as WebviewInfo]);

  navigationManager.assertWebviewExist('validId');
});

test('check webview does not exist', async () => {
  vi.mocked(webviewRegistry.listWebviews).mockReturnValue([]);

  expect(() => navigationManager.assertWebviewExist('invalidId')).toThrow('Webview with id invalidId cannot be found');
});

test('check navigateToWebview', async () => {
  vi.mocked(webviewRegistry.listWebviews).mockReturnValue([{ id: 'validId' } as WebviewInfo]);

  await navigationManager.navigateToWebview('validId');

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.WEBVIEW,
    parameters: {
      id: 'validId',
    },
  });
});

test('check navigateToDashboard', async () => {
  await navigationManager.navigateToDashboard();

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.DASHBOARD,
  });
});

test('check navigateToResources', async () => {
  await navigationManager.navigateToResources();

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.RESOURCES,
  });
});

test('check navigateToCliTools', async () => {
  await navigationManager.navigateToCliTools();

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.CLI_TOOLS,
  });
});

test('check navigateToImageBuild', async () => {
  await navigationManager.navigateToImageBuild();

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.IMAGE_BUILD,
    parameters: {
      taskId: undefined,
    },
  });
});

describe('navigateToImageRun', () => {
  test('expect to thrown error if image does not exists', async () => {
    vi.mocked(containerRegistry.imageExist).mockResolvedValue(false);

    await expect(async () => {
      await navigationManager.navigateToImageRun('sha256:55', 'podman.Podman', 'localhost/squid:latest');
    }).rejects.toThrow(
      `Image with id sha256:55, engine id podman.Podman and tag localhost/squid:latest cannot be found.`,
    );

    expect(apiSender.send).not.toHaveBeenCalled();
  });

  test('check navigateToImageRun', async () => {
    vi.mocked(containerRegistry.imageExist).mockResolvedValue(true);

    await navigationManager.navigateToImageRun('sha256:55', 'podman.Podman', 'localhost/squid:latest');

    expect(apiSender.send).toHaveBeenCalledWith('navigate', {
      page: NavigationPage.IMAGE_RUN,
      parameters: {
        id: 'sha256:55',
        engineId: 'podman.Podman',
        tag: 'localhost/squid:latest',
      },
    });
  });
});

test('check navigateToProviderTask', async () => {
  await navigationManager.navigateToProviderTask('internalId', 55);

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.PROVIDER_TASK,
    parameters: {
      internalId: 'internalId',
      taskId: 55,
    },
  });
});

test('check navigateToProviderConnection for a container connection', () => {
  const connectionInfo: ProviderContainerConnectionInfo = {
    connectionType: 'container',
    name: 'machine',
    displayName: 'Machine',
    status: 'stopped',
    endpoint: { socketPath: '/machine.sock' },
    canStart: true,
    canStop: false,
    canEdit: false,
    canDelete: false,
    type: 'podman',
    vmType: { id: 'qemu', name: 'QEMU' },
  };

  navigationManager.navigateToProviderConnection('internalId', connectionInfo);

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.CONTAINER_CONNECTION,
    parameters: {
      provider: 'internalId',
      name: 'machine',
      socketPath: '/machine.sock',
    },
  });
});

test('check navigateToProviderConnection for a Kubernetes connection', () => {
  const connectionInfo: ProviderKubernetesConnectionInfo = {
    connectionType: 'kubernetes',
    name: 'kind',
    status: 'stopped',
    endpoint: { apiURL: 'https://kind.example.test' },
    canStart: true,
    canStop: false,
    canEdit: false,
    canDelete: false,
  };

  navigationManager.navigateToProviderConnection('internalId', connectionInfo);

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.KUBERNETES_CONNECTION,
    parameters: {
      provider: 'internalId',
      apiURL: 'https://kind.example.test',
    },
  });
});

test('check navigateToProviderConnection for a VM connection', () => {
  const connectionInfo: ProviderVmConnectionInfo = {
    connectionType: 'vm',
    name: 'lima',
    status: 'stopped',
    canStart: true,
    canStop: false,
    canEdit: false,
    canDelete: false,
  };

  navigationManager.navigateToProviderConnection('internalId', connectionInfo);

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.VM_CONNECTION,
    parameters: {
      provider: 'internalId',
      name: 'lima',
    },
  });
});

test('check navigateToEditProviderContainerConnection', async () => {
  vi.mocked(providerRegistry.getMatchingProviderInternalId).mockReturnValue('id');
  const connection: ProviderContainerConnection = {
    providerId: 'internal',
    connection: {
      name: 'connection',
      type: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'stopped',
    },
  };
  await navigationManager.navigateToEditProviderContainerConnection(connection);

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.EDIT_CONTAINER_CONNECTION,
    parameters: {
      provider: 'id',
      name: Buffer.from(connection.connection.name).toString('base64'),
    },
  });
});

test('check navigateToOnboarding', async () => {
  vi.mocked(onboardingRegistry.getOnboarding).mockReturnValue({ extension: 'foo' } as OnboardingInfo);

  await navigationManager.navigateToOnboarding('my.extension');

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.ONBOARDING,
    parameters: {
      extensionId: 'my.extension',
    },
  });
});

describe('register route', () => {
  test('registering route should provide a disposable', () => {
    const routeId = 'dummy-route-id';
    const disposable = navigationManager.registerRoute({
      routeId: routeId,
      commandId: 'fake-command-id',
    });

    expect(navigationManager.hasRoute(routeId)).toBeTruthy();

    disposable.dispose();

    expect(navigationManager.hasRoute(routeId)).toBeFalsy();
  });

  test('registering existing route should throw an error', async () => {
    const routeId = 'dummy-route-id';
    navigationManager.registerRoute({
      routeId: routeId,
      commandId: 'fake-command-id',
    });

    expect(() => {
      return navigationManager.registerRoute({
        routeId: routeId,
        commandId: 'fake-command-id',
      });
    }).toThrowError('routeId dummy-route-id is already registered.');
  });

  test('calling navigateToRoute with invalid routeId should raise an error', async () => {
    await expect(() => {
      return navigationManager.navigateToRoute('invalidId');
    }).rejects.toThrowError('navigation route invalidId does not exists.');
  });

  test('calling navigateToRoute on route with invalid command should raise an error', async () => {
    vi.mocked(commandRegistry.hasCommand).mockReturnValue(false);
    const routeId = 'dummy-route-id';
    navigationManager.registerRoute({
      routeId: routeId,
      commandId: 'fake-command-id',
    });

    await expect(() => {
      return navigationManager.navigateToRoute(routeId);
    }).rejects.toThrowError('navigation route dummy-route-id registered an unknown command: fake-command-id');

    expect(commandRegistry.hasCommand).toHaveBeenCalledOnce();
  });

  test('calling navigateToRoute should propagate the argument to the command', async () => {
    vi.mocked(commandRegistry.hasCommand).mockReturnValue(true);
    vi.mocked(commandRegistry.executeCommand).mockResolvedValue(undefined);
    const routeId = 'dummy-route-id';
    navigationManager.registerRoute({
      routeId: routeId,
      commandId: 'dummy-command-id',
    });

    await navigationManager.navigateToRoute(routeId, 'potatoes', 'candies');

    expect(commandRegistry.executeCommand).toHaveBeenCalledWith('dummy-command-id', 'potatoes', 'candies');
  });

  test('error in the command should be propagate to the caller', async () => {
    vi.mocked(commandRegistry.hasCommand).mockReturnValue(true);
    vi.mocked(commandRegistry.executeCommand).mockRejectedValue('Dummy error');
    const routeId = 'dummy-route-id';
    navigationManager.registerRoute({
      routeId: routeId,
      commandId: 'dummy-command-id',
    });

    await expect(() => {
      return navigationManager.navigateToRoute(routeId);
    }).rejects.toThrowError('Dummy error');
  });

  test('registering route with searchEntry should fire navigation-searchable-route-update event', () => {
    navigationManager.registerRoute({
      routeId: 'route-with-search',
      commandId: 'some-command',
      searchEntry: { label: 'My Route' },
    });

    expect(apiSender.send).toHaveBeenCalledWith('navigation-searchable-route-update');
  });

  test('registering route without searchEntry should not fire navigation-searchable-route-update event', () => {
    navigationManager.registerRoute({
      routeId: 'route-without-search',
      commandId: 'some-command',
    });

    expect(apiSender.send).not.toHaveBeenCalledWith('navigation-searchable-route-update');
  });

  test('disposing route with searchEntry should fire navigation-searchable-route-update event', () => {
    const disposable = navigationManager.registerRoute({
      routeId: 'route-with-search',
      commandId: 'some-command',
      searchEntry: { label: 'My Route' },
    });

    vi.mocked(apiSender.send).mockClear();
    disposable.dispose();

    expect(apiSender.send).toHaveBeenCalledWith('navigation-searchable-route-update');
  });

  test('disposing route without searchEntry should not fire navigation-searchable-route-update event', () => {
    const disposable = navigationManager.registerRoute({
      routeId: 'route-without-search',
      commandId: 'some-command',
    });

    vi.mocked(apiSender.send).mockClear();
    disposable.dispose();

    expect(apiSender.send).not.toHaveBeenCalledWith('navigation-searchable-route-update');
  });
});

describe('getSearchableRoutes', () => {
  test('should return empty array when no routes registered', () => {
    expect(navigationManager.getSearchableRoutes()).toEqual([]);
  });

  test('should return only routes with searchEntry', () => {
    navigationManager.registerRoute({
      routeId: 'route-1',
      commandId: 'cmd-1',
      searchEntry: { label: 'Dashboard' },
    });
    navigationManager.registerRoute({
      routeId: 'route-2',
      commandId: 'cmd-2',
    });
    navigationManager.registerRoute({
      routeId: 'route-3',
      commandId: 'cmd-3',
      searchEntry: { label: 'Models', icon: 'icon.png' },
    });

    const results = navigationManager.getSearchableRoutes();

    expect(results).toHaveLength(2);
    expect(results).toEqual([
      { routeId: 'route-1', label: 'Dashboard', icon: undefined },
      { routeId: 'route-3', label: 'Models', icon: 'icon.png' },
    ]);
  });

  test('should not include disposed routes', () => {
    const disposable = navigationManager.registerRoute({
      routeId: 'route-1',
      commandId: 'cmd-1',
      searchEntry: { label: 'Dashboard' },
    });

    expect(navigationManager.getSearchableRoutes()).toHaveLength(1);

    disposable.dispose();

    expect(navigationManager.getSearchableRoutes()).toHaveLength(0);
  });

  test('should include icon with light and dark variants', () => {
    navigationManager.registerRoute({
      routeId: 'route-themed',
      commandId: 'cmd-themed',
      searchEntry: { label: 'Themed', icon: { light: 'light.png', dark: 'dark.png' } },
    });

    const results = navigationManager.getSearchableRoutes();

    expect(results).toEqual([
      { routeId: 'route-themed', label: 'Themed', icon: { light: 'light.png', dark: 'dark.png' } },
    ]);
  });
});

test('check navigateToCreateProviderConnection', async () => {
  vi.mocked(providerRegistry.getMatchingProviderInternalId).mockReturnValue('anInternalId');

  await navigationManager.navigateToCreateProviderConnection('my.extension');

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.CREATE_PROVIDER_CONNECTION,
    parameters: {
      provider: 'anInternalId',
    },
  });
});

test('check navigateToExtensionsCatalog', async () => {
  await navigationManager.navigateToExtensionsCatalog({ searchTerm: 'not:installed category:foo keyword:bar' });

  expect(apiSender.send).toHaveBeenCalledWith('navigate', {
    page: NavigationPage.EXTENSIONS_CATALOG,
    parameters: {
      searchTerm: 'not:installed category:foo keyword:bar',
    },
  });
});

describe('register navigation commands', () => {
  beforeEach(() => {
    navigationManager.init();
  });

  test('should register the navigation.goBack command', () => {
    expect(commandRegistry.registerCommand).toBeCalledWith('navigation.goBack', expect.anything());
  });

  test('should register the navigation.goForward command', () => {
    expect(commandRegistry.registerCommand).toBeCalledWith('navigation.goForward', expect.anything());
  });

  test('should register the navigateToResources command', () => {
    expect(commandRegistry.registerCommand).toBeCalledWith('navigateToResources', expect.anything());
  });

  test('should register navigation commands in command palette', () => {
    expect(commandRegistry.registerCommandPalette).toBeCalledWith(
      expect.objectContaining({ command: 'navigation.goBack', title: 'Go Back', category: 'Navigation' }),
      expect.objectContaining({ command: 'navigation.goForward', title: 'Go Forward', category: 'Navigation' }),
    );
  });
});

describe('pushHistoryEntry', () => {
  test('sends the navigation-history-push payload', () => {
    navigationManager.pushHistoryEntry('my.extension', {
      id: 'entry-1',
      label: 'Entry 1',
    });

    expect(apiSender.send).toHaveBeenCalledWith('navigation-history-push', {
      extensionId: 'my.extension',
      id: 'entry-1',
      label: 'Entry 1',
    });
  });
});

describe('onDidNavigateToHistoryEntry / navigateToHistoryEntry', () => {
  test('a registered listener is called with a NavigateToHistoryEvent when the extension navigates back to it', () => {
    const listener = vi.fn();
    navigationManager.onDidNavigateToHistoryEntry('extensionA', listener);

    navigationManager.navigateToHistoryEntry('extensionA', 'entry-1');

    expect(listener).toHaveBeenCalledWith({ id: 'entry-1' });
  });

  test('two extensions with the same entry id do not cross-fire', () => {
    const listenerA = vi.fn();
    const listenerB = vi.fn();
    navigationManager.onDidNavigateToHistoryEntry('extensionA', listenerA);
    navigationManager.onDidNavigateToHistoryEntry('extensionB', listenerB);

    navigationManager.navigateToHistoryEntry('extensionA', 'entry-1');

    expect(listenerA).toHaveBeenCalledWith({ id: 'entry-1' });
    expect(listenerB).not.toHaveBeenCalled();
  });

  test('is a safe no-op when no listener is registered for the extension', () => {
    expect(() => navigationManager.navigateToHistoryEntry('unknown.extension', 'entry-1')).not.toThrow();
  });
});

describe('dispose', () => {
  test('clears the history emitters so previously registered listeners no longer fire', () => {
    const listener = vi.fn();
    navigationManager.onDidNavigateToHistoryEntry('extensionA', listener);

    navigationManager.dispose();

    navigationManager.navigateToHistoryEntry('extensionA', 'entry-1');

    expect(listener).not.toHaveBeenCalled();
  });

  test('disposes the disposables registered during init', () => {
    const commandDisposeFn = vi.fn();
    vi.mocked(commandRegistry.registerCommand).mockReturnValue(Disposable.create(commandDisposeFn));
    const paletteDisposeFn = vi.fn();
    vi.mocked(commandRegistry.registerCommandPalette).mockReturnValue(Disposable.create(paletteDisposeFn));

    navigationManager.init();
    navigationManager.dispose();

    expect(commandDisposeFn).toHaveBeenCalled();
    expect(paletteDisposeFn).toHaveBeenCalled();
  });
});
