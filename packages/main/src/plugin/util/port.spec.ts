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
import * as port from './port.js';
import * as net from 'net';

test('return valid port range', async () => {
  const range = await port.getFreePortRange(3);

  const rangeValues = range.split('-');
  expect(rangeValues.length).toBe(2);

  const startRange = parseInt(rangeValues[0]);
  const endRange = parseInt(rangeValues[1]);

  expect(isNaN(startRange)).toBe(false);
  expect(isNaN(endRange)).toBe(false);

  expect(endRange + 1 - startRange).toBe(3);
  expect(await port.isFreePort(startRange)).toBe(true);
  expect(await port.isFreePort(endRange)).toBe(true);
});

test('check that the range returns new free ports if the one in previous call are busy', async () => {
  const range = await port.getFreePortRange(3);

  const rangeValues = range.split('-');
  expect(rangeValues.length).toBe(2);

  const startRange = parseInt(rangeValues[0]);
  const endRange = parseInt(rangeValues[1]);

  expect(isNaN(startRange)).toBe(false);
  expect(isNaN(endRange)).toBe(false);

  expect(endRange + 1 - startRange).toBe(3);

  const server = net.createServer();
  server.listen(endRange);

  const newRange = await port.getFreePortRange(3);

  server.close();

  const newRangeValues = newRange.split('-');
  expect(newRangeValues.length).toBe(2);

  const startNewRange = parseInt(newRangeValues[0]);
  const endNewRange = parseInt(newRangeValues[1]);

  expect(isNaN(startNewRange)).toBe(false);
  expect(isNaN(endNewRange)).toBe(false);

  expect(startNewRange > endRange).toBe(true);
  expect(endNewRange + 1 - startNewRange).toBe(3);
  expect(await port.isFreePort(startNewRange)).toBe(true);
  expect(await port.isFreePort(endNewRange)).toBe(true);
});
