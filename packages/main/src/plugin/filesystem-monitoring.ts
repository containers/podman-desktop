/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type * as containerDesktopAPI from '@podman-desktop/api';
import * as chokidar from 'chokidar';

import { Emitter } from './events/emitter.js';
import { Disposable } from './types/disposable.js';
import { Uri } from './types/uri.js';

export class FileSystemWatcherImpl implements containerDesktopAPI.FileSystemWatcher {
  constructor(path: string) {
    // needs to call chokidar
    const watcher = chokidar.watch(path, {
      persistent: true,
    });

    watcher.on('add', (addedPath: string) => {
      const uri: containerDesktopAPI.Uri = Uri.file(addedPath);
      this._onDidCreate.fire(uri);
    });

    watcher.on('change', (addedPath: string) => {
      const uri: containerDesktopAPI.Uri = Uri.file(addedPath);
      this._onDidChange.fire(uri);
    });

    watcher.on('unlink', (addedPath: string) => {
      const uri: containerDesktopAPI.Uri = Uri.file(addedPath);
      this._onDidDelete.fire(uri);
    });

    this._disposable = Disposable.from(this._onDidCreate, this._onDidChange, this._onDidDelete);
  }

  private _disposable: containerDesktopAPI.Disposable;
  private readonly _onDidChange = new Emitter<containerDesktopAPI.Uri>();
  private readonly _onDidCreate = new Emitter<containerDesktopAPI.Uri>();
  private readonly _onDidDelete = new Emitter<containerDesktopAPI.Uri>();

  readonly onDidChange: containerDesktopAPI.Event<containerDesktopAPI.Uri> = this._onDidChange.event;
  readonly onDidCreate: containerDesktopAPI.Event<containerDesktopAPI.Uri> = this._onDidCreate.event;
  readonly onDidDelete: containerDesktopAPI.Event<containerDesktopAPI.Uri> = this._onDidDelete.event;

  dispose(): void {
    this._disposable.dispose();
  }
}

export class FilesystemMonitoring {
  createFileSystemWatcher(path: string): containerDesktopAPI.FileSystemWatcher {
    return new FileSystemWatcherImpl(path);
  }
}
