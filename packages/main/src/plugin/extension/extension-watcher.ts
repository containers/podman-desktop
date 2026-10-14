/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { Event } from '@desktop-framework/api';
import { IDisposable } from '@desktop-framework/api';
import type { FileSystemWatcher, Uri } from '@desktop-framework/extension-api';
import type { FileMatcher } from 'get-tsconfig';
import { inject, injectable } from 'inversify';

import { Emitter } from '/@/plugin/events/emitter.js';
import { FilesystemMonitoring } from '/@/plugin/filesystem-monitoring.js';

import type { AnalyzedExtension } from './extension-analyzer.js';
import type { ActivatedExtension } from './extension-loader.js';
import { ExtensionTypeScriptConfigParser } from './extension-tsconfig-parser.js';

// In charge of watching the extension and reloading it when it changes
@injectable()
export class ExtensionWatcher implements IDisposable {
  #watcherExtensions: Map<string, FileSystemWatcher>;

  #reloadExtensionTimeouts: Map<string, NodeJS.Timeout>;

  #fileSystemMonitoring: FilesystemMonitoring;

  #onNeedToReloadExtension = new Emitter<AnalyzedExtension>();
  readonly onNeedToReloadExtension: Event<AnalyzedExtension> = this.#onNeedToReloadExtension.event;

  constructor(@inject(FilesystemMonitoring) fileSystemMonitoring: FilesystemMonitoring) {
    this.#fileSystemMonitoring = fileSystemMonitoring;
    this.#watcherExtensions = new Map<string, FileSystemWatcher>();
    this.#reloadExtensionTimeouts = new Map<string, NodeJS.Timeout>();
  }

  // detected that the extension needs to be reloaded
  // we do not this immediately to avoid reloading the extension while it is still being updated
  protected reloadExtension(extension: AnalyzedExtension): void {
    // do we already have a timeout asking to reload the extension ?
    // if yes, cancel the existing one and create a new one
    if (this.#reloadExtensionTimeouts.has(extension.id)) {
      clearTimeout(this.#reloadExtensionTimeouts.get(extension.id));
    }

    // wait 1 second before trying to reload the extension
    // this is to avoid reloading the extension while it is still being updated
    const timeout = setTimeout(() => {
      this.#onNeedToReloadExtension.fire(extension);
    }, 1_000);

    this.#reloadExtensionTimeouts.set(extension.id, timeout);
  }

  protected isWatched(extension: AnalyzedExtension): boolean {
    return this.#watcherExtensions.has(extension.id);
  }

  protected async getTsConfigFileMatcher(extension: AnalyzedExtension): Promise<FileMatcher | undefined> {
    const extensionTypeScriptConfigParser = new ExtensionTypeScriptConfigParser(extension.path);
    return extensionTypeScriptConfigParser.analyze();
  }

  async monitor(extension: AnalyzedExtension): Promise<void> {
    // track only if not already tracking
    if (this.isWatched(extension)) {
      return;
    }

    // analyze all tsconfig.json files from
    const tsConfigFileMatcher = await this.getTsConfigFileMatcher(extension);

    const extensionWatcher = this.#fileSystemMonitoring.createFileSystemWatcher(extension.path);
    this.#watcherExtensions.set(extension.id, extensionWatcher);

    const callback = (event: Uri): void => {
      let isInSource = false;
      // check if it's matching the source pattern of an existing typescript config
      const hasTsConfig = tsConfigFileMatcher !== undefined;
      if (tsConfigFileMatcher) {
        const matchingJsonEvent = tsConfigFileMatcher(event.fsPath);
        isInSource = matchingJsonEvent !== undefined;
      }

      if (!hasTsConfig || !isInSource) {
        this.reloadExtension(extension);
      }
    };

    extensionWatcher.onDidCreate(event => callback(event));
    extensionWatcher.onDidDelete(event => callback(event));
    extensionWatcher.onDidChange(event => callback(event));
  }

  protected getWatcher(extension: ActivatedExtension): FileSystemWatcher | undefined {
    return this.#watcherExtensions.get(extension.id);
  }

  untrack(extension: ActivatedExtension): void {
    // dispose the watcher
    const watcher = this.getWatcher(extension);
    if (watcher) {
      watcher.dispose();
    }
    this.#watcherExtensions.delete(extension.id);
  }

  dispose(): void {
    // dispose all watchers
    for (const watcher of this.#watcherExtensions.values()) {
      watcher.dispose();
    }

    // clear all timeouts
    for (const timeout of this.#reloadExtensionTimeouts.values()) {
      clearTimeout(timeout);
    }

    // reset all map
    this.#watcherExtensions.clear();
    this.#reloadExtensionTimeouts.clear();
  }
}
