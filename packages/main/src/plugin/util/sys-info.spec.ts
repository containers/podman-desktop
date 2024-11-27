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

import { arch, release, version } from 'node:os';

import { beforeEach, expect, test, vi } from 'vitest';

import { getSystemInfo } from '/@/plugin/util/sys-info.js';
import { isLinux, isMac, isWindows } from '/@/util.js';

vi.mock('/@/util.js', () => ({
  isLinux: vi.fn(),
  isMac: vi.fn(),
  isWindows: vi.fn(),
}));

vi.mock('node:os', () => ({
  arch: vi.fn(),
  release: vi.fn(),
  version: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
});

test('windows should use os#version and os#arch', () => {
  vi.mocked(isWindows).mockReturnValue(true);
  vi.mocked(arch).mockReturnValue('x64');
  vi.mocked(version).mockReturnValue('Windows 11 Home');

  const result = getSystemInfo().getSystemName();

  expect(release).not.toHaveBeenCalled();
  expect(version).toHaveBeenCalled();
  expect(arch).toHaveBeenCalled();

  expect(result).toBe('Windows 11 Home - x64');
});

test('linux should use os#release', () => {
  vi.mocked(isLinux).mockReturnValue(true);
  vi.mocked(release).mockReturnValue('6.11.7-300.fc41.x86_64');

  const result = getSystemInfo().getSystemName();

  expect(release).toHaveBeenCalled();
  expect(version).not.toHaveBeenCalled();
  expect(arch).not.toHaveBeenCalled();

  expect(result).toBe('Linux - 6.11.7-300.fc41.x86_64');
});

test('flatpak linux should include flatpak info', () => {
  vi.mocked(isLinux).mockReturnValue(true);
  vi.mocked(release).mockReturnValue('6.11.7-300.fc41.x86_64');

  process.env['FLATPAK_ID'] = 'dummy-id';

  const result = getSystemInfo().getSystemName();

  expect(release).toHaveBeenCalled();
  expect(version).not.toHaveBeenCalled();
  expect(arch).not.toHaveBeenCalled();

  expect(result).toBe('Linux - 6.11.7-300.fc41.x86_64 (flatpak)');
});

test('darwin should use os#release and os#arch', () => {
  vi.mocked(isMac).mockReturnValue(true);
  vi.mocked(release).mockReturnValue('23.9.4');
  vi.mocked(arch).mockReturnValue('arm64');

  const result = getSystemInfo().getSystemName();

  expect(release).toHaveBeenCalled();
  expect(version).not.toHaveBeenCalled();
  expect(arch).toHaveBeenCalled();

  expect(result).toBe('MacOS 23.9.4 - arm64');
});
