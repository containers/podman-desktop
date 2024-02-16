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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// based on https://github.com/microsoft/vscode/blob/cff1e8e9a755d206fb33237bb6b6337d171471f2/src/vs/platform/encryption/electron-main/encryptionMainService.ts

import { app, safeStorage } from 'electron';
import { type IEncryptionMainService, KnownStorageProvider, PasswordStoreCLIOption } from './encryptionService.js';
import { isMac, isWindows } from '/@/util.js';

export class EncryptionMainService implements IEncryptionMainService {
  constructor() {
    // if this commandLine switch is set, the user has opted in to using basic text encryption
    if (app.commandLine.getSwitchValue('password-store') === PasswordStoreCLIOption.basic) {
      safeStorage.setUsePlainTextEncryption?.(true);
    }
  }

  async encrypt(value: string): Promise<string> {
    try {
      return JSON.stringify(safeStorage.encryptString(value));
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  async decrypt(value: string): Promise<string> {
    let parsedValue: { data: string };
    try {
      parsedValue = JSON.parse(value);
      if (!parsedValue.data) {
        throw new Error(`[EncryptionMainService] Invalid encrypted value: ${value}`);
      }
      const bufferToDecrypt = Buffer.from(parsedValue.data);
      return safeStorage.decryptString(bufferToDecrypt);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  isEncryptionAvailable(): Promise<boolean> {
    return Promise.resolve(safeStorage.isEncryptionAvailable());
  }

  getKeyStorageProvider(): Promise<KnownStorageProvider> {
    if (isWindows()) {
      return Promise.resolve(KnownStorageProvider.dplib);
    }
    if (isMac()) {
      return Promise.resolve(KnownStorageProvider.keychainAccess);
    }
    if (safeStorage.getSelectedStorageBackend) {
      try {
        const result = safeStorage.getSelectedStorageBackend() as KnownStorageProvider;
        return Promise.resolve(result);
      } catch (e) {
        console.error(e);
      }
    }
    return Promise.resolve(KnownStorageProvider.unknown);
  }

  async setUsePlainTextEncryption(): Promise<void> {
    if (isWindows()) {
      throw new Error('Setting plain text encryption is not supported on Windows.');
    }

    if (isMac()) {
      throw new Error('Setting plain text encryption is not supported on macOS.');
    }

    if (!safeStorage.setUsePlainTextEncryption) {
      throw new Error('Setting plain text encryption is not supported.');
    }

    safeStorage.setUsePlainTextEncryption(true);
  }
}
