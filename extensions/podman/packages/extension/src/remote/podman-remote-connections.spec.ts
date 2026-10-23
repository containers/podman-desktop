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

import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { PodmanRemoteConnections } from './podman-remote-connections';
import type { PodmanRemoteSshTunnel } from './podman-remote-ssh-tunnel';

const extensionContext = {} as extensionApi.ExtensionContext;

const provider = {} as extensionApi.Provider;

beforeEach(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

afterEach(() => {
  vi.useRealTimers();
});
class TestPodmanRemoteConnections extends PodmanRemoteConnections {
  createTunnel(
    host: string,
    port: number,
    username: string,
    privateKey: string,
    remotePath: string,
    localPath: string,
  ): PodmanRemoteSshTunnel {
    return super.createTunnel(host, port, username, privateKey, remotePath, localPath);
  }

  async refreshRemoteConnections(): Promise<void> {
    return super.refreshRemoteConnections();
  }

  async readPrivateKey(identity?: string): Promise<string | undefined> {
    return super.readPrivateKey(identity);
  }
}

test('should do nothing if the configuration is disabled', async () => {
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => false,
  } as unknown as extensionApi.Configuration);
  const podmanRemoteConnections = new TestPodmanRemoteConnections(extensionContext, provider);

  // spy createTunnel method
  const spyCreateTunnel = vi.spyOn(podmanRemoteConnections, 'createTunnel');

  // spy refreshRemoteConnections method
  const spyRefreshRemoteConnections = vi.spyOn(podmanRemoteConnections, 'refreshRemoteConnections');

  try {
    // start
    await podmanRemoteConnections.start();

    // no connection should be created
    expect(spyCreateTunnel).not.toHaveBeenCalled();
    expect(spyRefreshRemoteConnections).not.toHaveBeenCalled();
  } finally {
    // clear the recurring monitoring timer so it cannot fire in a later test
    podmanRemoteConnections.stop();
  }
});

test('should check connections if configuration is enabled', async () => {
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => true,
  } as unknown as extensionApi.Configuration);
  const podmanRemoteConnections = new TestPodmanRemoteConnections(extensionContext, provider);

  // mock exec method for listing podman system connections
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stdout: JSON.stringify([]),
  } as unknown as extensionApi.RunResult);

  // spy createTunnel method
  const spyCreateTunnel = vi.spyOn(podmanRemoteConnections, 'createTunnel');

  // spy refreshRemoteConnections method
  const spyRefreshRemoteConnections = vi.spyOn(podmanRemoteConnections, 'refreshRemoteConnections');

  try {
    // start
    await podmanRemoteConnections.start();

    // no connection should be created
    expect(spyCreateTunnel).not.toHaveBeenCalled();
    expect(spyRefreshRemoteConnections).toHaveBeenCalled();
  } finally {
    // clear the recurring monitoring timer so it cannot fire in a later test
    podmanRemoteConnections.stop();
  }
});

test('hasConnections should return false when no connections exist', () => {
  const remoteConnections = new TestPodmanRemoteConnections(extensionContext, provider);
  expect(remoteConnections.hasConnections()).toBe(false);
});

test('hasConnections should return true after remote connections are registered', async () => {
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => true,
  } as unknown as extensionApi.Configuration);

  const mockProvider = {
    registerContainerProviderConnection: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  } as unknown as extensionApi.Provider;
  const mockContext = {
    subscriptions: [],
  } as unknown as extensionApi.ExtensionContext;

  const remoteConnections = new TestPodmanRemoteConnections(mockContext, mockProvider);

  vi.spyOn(remoteConnections, 'readPrivateKey').mockResolvedValue('fake-key');
  vi.spyOn(remoteConnections, 'createTunnel').mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    status: () => 'started',
  } as unknown as PodmanRemoteSshTunnel);

  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stdout: JSON.stringify([
      {
        IsMachine: false,
        URI: 'ssh://dummy@192.168.1.100:22/run/podman/podman.sock',
        Identity: '/tmp/fakepath',
        Name: 'RemoteConnection1',
      },
    ]),
  } as unknown as extensionApi.RunResult);

  await remoteConnections.refreshRemoteConnections();

  expect(remoteConnections.hasConnections()).toBe(true);
});

