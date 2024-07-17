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

import { beforeEach, expect, test, vi } from 'vitest';

import { getSpinnerCode } from './micromark-button-directive';

beforeEach(() => {
  vi.clearAllMocks();
});

test('Check script is removed', async () => {
  const spinnerCode = getSpinnerCode();
  expect(spinnerCode).not.contains('<script');
  expect(spinnerCode).not.contains('</script>');
});

test('Check height is set', async () => {
  const spinnerCode = getSpinnerCode();
  expect(spinnerCode).contains('height=16px');
});

test('Check width is set', async () => {
  const spinnerCode = getSpinnerCode();
  expect(spinnerCode).contains('width=16px');
});

test('Check macro is not there', async () => {
  const spinnerCode = getSpinnerCode();
  expect(spinnerCode).not.contains('{size}');
});
