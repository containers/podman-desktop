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
import { CliToolRegistry } from './cli-tool-registry.js';
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
import type { CliToolOptions } from '@podman-desktop/api';
import type { NotificationRegistry } from './notification-registry.js';

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
} as unknown as Directories;

let cliToolRegistry: CliToolRegistry;
suite('cli module', () => {
  let extLoader: ExtensionLoader;
  beforeEach(() => {
    cliToolRegistry = new CliToolRegistry(apiSender, vi.fn() as unknown as Exec, vi.fn() as unknown as Telemetry);
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
      cliToolRegistry,
      vi.fn() as unknown as NotificationRegistry,
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
  suite('create CliTool', () => {
    test('creates CliTool instance using CliToolsOptions properties', () => {
      const api = extLoader.createApi('/path', extManifest);
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = api.cli.createCliTool(options);
      expect(newCliTool.id).equals(`${extManifest.publisher}.${extManifest.name}.${options.name}`);
      expect(newCliTool.name).equals(options.name);
      expect(newCliTool.displayName).equals(options.displayName);
      expect(newCliTool.markdownDescription).equals(options.markdownDescription);
      expect(newCliTool.images).equals(options.images);
      expect(newCliTool.state).equals('registered');
    });

    test('CLI Tool registry sends "cli-tool-create" event when new tool is created', () => {
      const api = extLoader.createApi('/path', extManifest);
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      api.cli.createCliTool(options);
      expect(apiSender.send).toBeCalledWith('cli-tool-create');
    });

    test('CLI Tool registry generates CliToolInfo array for created tools', () => {
      const api = extLoader.createApi('/path', extManifest);
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = api.cli.createCliTool(options);
      const infoList = cliToolRegistry.getCliToolInfos();
      expect(infoList.length).equals(1);
      expect(infoList[0]).toMatchObject({
        id: newCliTool.id,
        name: newCliTool.name,
        displayName: newCliTool.displayName,
        description: newCliTool.markdownDescription,
        state: newCliTool.state,
        images: newCliTool.images,
        extensionInfo: newCliTool.extensionInfo,
      });
    });
  });

  suite('dispose CliTool', () => {
    test('sends "cli-tool-remove" event when cli tool is disposed', () => {
      const api = extLoader.createApi('/path', extManifest);
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = api.cli.createCliTool(options);
      newCliTool.dispose();
      expect(apiSender.send).toBeCalledWith('cli-tool-remove', newCliTool.id);
    });

    test('removes cli tool from the registry', () => {
      const api = extLoader.createApi('/path', extManifest);
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = api.cli.createCliTool(options);
      const infoListAfterCreate = cliToolRegistry.getCliToolInfos();
      expect(infoListAfterCreate.length).equals(1);
      newCliTool.dispose();
      const infoListAfterDispose = cliToolRegistry.getCliToolInfos();
      expect(infoListAfterDispose.length).equals(0);
    });
  });
});
