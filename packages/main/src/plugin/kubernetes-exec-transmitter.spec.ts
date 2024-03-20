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

import { expect, test } from 'vitest';

import type { TerminalSize } from '/@/plugin/kubernetes-exec-transmitter.js';
import {
  BufferedStreamWriter,
  DEFAULT_COLUMNS,
  DEFAULT_ROWS,
  ResizableTerminalWriter,
  StringLineReader,
} from '/@/plugin/kubernetes-exec-transmitter.js';

test('Test should verify string line reader', () => {
  const reader = new StringLineReader();

  reader.on('data', chunk => {
    expect(chunk.toString()).toEqual('foo');
  });

  reader.push('foo');
});

test('Test should verify buffered stream writer', () => {
  const writer = new BufferedStreamWriter((data: Buffer) => {
    expect(data.toString()).toEqual('foo');
  });

  writer.write(Buffer.from('foo'));
});

test('Test should verify resizable terminal writer', () => {
  const writer = new ResizableTerminalWriter(
    new BufferedStreamWriter((data: Buffer) => {
      expect(data.toString()).toEqual('foo');
    }),
  );

  writer.on('resize', () => {
    const dimension = writer.getDimension();
    expect(dimension).toEqual({ width: 1, height: 1 } as TerminalSize);
  });

  writer.write(Buffer.from('foo'));

  expect(writer.getDimension()).toEqual({ width: DEFAULT_COLUMNS, height: DEFAULT_ROWS } as TerminalSize);
  writer.resize({ width: 1, height: 1 } as TerminalSize);
  expect(writer.getDimension()).toEqual({ width: 1, height: 1 } as TerminalSize);
});