test('should skip broken connection and still register valid ones', async () => {
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => true,
  } as unknown as extensionApi.Configuration);

  const mockProvider = {
    registerContainerProviderConnection: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  } as unknown as extensionApi.Provider;
  const mockContext = {
    subscriptions: [],
  } as unknown as extensionApi.ExtensionContext;

  const remoteConnections = new TestPodmanRemoteConnections(mockContext, mockProvider);

  vi.spyOn(remoteConnections, 'readPrivateKey').mockImplementation(async (identity?: string) => {
    if (identity === '/tmp/broken-key') {
      throw new Error('ENOENT: no such file');
    }
    return 'fake-key';
  });
  vi.spyOn(remoteConnections, 'createTunnel').mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    status: () => 'started',
  } as unknown as PodmanRemoteSshTunnel);

  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stdout: JSON.stringify([
      {
        IsMachine: false,
        URI: 'ssh://user@192.168.1.1:22/run/podman/podman.sock',
        Identity: '/tmp/broken-key',
        Name: 'BrokenRemote',
      },
      {
        IsMachine: false,
        URI: 'ssh://user@192.168.1.2:22/run/podman/podman.sock',
        Identity: '/tmp/valid-key',
        Name: 'ValidRemote',
      },
    ]),
  } as unknown as extensionApi.RunResult);

  await remoteConnections.refreshRemoteConnections();

  expect(remoteConnections.hasConnections()).toBe(true);
});

test('should register a connection with a missing Identity via the ssh-agent (no key read)', async () => {
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => true,
  } as unknown as extensionApi.Configuration);

  const mockProvider = {
    registerContainerProviderConnection: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  } as unknown as extensionApi.Provider;
  const mockContext = {
    subscriptions: [],
  } as unknown as extensionApi.ExtensionContext;

  const remoteConnections = new TestPodmanRemoteConnections(mockContext, mockProvider);

  // spy on the real readPrivateKey to prove it is not reading any key file
  const readPrivateKeySpy = vi.spyOn(remoteConnections, 'readPrivateKey');
  const createTunnelSpy = vi.spyOn(remoteConnections, 'createTunnel').mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    status: () => 'started',
  } as unknown as PodmanRemoteSshTunnel);

  // podman >= 5.x omits the Identity field entirely when a connection was added
  // without --identity, so connection.Identity is undefined here
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stdout: JSON.stringify([
      {
        IsMachine: false,
        URI: 'ssh://user@192.168.1.5:22/run/podman/podman.sock',
        Name: 'NoIdentityRemote',
      },
    ]),
  } as unknown as extensionApi.RunResult);

  await remoteConnections.refreshRemoteConnections();

  // the connection registers instead of being silently dropped
  expect(remoteConnections.hasConnections()).toBe(true);
  // no identity => readPrivateKey resolves to undefined (tunnel uses the ssh-agent)
  await expect(readPrivateKeySpy.mock.results[0]?.value).resolves.toBeUndefined();
  // the tunnel is created with an undefined private key
  expect(createTunnelSpy).toHaveBeenCalledWith(
    '192.168.1.5',
    22,
    'user',
    undefined,
    '/run/podman/podman.sock',
    expect.any(String),
  );
});

test('should disconnect tunnel if registration fails after connect', async () => {
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => true,
  } as unknown as extensionApi.Configuration);

  const mockProvider = {
    registerContainerProviderConnection: vi.fn().mockImplementation(() => {
      throw new Error('registration failed');
    }),
  } as unknown as extensionApi.Provider;
  const mockContext = {
    subscriptions: [],
  } as unknown as extensionApi.ExtensionContext;

  const remoteConnections = new TestPodmanRemoteConnections(mockContext, mockProvider);

  vi.spyOn(remoteConnections, 'readPrivateKey').mockResolvedValue('fake-key');
  const mockDisconnect = vi.fn();
  vi.spyOn(remoteConnections, 'createTunnel').mockReturnValue({
    connect: vi.fn(),
    disconnect: mockDisconnect,
    status: () => 'started',
  } as unknown as PodmanRemoteSshTunnel);

  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stdout: JSON.stringify([
      {
        IsMachine: false,
        URI: 'ssh://user@192.168.1.1:22/run/podman/podman.sock',
        Identity: '/tmp/fakepath',
        Name: 'FailingRemote',
      },
    ]),
  } as unknown as extensionApi.RunResult);

  await remoteConnections.refreshRemoteConnections();

  expect(mockDisconnect).toHaveBeenCalledOnce();
  expect(remoteConnections.hasConnections()).toBe(false);
});

