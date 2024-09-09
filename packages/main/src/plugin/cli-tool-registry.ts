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
  CliTool,
  CliToolInfo as CliToolInfoApi,
  CliToolInstaller,
  CliToolOptions,
  CliToolSelectUpdate,
  CliToolUpdate,
  Logger,
} from '@podman-desktop/api';

import type { CliToolExtensionInfo, CliToolInfo } from '/@api/cli-tool-info.js';

import type { ApiSenderType } from './api.js';
import { CliToolImpl } from './cli-tool-impl.js';
import type { Event } from './events/emitter.js';
import { Emitter } from './events/emitter.js';
import { Disposable } from './types/disposable.js';

export class CliToolRegistry {
  constructor(private apiSender: ApiSenderType) {}

  private cliTools = new Map<string, CliToolImpl>();
  private cliToolsUpdater = new Map<string, CliToolUpdate | CliToolSelectUpdate>();
  private cliToolsInstaller = new Map<string, CliToolInstaller>();

  private readonly _onDidCliToolsChange = new Emitter<void>();
  readonly onDidCliToolsChange: Event<void> = this._onDidCliToolsChange.event;

  createCliTool(extensionInfo: CliToolExtensionInfo, options: CliToolOptions): CliTool {
    const cliTool = new CliToolImpl(extensionInfo, this, options);
    this.cliTools.set(cliTool.id, cliTool);
    this.apiSender.send('cli-tool-create');
    this._onDidCliToolsChange.fire();
    cliTool.onDidUpdateVersion(() => this.apiSender.send('cli-tool-change', cliTool.id));
    cliTool.onDidUninstall(() => this.apiSender.send('cli-tool-change', cliTool.id));
    return cliTool;
  }

  registerUpdate(cliTool: CliToolImpl, updater: CliToolUpdate | CliToolSelectUpdate): Disposable {
    this.cliToolsUpdater.set(cliTool.id, updater);

    return Disposable.create(() => {
      this.cliToolsUpdater.delete(cliTool.id);
      this.apiSender.send('cli-tool-change', cliTool.id);
    });
  }

  registerInstaller(cliTool: CliToolImpl, installer: CliToolInstaller): Disposable {
    this.cliToolsInstaller.set(cliTool.id, installer);

    return Disposable.create(() => {
      this.cliToolsInstaller.delete(cliTool.id);
      this.apiSender.send('cli-tool-change', cliTool.id);
    });
  }

  async updateCliTool(id: string, logger: Logger): Promise<void> {
    const cliToolUpdater = this.cliToolsUpdater.get(id);
    if (cliToolUpdater) {
      await cliToolUpdater.doUpdate(logger);
    }
  }

  async installCliTool(id: string, logger: Logger): Promise<void> {
    const cliToolInstaller = this.cliToolsInstaller.get(id);
    if (cliToolInstaller) {
      await cliToolInstaller.doInstall(logger);
    }
  }

  async uninstallCliTool(id: string, logger: Logger): Promise<void> {
    const cliToolInstaller = this.cliToolsInstaller.get(id);
    if (cliToolInstaller) {
      await cliToolInstaller.doUninstall(logger);
      // notify the tool has been uninstalled
      this.cliTools.get(id)?.uninstall();
    }
  }

  async selectCliToolVersionToUpdate(id: string): Promise<string> {
    const cliToolUpdater = this.cliToolsUpdater.get(id);
    if (!cliToolUpdater || this.isUpdaterToPredefinedVersion(cliToolUpdater)) {
      throw new Error(`No updater registered for ${id}`);
    }
    return cliToolUpdater.selectVersion();
  }

  async selectCliToolVersionToInstall(id: string): Promise<string> {
    const cliToolInstaller = this.cliToolsInstaller.get(id);
    if (!cliToolInstaller) {
      throw new Error(`No installer registered for ${id}`);
    }
    return cliToolInstaller.selectVersion();
  }

  isUpdaterToPredefinedVersion(update: CliToolUpdate | CliToolSelectUpdate): update is CliToolUpdate {
    return (update as CliToolUpdate).version !== undefined;
  }

  disposeCliTool(cliTool: CliToolImpl): void {
    this.cliTools.delete(cliTool.id);
    this._onDidCliToolsChange.fire();
    this.cliToolsUpdater.delete(cliTool.id);
    this.cliToolsInstaller.delete(cliTool.id);
    this.apiSender.send('cli-tool-remove', cliTool.id);
  }

  getCliToolInfos(): CliToolInfo[] {
    return Array.from(this.cliTools.values()).map(cliTool => {
      const installer = this.cliToolsInstaller.get(cliTool.id);
      // if the installer has been registered and the source is different from external enable install/uninstall
      const canInstall = !!installer && cliTool.installationSource !== 'external';

      const updater = this.cliToolsUpdater.get(cliTool.id);
      // if updater is the one with a default version that the tool will use to get updated we use it
      const newVersion = updater && this.isUpdaterToPredefinedVersion(updater) ? updater.version : undefined;
      // if the cli tool has an updater registered and its binary has been installed by podman desktop, it can be updated
      const canUpdate = !!updater && cliTool.installationSource === 'extension';

      return {
        id: cliTool.id,
        name: cliTool.name,
        displayName: cliTool.displayName,
        description: cliTool.markdownDescription,
        state: cliTool.state,
        images: cliTool.images,
        extensionInfo: cliTool.extensionInfo,
        version: cliTool.version,
        path: cliTool.path,
        newVersion,
        canUpdate,
        canInstall,
      };
    });
  }

  getCliTool(id: string): CliToolInfoApi | undefined {
    const cliTool = this.cliTools.get(id);
    if (!cliTool) {
      return undefined;
    }
    return this.convertToCliToolInfo(cliTool);
  }

  getCliTools(): CliToolInfoApi[] {
    return Array.from(this.cliTools.values()).map(cliTool => {
      return this.convertToCliToolInfo(cliTool);
    });
  }

  private convertToCliToolInfo(cliTool: CliTool): CliToolInfoApi {
    return {
      id: cliTool.id,
      name: cliTool.name,
      displayName: cliTool.displayName,
      markdownDescription: cliTool.markdownDescription,
      images: cliTool.images,
      version: cliTool.version,
      extensionInfo: {
        id: cliTool.extensionInfo.id,
        label: cliTool.extensionInfo.label,
      },
    };
  }
}
