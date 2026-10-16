/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { beforeEach, expect, test, vi } from 'vitest';

import { isLabelInName, warnIfLabelNotInName } from './label-in-name';

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

test.each([
  ['Delete container now', 'delete container', true],
  ['Install custom', 'Install custom...', true],
  ['Install   custom', 'install custom', true],
  ['Caf\u00e9 menu', 'Cafe\u0301', true],
  ['Remove', 'Delete', false],
  ['Delete', '', true],
  ['Delete', '...', true],
])('isLabelInName(%j, %j) is %s', (accessibleName, visibleText, expected) => {
  expect(isLabelInName(accessibleName, visibleText)).toBe(expected);
});

test('warnIfLabelNotInName warns with both strings when the text is missing from the name', () => {
  warnIfLabelNotInName('Remove', ' Delete \n');
  expect(console.warn).toHaveBeenCalledExactlyOnceWith(
    'Button aria-label "Remove" does not contain its visible text "Delete"',
  );
});

test.each([
  ['Delete container', 'Delete'],
  [undefined, 'Delete'],
  ['Delete', null],
])('warnIfLabelNotInName(%j, %j) does not warn', (accessibleName, visibleText) => {
  warnIfLabelNotInName(accessibleName, visibleText);
  expect(console.warn).not.toHaveBeenCalled();
});
