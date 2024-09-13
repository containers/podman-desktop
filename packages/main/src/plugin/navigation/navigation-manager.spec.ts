/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { ProviderContainerConnection } from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { CommandRegistry } from '/@/plugin/command-registry.js';
import { NavigationPage } from '/@api/navigation-page.js';
import type { WebviewInfo } from '/@api/webview-info.js';

import type { ApiSenderType } from '../api.js';
import type { ContainerProviderRegistry } from '../container-registry.js';
import type { ContributionManager } from '../contribution-manager.js';
import type { ProviderRegistry } from '../provider-registry.js';
import type { WebviewRegistry } from '../webview/webview-registry.js';
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

const containerRegistry = {} as unknown as ContainerProviderRegistry;

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
} as unknown as CommandRegistry;

beforeEach(() => {
  vi.resetAllMocks();
  navigationManager = new TestNavigationManager(
    apiSender,
    containerRegistry,
    contributionManager,
    providerRegistry,
    webviewRegistry,
    commandRegistry,
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
});
