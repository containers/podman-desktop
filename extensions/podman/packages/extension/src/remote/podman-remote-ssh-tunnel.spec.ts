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

import { rm } from 'node:fs/promises';
import * as net from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';

import { Client, type ConnectConfig, Server } from 'ssh2';
import { generatePrivateKey } from 'sshpk';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { PodmanRemoteSshTunnel } from './podman-remote-ssh-tunnel';

beforeEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

class TestPodmanRemoteSshTunnel extends PodmanRemoteSshTunnel {
  isListening(): boolean {
    return super.isListening();
  }

  getSshConfig(): ConnectConfig {
    return super.getSshConfig();
  }

  createServer(connectionListener: (socket: net.Socket) => void): net.Server {
    return super.createServer(connectionListener);
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
    const address: net.AddressInfo = sshServer.address() as net.AddressInfo;
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
  const npipeServer = net
    .createServer((_socket: net.Socket) => {})
    .listen(socketOrNpipePathRemote, () => {
      listenReady = true;
    });

  await vi.waitFor(() => expect(listenReady).toBeTruthy());

  const podmanRemoteSshTunnel = new TestPodmanRemoteSshTunnel(
    'localhost',
    sshPort,
    'foo',
    dummyKey,
    socketOrNpipePathRemote,
    socketOrNpipePathLocal,
  );

  podmanRemoteSshTunnel.connect();

  // wait authenticated and connected
  await vi.waitFor(() => expect(connected && authenticated && podmanRemoteSshTunnel.isListening()).toBeTruthy());

  let connectedToLocal = false;
  // send a request to the tunnel using the socket path
  const client = net.createConnection({ path: socketOrNpipePathLocal }, () => {
    connectedToLocal = true;
  });

  await vi.waitFor(() => expect(connectedToLocal).toBeTruthy());

  client.end();
  npipeServer.close();
});

test('disconnect should clear pending reconnect timeout', () => {
  vi.useFakeTimers();
  vi.spyOn(Client.prototype, 'connect').mockReturnThis();

  const podmanRemoteSshTunnel = new PodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    '',
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );
  const connectSpy = vi.spyOn(podmanRemoteSshTunnel, 'connect');

  podmanRemoteSshTunnel.connect();
  podmanRemoteSshTunnel.handleReconnect();
  podmanRemoteSshTunnel.disconnect();

  vi.advanceTimersByTime(30000);
  expect(connectSpy).toHaveBeenCalledTimes(1);
});

test('should use the provided private key over the ssh-agent', () => {
  const tunnel = new TestPodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    'my-private-key',
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );
  const config = tunnel.getSshConfig();
  expect(config.privateKey).toBe('my-private-key');
  expect(config.agent).toBeUndefined();
});

test('should fall back to the ssh-agent when no private key is provided', () => {
  vi.stubEnv('SSH_AUTH_SOCK', '/tmp/agent.sock');
  const tunnel = new TestPodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    undefined,
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );
  const config = tunnel.getSshConfig();
  expect(config.privateKey).toBeUndefined();
  expect(config.agent).toBe('/tmp/agent.sock');
});

test('should not set an agent when no private key and no ssh-agent are available', () => {
  vi.stubEnv('SSH_AUTH_SOCK', undefined);
  const tunnel = new TestPodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    undefined,
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );
  const config = tunnel.getSshConfig();
  expect(config.privateKey).toBeUndefined();
  expect(config.agent).toBeUndefined();
});

test('should expose ssh connection errors', () => {
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const capturedClient: { value?: Client } = {};
  vi.spyOn(Client.prototype, 'connect').mockImplementation(function (this: Client): Client {
    capturedClient.value = this;
    return this;
  });

  const podmanRemoteSshTunnel = new PodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    '',
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );

  podmanRemoteSshTunnel.connect();
  capturedClient.value?.emit('error', new Error('connection refused'));

  expect(podmanRemoteSshTunnel.status()).toBe('unknown');
  expect(podmanRemoteSshTunnel.error).toBe('connection refused');

  podmanRemoteSshTunnel.disconnect();
});

