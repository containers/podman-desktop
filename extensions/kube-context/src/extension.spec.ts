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

import { beforeEach, expect, test, vi } from 'vitest';
import type * as podmanDesktopApi from '@podman-desktop/api';
import * as fs from 'node:fs';
import { updateContext } from './extension';

vi.mock('@podman-desktop/api', async () => {
  return {};
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('check empty kubeconfig file', async () => {
  const readFileMock = vi.spyOn(fs.promises, 'readFile');
  const consoleErrorSpy = vi.spyOn(console, 'error');

  // provide empty kubeconfig file
  readFileMock.mockResolvedValue('');
  const fakeContext = {} as podmanDesktopApi.ExtensionContext;

  const fakeFile = '/fake/kubeconfig/file';
  await updateContext(fakeContext, fakeFile);
  expect(consoleErrorSpy).toBeCalledWith(`Kubeconfig file at '${fakeFile}' is empty. Skipping.`);
});
