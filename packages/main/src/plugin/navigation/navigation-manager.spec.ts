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
import { beforeEach, expect, test, vi } from 'vitest';

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
  assertContributionExist(name: string): void {
    return super.assertContributionExist(name);
  }
  assertWebviewExist(webviewId: string): void {
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

beforeEach(() => {
  vi.resetAllMocks();
  navigationManager = new TestNavigationManager(
    apiSender,
    containerRegistry,
    contributionManager,
    providerRegistry,
    webviewRegistry,
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
