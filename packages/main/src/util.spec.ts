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
import { getCommandLineArgs } from './util';

test('Should return command line argument', () => {
  const arg = getCommandLineArgs(['--arg_a=arg_aa', '--arg_b=arg_bb', '--arg_c=arg_cc'], '--arg_b=', false);
  expect(arg.split('=')[1]).toBe('arg_bb');
});

test('Should return undefined if command line argument is not found', () => {
  const arg = getCommandLineArgs(['--arg_a=arg_aa', '--arg_b=arg_bb', '--arg_c=arg_cc'], '--arg_d=', false);
  expect(arg).toBeUndefined();
});

test('Should throw an error when argv is invalid', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fakeArgv: any = 'null';
  expect(() => getCommandLineArgs(fakeArgv as string[], '--arg_d=', false)).toThrowError(
    new Error(`TypeError invalid func arg, must be an array: ${fakeArgv}`),
  );
});
