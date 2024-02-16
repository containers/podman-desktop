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
// based on https://github.com/microsoft/vscode/blob/cff1e8e9a755d206fb33237bb6b6337d171471f2/src/vs/platform/encryption/common/encryptionService.ts

export interface IEncryptionService extends ICommonEncryptionService {
  setUsePlainTextEncryption(): Promise<void>;
  getKeyStorageProvider(): Promise<KnownStorageProvider>;
}

export interface IEncryptionMainService extends IEncryptionService {}

export interface ICommonEncryptionService {
  encrypt(value: string): Promise<string>;

  decrypt(value: string): Promise<string>;

  isEncryptionAvailable(): Promise<boolean>;
}

// The values provided to the `password-store` command line switch.
// Notice that they are not the same as the values returned by
// `getSelectedStorageBackend` in the `safeStorage` API.
export const enum PasswordStoreCLIOption {
  kwallet = 'kwallet',
  kwallet5 = 'kwallet5',
  gnomeLibsecret = 'gnome-libsecret',
  basic = 'basic',
}

// The values returned by `getSelectedStorageBackend` in the `safeStorage` API.
export const enum KnownStorageProvider {
  unknown = 'unknown',
  basicText = 'basic_text',

  // Linux
  gnomeAny = 'gnome_any',
  gnomeLibsecret = 'gnome_libsecret',
  gnomeKeyring = 'gnome_keyring',
  kwallet = 'kwallet',
  kwallet5 = 'kwallet5',
  kwallet6 = 'kwallet6',

  // The rest of these are not returned by `getSelectedStorageBackend`
  // but these were added for platform completeness.

  // Windows
  dplib = 'dpapi',

  // macOS
  keychainAccess = 'keychain_access',
}
