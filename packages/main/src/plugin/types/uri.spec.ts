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

import type { Uri as APIUri } from '@podman-desktop/api';
import { afterEach, expect, test, vi } from 'vitest';

import { Uri } from './uri.js';

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

test('joinPath without path', () => {
  const uri = Uri.parse('https://podman-desktop.io');

  // delete path for the error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (uri as any)._path;

  expect(() => Uri.joinPath(uri, 'foo')).toThrowError('cannot call joinPath on Uri without a path');
});

test.each([
  ['file:///foo/', '../../bar', 'file:///bar'],
  ['file:///foo', '../../bar', 'file:///bar'],
  ['file:///foo/bar', './baz', 'file:///foo/bar/baz'],
  ['http://foo', 'bar', 'http://foo/bar'],
  ['https://foo', 'bar', 'https://foo/bar'],
])('joinPath %s %s', (left, right, expected) => {
  const leftUri = Uri.parse(left);
  const joinPathUri = Uri.joinPath(leftUri, right);
  expect(joinPathUri.toString()).toBe(expected);
});

test('Uri.with without any change should return same object', () => {
  const uri = Uri.parse('https://podman-desktop.io');

  const updatedUri = uri.with();

  expect(updatedUri).toBe(uri);
});

test('Uri.with and undefined path', () => {
  const uri = Uri.parse('https://podman-desktop.io');

  const updatedUri = uri.with({ scheme: 'http' });

  expect(updatedUri.scheme).toBe('http');
});

test('Uri.with and same change', () => {
  const uri = Uri.parse('https://podman-desktop.io');

  const updatedUri = uri.with({ scheme: 'https', authority: 'podman-desktop.io', path: '/', query: '', fragment: '' });

  expect(updatedUri).toBe(uri);
});

test('Expect revive to return revived Uri object', () => {
  const uriSerialized = {
    _scheme: 'scheme',
    _authority: 'authority',
    _path: 'path',
    _query: 'query',
    _fragment: 'fragment',
  } as unknown as APIUri;

  const revived = Uri.revive(uriSerialized);
  expect(revived.authority).equals('authority');
  expect(revived.scheme).equals('scheme');
  expect(revived.path).equals('path');
  expect(revived.fsPath).equals('path');
  expect(revived.query).equals('query');
  expect(revived.fragment).equals('fragment');
});
