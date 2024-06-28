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

import type * as PodmanDesktop from '@podman-desktop/api';
import type { SpyInstance } from 'vitest';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import type { ExtensionModule } from './module-loader.js';
import { ModuleLoader } from './module-loader.js';

const fakeModule = {
  _load: vi.fn(),
};
let analyzedExtension;
let moduleLoader;

const fakeModule1 = {
  export1: {},
  export2: {},
};
const fakeApi = {} as typeof PodmanDesktop;

let loadSpy: SpyInstance;

beforeEach(() => {
  loadSpy = vi.spyOn(fakeModule, '_load');
  analyzedExtension = new Map<string, ExtensionModule>();
  moduleLoader = new ModuleLoader(fakeModule, analyzedExtension);
  analyzedExtension.set('ext', {
    path: '/path/to/ext',
    api: fakeApi,
  });
  moduleLoader.addOverride({
    module1: fakeModule1,
  });
  moduleLoader.addOverride({
    module2: ext => ext.api,
  });
  moduleLoader.overrideRequire();
});

afterEach(() => {
  vi.clearAllMocks();
});

test('module loader overrides modules registered as records', () => {
  const loadedModule1 = fakeModule._load('module1', {
    filename: '/path/to/ext/internal/module1.js',
    path: '/path/to/ext',
  });
  expect(loadedModule1).haveOwnProperty('export1');
  expect(loadedModule1).haveOwnProperty('export2');
});

test('module loader overrides modules registered as factory', () => {
  const loadedModule2 = fakeModule._load('module2', {
    filename: '/path/to/ext/internal/module2.js',
    path: '/path/to/ext',
  });
  expect(loadedModule2).equal(fakeApi);
});

test('module loader trow exception if override is a function and request came not from extension', () => {
  let error;
  try {
    fakeModule._load('module2', { filename: '/path/to/none/ext/internal/module1.js', path: '/path/to/ext' });
  } catch (err) {
    error = err;
  }
  expect(error).is.not.undefined;
});

test('module loader calls calls original _load function for not registered module', () => {
  fakeModule._load('module3', { filename: '/path/to/ext/internal/module1.js', path: '/path/to/ext' });
  expect(loadSpy).toHaveBeenCalledOnce();
});