test('should expose unexpected ssh end and close errors while reconnecting', () => {
  vi.useFakeTimers();
  const capturedClients: Client[] = [];
  vi.spyOn(Client.prototype, 'connect').mockImplementation(function (this: Client): Client {
    capturedClients.push(this);
    return this;
  });

  const podmanRemoteSshTunnel = new TestPodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    '',
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );
  vi.spyOn(podmanRemoteSshTunnel, 'createServer').mockReturnValue({
    listen: vi.fn(),
    on: vi.fn(),
    close: vi.fn(),
  } as unknown as net.Server);

  podmanRemoteSshTunnel.connect();
  capturedClients[0].emit('end');

  expect(podmanRemoteSshTunnel.status()).toBe('stopped');
  expect(podmanRemoteSshTunnel.error).toBe('SSH connection ended unexpectedly');

  vi.advanceTimersByTime(30000);
  capturedClients[1].emit('ready');
  capturedClients[1].emit('close');

  expect(podmanRemoteSshTunnel.status()).toBe('stopped');
  expect(podmanRemoteSshTunnel.error).toBe('SSH connection closed unexpectedly');

  podmanRemoteSshTunnel.disconnect();
});

test('should keep the ssh connection error when the connection ends and closes afterwards', () => {
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const capturedClient: { value?: Client } = {};
  vi.spyOn(Client.prototype, 'connect').mockImplementation(function (this: Client): Client {
    capturedClient.value = this;
    return this;
  });

  const podmanRemoteSshTunnel = new PodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    '',
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );

  podmanRemoteSshTunnel.connect();
  // ssh2 emits 'error' then 'end' and 'close' when authentication fails
  capturedClient.value?.emit('error', new Error('All configured authentication methods failed'));
  capturedClient.value?.emit('end');
  capturedClient.value?.emit('close');

  expect(podmanRemoteSshTunnel.error).toBe('All configured authentication methods failed');

  podmanRemoteSshTunnel.disconnect();
});

test('should clear error when ssh connection becomes ready', async () => {
  vi.useFakeTimers();
  vi.spyOn(console, 'error').mockImplementation(() => {});

  const capturedClient: { value?: Client } = {};
  vi.spyOn(Client.prototype, 'connect').mockImplementation(function (this: Client): Client {
    capturedClient.value = this;
    return this;
  });

  const podmanRemoteSshTunnel = new TestPodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    '',
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );
  vi.spyOn(podmanRemoteSshTunnel, 'createServer').mockReturnValue({
    listen: vi.fn((_path, callback) => {
      callback();
    }),
    on: vi.fn(),
    close: vi.fn(),
  } as unknown as net.Server);

  podmanRemoteSshTunnel.connect();
  capturedClient.value?.emit('error', new Error('connection refused'));
  capturedClient.value?.emit('ready');

  await vi.waitFor(() => expect(podmanRemoteSshTunnel.isListening()).toBeTruthy());
  expect(podmanRemoteSshTunnel.status()).toBe('started');
  expect(podmanRemoteSshTunnel.error).toBeUndefined();

  podmanRemoteSshTunnel.disconnect();
});

test('should not expose errors of a single forwarded stream', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  let localConnectionHandler: ((localSocket: net.Socket) => void) | undefined;
  const localSocket = new PassThrough() as unknown as net.Socket;
  const remoteSocket = new PassThrough();
  const capturedClient: { value?: Client } = {};
  vi.spyOn(Client.prototype, 'connect').mockImplementation(function (this: Client): Client {
    capturedClient.value = this;
    return this;
  });
  vi.spyOn(Client.prototype, 'openssh_forwardOutStreamLocal').mockImplementation((_path, callback) => {
    callback(undefined, remoteSocket as never);
    return undefined as never;
  });

  const podmanRemoteSshTunnel = new TestPodmanRemoteSshTunnel(
    'localhost',
    22,
    'foo',
    '',
    '/tmp/remote.sock',
    '/tmp/local.sock',
  );

  vi.spyOn(podmanRemoteSshTunnel, 'createServer').mockImplementation(connectionListener => {
    localConnectionHandler = connectionListener;
    return {
      listen: vi.fn((_path, callback) => {
        callback();
      }),
      on: vi.fn(),
      close: vi.fn(),
    } as unknown as net.Server;
  });

  podmanRemoteSshTunnel.connect();
  capturedClient.value?.emit('ready');
  await vi.waitFor(() => expect(podmanRemoteSshTunnel.isListening()).toBeTruthy());

  localConnectionHandler?.(localSocket);
  await vi.waitFor(() => expect(Client.prototype.openssh_forwardOutStreamLocal).toHaveBeenCalled());

  remoteSocket.emit('error', new Error('remote socket failed'));

  // the ssh connection itself is still healthy
  expect(podmanRemoteSshTunnel.status()).toBe('started');
  expect(podmanRemoteSshTunnel.error).toBeUndefined();

  podmanRemoteSshTunnel.disconnect();
});
