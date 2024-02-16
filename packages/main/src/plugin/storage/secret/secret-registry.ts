/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import { Emitter, type Event } from '../../events/emitter.js';
import type {
  IStorageEntry,
  IStorageService,
  IStorageValueChangeEvent,
  StorageValue,
} from '/@/plugin/storage/storage.js';
import type { Directories } from '/@/plugin/directories.js';
import path from 'path';
import * as fs from 'node:fs';
import type { NotificationCardOptions } from '/@/plugin/api/notification.js';
import type { IEncryptionService } from '/@/plugin/storage/encryption/encryptionService.js';

// Type guard functions for commonly used types
const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isObject = (value: unknown): value is object => typeof value === 'object';

export class SecretStorage implements IStorageService {
  private readonly _onDidChangeSecret = new Emitter<IStorageValueChangeEvent[]>();
  readonly onDidChangeSecret: Event<IStorageValueChangeEvent[]> = this._onDidChangeSecret.event;

  readonly #secretsValues: Map<string, StorageValue>;

  constructor(
    private directories: Directories,
    private encryptionService: IEncryptionService,
  ) {
    this.#secretsValues = new Map();
  }

  protected getSecretsFile(): string {
    return path.resolve(this.directories.getConfigurationDirectory(), 'secrets.json');
  }

  protected async load(content: unknown): Promise<void> {
    if (!content || typeof content !== 'object') throw new Error(`${this.getSecretsFile()} is not formatted properly.`);

    const entries = Object.entries(content);
    for (const [key, value] of entries) {
      if (typeof value !== 'string') throw new Error(`malformed value for property ${key}. Only string are supported`);

      try {
        const decryptedKey = await this.encryptionService.decrypt(key);
        const decryptedValue = await this.encryptionService.decrypt(value);
        this.#secretsValues.set(decryptedKey, JSON.parse(decryptedValue));
      } catch (err: unknown) {
        console.error(`something went wrong while trying to decrypt property ${key}`);
        throw err;
      }
    }
  }

  async save(): Promise<void> {
    const output: Record<string, string> = {};
    const entries = Array.from(this.#secretsValues.entries());
    for (const [key, value] of entries) {
      const cryptedKey = await this.encryptionService.encrypt(key);
      const cryptedValue = await this.encryptionService.encrypt(JSON.stringify(value));
      output[cryptedKey] = cryptedValue;
    }
    fs.writeFileSync(this.getSecretsFile(), JSON.stringify(output));
  }

  public async init(): Promise<NotificationCardOptions[]> {
    const notifications: NotificationCardOptions[] = [];

    const secretsFile = this.getSecretsFile();
    const parentDirectory = path.dirname(secretsFile);
    if (!fs.existsSync(parentDirectory)) {
      // create directory if it does not exist
      fs.mkdirSync(parentDirectory, { recursive: true });
    }
    if (!fs.existsSync(secretsFile)) {
      fs.writeFileSync(secretsFile, JSON.stringify({}));
    }

    const secretsRawContent = fs.readFileSync(secretsFile, 'utf-8');
    let configData: unknown;
    try {
      configData = JSON.parse(secretsRawContent);
      await this.load(configData);
    } catch (error) {
      console.error(`Unable to parse ${secretsFile} file`, error);

      const backupFilename = `${secretsFile}.backup-${Date.now()}`;
      // keep original file as a backup
      fs.cpSync(secretsFile, backupFilename);

      // append notification for the user
      notifications.push({
        title: 'Corrupted secret file',
        body: `Secret file located at ${secretsFile} was invalid. Created a copy at '${backupFilename}' and started with default settings.`,
        extensionId: 'core',
        type: 'warn',
        highlight: true,
        silent: true,
      });
    }

    return notifications;
  }

  protected getAs<T>(key: string, typeGuard: (value: unknown) => value is T, fallbackValue?: T): T | undefined {
    const value = this.#secretsValues.get(key);
    if (!value) return fallbackValue;
    if (!typeGuard(value)) throw new Error(`wrong value type`);
    return value;
  }

  get(key: string, fallbackValue: string): string;
  get(key: string, fallbackValue?: string | undefined): string | undefined;

  get(key: string, fallbackValue?: string): string | undefined {
    return this.getAs<string>(key, isString, fallbackValue);
  }

  getBoolean(key: string, fallbackValue: boolean): boolean;
  getBoolean(key: string, fallbackValue?: boolean | undefined): boolean | undefined;
  getBoolean(key: string, fallbackValue?: boolean): boolean | undefined {
    return this.getAs<boolean>(key, isBoolean, fallbackValue);
  }

  getNumber(key: string, fallbackValue: number): number;
  getNumber(key: string, fallbackValue?: number | undefined): number | undefined;
  getNumber(key: string, fallbackValue?: number): number | undefined {
    return this.getAs<number>(key, isNumber, fallbackValue);
  }

  getObject<T extends object>(key: string, fallbackValue: T): T;
  getObject<T extends object>(key: string, fallbackValue?: T | undefined): T | undefined;
  getObject<T extends object>(key: string, fallbackValue?: T): T | undefined {
    return this.getAs<object>(key, isObject, fallbackValue) as T;
  }
  store(key: string, value: StorageValue): void {
    this.storeAll([{ key, value }]);
  }
  storeAll(entries: IStorageEntry[]): void {
    entries.forEach(entry => this.#secretsValues.set(entry.key, entry.value));
    this._onDidChangeSecret.fire(entries.map(entry => ({ key: entry.key })));
  }
  remove(key: string): void {
    this.#secretsValues.delete(key);
    this._onDidChangeSecret.fire([{ key: key }]);
  }
  keys(): string[] {
    return Array.from(this.#secretsValues.keys());
  }
}
