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

import { WelcomeSettings } from '../../../../main/src/plugin/welcome/welcome-settings';
import { WelcomeUtils } from './welcome-utils';

let welcomeUtils: WelcomeUtils;

// mock window.getConfigurationValue
const getConfigurationValueMock = vi.fn();
(window as any).getConfigurationValue = getConfigurationValueMock;

beforeEach(() => {
  vi.clearAllMocks();
  welcomeUtils = new WelcomeUtils();
});

test('should expect no value by default', async () => {
  getConfigurationValueMock.mockResolvedValue(undefined);
  const version = await welcomeUtils.getVersion();
  expect(version).toBeUndefined();
  expect(getConfigurationValueMock).toHaveBeenCalledWith(WelcomeSettings.SectionName + '.' + WelcomeSettings.Version);
});

test('should expect value', async () => {
  getConfigurationValueMock.mockResolvedValue('foo');
  const version = await welcomeUtils.getVersion();
  expect(version).toBe('foo');
  expect(getConfigurationValueMock).toHaveBeenCalledWith(WelcomeSettings.SectionName + '.' + WelcomeSettings.Version);
});
