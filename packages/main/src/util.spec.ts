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
import * as fs from 'node:fs';

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getBase64Image, requireNonUndefined } from './util.js';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mock('node:fs');
});

test('getBase64Image - return undefined if path do not exists', () => {
  vi.spyOn(fs, 'existsSync').mockReturnValue(false);
  const result = getBase64Image('unknown');
  expect(result).toBe(undefined);
});

test('getBase64Image - return undefined if erroring durin execution', () => {
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
    throw new Error('error');
  });
  const result = getBase64Image('path');
  expect(result).toBe(undefined);
});

test('getBase64Image - return base64 image', () => {
  const buffer: Buffer = {} as Buffer;
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  vi.spyOn(fs, 'readFileSync').mockReturnValue('file');
  vi.spyOn(Buffer, 'from').mockReturnValue(buffer);
  vi.spyOn(buffer, 'toString').mockReturnValue('image');

  const result = getBase64Image('path');
  expect(result).toBe('data:image/png;base64,image');
});

describe('requireNonUndefined', () => {
  test('should return the value if it is defined', () => {
    const value = 'test';
    const result = requireNonUndefined(value);
    expect(result).toBe(value);
  });

  test('should throw an error if the value is undefined', () => {
    expect(() => requireNonUndefined(undefined)).toThrow('Found undefined value.');
  });

  test('should throw an error with a custom message if the value is undefined', () => {
    const customMessage = 'Custom error message';
    expect(() => requireNonUndefined(undefined, customMessage)).toThrow(customMessage);
  });
});
