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

import type { Mock } from 'vitest';
import { promises } from 'node:fs';

import { afterEach, expect, beforeEach, test, vi, vitest } from 'vitest';
import { PodmanComposeGenerator } from './podman-compose-generator';
import * as extensionApi from '@tmpwip/extension-api';

// expose methods publicly for testing
class TestPodmanGenerator extends PodmanComposeGenerator {
  public publicGenerateContent(): string {
    return this.generateContent();
  }
}

vi.mock('@tmpwip/extension-api', () => {
  return {
    window: {
      showErrorMessage: vi.fn(),
    },
    provider: {
      getContainerConnections: vi.fn(),
    },
  };
});

const osMock = {
  isWindows: vi.fn(),
  isLinux: vi.fn(),
  isMac: vi.fn(),
};

const dummyConnection1 = {
  connection: {
    status: () => 'stopped',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
  },
};
const dummyConnection2 = {
  connection: {
    status: () => 'started',
    endpoint: {
      socketPath: '/endpoint2.sock',
    },
  },
};

let podmanComposeGenerator: TestPodmanGenerator;
beforeEach(() => {
  podmanComposeGenerator = new TestPodmanGenerator(osMock, '/fake-dir');
  vi.mock('node:fs');
  vitest.spyOn(promises, 'writeFile').mockImplementation(() => Promise.resolve());
  (extensionApi.provider.getContainerConnections as Mock).mockReturnValue([dummyConnection1, dummyConnection2]);
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('no connections', async () => {
  vi.mock('node:fs');
  (extensionApi.provider.getContainerConnections as Mock).mockReturnValue([]);
  osMock.isLinux.mockReturnValue(true);
  podmanComposeGenerator.generate('/destFile');
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalledWith('No connection to container engine is started');
});

test('generate', async () => {
  osMock.isLinux.mockReturnValue(true);
  await podmanComposeGenerator.generate('/destFile');
  // no error
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();

  // check file is written
  expect(promises.writeFile).toHaveBeenCalled();
});

test('generateContent on linux', async () => {
  osMock.isLinux.mockReturnValue(true);
  const content = await podmanComposeGenerator.publicGenerateContent();
  // no error
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();

  // check content
  // should have sh for linux/mac
  expect(content).toContain('#!/bin/sh');

  // contains the right endpoint
  expect(content).toContain('unix:///endpoint2.sock');
});

test('generateContent on mac', async () => {
  osMock.isMac.mockReturnValue(true);
  const content = await podmanComposeGenerator.publicGenerateContent();
  // no error
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();

  // check content
  // should have sh for linux/mac
  expect(content).toContain('#!/bin/sh');

  // contains the right endpoint
  expect(content).toContain('unix:///endpoint2.sock');
});

test('generateContent on windows', async () => {
  osMock.isWindows.mockReturnValue(true);
  const content = await podmanComposeGenerator.publicGenerateContent();
  // no error
  expect(extensionApi.window.showErrorMessage).not.toHaveBeenCalled();

  // check content
  // should have echo for windows
  expect(content).toContain('@echo off');

  // contains the right endpoint
  expect(content).toContain('npipe:///endpoint2.sock');
});
