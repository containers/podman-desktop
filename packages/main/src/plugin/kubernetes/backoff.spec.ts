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

import { Backoff } from './backoff.js';

test('backoff increment and limit without jitter', () => {
  const backoff = new Backoff(100, 500, 0);
  expect(backoff.get()).toEqual(100);
  expect(backoff.get()).toEqual(200);
  expect(backoff.get()).toEqual(400);
  expect(backoff.get()).toEqual(800);
  expect(backoff.get()).toEqual(800);
});

test('backoff with jitter', () => {
  let jitterFound = false;
  let base = 100;
  let backoff: Backoff = new Backoff(base, 500, 10);
  // run several tests, as we cannot rely on a single one due to the random nature
  for (let i = 0; i < 10; i++) {
    const value = backoff.get();
    expect(value).not.toBeLessThan(base);
    expect(value).toBeLessThan(base * 1.1);
    if (value === base) {
      // this can happen, try again
      backoff = new Backoff(base, 500, 10);
      continue;
    }
    jitterFound = true;
    base = value;
    break;
  }
  expect(jitterFound).toBeTruthy();
  const value = backoff.get();
  expect(value).not.toBeLessThan(base * 2);
  expect(value).toBeLessThan(base * 2 * 1.1);
});

test('backoff reset', () => {
  const backoff = new Backoff(100, 500, 0);
  expect(backoff.get()).toBe(100);
  expect(backoff.get()).toBe(200);
  expect(backoff.get()).toBe(400);
  expect(backoff.get()).toBe(800);
  expect(backoff.get()).toBe(800);
  backoff.reset();
  expect(backoff.get()).toBe(100);
  expect(backoff.get()).toBe(200);
  backoff.reset();
  expect(backoff.get()).toBe(100);
});
