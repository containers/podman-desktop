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

import { test, expect } from 'vitest';
import { UpdateProviderRegistry } from './update-provider-registry.js';
import type { UpdateProvider } from './update-provider.js';

test('register update provider', () => {
  const updateProviderRegistry = new UpdateProviderRegistry();

  expect(updateProviderRegistry.getProvider('dummy')).toBeUndefined();

  const updateProviderMock = {
    protocol: 'dummy',
  };
  updateProviderRegistry.registerProvider(updateProviderMock as unknown as UpdateProvider);
  expect(updateProviderRegistry.getProvider('dummy')).toBeDefined();
});

test('unregister update provider', () => {
  const updateProviderRegistry = new UpdateProviderRegistry();

  const updateProviderMock = {
    protocol: 'dummy',
  };
  const disposable = updateProviderRegistry.registerProvider(updateProviderMock as unknown as UpdateProvider);
  disposable.dispose();

  expect(updateProviderRegistry.getProvider('dummy')).toBeUndefined();
});
