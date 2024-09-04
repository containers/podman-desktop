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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { get } from 'svelte/store';
import { beforeEach, expect, test } from 'vitest';

import { setup, tooltipHidden } from './tooltip-store';

const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any): void => {
    callbacks.set(message, callback);
  },
};

beforeEach(() => {
  (window as any).addEventListener = eventEmitter.receive;
});

test('tooltipHidden starts as false, then true on tooltip-hide and false on tooltip-show', async () => {
  setup();

  expect(get(tooltipHidden)).toBeFalsy();

  // now we call the listener
  let callback = callbacks.get('tooltip-hide');

  expect(callback).toBeDefined();

  callback();

  expect(get(tooltipHidden)).toBeTruthy();

  callback = callbacks.get('tooltip-show');

  callback();

  expect(get(tooltipHidden)).toBeFalsy();
});