test('should check connections if configuration is enabled and a system connection', async () => {
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => true,
  } as unknown as extensionApi.Configuration);

  const mockProvider = {
    registerContainerProviderConnection: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  } as unknown as extensionApi.Provider;
  const mockContext = {
    subscriptions: [],
  } as unknown as extensionApi.ExtensionContext;

  const podmanRemoteConnections = new TestPodmanRemoteConnections(mockContext, mockProvider);

  // mock readPrivateKey
  vi.spyOn(podmanRemoteConnections, 'readPrivateKey').mockResolvedValue('file');

  // mock createTunnel to return a mock tunnel
  const spyCreateTunnel = vi.spyOn(podmanRemoteConnections, 'createTunnel').mockReturnValue({
    connect: vi.fn(),
    disconnect: vi.fn(),
    status: () => 'started',
  } as unknown as PodmanRemoteSshTunnel);

  // mock exec method for listing podman system connections
  // one machine and one remote connection
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stdout: JSON.stringify([
      {
        IsMachine: true,
        URI: 'ssh://dummy@127.0.0.1:1234/run/podman/podman.sock',
        Identity: '/tmp/fakepath',
        Name: 'Machine1',
      },
      {
        IsMachine: false,
        URI: 'ssh://dummy@127.0.0.1:1234/run/podman/podman.sock',
        Identity: '/tmp/fakepath',
        Name: 'RemoteSystemConnection1',
      },
    ]),
  } as unknown as extensionApi.RunResult);

  // spy refreshRemoteConnections method
  const spyRefreshRemoteConnections = vi.spyOn(podmanRemoteConnections, 'refreshRemoteConnections');

  try {
    // start
    await podmanRemoteConnections.start();

    // remote connection should trigger tunnel creation (machine is filtered out)
    expect(spyCreateTunnel).toHaveBeenCalledOnce();
    expect(spyRefreshRemoteConnections).toHaveBeenCalled();
    expect(podmanRemoteConnections.hasConnections()).toBe(true);
  } finally {
    // clear the recurring monitoring timer so it cannot fire in a later test
    podmanRemoteConnections.stop();
  }
});

test('stop should cancel the recurring monitoring timer', async () => {
  // fake timers are restored by the afterEach hook (vi.useRealTimers)
  vi.useFakeTimers();
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => true,
  } as unknown as extensionApi.Configuration);

  const podmanRemoteConnections = new TestPodmanRemoteConnections(extensionContext, provider);

  // no remote connections, so start() completes without creating any tunnel
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stdout: JSON.stringify([]),
  } as unknown as extensionApi.RunResult);

  const spyRefreshRemoteConnections = vi.spyOn(podmanRemoteConnections, 'refreshRemoteConnections');

  await podmanRemoteConnections.start();
  expect(spyRefreshRemoteConnections).toHaveBeenCalledTimes(1);

  // stop() must clear the pending 5s timer
  podmanRemoteConnections.stop();
  spyRefreshRemoteConnections.mockClear();

  // advancing well past the interval must not trigger any further monitoring
  await vi.advanceTimersByTimeAsync(15000);
  expect(spyRefreshRemoteConnections).not.toHaveBeenCalled();
});

test('should register remote connection with tunnel error', async () => {
  vi.useFakeTimers();
  const subscriptions: extensionApi.Disposable[] = [];
  const testProvider = {
    registerContainerProviderConnection: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  } as unknown as extensionApi.Provider;
  const podmanRemoteConnections = new TestPodmanRemoteConnections(
    { subscriptions } as unknown as extensionApi.ExtensionContext,
    testProvider,
  );
  const sshTunnel = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    status: vi.fn(() => 'unknown'),
    get error(): string {
      return 'connection refused';
    },
  } as unknown as PodmanRemoteSshTunnel;

  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => undefined,
  } as unknown as extensionApi.Configuration);
  vi.spyOn(podmanRemoteConnections, 'readPrivateKey').mockResolvedValue('fake-key');
  vi.mocked(extensionApi.process.exec).mockResolvedValue({
    stdout: JSON.stringify([
      {
        IsMachine: false,
        URI: 'ssh://dummy@127.0.0.1:1234/run/podman/podman.sock',
        Identity: '/tmp/fakepath',
        Name: 'RemoteSystemConnection1',
      },
    ]),
  } as unknown as extensionApi.RunResult);
  vi.spyOn(podmanRemoteConnections, 'createTunnel').mockReturnValue(sshTunnel);

  const refresh = podmanRemoteConnections.refreshRemoteConnections();
  await vi.advanceTimersByTimeAsync(1000);
  await refresh;

  expect(testProvider.registerContainerProviderConnection).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'RemoteSystemConnection1',
      error: 'connection refused',
    }),
  );
  expect(subscriptions).toHaveLength(1);
});
