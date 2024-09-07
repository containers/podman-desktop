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
import { rm } from 'node:fs/promises';
import { type AddressInfo, createConnection, createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Server } from 'ssh2';
import { generatePrivateKey } from 'sshpk';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { PodmanRemoteSshTunnel } from './podman-remote-ssh-tunnel';

// mock the API
vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

class TestPodmanRemoteSshTunnel extends PodmanRemoteSshTunnel {
  isListening(): boolean {
    return super.isListening();
  }
}

let dummyKey: string;
beforeAll(async () => {
  // generate on the fly a dummy key
  dummyKey = generatePrivateKey('ed25519').toString('ssh');
});

test('should be able to connect', async () => {
  let sshPort = 0;
  let connected = false;
  let authenticated = false;

  // create ssh server
  const sshServer = new Server(
    {
      hostKeys: [dummyKey],
    },
    client => {
      connected = true;

      client
        .on('authentication', ctx => {
          ctx.accept();
        })
        .on('ready', () => {
          authenticated = true;
        });
    },
  ).listen(0, '127.0.0.1', () => {
    const address: AddressInfo = sshServer.address() as AddressInfo;
    sshPort = address?.port;
  });

  // wait that the server is listening
  await vi.waitFor(() => expect(sshPort).toBeGreaterThan(0));

  // create a npipe/socket server
  // on windows it's an npipe, on macOS a socket file
  let socketOrNpipePathLocal: string;
  let socketOrNpipePathRemote: string;
  if (process.platform === 'win32') {
    socketOrNpipePathLocal = '\\\\.\\pipe\\test-local';
    socketOrNpipePathRemote = '\\\\.\\pipe\\test-remote';
  } else {
    socketOrNpipePathLocal = join(tmpdir(), 'test-local.sock');
    socketOrNpipePathRemote = join(tmpdir(), 'test-remote.sock');
  }

  // delete file if exists
  await rm(socketOrNpipePathLocal, { force: true });
  await rm(socketOrNpipePathRemote, { force: true });

  let listenReady = false;

  // start a remote server
  const npipeServer = createServer(_socket => {}).listen(socketOrNpipePathRemote, () => {
    listenReady = true;
  });

  await vi.waitFor(() => expect(listenReady).toBeTruthy());

  const podmanRemoteSshTunnel = new TestPodmanRemoteSshTunnel(
    'localhost',
    sshPort,
    'foo',
    '',
    socketOrNpipePathRemote,
    socketOrNpipePathLocal,
  );

  podmanRemoteSshTunnel.connect();

  // wait authenticated and connected
  await vi.waitFor(() => expect(connected && authenticated && podmanRemoteSshTunnel.isListening()).toBeTruthy());

  let connectedToLocal = false;
  // send a request to the tunnel using the socket path
  const client = createConnection({ path: socketOrNpipePathLocal }, () => {
    connectedToLocal = true;
  });

  await vi.waitFor(() => expect(connectedToLocal).toBeTruthy());

  client.end();
  npipeServer.close();
});
