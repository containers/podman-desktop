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

import '@testing-library/jest-dom/vitest';

import { expect, test } from 'vitest';

import { capitalize, getTabUrl, isTabSelected } from './Util';

test('test capitalize function', () => {
  expect(capitalize('test')).toBe('Test');
  expect(capitalize('Test')).toBe('Test');
  expect(capitalize('TEST')).toBe('TEST');
});

test('test getTabUrl', () => {
  expect(getTabUrl('/images', 'images')).toBe('/images');
  expect(getTabUrl('/images/summary', 'summary')).toBe('/images/summary');
  expect(getTabUrl('/images/summary', 'logs')).toBe('/images/logs');
  expect(getTabUrl('/images/image-id/summary', 'logs')).toBe('/images/image-id/logs');
  expect(getTabUrl('/images/image-id/logs', 'logs')).toBe('/images/image-id/logs');
});

test('test isTabSelected', () => {
  expect(isTabSelected('/images/details/summary', 'summary')).toBe(true);
  expect(isTabSelected('/images/details/logs', 'summary')).toBe(false);
  expect(isTabSelected('/images/details/', 'images')).toBe(false);
  expect(isTabSelected('/images/image-id/details/summary', 'summary')).toBe(true);
});
