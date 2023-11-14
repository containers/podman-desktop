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

import { beforeEach, test, expect, vi, suite } from 'vitest';
import { ExtensionLoader } from './extension-loader.js';
import type { Exec } from './util/exec.js';
import type { ApiSenderType } from './api.js';
import type { AuthenticationImpl } from './authentication.js';
import type { CliToolRegistry } from './cli-tool-registry.js';
import type { CommandRegistry } from './command-registry.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import type { CustomPickRegistry } from './custompick/custompick-registry.js';
import type { Directories } from './directories.js';
import type { FilesystemMonitoring } from './filesystem-monitoring.js';
import type { IconRegistry } from './icon-registry.js';
import type { ImageRegistry } from './image-registry.js';
import type { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import type { KubeGeneratorRegistry } from './kube-generator-registry.js';
import type { KubernetesClient } from './kubernetes-client.js';
import type { MenuRegistry } from './menu-registry.js';
import type { MessageBox } from './message-box.js';
import type { OnboardingRegistry } from './onboarding-registry.js';
import type { ProgressImpl } from './progress-impl.js';
import type { ProviderRegistry } from './provider-registry.js';
import type { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';
import type { TrayMenuRegistry } from './tray-menu-registry.js';
import type { ViewRegistry } from './view-registry.js';
import type { Context } from './context/context.js';
import type { Proxy } from './proxy.js';
import { afterEach } from 'node:test';
import type { CancellationToken, ImageChecks, ImageInfo, ProviderResult } from '@podman-desktop/api';
import type { NotificationRegistry } from './notification-registry.js';
import { ImageCheckerImpl } from './image-checker.js';

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
} as unknown as Directories;

let imageChecker: ImageCheckerImpl;
suite('image checker module', () => {
  let extLoader: ExtensionLoader;
  beforeEach(() => {
    imageChecker = new ImageCheckerImpl(apiSender);
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
      vi.fn() as unknown as StatusBarRegistry,
      vi.fn() as unknown as KubernetesClient,
      vi.fn() as unknown as FilesystemMonitoring,
      vi.fn() as unknown as Proxy,
      vi.fn() as unknown as ContainerProviderRegistry,
      vi.fn() as unknown as InputQuickPickRegistry,
      vi.fn() as unknown as CustomPickRegistry,
      vi.fn() as unknown as AuthenticationImpl,
      vi.fn() as unknown as IconRegistry,
      vi.fn() as unknown as OnboardingRegistry,
      vi.fn() as unknown as Telemetry,
      vi.fn() as unknown as ViewRegistry,
      vi.fn() as unknown as Context,
      directories,
      vi.fn() as unknown as Exec,
      vi.fn() as unknown as KubeGeneratorRegistry,
      vi.fn() as unknown as CliToolRegistry,
      vi.fn() as unknown as NotificationRegistry,
      imageChecker,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  const extManifest = {
    publisher: 'ext-publisher',
    name: 'ext-name',
    displayName: 'ext-display-name',
    version: 'ext-version',
  };
  suite('create ImageChecker', () => {
    test('creates Imagechecker instance', () => {
      const api = extLoader.createApi('/path', extManifest);
      const provider1 = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const provider2 = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const metadata1 = {
        label: 'Provider label',
      };
      api.imageChecker.registerImageCheckerProvider(provider1, metadata1);
      api.imageChecker.registerImageCheckerProvider(provider2);
      const providers = imageChecker.getImageCheckerProviders();
      expect(providers.length).toBe(2);

      expect(providers[0].id).equals(`${extManifest.publisher}.${extManifest.name}-0`);
      expect(providers[0].label).equals('Provider label');

      expect(providers[1].id).equals(`${extManifest.publisher}.${extManifest.name}-1`);
      expect(providers[1].label).equals(`${extManifest.displayName}`);
    });

    test('Image checker sends "image-checker-provider-update" event when new provider is added', () => {
      const api = extLoader.createApi('/path', extManifest);
      const provider = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      api.imageChecker.registerImageCheckerProvider(provider);
      expect(apiSender.send).toBeCalledWith('image-checker-provider-update', {
        id: `${extManifest.publisher}.${extManifest.name}-0`,
      });
    });

    test('sends "image-checker-provider-remove" event when provider is disposed', () => {
      const api = extLoader.createApi('/path', extManifest);
      const provider = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const dispo = api.imageChecker.registerImageCheckerProvider(provider);
      dispo.dispose();
      expect(apiSender.send).toBeCalledWith('image-checker-provider-remove', {
        id: `${extManifest.publisher}.${extManifest.name}-0`,
      });
    });

    test('removes image checker from the registry when disposed', () => {
      const api = extLoader.createApi('/path', extManifest);
      const provider1 = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const provider2 = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return { checks: [] };
        },
      };
      const metadata1 = {
        label: 'Provider label',
      };
      const dispo1 = api.imageChecker.registerImageCheckerProvider(provider1, metadata1);
      api.imageChecker.registerImageCheckerProvider(provider2);
      const providers = imageChecker.getImageCheckerProviders();
      expect(providers.length).toBe(2);
      dispo1.dispose();
      const providersAfterDispose = imageChecker.getImageCheckerProviders();
      expect(providersAfterDispose.length).toBe(1);
    });

    test('calls check method', async () => {
      const api = extLoader.createApi('/path', extManifest);
      const provider = {
        check: (_image: ImageInfo, _token?: CancellationToken): ProviderResult<ImageChecks> => {
          return {
            checks: [
              {
                name: 'check1',
                status: 'failed',
              },
            ],
          };
        },
      };
      api.imageChecker.registerImageCheckerProvider(provider);
      const providers = imageChecker.getImageCheckerProviders();
      expect(providers.length).toBe(1);
      const imageInfo: ImageInfo = {
        engineId: 'eng-id',
        engineName: 'eng-name',
        Id: 'id',
        ParentId: 'parent-id',
        RepoTags: undefined,
        Created: 0,
        Size: 1,
        VirtualSize: 1,
        SharedSize: 1,
        Labels: {},
        Containers: 1,
      };
      const result = await imageChecker.check(providers[0].id, imageInfo);
      expect(result).toBeDefined();
      expect(result!.checks.length).toBe(1);
      expect(result!.checks[0].name).toBe('check1');
      expect(result!.checks[0].status).toBe('failed');
    });

    test('check method throws an error if provider is unknown', async () => {
      const imageInfo: ImageInfo = {
        engineId: 'eng-id',
        engineName: 'eng-name',
        Id: 'id',
        ParentId: 'parent-id',
        RepoTags: undefined,
        Created: 0,
        Size: 1,
        VirtualSize: 1,
        SharedSize: 1,
        Labels: {},
        Containers: 1,
      };
      await expect(() => imageChecker.check('unknown-id', imageInfo)).rejects.toThrow(
        'provider not found with id unknown-id',
      );
    });
  });
});
