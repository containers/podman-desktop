/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { combinedInstalledExtensions } from './all-installed-extensions';
import { contributions } from './contribs';
import { extensionInfos } from './extensions';

beforeEach(() => {
  vi.resetAllMocks();
  contributions.set([]);
  extensionInfos.set([]);
});

test('combined extensions from DD', async () => {
  let allExtensons = get(combinedInstalledExtensions);

  expect(allExtensons.length).toBe(0);

  // now, add some contributions
  contributions.set([
    {
      id: 'first.extension1',
      extensionId: 'first.extension1',
      description: 'test1',
      type: 'hello',
      uiUri: 'http://test1',
      icon: 'icon1',
      hostEnvPath: 'path1',
      storagePath: 'storage1',
      displayName: 'test1',
      publisher: 'Foo publisher',
      name: 'extension',
      version: '1.0.0',
    },
    {
      id: 'second.extension2',
      extensionId: 'second.extension2',
      description: 'test2',
      type: 'hello',
      uiUri: 'http://test2',
      icon: 'icon2',
      hostEnvPath: 'path2',
      storagePath: 'storage2',
      displayName: 'test2',
      publisher: 'Foo publisher',
      name: 'extension2',
      version: '2.0.0',
    },
  ]);

  // refresh the extensions
  allExtensons = get(combinedInstalledExtensions);
  expect(allExtensons.length).toBe(2);

  const extension1 = allExtensons.find(ext => ext.id === 'first.extension1');
  expect(extension1).toBeDefined();

  expect(extension1?.type).toBe('dd');
  expect(extension1?.displayName).toBe('test1');
});

test('combined extensions from PD', async () => {
  let allExtensons = get(combinedInstalledExtensions);

  expect(allExtensons.length).toBe(0);

  extensionInfos.set([
    {
      id: 'first.extension1',
      name: 'first.extension1',
      description: 'test1',
      displayName: 'test1',
      publisher: 'Foo publisher',
      removable: true,
      version: '1.0.0',
      state: 'started',
      path: 'path1',
      readme: 'readme1',
    },
    {
      id: 'second.extension2',
      name: 'second.extension2',
      description: 'test2',
      displayName: 'test2',
      publisher: 'Foo publisher',
      removable: true,
      version: '2.0.0',
      state: 'started',
      path: 'path2',
      readme: 'readme2',
    },
  ]);

  // refresh the extensions
  allExtensons = get(combinedInstalledExtensions);
  expect(allExtensons.length).toBe(2);

  const extension1 = allExtensons.find(ext => ext.id === 'first.extension1');
  expect(extension1).toBeDefined();

  expect(extension1?.type).toBe('pd');
  expect(extension1?.displayName).toBe('test1');
});

test('combined extensions from all', async () => {
  let allExtensons = get(combinedInstalledExtensions);

  expect(allExtensons.length).toBe(0);

  extensionInfos.set([
    {
      id: 'first.extension1',
      name: 'first.extension1',
      description: 'test1',
      displayName: 'test1',
      publisher: 'Foo publisher',
      removable: true,
      version: '1.0.0',
      state: 'started',
      path: 'path1',
      readme: 'readme1',
    },
  ]);

  contributions.set([
    {
      id: 'second.extension2',
      extensionId: 'second.extension2',
      description: 'test2',
      type: 'hello',
      uiUri: 'http://test2',
      icon: 'icon2',
      hostEnvPath: 'path2',
      storagePath: 'storage2',
      displayName: 'test2',
      publisher: 'Foo publisher',
      name: 'extension2',
      version: '2.0.0',
    },
  ]);

  // refresh the extensions
  allExtensons = get(combinedInstalledExtensions);
  expect(allExtensons.length).toBe(2);

  const extension1 = allExtensons.find(ext => ext.id === 'first.extension1');
  expect(extension1).toBeDefined();
  expect(extension1?.type).toBe('pd');
  expect(extension1?.displayName).toBe('test1');

  const extension2 = allExtensons.find(ext => ext.id === 'second.extension2');
  expect(extension2).toBeDefined();

  expect(extension2?.type).toBe('dd');
  expect(extension2?.displayName).toBe('test2');
});
