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
import * as os from 'node:os';

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { Directories } from './directories.js';

class TestDirectories extends Directories {
  public getDesktopAppHomeDir(): string {
    return this.desktopAppHomeDir;
  }
}

let directories: TestDirectories;

const originalProcessEnv = process.env;

beforeEach(() => {
  // mock the env variable
  process.env = Object.assign({}, process.env);

  // mock the fs module
  vi.mock('node:fs');

  // mock the existSync and mkdir methods
  const existSyncSpy = vi.spyOn(fs, 'existsSync');
  existSyncSpy.mockImplementation(() => true);

  const mkdirSpy = vi.spyOn(fs, 'mkdirSync');
  mkdirSpy.mockImplementation(() => '');
});

afterEach(() => {
  process.env = originalProcessEnv;
});

test('should use default path', async () => {
  directories = new TestDirectories();
  const result = directories.getDesktopAppHomeDir();

  // desktop app home dir should start with user's home dir
  expect(result.startsWith(os.homedir())).toBeTruthy();

  // should ends with the default path
  expect(result.endsWith(Directories.XDG_DATA_DIRECTORY)).toBeTruthy();
});

test('should override default path', async () => {
  const wantedDirectory = '/fake-directory';

  // add the env variable
  process.env[Directories.PODMAN_DESKTOP_HOME_DIR] = wantedDirectory;

  directories = new TestDirectories();
  const result = directories.getDesktopAppHomeDir();

  // desktop app home dir should not start anymore with user's home dir
  expect(result.startsWith(os.homedir())).toBeFalsy();

  // should not ends with the default path
  expect(result.endsWith(Directories.XDG_DATA_DIRECTORY)).toBeFalsy();

  // should be the directory provided as env var
  expect(result).toEqual(wantedDirectory);
});
