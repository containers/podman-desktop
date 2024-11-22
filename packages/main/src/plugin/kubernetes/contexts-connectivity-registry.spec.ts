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

import { expect, test } from 'vitest';

import type { ContextConnectivity } from './contexts-connectivity-registry.js';
import { ContextsConnectivityRegistry } from './contexts-connectivity-registry.js';

class ContextsConnectivityRegistryTest extends ContextsConnectivityRegistry {
  override getConnectivity(contextName: string): ContextConnectivity {
    return super.getConnectivity(contextName);
  }
}

test('setChecking should change the checking state for the context only', () => {
  const registry = new ContextsConnectivityRegistryTest();
  const contextName = 'context1';
  const otherContextName = 'context2';
  expect(registry.getConnectivity(contextName)).toEqual({ checking: false, reachable: false });
  expect(registry.getConnectivity(otherContextName)).toEqual({ checking: false, reachable: false });
  registry.setChecking(contextName, true);
  expect(registry.getConnectivity(contextName)).toEqual({ checking: true, reachable: false });
  expect(registry.getConnectivity(otherContextName)).toEqual({ checking: false, reachable: false });
});

test('setReachable should change the reachable state for the context only', () => {
  const registry = new ContextsConnectivityRegistryTest();
  const contextName = 'context1';
  const otherContextName = 'context2';
  expect(registry.getConnectivity(contextName)).toEqual({ checking: false, reachable: false });
  expect(registry.getConnectivity(otherContextName)).toEqual({ checking: false, reachable: false });
  registry.setReachable(contextName, true);
  expect(registry.getConnectivity(contextName)).toEqual({ checking: false, reachable: true });
  expect(registry.getConnectivity(otherContextName)).toEqual({ checking: false, reachable: false });
});
