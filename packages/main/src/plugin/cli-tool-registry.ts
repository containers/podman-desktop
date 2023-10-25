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

import type { CliTool, CliToolOptions, CliToolState, Disposable } from '@podman-desktop/api';
import type { CliToolExtensionInfo, CliToolInfo } from './api/cli-tool-info.js';
import type { ApiSenderType } from './api.js';
import type { Telemetry } from './telemetry/telemetry.js';
import type { Exec } from './util/exec.js';
import path from 'node:path';
import { isWindows } from '../util.js';

export class CliToolImpl implements CliTool, Disposable {
  readonly id: string;
  private _state: CliToolState = 'registered';

  constructor(
    private _apiSender: ApiSenderType,
    private _exec: Exec,
    readonly extensionInfo: CliToolExtensionInfo,
    readonly registry: CliToolRegistry,
    private _options: CliToolOptions,
  ) {
    this.id = `${extensionInfo.id}.${_options.name}`;
  }

  get state() {
    return this._state;
  }

  get name() {
    return this._options.name;
  }

  get displayName() {
    return this._options.displayName;
  }

  get markdownDescription() {
    return this._options.markdownDescription;
  }

  get images() {
    return Object.freeze(this._options.images);
  }

  // getVersion will call getCliVersion which will check via running the binary with `--version` or `-v`, etc (from _options.helpCommand)
  async getVersion(): Promise<string> {
    return await getCliVersion(this._exec, this._options.name, this._options.storagePath, this._options.helpCommand);
  }

  dispose(): void {
    this.registry.disposeCliTool(this);
  }
}

export class CliToolRegistry {
  constructor(
    private apiSender: ApiSenderType,
    private exec: Exec,
    private telemetryService: Telemetry,
  ) {}

  private cliTools = new Map<string, CliToolImpl>();

  createCliTool(extensionInfo: CliToolExtensionInfo, options: CliToolOptions): CliTool {
    const cliTool = new CliToolImpl(this.apiSender, this.exec, extensionInfo, this, options);
    this.cliTools.set(cliTool.id, cliTool);
    this.apiSender.send('cli-tool-create');
    return cliTool;
  }

  disposeCliTool(cliTool: CliToolImpl): void {
    this.cliTools.delete(cliTool.id);
    this.apiSender.send('cli-tool-remove', cliTool.id);
  }

  async getCliToolInfos(): Promise<CliToolInfo[]> {
    const cliToolInfos: CliToolInfo[] = [];
    for (const cliTool of this.cliTools.values()) {
      const cliVersion = await cliTool.getVersion();
      cliToolInfos.push({
        id: cliTool.id,
        name: cliTool.name,
        displayName: cliTool.displayName,
        description: cliTool.markdownDescription,
        state: cliTool.state,
        images: cliTool.images,
        extensionInfo: cliTool.extensionInfo,
        version: cliVersion,
      });
    }
    return cliToolInfos;
  }
}

// This function will take in the exec, name and storage path of the binary.
// it will also take in the "command" that achieves getting the version of the binary as
// each tool has a different way of getting it (for example, -v, --version, version, --help, etc.)
// NOTE: We only care what's in the ~/.local/share/containers/podman-desktop/extensions-storage/ folder
// not the binary that is installed on the system (since we have the ability to install system-wide)
async function getCliVersion(exec: Exec, name: string, storagePath: string, helpCommand: string): Promise<string> {
  // Make sure we resolve if it is a Windows binary or not as well.
  const destFile = path.resolve(storagePath, 'bin', isWindows() ? name + '.exe' : name);
  try {
    const result = await exec.exec(destFile, [helpCommand]);
    return extractVersion(result.stdout);
  } catch (e) {
    // If unable to get binary, just return blank, don't bother with returning an error, just output it to console.
    console.log(`Error getting version of binary ${name}, error:`, e);
  }
  return '';
}

// Extracts a version from an output string. This is a best-effort attempt to
// extract a version from the output of a command. It is not guaranteed to
// succeed.
function extractVersion(output: string): string {
  // This regex captures:
  // - A leading "v" (optional)
  // - Major, minor, and patch numbers
  // - Optional suffixes like -alpha, -beta, -rc1, etc.
  const regex = /v?(\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?)/;
  const match = output.match(regex);
  return match ? match[1] : '';
}
