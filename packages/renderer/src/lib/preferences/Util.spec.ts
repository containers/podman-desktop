/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { Terminal } from '@xterm/xterm';
import { afterEach, describe, expect, test, vi } from 'vitest';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { ContextUI } from '../context/context';
import {
  calcHalfCpuCores,
  getNormalizedDefaultNumberValue,
  isPropertyValidInContext,
  isTargetScope,
  uncertainStringToNumber,
  validateProxyAddress,
  writeToTerminal,
} from './Util';

const xtermMock = {
  write: vi.fn(),
} as unknown as Terminal;

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

test('write empty array of array object should not call write', () => {
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
  writeToTerminal(xtermMock, {} as unknown, 'test');
  // it should not write as xterm.write is called with a valid string
  expect(xtermMock.write).not.toBeCalled();
});

test('write undefined object', () => {
  writeToTerminal(xtermMock, undefined, 'test');
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

test('return false if scope is undefined and targetScope is defined', () => {
  const result = isTargetScope('DEFAULT');
  expect(result).toBe(false);
});

test('return false if scope is an array and targetScope is not contained in it', () => {
  const result = isTargetScope('DEFAULT', ['Onboarding']);
  expect(result).toBe(false);
});

test('return false if scope is a string and it is different from targetScope', () => {
  const result = isTargetScope('DEFAULT', 'Onboarding');
  expect(result).toBe(false);
});

test('return true if scope is an array and targetScope is contained in it', () => {
  const result = isTargetScope('DEFAULT', ['scope', 'DEFAULT']);
  expect(result).toBe(true);
});

test('return true if scope is a string and it is equal to targetScope', () => {
  const result = isTargetScope('DEFAULT', 'DEFAULT');
  expect(result).toBe(true);
});

test('test isPropertyValidInContext returns true if when is undefined', () => {
  const contextMock = new ContextUI();
  const result = isPropertyValidInContext(undefined, contextMock);
  expect(result).toBe(true);
});

test('test isPropertyValidInContext returns false if when is defined but context is empty / undefined', () => {
  const result = isPropertyValidInContext('config.test', new ContextUI());
  expect(result).toBe(false);
});

test('test isPropertyValidInContext with valid when statements', () => {
  const contextMock = new ContextUI();
  contextMock.setValue('config.test', false);

  // Test with single when statements
  expect(isPropertyValidInContext('config.test', contextMock)).toBe(false);
  expect(isPropertyValidInContext('!config.test', contextMock)).toBe(true);

  // Test with multiple when statements
  contextMock.setValue('config.test2', true);
  expect(isPropertyValidInContext('config.test && config.test2', contextMock)).toBe(false);
  expect(isPropertyValidInContext('config.test && !config.test2', contextMock)).toBe(false);
});

test('Expect to receive the same number passed as arg', async () => {
  const value = 0;
  expect(uncertainStringToNumber(value)).toBe(value);
});

test('Expect to receive a number if a number as string is passed as arg', async () => {
  const value = 10;
  const valueAsString = '10';
  expect(uncertainStringToNumber(valueAsString)).toBe(value);
});

test('Expect to receive a NaN if a not number string is passed as arg', async () => {
  const valueAsString = 'unknown';
  expect(uncertainStringToNumber(valueAsString)).toBe(NaN);
});

describe.each([
  'http://127.0.1',
  'http://127.0.0.1:8080',
  'http://hostname',
  'http://hostname:8080',
  'http://hostname-suffix',
  'http://hostname-suffix:8080',
  'http://hostname.domain.com',
  'http://hostname.domain.com:8080',
  'http://hostname-suffix.domain.com',
  'http://hostname-suffix.domain.com:8080',
])('Test accepted proxy addresses', address => {
  test(`Test address ${address}`, () => {
    expect(validateProxyAddress(address)).toBeUndefined();
  });
});

describe.each([
  '127.0.1',
  '127.0.0.1:8080',
  'hostname',
  'hostname:8080',
  'hostname-suffix',
  'hostname-suffix:8080',
  'hostname.domain.com',
  'hostname.domain.com:8080',
  'hostname-suffix.domain.com',
  'hostname-suffix.domain.com:8080',
])('Test rejected proxy addresses', address => {
  test(`Test address ${address}`, () => {
    expect(validateProxyAddress(address)).toBeDefined();
  });
});

describe('calcHalfCpuCores', () => {
  test('should return half of the provided CPU cores as a number', () => {
    expect(calcHalfCpuCores('4')).toBe(2);
    expect(calcHalfCpuCores('10')).toBe(5);
  });

  test('should return 1 if provided CPU cores are 0', () => {
    expect(calcHalfCpuCores('0')).toBe(1);
  });

  test('should handle same integer value if CPU has one core', () => {
    expect(calcHalfCpuCores('1')).toBe(1);
  });

  test('should return 1 for non-numeric strings', () => {
    expect(calcHalfCpuCores('not-a-number')).toBe(1);
  });

  test('should return 1 for negative numbers', () => {
    expect(calcHalfCpuCores('-4')).toBe(1);
  });
});
