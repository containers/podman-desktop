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

import { expect, test } from 'vitest';

import { removeNonSerializableProperties } from '/@/lib/actions/ActionUtils';

test('Object with single non serializable property', async () => {
  expect(
    removeNonSerializableProperties({
      nonSerializable: () => {},
    }),
  ).toStrictEqual({});
});

test('Array with single non serializable property', async () => {
  expect(removeNonSerializableProperties([() => {}])).toStrictEqual([]);
});

test('Array with single non serializable and serializable property', async () => {
  expect(removeNonSerializableProperties([() => {}, 'dummy'])).toStrictEqual(['dummy']);
});

test('Object with properties nested in object', async () => {
  expect(
    removeNonSerializableProperties({
      parent: {
        nonSerializable: () => {},
        serializable: 'dummy',
      },
    }),
  ).toStrictEqual({
    parent: {
      serializable: 'dummy',
    },
  });
});

test('Object with properties nested in array', async () => {
  expect(
    removeNonSerializableProperties({
      parent: [
        {
          nonSerializable: () => {},
          serializable: 'dummy',
        },
      ],
    }),
  ).toStrictEqual({
    parent: [
      {
        serializable: 'dummy',
      },
    ],
  });
});

test('Object with single non serializable property nested in array', async () => {
  expect(
    removeNonSerializableProperties({
      parent: [
        {
          nonSerializable: () => {},
          serializable: 'dummy',
        },
      ],
    }),
  ).toStrictEqual({
    parent: [
      {
        serializable: 'dummy',
      },
    ],
  });
});
