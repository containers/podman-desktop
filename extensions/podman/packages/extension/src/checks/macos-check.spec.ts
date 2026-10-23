/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import * as os from 'node:os';

import * as extensionApi from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { MacKrunkitPodmanMachineCreationCheck, MacVersionCheck, MINIMUM_VERSION } from './macos-checks';

let macVersionCheck: MacVersionCheck;

vi.mock(import('node:os'), () => {
  return {
    release: vi.fn(),
    platform: vi.fn(),
  };
});

beforeEach(() => {
  macVersionCheck = new MacVersionCheck();
  vi.clearAllMocks();
});

test('expect error on versions of macOS too old', async () => {
  // Let say we have a very old macOS version
  (os.release as Mock).mockReturnValue('5.0.0');
  const result = await macVersionCheck.execute();
  expect(result).toBeDefined();
  expect(result.successful).toBeFalsy();
  expect(result.description).toMatch('you need to update to macOS Catalina');
});

test('expect success on versions of macOS matching the minimum version', async () => {
  // pickup minimum version
  (os.release as Mock).mockReturnValue(MINIMUM_VERSION);
  const result = await macVersionCheck.execute();
  expect(result).toBeDefined();
  // minimum version should match
  expect(result.successful).toBeTruthy();
});

test('expect success on a recent macOS version', async () => {
  (os.release as Mock).mockReturnValue('22.1.0');
  const result = await macVersionCheck.execute();
  expect(result).toBeDefined();
  expect(result.successful).toBeTruthy();
});

describe('Krunkit', () => {
  const mockExec = (handlers: Record<string, () => Promise<unknown>>): void => {
    vi.mocked(extensionApi.process.exec).mockImplementation(async (command: string, args?: string[]) => {
      const key = command === 'brew' ? 'brew list' : command === 'which' ? `which ${args?.[0]}` : command;
      const handler = handlers[key];
      if (!handler) {
        throw new Error(`unexpected command ${key}`);
      }
      return handler() as Promise<extensionApi.RunResult>;
    });
  };
  const ok = (stdout = 'hello-world'): (() => Promise<unknown>) => {
    return async () => ({ exitCode: 0, stdout });
  };
  const fail = (): (() => Promise<unknown>) => {
    return async () => {
      throw new Error('command failed');
    };
  };

  test('Krunkit is found in the PATH but not installed by brew', async () => {
    mockExec({ krunkit: ok('krunkit 0.2.0'), 'which brew': ok(), 'brew list': fail() });

    const result = await new MacKrunkitPodmanMachineCreationCheck().execute();
    expect(result.successful).toBeTruthy();
    expect(extensionApi.process.exec).toHaveBeenCalledWith('krunkit', ['--version'], undefined);
    expect(extensionApi.process.exec).not.toHaveBeenCalledWith('brew', expect.anything(), expect.anything());
  });

  test('Krunkit is only found in the Podman installer folder', async () => {
    vi.mocked(extensionApi.process.exec).mockImplementation(
      async (command: string, _args?: string[], options?: { env?: Record<string, string> }) => {
        if (command === 'krunkit' && options?.env?.['PATH'] === '/opt/podman/bin') {
          return { command: 'krunkit', exitCode: 0, stdout: 'krunkit 0.2.0', stderr: '' };
        }
        throw new Error('command failed');
      },
    );

    const result = await new MacKrunkitPodmanMachineCreationCheck().execute();
    expect(result.successful).toBeTruthy();
    expect(extensionApi.process.exec).not.toHaveBeenCalledWith('which', ['brew']);
  });

  test('Krunkit is installed by brew', async () => {
    mockExec({ krunkit: fail(), 'which brew': ok(), 'brew list': ok() });

    const result = await new MacKrunkitPodmanMachineCreationCheck().execute();
    expect(result.successful).toBeTruthy();
  });

  test('Krunkit is installed by Podman installer and brew is not installed', async () => {
    mockExec({ krunkit: fail(), 'which brew': fail() });

    const result = await new MacKrunkitPodmanMachineCreationCheck().execute();
    expect(result.successful).toBeTruthy();
  });

  test('Krunkit is not in the PATH and not installed by brew', async () => {
    mockExec({
      krunkit: fail(),
      'which brew': ok(),
      'brew list': async () => ({ exitCode: 1, stderr: 'error-world' }),
    });

    const result = await new MacKrunkitPodmanMachineCreationCheck().execute();
    expect(result.successful).toBeFalsy();
    expect(result.description).toContain('krunkit installed with "brew"');
  });
});
