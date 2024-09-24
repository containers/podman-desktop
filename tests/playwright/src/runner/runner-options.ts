/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

export class RunnerOptions {
  public readonly _profile: string;
  public readonly _customFolder: string;
  public readonly _openDevTools: string;
  public readonly _autoUpdate: boolean;
  public readonly _autoCheckUpdates: boolean;
  public readonly _extensionsDisabled: string[];
  public readonly _aiLabModelUploadDisabled: boolean;
  public readonly _binaryPath: string | undefined;
  public readonly _customSettings: { [key: string]: unknown } = {};

  constructor({
    profile = '',
    customFolder = 'podman-desktop',
    openDevTools = 'none',
    autoUpdate = true,
    autoCheckUpdates = true,
    extensionsDisabled = [],
    aiLabModelUploadDisabled = false,
    binaryPath = undefined,
    customSettings = {},
  }: {
    profile?: string;
    customFolder?: string;
    openDevTools?: string;
    autoUpdate?: boolean;
    autoCheckUpdates?: boolean;
    extensionsDisabled?: string[];
    aiLabModelUploadDisabled?: boolean;
    binaryPath?: string;
    customSettings?: { [key: string]: unknown };
  } = {}) {
    this._profile = profile;
    this._customFolder = customFolder;
    this._openDevTools = openDevTools;
    this._autoUpdate = autoUpdate;
    this._autoCheckUpdates = autoCheckUpdates;
    this._extensionsDisabled = extensionsDisabled;
    this._aiLabModelUploadDisabled = aiLabModelUploadDisabled;
    this._binaryPath = binaryPath;
    this._customSettings = customSettings;
  }

  public createSettingsJson(): string {
    console.log(`Binary path: ${this._binaryPath}`);

    if (this._binaryPath) {
      return JSON.stringify({
        'preferences.OpenDevTools': this._openDevTools,
        'extensions.autoUpdate': this._autoUpdate,
        'extensions.autoCheckUpdates': this._autoCheckUpdates,
        'extensions.disabled': this._extensionsDisabled,
        'ai-lab.modelUploadDisabled': this._aiLabModelUploadDisabled,
        'podman.binary.path': this._binaryPath,
        ...this._customSettings,
      });
    }

    return JSON.stringify({
      'preferences.OpenDevTools': this._openDevTools,
      'extensions.autoUpdate': this._autoUpdate,
      'extensions.autoCheckUpdates': this._autoCheckUpdates,
      'extensions.disabled': this._extensionsDisabled,
      'ai-lab.modelUploadDisabled': this._aiLabModelUploadDisabled,
      ...this._customSettings,
    });
  }
}
