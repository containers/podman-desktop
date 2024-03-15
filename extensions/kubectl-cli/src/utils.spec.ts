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

import { promises } from 'node:fs';

import { describe, expect, test, vi, vitest } from 'vitest';

import { makeExecutable } from './utils';

vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

describe('makeExecutable', async () => {
  const fakePath = '/fake/path';
  test('mac', async () => {
    vitest.spyOn(process, 'platform', 'get').mockReturnValue('darwin');

    // fake chmod
    const chmodMock = vi.spyOn(promises, 'chmod');
    chmodMock.mockImplementation(() => Promise.resolve());
    await makeExecutable(fakePath);
    // check it has been called
    expect(chmodMock).toHaveBeenCalledWith(fakePath, 0o755);
  });

  test('linux', async () => {
    vitest.spyOn(process, 'platform', 'get').mockReturnValue('linux');

    // fake chmod
    const chmodMock = vi.spyOn(promises, 'chmod');
    chmodMock.mockImplementation(() => Promise.resolve());
    await makeExecutable(fakePath);
    // check it has been called
    expect(chmodMock).toHaveBeenCalledWith(fakePath, 0o755);
  });

  test('windows', async () => {
    vitest.spyOn(process, 'platform', 'get').mockReturnValue('win32');

    // fake chmod
    const chmodMock = vi.spyOn(promises, 'chmod');
    chmodMock.mockImplementation(() => Promise.resolve());
    await makeExecutable(fakePath);
    // check it has not been called on Windows
    expect(chmodMock).not.toHaveBeenCalled();
  });
});
