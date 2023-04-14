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
import { writeToTerminal } from './Util';

const xtermMock = {
  write: vi.fn(),
};

afterEach(() => {
  vi.resetAllMocks();
});

test('write array object', () => {
  writeToTerminal(xtermMock, ['a', 'b'], 'test');
  // no error reported
  expect(xtermMock.write).toBeCalledTimes(2);
});

test('write invalid object', () => {
  writeToTerminal(xtermMock, {} as unknown as string[], 'test');
  // no error reported
  expect(xtermMock.write).toBeCalledWith(expect.stringContaining('test'));
});

test('write undefined object', () => {
  writeToTerminal(xtermMock, undefined as unknown as string[], 'test');
  // no error reported
  expect(xtermMock.write).toBeCalledWith(expect.stringContaining('test'));
});
