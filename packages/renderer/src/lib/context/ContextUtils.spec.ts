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

import { expect, test } from 'vitest';

import { transformObjectToContext } from '/@/lib/context/ContextUtils';

test('Object with single property', async () => {
  expect(
    transformObjectToContext({
      property: 'hello',
    }).collectAllValues(),
  ).toStrictEqual({
    property: 'hello',
  });
});

test('Object with multiple properties', async () => {
  expect(
    transformObjectToContext({
      property: 'hello',
      field: 'world',
    }).collectAllValues(),
  ).toStrictEqual({
    property: 'hello',
    field: 'world',
  });
});

test('Object with array property', async () => {
  expect(
    transformObjectToContext({
      property: [1, 2, 3],
    }).collectAllValues(),
  ).toStrictEqual({
    property: [1, 2, 3],
  });
});
