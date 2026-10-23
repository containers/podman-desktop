/*********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
 ********************************************************************/
import { promisify } from 'node:util';

import {
  commands,
  type Disposable,
  process as processAPI,
  ProgressLocation,
  TelemetryLogger,
  window,
} from '@podman-desktop/api';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';
import { parseArgsStringToArgv } from 'string-argv';
import type { Registry } from 'winreg';
import WinReg from 'winreg';

import { UNINSTALL_LEGACY_INSTALLER_COMMAND } from '/@/constants';
import { TelemetryLoggerSymbol } from '/@/inject/symbols';

// Registry key / item used by the legacy installer
export const LEGACY_PODMAN_REGISTRY_KEY = '\\SOFTWARE\\Red Hat\\Podman';
export const LEGACY_PODMAN_REGISTRY_ITEM_NAME = 'InstallDir';

// Uninstall
const UNINSTALL_REGISTRY_PATH = '\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall';
export const UNINSTALL_REGISTRY_DISPLAY_NAME_KEY = 'DisplayName';
export const UNINSTALL_REGISTRY_QUIET_UNINSTALL_STRING_KEY = 'QuietUninstallString';

/**
 * On Windows Podman migrated from a system-wide installer requiring admin privilege to
 * a msi installer that can run in user mode.
 *
 * However, the new installer will fail if it detects a previous version of podman installed with the legacy installer.
 * This class centralize the logic to deal with the legacy installer.
 */
@injectable()
export class PodmanWindowsLegacyInstaller implements Disposable {
  #disposables: Disposable[] = [];

  constructor(
    @inject(TelemetryLoggerSymbol)
    readonly telemetryLogger: TelemetryLogger,
  ) {}

  @preDestroy()
  dispose(): void {
    this.#disposables.forEach(disposable => disposable.dispose());
  }

  @postConstruct()
  init(): void {
    this.#disposables.push(commands.registerCommand(UNINSTALL_LEGACY_INSTALLER_COMMAND, this.uninstall.bind(this)));
  }

  /**
   * To detect if we have an installation of Podman made through the legacy installer, we use the
   * same logic made inside the new podman installer (https://github.com/podman-container-tools/podman/pull/27284)
   *
   * We check in {@link LEGACY_PODMAN_REGISTRY_KEY} registry the existence of {@link LEGACY_PODMAN_REGISTRY_ITEM_NAME}
   */
  async isInstalled(): Promise<boolean> {
    const legacyRegistry: Registry = new WinReg({
      hive: WinReg.HKLM,
      key: LEGACY_PODMAN_REGISTRY_KEY,
    });

    return await promisify(legacyRegistry.valueExists).bind(legacyRegistry)(LEGACY_PODMAN_REGISTRY_ITEM_NAME);
  }

  public async uninstall(): Promise<void> {
    return window.withProgress(
      {
        location: ProgressLocation.TASK_WIDGET,
        title: 'Uninstalling legacy Podman Installer',
      },
      async () => {
        const start = performance.now();
        const telemetry: Record<string, unknown> = {};

        try {
          const uninstallString = await this.getUninstallCMD();

          /**
           * The QuietUninstallString is a full command line (`"<exe>" <args>`). We parse it
           * into the executable and its arguments and invoke it directly instead of going
           * through `cmd.exe`, so every token is passed as a discrete, individually escaped
           * argument rather than relying on shell quoting.
           */
          const [executable, args] = this.parseUninstallCommand(uninstallString);
          await processAPI.exec(executable, args, {
            logger: {
              error: console.error,
              log: console.log,
              warn: console.warn,
            },
            isAdmin: true,
          });
        } catch (err: unknown) {
          console.error('Something went wrong while trying to uninstall legacy Podman Installer', err);
          telemetry['error'] = err;
          throw err;
        } finally {
          telemetry['duration'] = performance.now() - start;
          this.telemetryLogger.logUsage('podman.uninstallLegacy', telemetry);
        }
      },
    );
  }

  /**
   * Split a registry `QuietUninstallString` into its executable and arguments.
   *
   * A WiX Burn bundle always writes it as a quoted executable path (it usually contains spaces)
   * followed by whitespace-separated flags, e.g. `"<path to exe>" <flag> <flag>...`. We use the
   * `string-argv` tokenizer rather than a hand-written parser.
   *
   * @throws if no executable can be extracted (empty or whitespace-only command line).
   */
  protected parseUninstallCommand(uninstallString: string): [executable: string, args: string[]] {
    const [executable, ...args] = parseArgsStringToArgv(uninstallString);
    if (executable === undefined) {
      throw new Error('malformed uninstall command: empty command line');
    }
    return [executable, args];
  }

  /**
   * The legacy podman installer use the DisplayName `Podman` where the new one use `Podman CLI`.
   * We usually have two entries per program installed, one with a `QuietUninstallString` registered by windows
   * and the one made by the installer.
   *
   * @remarks this function will recognize the registry created by windows by checking both `DisplayName` and `QuietUninstallString`
   */
  protected async isPodmanUninstallRegistry(registry: Registry): Promise<boolean> {
    const valueExists = promisify(registry.valueExists).bind(registry);
    const exists = await valueExists(UNINSTALL_REGISTRY_DISPLAY_NAME_KEY);
    if (!exists) return false;

    const item = await promisify(registry.get).bind(registry)(UNINSTALL_REGISTRY_DISPLAY_NAME_KEY);

    if (item.value.trim().toLowerCase() !== 'podman') return false;

    return valueExists(UNINSTALL_REGISTRY_QUIET_UNINSTALL_STRING_KEY);
  }

  /**
   * We want to find the `QuietUninstallString` command for the legacy podman installer.
   * It is located inside the {@link UNINSTALL_REGISTRY_PATH} registry path
   *
   * However, windows use a unique UUID for each entry, and it is unique to each install, so we need to iterate
   * until we found the one matching the podman one (we use {@link isPodmanUninstallRegistry})
   */
  protected async getUninstallCMD(): Promise<string> {
    const uninstallRegistry: Registry = new WinReg({
      hive: WinReg.HKLM,
      key: UNINSTALL_REGISTRY_PATH,
    });

    const registries: Registry[] = await promisify(uninstallRegistry.keys).bind(uninstallRegistry)();
    for (const registry of registries) {
      if (await this.isPodmanUninstallRegistry(registry)) {
        const uninstallItem = await promisify(registry.get).bind(registry)(
          UNINSTALL_REGISTRY_QUIET_UNINSTALL_STRING_KEY,
        );
        return uninstallItem.value;
      }
    }

    throw new Error('cannot find the uninstall command for the Podman legacy installer');
  }
}
