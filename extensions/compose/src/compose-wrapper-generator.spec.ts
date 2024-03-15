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

import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeEach, expect, test, vi, vitest } from 'vitest';

import { ComposeWrapperGenerator } from './compose-wrapper-generator';

// expose methods publicly for testing
class TestComposeWrapperGenerator extends ComposeWrapperGenerator {
  public async generateContent(connection: extensionApi.ProviderContainerConnection): Promise<string> {
    return super.generateContent(connection);
  }
}

const dummyConnection = {
  connection: {
    status: () => 'started',
    endpoint: {
      socketPath: '/endpoint.sock',
    },
  },
} as extensionApi.ProviderContainerConnection;

vi.mock('@podman-desktop/api', () => {
  return {
    window: {
      showErrorMessage: vi.fn(),
    },
  };
});

const osMock = {
  isWindows: vi.fn(),
  isLinux: vi.fn(),
  isMac: vi.fn(),
};

let composeWrapperGenerator: TestComposeWrapperGenerator;
beforeEach(() => {
  composeWrapperGenerator = new TestComposeWrapperGenerator(osMock, '/fake-dir');
  vi.mock('node:fs');
  vitest.spyOn(promises, 'writeFile').mockImplementation(() => Promise.resolve());
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('generate', async () => {
  osMock.isLinux.mockReturnValue(true);
  const generateContent = vi.spyOn(composeWrapperGenerator, 'generateContent');
  await composeWrapperGenerator.generate(dummyConnection, '/destFile');

  // no error
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();
  expect(generateContent).toHaveBeenCalled();

  // check file is written
  expect(promises.writeFile).toHaveBeenCalled();
});

test('generateContent on linux', async () => {
  osMock.isLinux.mockReturnValue(true);
  const content = await composeWrapperGenerator.generateContent(dummyConnection);
  // no error
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();

  // check content
  // should have sh for linux/mac
  expect(content).toContain('#!/bin/sh');

  // contains the right endpoint
  expect(content).toContain('unix:///endpoint.sock');
});

test('generateContent on mac', async () => {
  osMock.isMac.mockReturnValue(true);
  const content = await composeWrapperGenerator.generateContent(dummyConnection);
  // no error
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();

  // check content
  // should have sh for linux/mac
  expect(content).toContain('#!/bin/sh');

  // contains the right endpoint
  expect(content).toContain('unix:///endpoint.sock');
});

test('generateContent on windows', async () => {
  osMock.isWindows.mockReturnValue(true);
  const content = await composeWrapperGenerator.generateContent(dummyConnection);
  // no error
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();

  // check content
  // should have echo for windows
  expect(content).toContain('@echo off');

  // contains the right endpoint
  expect(content).toContain('npipe:///endpoint.sock');
});
