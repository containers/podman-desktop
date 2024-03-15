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

import { afterEach, beforeEach, expect, test, vi, vitest } from 'vitest';

import { OS } from './os';

let os: OS;
beforeEach(() => {
  os = new OS();
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('linux', async () => {
  vitest.spyOn(process, 'platform', 'get').mockReturnValue('linux');
  const isWindows = os.isWindows();
  const isLinux = os.isLinux();
  const isMac = os.isMac();
  expect(isWindows).toBeFalsy();
  expect(isLinux).toBeTruthy();
  expect(isMac).toBeFalsy();
});

test('mac', async () => {
  vitest.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
  const isWindows = os.isWindows();
  const isLinux = os.isLinux();
  const isMac = os.isMac();
  expect(isWindows).toBeFalsy();
  expect(isLinux).toBeFalsy();
  expect(isMac).toBeTruthy();
});

test('windows', async () => {
  vitest.spyOn(process, 'platform', 'get').mockReturnValue('win32');
  const isWindows = os.isWindows();
  const isLinux = os.isLinux();
  const isMac = os.isMac();
  expect(isWindows).toBeTruthy();
  expect(isLinux).toBeFalsy();
  expect(isMac).toBeFalsy();
});
