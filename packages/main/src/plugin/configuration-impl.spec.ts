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

import type * as containerDesktopAPI from '@podman-desktop/api';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import { ConfigurationImpl } from './configuration-impl.js';

let configurationImpl: TestConfigurationImpl;

class TestConfigurationImpl extends ConfigurationImpl {
  getUpdateCallback(): (sectionName: string, scope: containerDesktopAPI.ConfigurationScope) => void {
    return this.updateCallback;
  }
}

beforeEach(() => {
  vi.resetAllMocks();
  const map = new Map<string, string>();
  configurationImpl = new TestConfigurationImpl(
    {
      send: vi.fn(),
    } as unknown as ApiSenderType,
    vi.fn(),
    map,
  );
});

test('Should callback on update with configuration key', async () => {
  await configurationImpl.update('key', 'value');
  expect(configurationImpl.getUpdateCallback()).toBeCalledWith('key', 'DEFAULT');
});
