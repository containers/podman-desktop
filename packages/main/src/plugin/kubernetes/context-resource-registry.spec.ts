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

import { ContextResourceRegistry } from './context-resource-registry.js';

test('ContextResourceRegistry', () => {
  const registry = new ContextResourceRegistry<string>();

  registry.set('context1', 'resource1', 'value1');
  expect(registry.get('context1', 'resource1')).toEqual('value1');

  registry.set('context1', 'resource2', 'value2');
  expect(registry.getAll()).toEqual(['value1', 'value2']);
});
