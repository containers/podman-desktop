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

import { cpSync, existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { safeStorage } from 'electron';

import { type Directories } from '/@/plugin/directories.js';
import type { Event } from '/@/plugin/events/emitter.js';
import { Emitter } from '/@/plugin/events/emitter.js';
import type { NotificationCardOptions } from '/@api/notification.js';

/**
 * Manage the storage of string being encrypted on disk
 * It's only converted to readable content when getting the value
 */
export class SafeStorageRegistry {
  readonly #directories: Directories;

  #extensionStorage: SafeStorage | undefined;

  constructor(directories: Directories) {
    this.#directories = directories;
  }

  protected getSafeStorageDataPath(): string {
    // create directory if it does not exist
    return path.resolve(this.#directories.getSafeStorageDirectory(), 'data.json');
  }

  // initialize the safe storage
  public async init(): Promise<NotificationCardOptions[]> {
    const notifications: NotificationCardOptions[] = [];
    const safeStoragePath = this.getSafeStorageDataPath();

    const parentDirectory = path.dirname(safeStoragePath);
    if (!existsSync(parentDirectory)) {
      await mkdir(parentDirectory, { recursive: true });
    }
    if (!existsSync(safeStoragePath)) {
      await writeFile(safeStoragePath, JSON.stringify({}), 'utf-8');
    }

    // read the file and create a SafeStorage object
    const content = await readFile(safeStoragePath, 'utf-8');
    let data: { [key: string]: string };
    try {
      data = JSON.parse(content);
    } catch (error) {
      console.error(`Unable to parse ${safeStoragePath} file`, error);

      const backupFilename = `${safeStoragePath}.backup-${Date.now()}`;
      // keep original file as a backup
      cpSync(safeStoragePath, backupFilename);

      // append notification for the user
      notifications.push({
        title: 'Corrupted secure storage',
        body: `Secure storage located at ${safeStoragePath} was invalid. Created a copy at '${backupFilename}' and started with empty storage.`,
        extensionId: 'core',
        type: 'warn',
        highlight: true,
        silent: true,
      });
      data = {};
    }
    this.#extensionStorage = new SafeStorage(data);

    // in case of an update, persists the new data to the file
    this.#extensionStorage.onDidChange(async () => {
      await writeFile(safeStoragePath, JSON.stringify(data), 'utf-8');
    });
    return notifications;
  }

  getExtensionStorage(extensionId: string): ExtensionSecretStorage {
    if (!this.#extensionStorage) {
      throw new Error('Safe storage not initialized');
    }
    return new ExtensionSecretStorage(this.#extensionStorage, extensionId);
  }
}

export interface SecretStorageChangeEvent {
  readonly key: string;
}

export class SafeStorage {
  readonly #onDidChange = new Emitter<SecretStorageChangeEvent>();
  readonly onDidChange: Event<SecretStorageChangeEvent> = this.#onDidChange.event;

  encrypt(value: string): string {
    return safeStorage.encryptString(value).toString('base64');
  }

  decrypt(value: string): string {
    return safeStorage.decryptString(Buffer.from(value, 'base64'));
  }

  // create Map of key value pairs
  // key is the secret name
  // value is the secret value
  readonly #data: { [key: string]: string };

  constructor(data: { [key: string]: string }) {
    this.#data = data;
  }

  getDecrypted(key: string): string | undefined {
    const value = this.#data[key];
    if (value) {
      return this.decrypt(value);
    }
  }

  set(key: string, value: string): void {
    this.#data[key] = this.encrypt(value);
    this.#onDidChange.fire({ key });
  }

  delete(key: string): void {
    delete this.#data[key];
    this.#onDidChange.fire({ key });
  }
}

export class ExtensionSecretStorage {
  readonly #onDidChange = new Emitter<SecretStorageChangeEvent>();
  readonly onDidChange: Event<SecretStorageChangeEvent> = this.#onDidChange.event;

  readonly #storage: SafeStorage;
  readonly #extensionId: string;

  constructor(storage: SafeStorage, extensionId: string) {
    this.#storage = storage;
    this.#extensionId = extensionId;
  }

  async get(key: string): Promise<string | undefined> {
    return this.#storage.getDecrypted(`${this.#extensionId}.${key}`);
  }

  async store(key: string, value: string): Promise<void> {
    this.#storage.set(`${this.#extensionId}.${key}`, value);
    this.#onDidChange.fire({ key });
  }

  async delete(key: string): Promise<void> {
    this.#storage.delete(`${this.#extensionId}.${key}`);
    this.#onDidChange.fire({ key });
  }
}
