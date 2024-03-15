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

import * as extensionApi from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { beforeEach, expect, test, vi } from 'vitest';

import { PodmanBinaryLocationHelper } from './podman-binary-location-helper';

let podmanBinaryLocationHelper: PodmanBinaryLocationHelper;

// mock the API
vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

beforeEach(() => {
  podmanBinaryLocationHelper = new PodmanBinaryLocationHelper();
  vi.resetAllMocks();
});

test('should grab podman from the installer', async () => {
  (extensionApi.process.exec as Mock).mockResolvedValue({
    stdout: '/opt/podman/bin/podman',
  } as extensionApi.RunResult);

  const podmanBinaryResult = await podmanBinaryLocationHelper.getPodmanLocationMac();

  expect(podmanBinaryResult.source).toBe('installer');

  // expect called with which podman command
  expect(extensionApi.process.exec).toHaveBeenCalledWith('which', ['podman']);
});

test('should grab podman from brew', async () => {
  (extensionApi.process.exec as Mock).mockResolvedValue({
    stdout: '/opt/homebrew/bin/podman',
  } as extensionApi.RunResult);

  const podmanBinaryResult = await podmanBinaryLocationHelper.getPodmanLocationMac();

  expect(podmanBinaryResult.source).toBe('brew');

  // expect called with which podman command
  expect(extensionApi.process.exec).toHaveBeenCalledWith('which', ['podman']);
});

test('should grab podman from unknown location', async () => {
  (extensionApi.process.exec as Mock).mockResolvedValue({
    stdout: '/foo/bin/podman',
  } as extensionApi.RunResult);

  const podmanBinaryResult = await podmanBinaryLocationHelper.getPodmanLocationMac();

  expect(podmanBinaryResult.source).toBe('unknown');

  // expect called with which podman command
  expect(extensionApi.process.exec).toHaveBeenCalledWith('which', ['podman']);
});

test('error grab podman from the installer', async () => {
  (extensionApi.process.exec as Mock).mockImplementation(() => {
    throw new Error('error');
  });

  const podmanBinaryResult = await podmanBinaryLocationHelper.getPodmanLocationMac();

  expect(podmanBinaryResult.source).toBe('unknown');
  expect(podmanBinaryResult.error).toBeDefined();

  // expect called with which podman command
  expect(extensionApi.process.exec).toHaveBeenCalledWith('which', ['podman']);
});
