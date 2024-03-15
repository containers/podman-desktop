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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';

import * as podmanDesktopApi from '@podman-desktop/api';
import { beforeAll, beforeEach, expect, type Mock, test, vi } from 'vitest';

import { updateContext } from './extension';

const item = {
  show: vi.fn(),
  command: '',
  text: '',
};

vi.mock('@podman-desktop/api', async () => {
  return {
    window: {
      createStatusBarItem: vi.fn(),
    },
    tray: {
      registerMenuItem: vi.fn(),
    },
  };
});

beforeAll(() => {
  (podmanDesktopApi.window.createStatusBarItem as Mock).mockReturnValue(item);
});

beforeEach(() => {
  vi.clearAllMocks();
});

async function checkContent(content: string, expectedContext: string): Promise<void> {
  const readFileMock = vi.spyOn(fs.promises, 'readFile');

  // provide empty kubeconfig file
  readFileMock.mockResolvedValue(content);
  const fakeContext = {
    subscriptions: [],
  } as unknown as podmanDesktopApi.ExtensionContext;

  const fakeFile = '/fake/kubeconfig/file';
  await updateContext(fakeContext, fakeFile);
  expect(item.command).toBe('kubecontext.quickpick');
  expect(item.text).toBe(expectedContext);
}

test('check empty kubeconfig file', async () => {
  await checkContent('', 'No context');
});

test('check invalid kubeconfig file', async () => {
  await checkContent('this is not a valid YAML file', 'No context');
});

test('check kubeconfig file with no contexts', async () => {
  await checkContent('apiVersion: v1\nkind: Config', 'No context');
});

test('check kubeconfig file with no current context', async () => {
  await checkContent('apiVersion: v1\nkind: Config\ncontexts:\n- context:\n  name: default\n', 'No context');
});

test('check kubeconfig file with current context', async () => {
  await checkContent(
    'apiVersion: v1\nkind: Config\ncontexts:\n- context:\n  name: default\ncurrent-context: default',
    'default',
  );
});
