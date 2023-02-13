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
import { afterEach, beforeEach, vi, test, expect } from 'vitest';
import { CloseBehavior } from './close-behavior';
import { ConfigurationRegistry } from './configuration-registry';
import { isLinux } from '../util';
import * as os from 'node:os';

let closeBehavior;
let configurationRegistry;

beforeEach(() => {
  configurationRegistry = new ConfigurationRegistry();
  closeBehavior = new CloseBehavior(configurationRegistry);
});

afterEach(() => {
  vi.clearAllMocks();
});

test('configuration registry properties are not set before init is called', () => {
  expect(configurationRegistry.getConfigurationProperties()).toEqual({});
});

test('should register configuration node object on init method call', () => {
  const spy = vi.spyOn(configurationRegistry, 'registerConfigurations');
  closeBehavior.init();
  expect(spy).toBeCalled();
});

test.skipIf(os.platform() !== 'linux')('should set default value of configuraton registry to true on Linux', () => {
  closeBehavior.init();
  expect(configurationRegistry.getConfigurationProperties()['preferences.ExitOnClose'].default).toBeTruthy();
});

test.skipIf(os.platform() !== 'darwin')('should set default value of configuraton registry to false on Mac OS', () => {
  closeBehavior.init();
  expect(configurationRegistry.getConfigurationProperties()['preferences.ExitOnClose'].default).toBeFalsy();
});

test.skipIf(os.platform() !== 'win32')('should set default value of configuraton registry to false on Windows', () => {
  console.log(`isLinux result: ${isLinux}`);
  closeBehavior.init();
  expect(configurationRegistry.getConfigurationProperties()['preferences.ExitOnClose'].default).toBeFalsy();
});
