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

test('return port range starting with port 9000', async () => {
  const range = await port.getFreePortRange(3);

  expect(range).toBe('9000-9002');
});

test('return port range starting with port 9001 if 9000 is busy', async () => {
  const server = net.createServer();
  server.listen(9000);
  const range = await port.getFreePortRange(3);

  expect(range).toBe('9001-9003');
  server.close();
});
