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

import type { OpenDialogOptions, SaveDialogOptions, Uri as APIUri } from '@podman-desktop/api';
import type { BrowserWindow } from 'electron';
import { dialog } from 'electron';

import { Uri } from './types/uri.js';
import type { Deferred } from './util/deferred.js';

/**
 * Handle native open and save dialogs
 */
export class DialogRegistry {
  #browserWindow: BrowserWindow | undefined;

  #mainWindowDeferred: Deferred<BrowserWindow>;

  constructor(readonly mainWindowDeferred: Deferred<BrowserWindow>) {
    this.#mainWindowDeferred = mainWindowDeferred;
  }

  init(): void {
    // browser window will be initialized when promise is resolved
    this.#mainWindowDeferred.promise
      .then(browserWindow => {
        this.#browserWindow = browserWindow;
      })
      .catch((error: unknown) => {
        console.error('Error getting main window', String(error));
      });
  }

  async openDialog(options?: OpenDialogOptions, dialogId?: string): Promise<string[] | undefined> {
    if (!this.#browserWindow) {
      throw new Error('Browser window is not available');
    }

    // if no properties, use file
    let selectors = options?.selectors;
    if (!selectors || selectors.length === 0) {
      selectors = ['openFile'];
    }

    const uri = options?.defaultUri;
    let defaultPath: string | undefined;
    if (uri?.scheme === 'file') {
      // convert defaultUri into defaultPath if file
      defaultPath = uri.fsPath;
    }

    // convert options into electron dialog options
    const electronOpenDialogOptions: Electron.OpenDialogOptions = {
      filters: options?.filters,
      properties: selectors,
      defaultPath,
      title: options?.title,
      message: options?.title,
      buttonLabel: options?.openLabel,
    };

    let paths: string[] | undefined;

    const response = await dialog.showOpenDialog(this.#browserWindow, electronOpenDialogOptions);
    if (response.filePaths && !response.canceled) {
      paths = response.filePaths;
    }
    // send the response to the renderer part if dialogId is provided
    if (dialogId) {
      this.#browserWindow.webContents.send('dialog:open-save-dialog-response', dialogId, paths);
    } else {
      // return the URIs if dialogId is not provided (call from main process)
      return paths;
    }
  }

  async saveDialog(options?: SaveDialogOptions, dialogId?: string): Promise<APIUri | undefined> {
    if (!this.#browserWindow) {
      throw new Error('Browser window is not available');
    }

    // convert options into electron dialog options
    const uri = options?.defaultUri;
    let defaultPath: string | undefined;
    if (uri?.scheme === 'file') {
      // convert defaultUri into defaultPath if file
      defaultPath = uri.fsPath;
    }

    // convert options into electron dialog options
    const electronSaveDialogOptions: Electron.SaveDialogOptions = {
      filters: options?.filters,
      defaultPath,
      title: options?.title,
      message: options?.title,
      buttonLabel: options?.saveLabel,
    };

    const response = await dialog.showSaveDialog(this.#browserWindow, electronSaveDialogOptions);
    let filePath: string | undefined;
    if (response.filePath && !response.canceled) {
      filePath = response.filePath;
    }
    const fileUri = filePath ? Uri.file(filePath) : undefined;
    // send the response to the renderer part if dialogId is provided
    if (dialogId) {
      this.#browserWindow.webContents.send('dialog:open-save-dialog-response', dialogId, fileUri);
    } else {
      return fileUri;
    }
  }
}
