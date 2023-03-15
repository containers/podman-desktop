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
import { expect, test, vi } from 'vitest';
import { getSocketCompatibility, DarwinSocketCompatibility } from './compatibility-mode';
import * as extensionApi from '@podman-desktop/api';

vi.mock('@podman-desktop/api', () => {
  return {
    window: {
      showErrorMessage: vi.fn(),
    },
  };
});

// macOS tests

vi.mock('runSudoMacHelperCommand', () => {
  return vi.fn();
});

const mockDarwinSocketCompatibility: DarwinSocketCompatibility = {
  findPodmanHelper: vi.fn(),
  details: '',
  enable: vi.fn(),
  disable: vi.fn(),
  runCommand: vi.fn(),
};

test('darwin: compatibility mode binary not found failure', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  const compatibility = getSocketCompatibility();
  expect(compatibility).toBeInstanceOf(DarwinSocketCompatibility);

  const enable = await compatibility.enable();
  expect(enable).toBeUndefined();

  // Expect the binary to have not been found
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalledWith('podman-mac-helper binary not found.', 'OK');
});

test('darwin: compatibility mode binary found, run command success', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'darwin',
  });

  (mockDarwinSocketCompatibility.findPodmanHelper as Mock).mockResolvedValue('/opt/podman/bin/podman-mac-helper');
  const enabled = await getSocketCompatibility().enable();
  expect(enabled).toBeUndefined();
});

// Linux tests

test('linux: compatibility mode fail', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  // Expect getSocketCompatibility to return error since Linux is not supported yet
  expect(() => getSocketCompatibility()).toThrowError();
});

// Windows tests

test('windows: compatibility mode fail', async () => {
  // Mock platform to be darwin
  Object.defineProperty(process, 'platform', {
    value: 'win32',
  });

  // Expect getSocketCompatibility to return error since Linux is not supported yet
  expect(() => getSocketCompatibility()).toThrowError();
});
