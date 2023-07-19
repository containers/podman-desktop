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

import { beforeAll, beforeEach, expect, expectTypeOf, test, vi } from 'vitest';
import { ContextRegistry } from './context-registry.js';
import type { ApiSenderType } from './api.js';

let contextRegistry: ContextRegistry;

beforeAll(() => {
  contextRegistry = new ContextRegistry(vi.fn() as unknown as ApiSenderType);
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should register extension context', async () => {
  contextRegistry.registerContext('extension');
  const contexts = contextRegistry.listContextInfos();
  expectTypeOf(contexts).toBeArray();
  expect(contexts.length).toBe(1);
});

test('Should not register new context for an already registered extension', async () => {
  contextRegistry.registerContext('extension');
  contextRegistry.registerContext('extension');
  const contexts = contextRegistry.listContextInfos();
  expect(contexts.length).toBe(1);
});

test('Should unregister extension context', async () => {
  contextRegistry.registerContext('extension');
  let contexts = contextRegistry.listContextInfos();
  expectTypeOf(contexts).toBeArray();
  expect(contexts.length).toBe(1);
  contextRegistry.unregisterContext('extension');
  contexts = contextRegistry.listContextInfos();
  expectTypeOf(contexts).toBeArray();
  expect(contexts.length).toBe(0);
});

test('Should return empty array if no extension has been registered', async () => {
  const contexts = contextRegistry.listContextInfos();
  expectTypeOf(contexts).toBeArray();
  expect(contexts.length).toBe(0);
});

test('Should return array with contexts of registered extensions', async () => {
  contextRegistry.registerContext('extension');
  const contexts = contextRegistry.listContextInfos();
  expectTypeOf(contexts).toBeArray();
  expect(contexts.length).toBe(1);
  expect(contexts[0].id).toEqual(0);
  expect(contexts[0].parent).toBeNull();
  expect(contexts[0].extension).toEqual('extension');
});

test('Should throw an error if trying to get context not registered extension', async () => {
  expect(() => contextRegistry.getContextInfo('unknown')).toThrowError('no context found for extension unknown');
});

test('Should return the contextInfo of the registered extension', async () => {
  contextRegistry.registerContext('extension');
  const context = contextRegistry.getContextInfo('extension');
  expect(context.id).toEqual(0);
  expect(context.parent).toBeNull();
  expect(context.extension).toEqual('extension');
});
