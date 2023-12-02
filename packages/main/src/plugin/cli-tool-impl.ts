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
  CliToolOptions,
  CliToolState,
  CliToolUpdate,
  CliToolUpdateOptions,
  Disposable,
  Event,
} from '@podman-desktop/api';
import type { CliToolExtensionInfo } from './api/cli-tool-info.js';
import type { ApiSenderType } from './api.js';
import type { Exec } from './util/exec.js';
import { Emitter } from './events/emitter.js';
import type { CliToolRegistry } from './cli-tool-registry.js';

export class CliToolImpl implements CliTool, Disposable {
  readonly id: string;
  private _state: CliToolState = 'registered';
  private readonly _onDidUpdateVersion = new Emitter<string>();
  readonly onDidUpdateVersion: Event<string> = this._onDidUpdateVersion.event;

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

  get version() {
    return this._options.version;
  }

  get path() {
    return this._options.path;
  }

  get images() {
    return Object.freeze(this._options.images);
  }

  dispose(): void {
    this.registry.disposeCliTool(this);
  }

  updateVersion(options: CliToolUpdateOptions): void {
    this._options = {
      name: this._options.name,
      displayName: options.displayName ?? this._options.displayName,
      images: options.images ?? this._options.images,
      markdownDescription: options.markdownDescription ?? this._options.markdownDescription,
      path: options.path ?? this._options.path,
      version: options.version,
    };
    this._onDidUpdateVersion.fire(options.version);
  }

  registerUpdate(update: CliToolUpdate): Disposable {
    return this.registry.registerUpdate(this, update);
  }
}
