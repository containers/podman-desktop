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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// based on https://github.com/microsoft/vscode/blob/cff1e8e9a755d206fb33237bb6b6337d171471f2/src/vs/platform/storage/common/storage.ts

import type { Event } from '/@/plugin/events/emitter.js';

export interface IStorageValueChangeEvent {
  /**
   * The `key` of the storage entry that was changed
   * or was removed.
   */
  readonly key: string;
}

export type StorageValue = string | boolean | number | undefined | null | object;

export interface IStorageEntry {
  readonly key: string;
  readonly value: StorageValue;
}

export interface IStorage {
  readonly onDidChangeSecret: Event<IStorageValueChangeEvent[]>;

  /**
   * Retrieve an element stored with the given key from storage. Use
   * the provided `defaultValue` if the element is `null` or `undefined`.
   */
  get(key: string, fallbackValue: string): string;
  get(key: string, fallbackValue?: string): string | undefined;

  /**
   * Retrieve an element stored with the given key from storage. Use
   * the provided `defaultValue` if the element is `null` or `undefined`.
   * The element will be converted to a `boolean`.
   */
  getBoolean(key: string, fallbackValue: boolean): boolean;
  getBoolean(key: string, fallbackValue?: boolean): boolean | undefined;

  /**
   * Retrieve an element stored with the given key from storage. Use
   * the provided `defaultValue` if the element is `null` or `undefined`.
   * The element will be converted to a `number` using `parseInt` with a
   * base of `10`.
   */
  getNumber(key: string, fallbackValue: number): number;
  getNumber(key: string, fallbackValue?: number): number | undefined;

  /**
   * Retrieve an element stored with the given key from storage. Use
   * the provided `defaultValue` if the element is `null` or `undefined`.
   * The element will be converted to a `object` using `JSON.parse`.
   */
  getObject<T extends object>(key: string, fallbackValue: T): T;
  getObject<T extends object>(key: string, fallbackValue?: T): T | undefined;

  /**
   * Store a value under the given key to storage. The value will be
   * converted to a `string`. Storing either `undefined` or `null` will
   * remove the entry under the key.
   */
  store(key: string, value: StorageValue): void;

  /**
   * Allows to store multiple values in a bulk operation. Events will only
   * be emitted when all values have been stored.
   */
  storeAll(entries: Array<IStorageEntry>): void;

  /**
   * Delete an element stored under the provided key from storage.
   */
  remove(key: string): void;

  /**
   * Returns all the keys used in the storage
   */
  keys(): string[];
}
