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
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import * as assert from 'assert';
import { suite, test } from 'vitest';

import { ContextKeyExpr } from './contextKey.js';

function createContext(ctx: any) {
  return {
    getValue: (key: string) => {
      return ctx[key];
    },
  };
}

suite('ContextKeyExpr', () => {
  test('ContextKeyInExpr', () => {
    const ainb = ContextKeyExpr.deserialize('a in b')!;
    assert.strictEqual(ainb.evaluate(createContext({ a: 3, b: [3, 2, 1] })), true);
    assert.strictEqual(ainb.evaluate(createContext({ a: 3, b: [1, 2, 3] })), true);
    assert.strictEqual(ainb.evaluate(createContext({ a: 3, b: [1, 2] })), false);
    assert.strictEqual(ainb.evaluate(createContext({ a: 3 })), false);
    assert.strictEqual(ainb.evaluate(createContext({ a: 3, b: null })), false);
    assert.strictEqual(ainb.evaluate(createContext({ a: 'x', b: ['x'] })), true);
    assert.strictEqual(ainb.evaluate(createContext({ a: 'x', b: ['y'] })), false);
    assert.strictEqual(ainb.evaluate(createContext({ a: 'x', b: {} })), false);
    assert.strictEqual(ainb.evaluate(createContext({ a: 'x', b: { x: false } })), true);
    assert.strictEqual(ainb.evaluate(createContext({ a: 'x', b: { x: true } })), true);
    assert.strictEqual(ainb.evaluate(createContext({ a: 'prototype', b: {} })), false);
  });

  test('ContextKeyNotInExpr', () => {
    const aNotInB = ContextKeyExpr.deserialize('a not in b')!;
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 3, b: [3, 2, 1] })), false);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 3, b: [1, 2, 3] })), false);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 3, b: [1, 2] })), true);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 3 })), true);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 3, b: null })), true);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 'x', b: ['x'] })), false);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 'x', b: ['y'] })), true);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 'x', b: {} })), true);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 'x', b: { x: false } })), false);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 'x', b: { x: true } })), false);
    assert.strictEqual(aNotInB.evaluate(createContext({ a: 'prototype', b: {} })), true);
  });
});
