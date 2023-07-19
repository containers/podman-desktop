/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import { test, expect, vi } from 'vitest';
import { getNormalizedDefaultNumberValue, writeToTerminal } from './Util';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

const xtermMock = {
  write: vi.fn(),
};

afterEach(() => {
  vi.resetAllMocks();
});

test('write array object', () => {
  writeToTerminal(xtermMock, ['a', 'b'], 'test');
  // no error reported
  expect(xtermMock.write).toHaveBeenNthCalledWith(1, expect.stringContaining('a'));
  expect(xtermMock.write).toHaveBeenNthCalledWith(2, expect.stringContaining('b'));
  expect(xtermMock.write).toBeCalledTimes(2);
});

test('write array of array object', () => {
  writeToTerminal(
    xtermMock,
    [
      ['a', 'b'],
      ['c', 'd'],
    ],
    'test',
  );
  // no error reported
  expect(xtermMock.write).toHaveBeenNthCalledWith(1, expect.stringContaining('a'));
  expect(xtermMock.write).toHaveBeenNthCalledWith(2, expect.stringContaining('b'));
  expect(xtermMock.write).toHaveBeenNthCalledWith(3, expect.stringContaining('c'));
  expect(xtermMock.write).toHaveBeenNthCalledWith(4, expect.stringContaining('d'));
  expect(xtermMock.write).toBeCalledTimes(4);
});

test('write array with mixed values', () => {
  writeToTerminal(xtermMock, [undefined, undefined, 'ok'], 'test');
  // no error reported
  expect(xtermMock.write).toBeCalledTimes(1);
  expect(xtermMock.write).toBeCalledWith(expect.stringContaining('ok'));
});

test('write array of array object', () => {
  writeToTerminal(xtermMock, [], 'test');
  // no error reported
  expect(xtermMock.write).not.toBeCalled();
});

test('write multiline string', () => {
  writeToTerminal(xtermMock, ['a\nb\n'], 'test');
  // no error reported
  expect(xtermMock.write).toHaveBeenNthCalledWith(1, expect.stringContaining('a'));
  expect(xtermMock.write).toHaveBeenNthCalledWith(2, expect.stringContaining('b'));
});

test('write invalid object', () => {
  writeToTerminal(xtermMock, {} as unknown as any[], 'test');
  // it should not write as xterm.write is called with a valid string
  expect(xtermMock.write).not.toBeCalled();
});

test('write undefined object', () => {
  writeToTerminal(xtermMock, undefined as unknown as any[], 'test');
  // it should not write as xterm.write is called with a valid string
  expect(xtermMock.write).not.toBeCalled();
});

test('return default if type is not number', () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my boolean property',
    id: 'myid',
    parentId: '',
    type: 'boolean',
    default: true,
  };
  const res = getNormalizedDefaultNumberValue(record);
  expect(res).equal(true);
});

test('return maximum number value if less than default number value', () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my number property',
    id: 'myid',
    parentId: '',
    type: 'number',
    default: 12,
    maximum: 10,
  };
  const res = getNormalizedDefaultNumberValue(record);
  expect(res).equal(10);
});

test('return default number value if less than maximum number value', () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my number property',
    id: 'myid',
    parentId: '',
    type: 'number',
    default: 8,
    maximum: 10,
  };
  const res = getNormalizedDefaultNumberValue(record);
  expect(res).equal(8);
});
