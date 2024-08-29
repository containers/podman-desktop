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

import { once } from 'node:events';
import * as net from 'node:net';

import { expect, test } from 'vitest';

import * as port from './port.js';

const hosts = ['127.0.0.1', '0.0.0.0'];

function getInt(val: string | undefined): number {
  if (!val) {
    throw new Error('Value is empty');
  }
  return parseInt(val);
}

async function closeServer(server: net.Server): Promise<void> {
  const promise = once(server, 'close');
  server.close();
  await promise;
}

test('return valid port range', async () => {
  const range = await port.getFreePortRange(3);

  const rangeValues = range.split('-');
  expect(rangeValues.length).toBe(2);

  const startRange = getInt(rangeValues[0]);
  const endRange = getInt(rangeValues[1]);

  expect(isNaN(startRange)).toBe(false);
  expect(isNaN(endRange)).toBe(false);

  expect(endRange + 1 - startRange).toBe(3);
  expect(await port.isFreePort(startRange)).toBe(true);
  expect(await port.isFreePort(endRange)).toBe(true);
});

test.each(hosts)(
  'check that the range returns new free ports if the one in previous call are busy, when listening on %s',
  async host => {
    const range = await port.getFreePortRange(3);

    const rangeValues = range.split('-');
    expect(rangeValues.length).toBe(2);

    const startRange = getInt(rangeValues[0]);
    const endRange = getInt(rangeValues[1]);

    expect(isNaN(startRange)).toBe(false);
    expect(isNaN(endRange)).toBe(false);

    expect(endRange + 1 - startRange).toBe(3);

    const server = net.createServer();
    server.listen(endRange, host);
    await once(server, 'listening');

    const newRange = await port.getFreePortRange(3);

    await closeServer(server);

    const newRangeValues = newRange.split('-');
    expect(newRangeValues.length).toBe(2);

    const startNewRange = getInt(newRangeValues[0]);
    const endNewRange = getInt(newRangeValues[1]);

    expect(isNaN(startNewRange)).toBe(false);
    expect(isNaN(endNewRange)).toBe(false);

    expect(startNewRange > endRange).toBe(true);
    expect(endNewRange + 1 - startNewRange).toBe(3);
    expect(await port.isFreePort(startNewRange)).toBe(true);
    expect(await port.isFreePort(endNewRange)).toBe(true);
  },
);

test('return first empty port, no port is used', async () => {
  // eslint-disable-next-line sonarjs/pseudo-random
  const start = 21000 + Math.floor(Math.random() * 100);
  const freePort = await port.getFreePort(start);

  expect(freePort).toBe(start);
  expect(await port.isFreePort(freePort)).toBe(true);
});

test.each(hosts)(
  'return first empty port, port is used so it returns the next one, when listening on %s',
  async host => {
    const port20000 = 20000;
    const port20001 = 20001;

    // create a server to make port 20000 busy
    const server = net.createServer();
    server.listen(port20000, host);
    await once(server, 'listening');

    // as 20000 is busy it should increment it and return 20001
    const freePort = await port.getFreePort(port20000);

    await closeServer(server);

    expect(freePort).toBe(port20001);
    expect(await port.isFreePort(freePort)).toBe(true);
  },
);

test.each(hosts)(
  'return first empty port, port and next one are used so it returns the second from the starting one, when listening on %s',
  async host => {
    const port20000 = 20000;
    const port20001 = 20001;
    const port20002 = 20002;

    // create a server to make port 20000 busy
    const server = net.createServer();
    server.listen(port20000, host);
    await once(server, 'listening');

    const server2 = net.createServer();
    server2.listen(port20001, host);
    await once(server2, 'listening');

    // as 20000 is busy it should increment it and return 20001
    const freePort = await port.getFreePort(port20000);

    server.close();
    server2.close();
    await closeServer(server);
    await closeServer(server2);

    expect(freePort).toBe(port20002);
    expect(await port.isFreePort(freePort)).toBe(true);
  },
);

test('fails with range error if value is over upper range', async () => {
  await expect(port.isFreePort(200000)).rejects.toThrowError(
    /The port must have an integer value within the range from 1025 to 65535./,
  );
});

test('fails with range error if value is less lower range', async () => {
  await expect(port.isFreePort(-1)).rejects.toThrowError(/The port must be greater than 1024./);
});

test('should return message that user is trying to check unprivileged port', async () => {
  await expect(port.isFreePort(1)).rejects.toThrowError(/The port must be greater than 1024./);
});
