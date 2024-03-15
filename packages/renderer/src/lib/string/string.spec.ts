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

import { splitSpacesHandlingDoubleQuotes } from './string';

test('Expect single argument without quotes returns a single element array ', async () => {
  expect(splitSpacesHandlingDoubleQuotes('arg1')).toStrictEqual(['arg1']);
});

test('Expect two arguments without quotes returns a two elements array ', async () => {
  expect(splitSpacesHandlingDoubleQuotes('arg1 arg2')).toStrictEqual(['arg1', 'arg2']);
});

test('Expect single argument with quotes returns a single element array ', async () => {
  expect(splitSpacesHandlingDoubleQuotes('"arg1"')).toStrictEqual(['arg1']);
});

test('Expect two arguments with quotes returns a two elements array ', async () => {
  expect(splitSpacesHandlingDoubleQuotes('"arg1" "arg2"')).toStrictEqual(['arg1', 'arg2']);
});

test('Expect mixed quoted and unquoted returns unquoted array ', async () => {
  expect(splitSpacesHandlingDoubleQuotes('arg1 "arg2" arg3')).toStrictEqual(['arg1', 'arg2', 'arg3']);
});
