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
import { beforeAll, expect, test, vi } from 'vitest';

import { providerTerminals, getExistingTerminal, registerTerminal } from './provider-terminal-store';
import { providerInfos } from './providers';

beforeAll(() => {
  vi.clearAllMocks();
});

test('get a terminal', async () => {
  // register a new terminal
  registerTerminal({
    providerInternalId: '1',
    connectionSocket: 'connectionSocket1',
    connectionName: 'connectionName1',
    callbackId: 1,
    terminal: {} as any,
  });

  // try to grab the terminal
  const terminal1 = getExistingTerminal('connectionName1', 'connectionSocket1');
  expect(terminal1).toBeDefined();

  // try to grab an unexisting terminal
  const terminal2 = getExistingTerminal('connectionName2', 'connectionSocket2');
  expect(terminal2).toBeUndefined();
});

test('terminals should be updated in case of a matching provider connection is removed', async () => {
  // set list of terminals
  registerTerminal({
    providerInternalId: '1',
    connectionSocket: 'connectionSocket1',
    connectionName: 'connectionName1',
    callbackId: 1,
    terminal: {} as any,
  });

  // now, assume we don't have anymore provider connections
  providerInfos.set([]);

  // grab again the list of terminals
  const updatedTerminals = get(providerTerminals);

  // check that the terminal has been removed
  expect(updatedTerminals.length).toBe(0);
});
