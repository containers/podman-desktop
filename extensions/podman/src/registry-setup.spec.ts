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

import type { MockedFunction } from 'vitest';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { ContainersAuthConfigFile } from './registry-setup';
import { RegistrySetup } from './registry-setup';

// allow us to test protected methods
export class TestRegistrySetup extends RegistrySetup {
  publicReadAuthFile(): Promise<ContainersAuthConfigFile> {
    return super.readAuthFile();
  }

  getAuthFileLocation(): string {
    return super.getAuthFileLocation();
  }
}

let registrySetup: TestRegistrySetup;

// mock the fs module
vi.mock('node:fs');

const originalConsoleError = console.error;
const consoleErroMock = vi.fn();

beforeAll(() => {
  registrySetup = new TestRegistrySetup();
});

beforeEach(() => {
  vi.resetAllMocks();
  console.error = consoleErroMock;
});

afterEach(() => {
  console.error = originalConsoleError;
});

type ReadFileType = (
  path: string,
  options: string,
  callback: (err: NodeJS.ErrnoException | undefined, data: string | Buffer) => void,
) => void;

test('should work with invalid JSON auth file', async () => {
  // mock the existSync
  const existSyncSpy = vi.spyOn(fs, 'existsSync');
  existSyncSpy.mockReturnValue(true);

  // mock the readFile
  const readFileSpy = vi.spyOn(fs, 'readFile') as unknown as MockedFunction<ReadFileType>;

  readFileSpy.mockImplementation(
    (_path: string, _encoding: string, callback: (err: Error | undefined, data: string | Buffer) => void) => {
      // mock the error
      callback(undefined, 'invalid json');
    },
  );

  // mock the location
  const authJsonLocation = '/tmp/containers/auth.json';
  const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
  mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

  // expect an error
  const authFile = await registrySetup.publicReadAuthFile();

  // expect the file to be empty
  expect(authFile).toEqual({});

  // expect read with the correct file
  expect(readFileSpy).toHaveBeenCalledWith(authJsonLocation, 'utf-8', expect.anything());

  // expect error was logged
  expect(consoleErroMock).toHaveBeenCalledWith('Error parsing auth file', expect.anything());
});

test('should work with JSON auth file', async () => {
  // mock the existSync
  const existSyncSpy = vi.spyOn(fs, 'existsSync');
  existSyncSpy.mockReturnValue(true);

  // mock the readFile
  const readFileSpy = vi.spyOn(fs, 'readFile') as unknown as MockedFunction<ReadFileType>;
  const auth = Buffer.from('user:password').toString('base64');

  readFileSpy.mockImplementation(
    (_path: string, _encoding: string, callback: (err: Error | undefined, data: string | Buffer) => void) => {
      // mock the error

      callback(undefined, JSON.stringify({ auths: { 'myregistry.io': { auth: auth } } }));
    },
  );

  // mock the location
  const authJsonLocation = '/tmp/containers/auth.json';
  const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
  mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

  // expect an error
  const authFile = await registrySetup.publicReadAuthFile();

  // expect the file to have a single entry
  expect(authFile.auths?.['myregistry.io']).toBeDefined();
  expect(authFile.auths?.['myregistry.io'].auth).toBe(auth);
  expect(authFile.auths?.['myregistry.io']['podmanDesktopAlias']).not.toBeDefined();

  // expect read with the correct file
  expect(readFileSpy).toHaveBeenCalledWith(authJsonLocation, 'utf-8', expect.anything());
});

test('should work with JSON auth file and alias', async () => {
  // mock the existSync
  const existSyncSpy = vi.spyOn(fs, 'existsSync');
  existSyncSpy.mockReturnValue(true);

  // mock the readFile
  const readFileSpy = vi.spyOn(fs, 'readFile') as unknown as MockedFunction<ReadFileType>;
  const auth = Buffer.from('user:password').toString('base64');

  readFileSpy.mockImplementation(
    (_path: string, _encoding: string, callback: (err: Error | undefined, data: string | Buffer) => void) => {
      // mock the error

      callback(undefined, JSON.stringify({ auths: { 'myregistry.io': { auth: auth, podmanDesktopAlias: 'alias' } } }));
    },
  );

  // mock the location
  const authJsonLocation = '/tmp/containers/auth.json';
  const mockGetAuthFileLocation = vi.spyOn(registrySetup, 'getAuthFileLocation');
  mockGetAuthFileLocation.mockReturnValue(authJsonLocation);

  // expect an error
  const authFile = await registrySetup.publicReadAuthFile();

  // expect the file to have a single entry
  expect(authFile.auths?.['myregistry.io']).toBeDefined();
  expect(authFile.auths?.['myregistry.io'].auth).toBe(auth);
  expect(authFile.auths?.['myregistry.io']['podmanDesktopAlias']).toBe('alias');

  // expect read with the correct file
  expect(readFileSpy).toHaveBeenCalledWith(authJsonLocation, 'utf-8', expect.anything());
});
