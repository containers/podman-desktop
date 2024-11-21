/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import { afterEach, expect, test, vi } from 'vitest';

import { getPodmanCli } from './podman-cli';
import {
  APPLEHV_LABEL,
  execPodman,
  getProviderByLabel,
  getProviderLabel,
  LIBKRUN_LABEL,
  normalizeWSLOutput,
  VMTYPE,
} from './util';

const config: extensionApi.Configuration = {
  get: () => {
    // not implemented
  },
  has: () => true,
  update: vi.fn(),
};

vi.mock('@podman-desktop/api', () => {
  return {
    configuration: {
      getConfiguration: (): extensionApi.Configuration => config,
    },
    process: {
      exec: vi.fn(),
    },
    env: {
      isWindows: false,
      isMac: false,
      isLinux: false,
    },
  };
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('normalizeWSLOutput returns the same string if there is no need to normalize it', async () => {
  const text = 'blabla';
  const res = normalizeWSLOutput(text);
  expect(res).toEqual(text);
});

test('normalizeWSLOutput returns a normalized output', async () => {
  const text = 'WSL version: 1.2.5.0';
  const textU16 = strEncodeUTF16(text);
  const enc = new TextDecoder('utf-16');
  const res = normalizeWSLOutput(enc.decode(textU16));
  expect(textU16).not.toEqual(text);
  expect(res).toEqual(text);
});

// create a string with invalid chars
function strEncodeUTF16(str: string): Uint16Array {
  const buf = new ArrayBuffer(str.length * 4);
  const bufView = new Uint16Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i * 2] = str.charCodeAt(i);
    // add an extra char to the string to simulate WSL output
    bufView[i * 2 + 1] = 0;
  }
  return bufView;
}

test('expect exec called with CONTAINERS_MACHINE_PROVIDER if a provider is defined', async () => {
  const execMock = vi
    .spyOn(extensionApi.process, 'exec')
    .mockImplementation(() => Promise.resolve({} as extensionApi.RunResult));

  await execPodman(['machine', 'inspect'], 'libkrun', {
    env: {
      label: 'one',
    },
  });

  expect(execMock).toBeCalledWith(getPodmanCli(), ['machine', 'inspect'], {
    env: {
      label: 'one',
      CONTAINERS_MACHINE_PROVIDER: 'libkrun',
    },
  });
});

test('expect exec called without CONTAINERS_MACHINE_PROVIDER if a provider is NOT defined', async () => {
  const execMock = vi
    .spyOn(extensionApi.process, 'exec')
    .mockImplementation(() => Promise.resolve({} as extensionApi.RunResult));

  await execPodman(['machine', 'inspect'], undefined, {
    env: {
      label: 'one',
    },
  });

  expect(execMock).toBeCalledWith(getPodmanCli(), ['machine', 'inspect'], {
    env: {
      label: 'one',
    },
  });
});

test('expect libkrun label with libkrun provider', async () => {
  const label = getProviderLabel(VMTYPE.LIBKRUN);
  expect(label).equals(LIBKRUN_LABEL);
});

test('expect applehv label with applehv provider', async () => {
  const label = getProviderLabel(VMTYPE.APPLEHV);
  expect(label).equals(APPLEHV_LABEL);
});

test('expect provider name with provider different from libkrun and applehv', async () => {
  const label = getProviderLabel(VMTYPE.WSL);
  expect(label).equals(VMTYPE.WSL);
});

test('expect libkrun provider with libkrun label', async () => {
  const provider = getProviderByLabel(LIBKRUN_LABEL);
  expect(provider).equals(VMTYPE.LIBKRUN);
});

test('expect applehv provider with applehv label', async () => {
  const provider = getProviderByLabel(APPLEHV_LABEL);
  expect(provider).equals(VMTYPE.APPLEHV);
});

test('expect wsl name with provider wsl label', async () => {
  const provider = getProviderByLabel(VMTYPE.WSL);
  expect(provider).equals(VMTYPE.WSL);
});
