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

import type { WritableOptions } from 'node:stream';
import { Readable, Writable } from 'node:stream';

export const DEFAULT_COLUMNS: number = 80;
export const DEFAULT_ROWS: number = 60;

export interface TerminalSize {
  height: number;
  width: number;
}

export class ExecStreamWriter extends Writable {
  protected transmitter: Writable;

  constructor(transmitter: Writable, options?: WritableOptions) {
    super(options);
    this.transmitter = transmitter;
  }

  get delegate(): Writable {
    return this.transmitter;
  }

  set delegate(delegate: Writable) {
    this.transmitter = delegate;
  }

  override _write(chunk: unknown, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    this.transmitter._write(chunk, encoding, callback);
  }
}

export class ResizableTerminalWriter extends ExecStreamWriter {
  protected columns: number;
  protected rows: number;

  constructor(
    transmitter: Writable,
    terminalSize: TerminalSize = { width: DEFAULT_COLUMNS, height: DEFAULT_ROWS },
    options?: WritableOptions,
  ) {
    super(transmitter, options);
    this.columns = terminalSize.width;
    this.rows = terminalSize.height;
  }

  override _write(chunk: unknown, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    super._write(chunk, encoding, callback);
  }

  resize(terminalSize: TerminalSize): void {
    this.columns = terminalSize.width;
    this.rows = terminalSize.height;

    this.emit('resize');
  }

  getDimension(): TerminalSize {
    return {
      width: this.columns,
      height: this.rows,
    } as TerminalSize;
  }
}

export class BufferedStreamWriter extends Writable {
  private readonly transmitFn: (data: Buffer) => void;

  constructor(transmitFn: (data: Buffer) => void, options?: WritableOptions) {
    super(options);
    this.transmitFn = transmitFn;
  }

  override _write(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    this.transmitFn(chunk);
    callback();
  }
}

export class StringLineReader extends Readable {
  private dataQueue: string[] = [];
  private isReading: boolean = false;

  constructor() {
    super();
  }

  readLine(data: string): void {
    this.dataQueue.push(data);
    if (!this.isReading) {
      this.read();
    }
  }

  override _read(): void {
    this.isReading = true;
    const data = this.dataQueue.shift();

    if (data) {
      this.push(data);
    } else {
      this.isReading = false;
      this.push(undefined);
    }
  }
}
