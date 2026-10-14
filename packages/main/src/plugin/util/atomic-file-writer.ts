/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { randomUUID } from 'node:crypto';
import { rename, writeFile } from 'node:fs/promises';

import type { IAsyncDisposable } from '@desktop-framework/api';

/**
 * Serializes writes to a single file using an atomic write pattern:
 * data is written to a unique temporary file, then renamed into place.
 * This prevents data loss from concurrent writes or mid-write crashes.
 */
export class AtomicFileWriter implements IAsyncDisposable {
  readonly #filePath: string;
  readonly #getData: () => string;
  readonly #encoding: BufferEncoding;
  #writeChain: Promise<void> = Promise.resolve();

  /**
   * @param filePath - target file path
   * @param getData - called at write time to get the current content to persist
   * @param encoding - file encoding (defaults to 'utf-8')
   */
  constructor(filePath: string, getData: () => string, encoding: BufferEncoding = 'utf-8') {
    this.#filePath = filePath;
    this.#getData = getData;
    this.#encoding = encoding;
  }

  /**
   * Enqueue a write. Writes are serialized: each completes before the next starts.
   * Errors are logged but do not break the chain.
   */
  schedule(): void {
    this.#writeChain = this.#writeChain
      .then(async () => {
        const tmpPath = `${this.#filePath}.tmp-${randomUUID()}`;
        await writeFile(tmpPath, this.#getData(), this.#encoding);
        await rename(tmpPath, this.#filePath);
      })
      .catch(error => {
        console.error(`Unable to persist ${this.#filePath}`, error);
      });
  }

  /** Wait for all pending writes to complete. */
  async flush(): Promise<void> {
    await this.#writeChain;
  }

  async asyncDispose(): Promise<void> {
    await this.flush();
  }
}
