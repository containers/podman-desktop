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

import { afterEach, expect, test, vi } from 'vitest';

import { Uri } from './uri';

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Check Uri parse', async () => {
  const uri = Uri.parse('https://podman-desktop.io');
  expect(uri.scheme).toBe('https');
  expect(uri.authority).toBe('podman-desktop.io');

  const value = Uri.parse('http://api/files/test.me?t=1234');
  expect(value.scheme).toBe('http');
  expect(value.authority).toBe('api');
  expect(value.path).toBe('/files/test.me');
  expect(value.query).toBe('t=1234');
  expect(value.fragment).toBe('');
});

test('check uri.file', async () => {
  const uri = Uri.file('/coding/ts#/project1');
  expect(uri.scheme).toBe('file');
  expect(uri.path).toBe('/coding/ts#/project1');
  expect(uri.fragment).toBe('');
});

test('toString', () => {
  const uri = Uri.parse('https://podman-desktop.io');
  expect(uri.toString()).toBe('https://podman-desktop.io/');
});
