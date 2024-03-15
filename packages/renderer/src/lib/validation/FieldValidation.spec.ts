/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import { urlValidator } from './FieldValidation';

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should expect invalid domain', async () => {
  const result = urlValidator()('my_invalid_domain');
  expect(result[1]).toBe('Please enter a valid URL');
});

test('Should expect valid domain', async () => {
  const result = urlValidator()('valid.com');
  expect(result[0]).toBe(true);
});

test('Should expect valid TLD domain with more than 3 char domains', async () => {
  const result = urlValidator()('foobar.mydomain.science');
  expect(result[0]).toBe(true);
});
