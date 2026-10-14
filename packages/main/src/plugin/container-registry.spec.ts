/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PassThrough, Readable } from 'node:stream';
import * as streamPromises from 'node:stream/promises';

import type {
  ContainerCreateOptions,
  ContainerInspectInfo,
  HostConfig,
  ImageInspectInfo,
  ImageUpdateStatus,
  ProviderContainerConnectionInfo,
} from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { IConfigurationNode } from '@desktop-framework/api/configuration';
import type { ContainerCreateOptions as PodmanContainerCreateOptions } from '@desktop-framework/api/libpod';
import type * as podmanDesktopAPI from '@desktop-framework/extension-api';
import Dockerode from 'dockerode';
import moment from 'moment';
import { http, HttpResponse } from 'msw';
import { type SetupServer, setupServer } from 'msw/node';
import type { Headers, PackOptions } from 'tar-fs';
import * as tarstream from 'tar-stream';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { Certificates } from '/@/plugin/certificates.js';
import type { InternalContainerProvider } from '/@/plugin/container-registry.js';
import { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import { ImageRegistry } from '/@/plugin/image-registry.js';
import { KubePlayContext } from '/@/plugin/podman/kube.js';
import type { Proxy } from '/@/plugin/proxy.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import * as util from '/@/util.js';

import { CancellationTokenRegistry } from './cancellation-token-registry.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { Info, LibPod } from './dockerode/libpod-dockerode.js';
import { LibpodDockerode } from './dockerode/libpod-dockerode.js';
import type { EnvfileParser } from './env-file-parser.js';
import type { ProviderRegistry } from './provider-registry.js';

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-null/no-null */
/* eslint-disable @typescript-eslint/consistent-type-imports */

const tar: { pack: (dir: string, opts?: PackOptions & { fs?: unknown }) => NodeJS.ReadableStream } = require('tar-fs');

const originalTarPack = tar.pack;

const fakeContainerWithComposeProject: Dockerode.ContainerInfo = {
  Id: '1234567890',
  Names: ['/container1'],
  Image: 'image1',
  ImageID: 'image1',
  Command: 'command1',
  Created: 1234567890,
  State: 'running',
  Status: 'running',
  Ports: [],
  // Fake the labels to use com.docker.compose.project
  Labels: {
    'com.docker.compose.project': 'project1',
  },
  Mounts: [],
  HostConfig: {
    NetworkMode: 'bridge',
  },
  // Fake NetworkSettings
  NetworkSettings: {
    Networks: {
      bridge: {
        IPAddress: '',
        IPPrefixLen: 0,
        Gateway: '',
        NetworkID: '',
        EndpointID: '',
        IPv6Gateway: '',
        GlobalIPv6Address: '',
        GlobalIPv6PrefixLen: 0,
        MacAddress: '',
      },
    },
  },
};

const fakeContainer: Dockerode.ContainerInfo = {
  Id: '1234',
  Names: ['/container2'],
  Image: 'image2',
  ImageID: 'image2',
  Command: 'command2',
  Created: 1234567890,
  State: 'running',
  Status: 'running',
  Ports: [],
  Labels: {},
  Mounts: [],
  HostConfig: {
    NetworkMode: 'bridge',
  },
  NetworkSettings: {
    Networks: {
      bridge: {
        IPAddress: '',
        IPPrefixLen: 0,
        Gateway: '',
        NetworkID: '',
        EndpointID: '',
        IPv6Gateway: '',
        GlobalIPv6Address: '',
        GlobalIPv6PrefixLen: 0,
        MacAddress: '',
      },
    },
  },
};

const fakeContainerInspectInfo: Dockerode.ContainerInspectInfo = {
  Id: '1234',
  Name: 'container2',
  Image: 'image2',
  Created: '1234567890',
  State: {
    Status: 'running',
    Running: true,
    Paused: false,
    Restarting: false,
    OOMKilled: false,
    Dead: false,
    Pid: 26852,
    ExitCode: 0,
    Error: '',
    StartedAt: '2024-01-22T17:42:34.56349523+01:00',
    FinishedAt: '0001-01-01T00:00:00Z',
  },
  Mounts: [
    {
      Destination: 'destination',
      Mode: '',
      Propagation: '',
      RW: true,
      Source: 'source',
      Type: 'bind',
    },
  ],
  HostConfig: {
    NetworkMode: 'bridge',
  },
  Path: '',
  Args: [],
  ResolvConfPath: '',
  HostnamePath: '',
  HostsPath: '',
  LogPath: '',
  RestartCount: 0,
  Driver: '',
  Platform: '',
  MountLabel: '',
  ProcessLabel: '',
  AppArmorProfile: '',
  GraphDriver: {
    Name: '',
    Data: {
      DeviceId: '',
      DeviceName: '',
      DeviceSize: '',
    },
  },
  Config: {
    Hostname: '',
    Domainname: '',
    User: '',
    AttachStdin: false,
    AttachStdout: false,
    AttachStderr: false,
    ExposedPorts: {},
    Tty: false,
    OpenStdin: false,
    StdinOnce: false,
    Env: [],
    Cmd: [],
    Image: '',
    Volumes: {},
    WorkingDir: '',
    Entrypoint: undefined,
    OnBuild: undefined,
    Labels: {},
  },
  NetworkSettings: {
    Bridge: '',
    SandboxID: '',
    HairpinMode: false,
    LinkLocalIPv6Address: '',
    LinkLocalIPv6PrefixLen: 0,
    Ports: {},
    SandboxKey: '',
    SecondaryIPAddresses: undefined,
    SecondaryIPv6Addresses: undefined,
    EndpointID: '',
    Gateway: '',
    GlobalIPv6Address: '',
    GlobalIPv6PrefixLen: 0,
    IPAddress: '',
    IPPrefixLen: 0,
    IPv6Gateway: '',
    MacAddress: '',
    Networks: {},
    Node: undefined,
  },
};

const fakeContainerInspectInfoWithVolume = {
  Id: '1234',
  Name: 'container2',
  Image: 'image2',
  Created: '1234567890',
  State: {
    Status: 'running',
    Running: true,
    Paused: false,
    Restarting: false,
    OOMKilled: false,
    Dead: false,
    Pid: 26852,
    ExitCode: 0,
    Error: '',
    StartedAt: '2024-01-22T17:42:34.56349523+01:00',
    FinishedAt: '0001-01-01T00:00:00Z',
  },
  Mounts: [
    {
      Destination: '/destination',
      Mode: '',
      Propagation: '',
      RW: true,
      Source: '/source',
      Type: 'volume',
      Name: 'vol1',
    },
  ],
  HostConfig: {
    NetworkMode: 'bridge',
  },
  Path: '',
  Args: [],
  ResolvConfPath: '',
  HostnamePath: '',
  HostsPath: '',
  LogPath: '',
  RestartCount: 0,
  Driver: '',
  Platform: '',
  MountLabel: '',
  ProcessLabel: '',
  AppArmorProfile: '',
  GraphDriver: {
    Name: '',
    Data: {
      DeviceId: '',
      DeviceName: '',
      DeviceSize: '',
    },
  },
  Config: {
    Hostname: '',
    Domainname: '',
    User: '',
    AttachStdin: false,
    AttachStdout: false,
    AttachStderr: false,
    ExposedPorts: {},
    Tty: false,
    OpenStdin: false,
    StdinOnce: false,
    Env: [],
    Cmd: [],
    Image: '',
    Volumes: {},
    WorkingDir: '',
    Entrypoint: undefined,
    OnBuild: undefined,
    Labels: {},
  },
  NetworkSettings: {
    Bridge: '',
    SandboxID: '',
    HairpinMode: false,
    LinkLocalIPv6Address: '',
    LinkLocalIPv6PrefixLen: 0,
    Ports: {},
    SandboxKey: '',
    SecondaryIPAddresses: undefined,
    SecondaryIPv6Addresses: undefined,
    EndpointID: '',
    Gateway: '',
    GlobalIPv6Address: '',
    GlobalIPv6PrefixLen: 0,
    IPAddress: '',
    IPPrefixLen: 0,
    IPv6Gateway: '',
    MacAddress: '',
    Networks: {},
    Node: undefined,
  },
};

let server: SetupServer | undefined = undefined;

class TestContainerProviderRegistry extends ContainerProviderRegistry {
  public override extractContainerEnvironment(container: ContainerInspectInfo): { [key: string]: string } {
    return super.extractContainerEnvironment(container);
  }

  public override getMatchingEngine(engineId: string): Dockerode {
    return super.getMatchingEngine(engineId);
  }

  public override getMatchingImage(engineId: string, imageId: string): Dockerode.Image {
    return super.getMatchingImage(engineId, imageId);
  }

  public override getMatchingContainer(engineId: string, containerId: string): Dockerode.Container {
    return super.getMatchingContainer(engineId, containerId);
  }

  public override getMatchingPodmanEngine(engineId: string): InternalContainerProvider {
    return super.getMatchingPodmanEngine(engineId);
  }

  public override getMatchingPodmanEngineLibPod(engineId: string): LibPod {
    return super.getMatchingPodmanEngineLibPod(engineId);
  }

  public override getMatchingContainerProvider(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo | podmanDesktopAPI.ContainerProviderConnection,
  ): InternalContainerProvider {
    return super.getMatchingContainerProvider(providerContainerConnectionInfo);
  }

  addInternalProvider(name: string, provider: InternalContainerProvider): void {
    this.internalProviders.set(name, provider);
  }

  addContainerProvider(name: string, provider: podmanDesktopAPI.ContainerProviderConnection): void {
    this.containerProviders.set(name, provider);
  }

  override getMatchingEngineFromConnection(
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): Dockerode {
    return super.getMatchingEngineFromConnection(providerContainerConnectionInfo);
  }

  setStreamsOutputPerContainerId(id: string, data: Buffer[]): void {
    this.streamsOutputPerContainerId.set(id, data);
  }

  getStreamsOutputPerContainerId(): Map<string, Buffer[]> {
    return this.streamsOutputPerContainerId;
  }

  getStreamsPerContainerId(): Map<string, NodeJS.ReadWriteStream> {
    return this.streamsPerContainerId;
  }

  setStreamsPerContainerId(id: string, data: NodeJS.ReadWriteStream): void {
    this.streamsPerContainerId.set(id, data);
  }

  setRetryDelayEvents(delay: number): void {
    this.retryDelayEvents = delay;
  }
}

class DockerodeTestStatusError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
  ) {
    super(message);
  }
}

let containerRegistry: TestContainerProviderRegistry;

const telemetryTrackMock = vi.fn().mockResolvedValue({});
const telemetry: Telemetry = { track: telemetryTrackMock } as unknown as Telemetry;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

// Mock that the return value is true
// since we check libpod API setting enabled to be true or not
const getConfigMock = vi.fn().mockReturnValue(true);
const getConfigurationMock = vi.fn();
getConfigurationMock.mockReturnValue({
  get: getConfigMock,
});
const configurationRegistry = {
  getConfiguration: getConfigurationMock,
} as unknown as ConfigurationRegistry;

vi.mock(import('node:fs'));
vi.mock(import('node:stream/promises'), async () => {
  return {
    pipeline: vi.fn(),
    readFile: vi.fn(),
  };
});

vi.mock(import('node:fs/promises'));
vi.mock(import('/@/plugin/podman/kube.js'));

beforeEach(() => {
  vi.mocked(apiSender.receive).mockClear();
  vi.mocked(apiSender.send).mockClear();

  const certificates: Certificates = {
    init: vi.fn(),
    getAllCertificates: vi.fn(),
  } as unknown as Certificates;
  const proxy: Proxy = {
    onDidStateChange: vi.fn(),
    onDidUpdateProxy: vi.fn(),
    isEnabled: vi.fn(),
  } as unknown as Proxy;

  const imageRegistry = new ImageRegistry({} as ApiSenderType, telemetry, certificates, proxy);
  containerRegistry = new TestContainerProviderRegistry(apiSender, configurationRegistry, imageRegistry, telemetry);
});

afterEach(() => {
  vi.useRealTimers();
  server?.close();
});

test('tag should reject if no provider', async () => {
  await expect(
    containerRegistry.tagImage('dummy', 'image:latest', 'quay.io/podman-desktop/image'),
  ).rejects.toThrowError('no engine matching this engine');
});

test('tag should succeed if provider', async () => {
  const engine = {
    getImage: vi.fn().mockReturnValue({ tag: vi.fn().mockResolvedValue({}) }),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  const result = await containerRegistry.tagImage('dummy', 'image:latest', 'quay.io/podman-desktop/image');
  expect(result).toBeUndefined();
});

test('push should reject if no provider', async () => {
  await expect(containerRegistry.pushImage('dummy', 'image:latest', () => {})).rejects.toThrowError(
    'no engine matching this engine',
  );
});

test('push should succeed if provider', async () => {
  const engine = {
    getImage: vi.fn().mockReturnValue({ push: vi.fn().mockResolvedValue({ on: vi.fn() }) }),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  const result = await containerRegistry.pushImage('dummy', 'image:latest', () => {});
  expect(result).toBeUndefined();
});

test('restartContainersByLabel should succeed successfully if project name is provided and call restartContainer', async () => {
  const engine = {
    // Fake that we have 3 containers of the same project
    listSimpleContainers: vi
      .fn()
      .mockResolvedValue([
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
        fakeContainer,
      ]),
    getContainer: vi.fn().mockReturnValue({ restart: vi.fn().mockResolvedValue({}) }),
    listPods: vi.fn().mockResolvedValue([]),
    restartContainer: vi.fn().mockResolvedValue({}),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  vi.spyOn(containerRegistry, 'listSimpleContainers').mockReturnValue(engine.listSimpleContainers());

  // Spy on restartContainer to make sure it's called
  // it is NOT called if there are no matches.. So it's important to check this.
  const restartContainer = vi.spyOn(containerRegistry, 'restartContainer');

  // Restart all containers in the 'project1' project
  const result = await containerRegistry.restartContainersByLabel('dummy', 'com.docker.compose.project', 'project1');
  expect(result).toBeUndefined();

  // Expect restartContainer tohave been called 3 times
  expect(restartContainer).toHaveBeenCalledTimes(3);
});

// Same test but with startContainersByLabel

test('startContainersByLabel should succeed successfully if project name is provided and call startContainer', async () => {
  const engine = {
    // Fake that we have 3 containers of the same project
    listSimpleContainers: vi
      .fn()
      .mockResolvedValue([
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
      ]),
    getContainer: vi.fn().mockReturnValue({ start: vi.fn().mockResolvedValue({}) }),
    listPods: vi.fn().mockResolvedValue([]),
    startContainer: vi.fn().mockResolvedValue({}),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  vi.spyOn(containerRegistry, 'listSimpleContainers').mockReturnValue(engine.listSimpleContainers());

  // Spy on startContainer to make sure it's called
  // it is NOT called if there are no matches.. So it's important tot check this.
  const startContainer = vi.spyOn(containerRegistry, 'startContainer');

  // Start all containers in the 'project1' project
  const result = await containerRegistry.startContainersByLabel('dummy', 'com.docker.compose.project', 'project1');
  expect(result).toBeUndefined();

  // Expect startContainer to NOT have been called since our containers are "running"
  expect(startContainer).not.toHaveBeenCalled();
});

// Same test but with stopContainersByLabel
test('stopContainersByLabel should succeed successfully if project name is provided and call stopContainer', async () => {
  const engine = {
    // Fake that we have 3 containers of the same project
    listSimpleContainers: vi
      .fn()
      .mockResolvedValue([
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
      ]),
    getContainer: vi.fn().mockReturnValue({ stop: vi.fn().mockResolvedValue({}) }),
    listPods: vi.fn().mockResolvedValue([]),
    stopContainer: vi.fn().mockResolvedValue({}),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  vi.spyOn(containerRegistry, 'listSimpleContainers').mockReturnValue(engine.listSimpleContainers());

  // Spy on stopContainer to make sure it's called
  // it is NOT called if there are no matches.. So it's important tot check this.
  const stopContainer = vi.spyOn(containerRegistry, 'stopContainer');

  // Restart all containers in the 'project1' project
  const result = await containerRegistry.stopContainersByLabel('dummy', 'com.docker.compose.project', 'project1');
  expect(result).toBeUndefined();

  // Expect stopContainer to have been called 3 times
  expect(stopContainer).toHaveBeenCalledTimes(3);
});

// Test deleting containers by label
test('deleteContainersByLabel should succeed successfully if project name is provided and call deleteContainer', async () => {
  const engine = {
    // Fake that we have 3 containers of the same project
    listSimpleContainers: vi
      .fn()
      .mockResolvedValue([
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
        fakeContainer,
      ]),
    getContainer: vi.fn().mockReturnValue({ remove: vi.fn().mockResolvedValue({}) }),
    listPods: vi.fn().mockResolvedValue([]),
    deleteContainer: vi.fn().mockResolvedValue({}),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  vi.spyOn(containerRegistry, 'listSimpleContainers').mockReturnValue(engine.listSimpleContainers());

  // Spy on deleteContainer to make sure it's called
  // it is NOT called if there are no matches.. So it's important to check this.
  const deleteContainer = vi.spyOn(containerRegistry, 'deleteContainer');

  // Delete all containers in the 'project1' project
  const result = await containerRegistry.deleteContainersByLabel('dummy', 'com.docker.compose.project', 'project1');
  expect(result).toBeUndefined();

  // Expect deleteContainer tohave been called 3 times
  expect(deleteContainer).toHaveBeenCalledTimes(3);
});

test('test listSimpleContainersByLabel with compose label', async () => {
  const engine = {
    // Fake that we have 3 containers of the same project
    listSimpleContainers: vi
      .fn()
      .mockResolvedValue([
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
        fakeContainerWithComposeProject,
        fakeContainer,
      ]),
    listPods: vi.fn().mockResolvedValue([]),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  vi.spyOn(containerRegistry, 'listSimpleContainers').mockReturnValue(engine.listSimpleContainers());

  // List all containers with the label 'com.docker.compose.project' and value 'project1'
  const result = await containerRegistry.listSimpleContainersByLabel('com.docker.compose.project', 'project1');

  // We expect ONLY to return 3 since the last container does not have the correct label.
  expect(result).toHaveLength(3);
});

describe('execInContainer', () => {
  // stream using first Byte being header
  const writeData = (eventEmitter: EventEmitter, type: 'stdout' | 'stderr', data: string): void => {
    const header = Buffer.alloc(8);
    // first byte is type
    header.writeUInt8(type === 'stdout' ? 1 : 2, 0);

    // write fourth byte is size of the message in big endian layout
    header.writeUInt32BE(data.length, 4);

    // full string is header + data
    const fullString = Buffer.concat([header, Buffer.from(data)]);

    eventEmitter.emit('data', fullString);
  };

  test('test exec in a container', async () => {
    const startStream = new EventEmitter();

    const startExecMock = vi.fn();
    startExecMock.mockResolvedValue(startStream);

    const inspectExecMock = vi.fn();
    inspectExecMock.mockResolvedValue({ Running: true });

    const execMock = {
      start: startExecMock,
      inspect: inspectExecMock,
    };

    const containerExecMock = vi.fn().mockResolvedValue(execMock);

    const dockerode = new Dockerode();
    const modem = dockerode.modem;

    const dockerodeContainer = {
      exec: containerExecMock,
      modem: modem,
    } as unknown as Dockerode.Container;

    vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(dockerodeContainer);

    let stdout = '';
    const stdoutFunction = (data: Buffer): void => {
      stdout += data.toString();
    };

    let stderr = '';
    const stderrFunction = (data: Buffer): void => {
      stderr += data.toString();
    };

    const promiseExec = containerRegistry.execInContainer(
      'dummy',
      '1234567890',
      ['echo', 'hello', 'world'],
      stdoutFunction,
      stderrFunction,
    );
    // wait method is initialized
    await new Promise(resolve => setTimeout(resolve, 100));

    // send data on stdout
    writeData(startStream, 'stdout', 'hello ');
    writeData(startStream, 'stdout', 'world');

    // send data on stderr
    writeData(startStream, 'stderr', 'warning ');
    writeData(startStream, 'stderr', 'message');

    // wait and then say that stream is ended
    await new Promise(resolve => setTimeout(resolve, 100));

    startStream.emit('end', {});

    // wait the end
    await promiseExec;

    console.log('stdout', stdout);
    expect(stdout).toBe('hello world');
    expect(stderr).toBe('warning message');
  });

  test('test exec in a container with interval inspect', async () => {
    const startStream: EventEmitter & { destroy?: () => void } = new EventEmitter();

    // add a destroy method
    const destroyMock = vi.fn();
    startStream.destroy = destroyMock;

    const startExecMock = vi.fn();
    startExecMock.mockResolvedValue(startStream);

    const inspectResult = { Running: true };
    const inspectExecMock = vi.fn();
    inspectExecMock.mockResolvedValue(inspectResult);

    const execMock = {
      start: startExecMock,
      inspect: inspectExecMock,
    };

    const containerExecMock = vi.fn().mockResolvedValue(execMock);

    const dockerode = new Dockerode();
    const modem = dockerode.modem;

    const dockerodeContainer = {
      exec: containerExecMock,
      modem: modem,
    } as unknown as Dockerode.Container;

    vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(dockerodeContainer);

    let stdout = '';
    const stdoutFunction = (data: Buffer): void => {
      stdout += data.toString();
    };

    let stderr = '';
    const stderrFunction = (data: Buffer): void => {
      stderr += data.toString();
    };

    const promiseExec = containerRegistry.execInContainer(
      'dummy',
      '1234567890',
      ['echo', 'hello', 'world'],
      stdoutFunction,
      stderrFunction,
    );
    // wait method is initialized
    await new Promise(resolve => setTimeout(resolve, 100));

    // send data on stdout
    writeData(startStream, 'stdout', 'hello ');
    writeData(startStream, 'stdout', 'world');

    // send data on stderr
    writeData(startStream, 'stderr', 'warning ');
    writeData(startStream, 'stderr', 'message');

    // wait and then say that stream is ended
    await new Promise(resolve => setTimeout(resolve, 100));

    // here we don't send end but says that the process is no longer running
    inspectResult.Running = false;

    // wait the end
    await promiseExec;

    // expect destroy to have been called
    expect(destroyMock).toHaveBeenCalled();

    expect(stdout).toBe('hello world');
    expect(stderr).toBe('warning message');
  });
});

test('getFirstRunningConnection', async () => {
  const fakeDockerode = {} as Dockerode;

  // set providers with docker being first
  containerRegistry.addInternalProvider('docker1', {
    name: 'docker1',
    id: 'docker1',
    connection: {
      type: 'docker',
    },
    api: fakeDockerode,
  } as InternalContainerProvider);
  containerRegistry.addInternalProvider('podman1', {
    name: 'podman1',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    api: fakeDockerode,
  } as InternalContainerProvider);

  containerRegistry.addInternalProvider('docker2', {
    name: 'docker2',
    id: 'docker2',
    connection: {
      type: 'docker',
    },
    api: fakeDockerode,
  } as InternalContainerProvider);

  containerRegistry.addInternalProvider('podman2', {
    name: 'podman2',
    id: 'podman2',
    connection: {
      type: 'podman',
    },
    api: fakeDockerode,
  } as InternalContainerProvider);

  // add provider for podman1
  containerRegistry.addContainerProvider('podman1', {
    name: 'podman1',
    endpoint: {
      socketPath: '/podman1.socket',
    },
  } as podmanDesktopAPI.ContainerProviderConnection);

  const connection = containerRegistry.getFirstRunningConnection();

  // first should be podman 1 as we're first ordering podman providers
  expect(connection[0].name).toBe('podman1');
  expect(connection[0].endpoint.socketPath).toBe('/podman1.socket');
});

test('getFirstRunningPodmanContainerProvider', async () => {
  const fakeDockerode = {} as Dockerode;

  // set providers with docker being first
  containerRegistry.addInternalProvider('docker1', {
    name: 'docker1',
    id: 'docker1',
    connection: {
      type: 'docker',
    },
    api: fakeDockerode,
  } as InternalContainerProvider);
  containerRegistry.addInternalProvider('podman1', {
    name: 'podman1',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    api: fakeDockerode,
  } as unknown as InternalContainerProvider);

  containerRegistry.addInternalProvider('docker2', {
    name: 'docker2',
    id: 'docker2',
    connection: {
      type: 'docker',
    },
    api: fakeDockerode,
  } as InternalContainerProvider);

  containerRegistry.addInternalProvider('podman2', {
    name: 'podman2',
    id: 'podman2',
    connection: {
      type: 'podman',
      endpoint: {
        socketPath: '/podman1.socket',
      },
    },
    api: fakeDockerode,
    libpodApi: fakeDockerode,
  } as unknown as InternalContainerProvider);

  const connection = containerRegistry.getFirstRunningPodmanContainerProvider();

  // first should be podman 1 as we're first ordering podman providers
  expect(connection.name).toBe('podman2');
  expect(connection.connection.endpoint.socketPath).toBe('/podman1.socket');
});

describe('listContainers', () => {
  test('list containers with Podman API', async () => {
    const containersWithPodmanAPI = [
      {
        AutoRemove: false,
        Command: ['httpd-foreground'],
        Created: '2023-08-10T15:37:44.555961563+02:00',
        CreatedAt: '',
        Exited: true,
        ExitedAt: 1691674673,
        ExitCode: 0,
        Id: '31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4',
        Image: 'docker.io/library/httpd:latest',
        ImageID: '911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a',
        IsInfra: false,
        Labels: {
          'io.buildah.version': '1.30.0',
          maintainer: 'Podman Maintainers',
        },
        Mounts: [],
        Names: ['admiring_wing'],
        Namespaces: {},
        Networks: ['podman'],
        Pid: 0,
        Pod: '',
        PodName: '',
        Ports: [
          {
            host_ip: '',
            container_port: 8080,
            host_port: 8080,
            range: 1,
            protocol: 'tcp',
          },
        ],
        Restarts: 0,
        Size: null,
        StartedAt: 1691674664,
        State: 'running',
        Status: '',
      },
    ];

    const handlers = [
      http.get('http://localhost/v4.2.0/libpod/containers/json', () => HttpResponse.json(containersWithPodmanAPI)),

      http.get('http://localhost/v4.2.0/libpod/pods/json', () => HttpResponse.json([])),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    const libpod = new LibpodDockerode();
    libpod.enhancePrototypeWithLibPod();

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const containers = await containerRegistry.listContainers();

    // ensure the field are correct
    expect(containers).toBeDefined();
    expect(containers).toHaveLength(1);
    const container = containers[0];
    expect(container?.engineId).toBe('podman1');
    expect(container?.engineName).toBe('podman');
    expect(container?.engineType).toBe('podman');
    expect(container?.StartedAt).toBe('2023-08-10T13:37:44.000Z');
    expect(container?.pod).toBeUndefined();
    expect(container?.Id).toBe('31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4');
    expect(container?.Command).toBe('httpd-foreground');
    expect(container?.Names).toStrictEqual(['/admiring_wing']);
    expect(container?.Image).toBe('docker.io/library/httpd:latest');
    expect(container?.ImageID).toBe('sha256:911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a');
    expect(container?.Created).toBe(1691674664);
    expect(container?.ImageBase64RepoTag).toBe('ZG9ja2VyLmlvL2xpYnJhcnkvaHR0cGQ6bGF0ZXN0');
    expect(container?.Ports).toStrictEqual([
      {
        IP: '',
        PrivatePort: 8080,
        PublicPort: 8080,
        Type: 'tcp',
      },
    ]);
    expect(container?.Labels).toStrictEqual({
      'io.buildah.version': '1.30.0',
      maintainer: 'Podman Maintainers',
    });
    expect(container?.State).toBe('running');
  });

  test('list containers with Docker API', async () => {
    const containersWithDockerAPI = [
      {
        Id: '31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4',
        Names: ['/admiring_wing'],
        Image: 'docker.io/library/httpd:latest',
        ImageID: 'sha256:911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a',
        Command: 'httpd-foreground',
        Created: 1691674664,
        Ports: [
          {
            PrivatePort: 8080,
            PublicPort: 8080,
            Type: 'tcp',
          },
        ],
        Labels: {
          'io.buildah.version': '1.30.0',
          maintainer: 'Podman Maintainers',
        },
        State: 'running',
        Status: 'Up 2 minutes',
        NetworkSettings: {
          Networks: {
            podman: {
              IPAMConfig: null,
              Links: null,
              Aliases: ['31a4b2826914'],
              NetworkID: 'podman',
              EndpointID: '',
              Gateway: '10.88.0.1',
              IPAddress: '10.88.0.4',
              IPPrefixLen: 16,
              IPv6Gateway: '',
              GlobalIPv6Address: '',
              GlobalIPv6PrefixLen: 0,
              MacAddress: '7e:49:fe:9b:2e:3a',
              DriverOpts: null,
            },
          },
        },
        Mounts: [],
        Name: '',
        Config: null,
        NetworkingConfig: null,
        Platform: null,
        AdjustCPUShares: false,
      },
    ];

    const handlers = [
      http.get('http://localhost/containers/json', () => HttpResponse.json(containersWithDockerAPI)),

      http.get('http://localhost/v4.2.0/libpod/pods/json', () => HttpResponse.json([])),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set providers with docker being first
    containerRegistry.addInternalProvider('docker', {
      name: 'docker',
      id: 'docker1',
      api: dockerAPI,
      connection: {
        type: 'docker',
      },
    } as unknown as InternalContainerProvider);

    const containers = await containerRegistry.listContainers();

    // ensure the field are correct
    expect(containers).toBeDefined();
    expect(containers).toHaveLength(1);
    const container = containers[0];
    expect(container?.engineId).toBe('docker1');
    expect(container?.engineName).toBe('docker');
    expect(container?.engineType).toBe('docker');

    // grab StartedAt from the containerWithDockerAPI
    const started = container?.StartedAt;

    //convert with moment
    const diff = moment.now() - moment(started).toDate().getTime();
    const delta = Math.round(moment.duration(diff).asMinutes());

    // expect delta to be 2 minutes
    expect(delta).toBe(2);
    expect(container?.pod).toBeUndefined();

    expect(container?.Id).toBe('31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4');
    expect(container?.Command).toBe('httpd-foreground');
    expect(container?.Names).toStrictEqual(['/admiring_wing']);
    expect(container?.Image).toBe('docker.io/library/httpd:latest');
    expect(container?.ImageID).toBe('sha256:911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a');
    expect(container?.Created).toBe(1691674664);
    expect(container?.Ports).toStrictEqual([
      {
        PrivatePort: 8080,
        PublicPort: 8080,
        Type: 'tcp',
      },
    ]);
    expect(container?.Labels).toStrictEqual({
      'io.buildah.version': '1.30.0',
      maintainer: 'Podman Maintainers',
    });
    expect(container?.State).toBe('running');
  });

  test('list containers with Podman API and null command value', async () => {
    const containersWithPodmanAPI = [
      {
        AutoRemove: false,
        Command: null,
        Created: '2023-08-10T15:37:44.555961563+02:00',
        CreatedAt: '',
        Exited: true,
        ExitedAt: 1691674673,
        ExitCode: 0,
        Id: '31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4',
        Image: 'docker.io/library/httpd:latest',
        ImageID: '911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a',
        IsInfra: false,
        Labels: {
          'io.buildah.version': '1.30.0',
          maintainer: 'Podman Maintainers',
        },
        Mounts: [],
        Names: ['admiring_wing'],
        Namespaces: {},
        Networks: ['podman'],
        Pid: 0,
        Pod: '',
        PodName: '',
        Ports: [
          {
            host_ip: '',
            container_port: 8080,
            host_port: 8080,
            range: 1,
            protocol: 'tcp',
          },
        ],
        Restarts: 0,
        Size: null,
        StartedAt: 1691674664,
        State: 'running',
        Status: '',
      },
    ];

    const handlers = [
      http.get('http://localhost/v4.2.0/libpod/containers/json', () => HttpResponse.json(containersWithPodmanAPI)),

      http.get('http://localhost/v4.2.0/libpod/pods/json', () => HttpResponse.json([])),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    const libpod = new LibpodDockerode();
    libpod.enhancePrototypeWithLibPod();

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const containers = await containerRegistry.listContainers();

    // ensure the field are correct
    expect(containers).toBeDefined();
    expect(containers).toHaveLength(1);
    const container = containers[0];
    expect(container?.engineId).toBe('podman1');
    expect(container?.engineName).toBe('podman');
    expect(container?.engineType).toBe('podman');
    expect(container?.StartedAt).toBe('2023-08-10T13:37:44.000Z');
    expect(container?.pod).toBeUndefined();
    expect(container?.Id).toBe('31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4');
    expect(container?.Command).toBe(undefined);
    expect(container?.Names).toStrictEqual(['/admiring_wing']);
    expect(container?.Image).toBe('docker.io/library/httpd:latest');
    expect(container?.ImageID).toBe('sha256:911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a');
    expect(container?.Created).toBe(1691674664);
    expect(container?.Ports).toStrictEqual([
      {
        IP: '',
        PrivatePort: 8080,
        PublicPort: 8080,
        Type: 'tcp',
      },
    ]);
    expect(container?.Labels).toStrictEqual({
      'io.buildah.version': '1.30.0',
      maintainer: 'Podman Maintainers',
    });
    expect(container?.State).toBe('running');
  });

  test('list containers with Podman API and a multi-argument command', async () => {
    const containersWithPodmanAPI = [
      {
        AutoRemove: false,
        Command: ['ls', '-l', '/etc'],
        Created: '2023-08-10T15:37:44.555961563+02:00',
        CreatedAt: '',
        Exited: true,
        ExitedAt: 1691674673,
        ExitCode: 0,
        Id: '31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4',
        Image: 'docker.io/library/httpd:latest',
        ImageID: '911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a',
        IsInfra: false,
        Labels: {},
        Mounts: [],
        Names: ['admiring_wing'],
        Namespaces: {},
        Networks: ['podman'],
        Pid: 0,
        Pod: '',
        PodName: '',
        Ports: [],
        Restarts: 0,
        Size: null,
        StartedAt: 1691674664,
        State: 'running',
        Status: '',
      },
    ];

    const handlers = [
      http.get('http://localhost/v4.2.0/libpod/containers/json', () => HttpResponse.json(containersWithPodmanAPI)),

      http.get('http://localhost/v4.2.0/libpod/pods/json', () => HttpResponse.json([])),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    const libpod = new LibpodDockerode();
    libpod.enhancePrototypeWithLibPod();

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const containers = await containerRegistry.listContainers();

    // the whole command line, not only the executable: libpod reports Command
    // as an array and the compatibility shape is a single string
    expect(containers).toHaveLength(1);
    expect(containers[0]?.Command).toBe('ls -l /etc');
  });
});

test.each([
  {
    statusCode: 403,
    expectedMessage: 'access to image "unknown-image" is denied (403 error). Can also be that image does not exist',
  },
  {
    statusCode: 401,
    expectedMessage:
      'access to image "unknown-image" is denied (401 error). Can also be that the registry requires authentication.',
  },
  {
    statusCode: 500,
    expectedMessage:
      'access to image "unknown-image" is denied (500 error). Can also be that the registry requires authentication.',
  },
])('pull unknown image fails with error $statusCode', async ({ statusCode, expectedMessage }) => {
  const getMatchingEngineFromConnectionSpy = vi.spyOn(containerRegistry, 'getMatchingEngineFromConnection');

  const pullMock = vi.fn();

  const fakeDockerode = {
    pull: pullMock,
    modem: {
      followProgress: vi.fn(),
    },
  } as unknown as Dockerode;

  getMatchingEngineFromConnectionSpy.mockReturnValue(fakeDockerode);

  const containerConnectionInfo = {} as ProviderContainerConnectionInfo;

  // add statusCode on the error
  const error = new DockerodeTestStatusError('access denied', statusCode);

  pullMock.mockRejectedValue(error);

  const callback = vi.fn();
  // check that we have a nice error message
  await expect(containerRegistry.pullImage(containerConnectionInfo, 'unknown-image', callback)).rejects.toThrow(
    expectedMessage,
  );
});

test('pulling an image with platform linux/arm64 will add platform to pull options', async () => {
  // Mock the pulling and dockerode
  const pullMock = vi.fn();
  const fakeDockerode = {
    pull: pullMock,
    modem: {
      followProgress: vi.fn(),
    },
  } as unknown as Dockerode;

  // This is important, if we do the standard mock of vi.fn(), it WILL get caught in a 5 second timeout
  // so instead we "fake" the progress to be completed.
  vi.spyOn(fakeDockerode.modem, 'followProgress').mockImplementation((_s, f, _p) => {
    return f(null, []);
  });

  // Add the internal provider
  containerRegistry.addInternalProvider('podman1', {
    name: 'podman1',
    id: 'podman1',
    connection: {
      type: 'podman',
      endpoint: {
        socketPath: '/podman1.socket',
      },
    },
    api: fakeDockerode,
    libpodApi: fakeDockerode,
  } as unknown as InternalContainerProvider);

  // Connection information & testing it
  const getMatchingEngineFromConnectionSpy = vi.spyOn(containerRegistry, 'getMatchingEngineFromConnection');
  getMatchingEngineFromConnectionSpy.mockReturnValue(fakeDockerode);
  const connection = containerRegistry.getFirstRunningPodmanContainerProvider();
  expect(connection).toBeDefined();
  const providerConnectionInfo: ProviderContainerConnectionInfo = {
    connectionType: 'container',
    name: 'podman1',
    type: 'podman1',
    endpoint: {
      socketPath: '/podman1.socket',
    },
    status: 'started',
  } as unknown as ProviderContainerConnectionInfo;

  // Pull the image and check that we were able to
  const engine = {
    getImage: vi.fn().mockReturnValue({ push: vi.fn().mockResolvedValue({ on: vi.fn() }) }),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  const result = await containerRegistry.pullImage(providerConnectionInfo, 'unknown-image', () => {}, 'linux/arm64');
  expect(result).toBeUndefined();

  // Check that linux/arm64 was passed in
  expect(pullMock).toHaveBeenCalledWith('unknown-image', {
    abortSignal: undefined,
    authconfig: undefined,
    platform: 'linux/arm64',
  });
});

describe('buildImage', () => {
  test('throw if there is no running provider with ProviderContainerConnectionInfo input', async () => {
    const fakeDockerode = {} as Dockerode;

    containerRegistry.addInternalProvider('podman1', {
      name: 'docker',
      id: 'docker',
      connection: {
        type: 'docker',
        endpoint: {
          socketPath: 'endpoint.sock',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'connection',
      displayName: 'podman',
      type: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
    };
    await expect(
      containerRegistry.buildImage('context', () => {}, {
        containerFile: 'file',
        tag: 'name',
        platform: '',
        provider: connection,
      }),
    ).rejects.toThrow('no running provider for the matching container');
  });

  test('called getFirstRunningConnection when undefined provider', async () => {
    const getFirstRunningConnection = vi.spyOn(containerRegistry, 'getFirstRunningConnection');
    getFirstRunningConnection.mockImplementation(() => {
      throw new Error('mocked');
    });

    await expect(containerRegistry.buildImage('context', () => {})).rejects.toThrow('mocked');

    expect(getFirstRunningConnection).toHaveBeenCalledOnce();
  });

  test('throw if there is no running provider with containerProviderConnection input', async () => {
    const fakeDockerode = {} as Dockerode;

    containerRegistry.addInternalProvider('podman1', {
      name: 'docker',
      id: 'docker',
      connection: {
        type: 'docker',
        endpoint: {
          socketPath: 'endpoint.sock',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    const connection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'connection',
      displayName: 'podman',
      type: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    };
    await expect(
      containerRegistry.buildImage('context', () => {}, {
        containerFile: 'file',
        tag: 'name',
        platform: '',
        provider: connection,
      }),
    ).rejects.toThrow('no running provider for the matching container');
  });

  test('throw if build command fail', async () => {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        name: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'podman',
      displayName: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
    };

    vi.spyOn(util, 'isWindows').mockReturnValue(false);
    vi.spyOn(tar, 'pack').mockReturnValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI, 'buildImage').mockRejectedValue('human error message');

    await expect(
      containerRegistry.buildImage('context', () => {}, {
        containerFile: 'file',
        tag: 'name',
        platform: '',
        provider: connection,
      }),
    ).rejects.toThrow('human error message');
  });

  test('throw if build command fail using a ContainerProviderConnection input', async () => {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        name: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const connection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'podman',
      displayName: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    };

    vi.spyOn(util, 'isWindows').mockReturnValue(false);
    vi.spyOn(tar, 'pack').mockReturnValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI, 'buildImage').mockRejectedValue('human error message');

    await expect(
      containerRegistry.buildImage('context', () => {}, {
        containerFile: 'file',
        tag: 'name',
        platform: '',
        provider: connection,
      }),
    ).rejects.toThrow('human error message');
  });

  test('verify relativeFilePath gets sanitized on Windows', async () => {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        name: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'podman',
      displayName: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
    };

    vi.spyOn(util, 'isWindows').mockReturnValue(true);
    vi.spyOn(tar, 'pack').mockReturnValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI, 'buildImage').mockResolvedValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI.modem, 'followProgress').mockImplementation((_s, f, _p) => {
      return f(null, []);
    });

    await containerRegistry.buildImage('context', () => {}, {
      containerFile: '\\path\\file',
      tag: 'name',
      platform: '',
      provider: connection,
    });

    expect(dockerAPI.buildImage).toBeCalledWith({} as NodeJS.ReadableStream, {
      registryconfig: {},
      dockerfile: '/path/file',
      t: 'name',
      platform: '',
    });
  });

  test('verify relativeFilePath gets sanitized on Windows using a ContainerProviderConnection', async () => {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      displayName: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        name: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const connection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'podman',
      displayName: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    };

    vi.spyOn(util, 'isWindows').mockReturnValue(true);
    vi.spyOn(tar, 'pack').mockReturnValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI, 'buildImage').mockResolvedValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI.modem, 'followProgress').mockImplementation((_s, f, _p) => {
      return f(null, []);
    });

    await containerRegistry.buildImage('context', () => {}, {
      containerFile: '\\path\\file',
      tag: 'name',
      platform: '',
      provider: connection,
    });

    expect(dockerAPI.buildImage).toBeCalledWith({} as NodeJS.ReadableStream, {
      registryconfig: {},
      dockerfile: '/path/file',
      t: 'name',
      platform: '',
    });
  });

  test('verify containerfile is added to archive if outside of context', async () => {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        name: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'podman',
      displayName: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
    };

    vi.spyOn(util, 'isWindows').mockReturnValue(false);
    vi.spyOn(dockerAPI, 'buildImage').mockResolvedValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI.modem, 'followProgress').mockImplementation((_s, f, _p) => {
      return f(null, []);
    });

    vi.mocked(fs.existsSync).mockImplementation(path => {
      return String(path).endsWith('Containerfile.0') || String(path).endsWith('Containerfile.1');
    });
    vi.mocked(dockerAPI.buildImage).mockClear();

    // Mock tar.pack to call the original one with the additional parameter `fs`,
    // virtualizing an fs with empty directories
    let mapOpts: (header: Headers) => Headers = header => header;

    vi.spyOn(tar, 'pack').mockImplementation(
      (dir: string, opts?: PackOptions & { fs?: unknown }): NodeJS.ReadableStream => {
        const virtfs = {
          // all paths exist and are directories
          lstat: vi.fn().mockImplementation((_path, callback) => {
            callback(undefined, {
              isDirectory: () => true,
              isSocket: () => false,
            });
          }),
          // all directories are empty
          readdir: vi.fn().mockImplementation((_path, callback) => {
            callback(undefined, []);
          }),
        };
        opts = opts ?? {};
        mapOpts = opts.map ?? mapOpts;
        opts.fs = virtfs;
        return originalTarPack(dir, opts);
      },
    );

    await containerRegistry.buildImage('unknown-directory', () => {}, {
      containerFile: '../../containerfile',
      tag: 'name',
      platform: '',
      provider: connection,
    });

    expect(vi.mocked(dockerAPI.buildImage).mock.calls.length).toBe(1);
    const args = vi.mocked(dockerAPI.buildImage).mock.calls[0];
    const archive = args?.[0] as unknown as tarstream.Pack;
    const extract = tarstream.extract();
    const entries: string[] = [];
    extract.on('entry', function (header, stream, next) {
      entries.push(header.name);
      // header is the tar header
      // stream is the content body (might be an empty stream)
      // call next when you are done with this entry
      stream.on('end', function () {
        next(); // ready for next entry
      });
      stream.resume(); // just auto drain the stream
    });

    archive.pipe(extract);

    // check if function map has been set and then resetting the uid/gid
    const testEntry = { uid: 500, gid: 500 } as Headers;
    const afterUpdate = mapOpts?.(testEntry);
    expect(afterUpdate?.uid).toBe(0);
    expect(afterUpdate?.gid).toBe(0);

    await vi.waitFor(() => {
      expect(entries).toContain('Containerfile.2');
    });
    const options = args?.[1];
    expect(options?.dockerfile).toEqual('./Containerfile.2');
  });

  test('verify uid/gid set to 0', async () => {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        name: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'podman',
      displayName: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
    };

    vi.spyOn(util, 'isWindows').mockReturnValue(false);
    vi.spyOn(dockerAPI, 'buildImage').mockResolvedValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI.modem, 'followProgress').mockImplementation((_s, f, _p) => {
      return f(null, []);
    });

    vi.mocked(fs.existsSync).mockImplementation(path => {
      return String(path).endsWith('Containerfile.0') || String(path).endsWith('Containerfile.1');
    });
    vi.mocked(dockerAPI.buildImage).mockClear();

    // Mock tar.pack to call the original one with the additional parameter `fs`,
    // virtualizing an fs with empty directories
    let mapOpts: (header: Headers) => Headers = header => header;

    vi.spyOn(tar, 'pack').mockImplementation(
      (dir: string, opts?: PackOptions & { fs?: unknown }): NodeJS.ReadableStream => {
        const virtfs = {
          // all paths exist and are directories
          lstat: vi.fn().mockImplementation((_path, callback) => {
            callback(undefined, {
              isDirectory: () => true,
              isSocket: () => false,
            });
          }),
          // all directories are empty
          readdir: vi.fn().mockImplementation((_path, callback) => {
            callback(undefined, []);
          }),
        };
        const newOpts = opts ?? {};
        mapOpts = newOpts.map ?? mapOpts;
        newOpts.fs = virtfs;
        return originalTarPack(dir, newOpts);
      },
    );

    await containerRegistry.buildImage('unknown-directory', () => {}, {
      containerFile: 'containerfile',
      tag: 'name',
      platform: '',
      provider: connection,
    });

    // check if function map has been set and then resetting the uid/gid
    const testEntry = { uid: 500, gid: 500 } as Headers;
    const afterUpdate = mapOpts?.(testEntry);
    expect(afterUpdate?.uid).toBe(0);
    expect(afterUpdate?.gid).toBe(0);
  });

  async function verifyBuildImage(extraArgs: object): Promise<void> {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set providers with docker being first
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        name: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'podman',
      displayName: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
    };

    vi.spyOn(util, 'isWindows').mockReturnValue(false);
    vi.spyOn(tar, 'pack').mockReturnValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI, 'buildImage').mockResolvedValue({} as NodeJS.ReadableStream);
    vi.spyOn(dockerAPI.modem, 'followProgress').mockImplementation((_e, f, _d) => {
      return f(null, []);
    });

    await containerRegistry.buildImage('context', () => {}, {
      containerFile: '/dir/dockerfile',
      tag: 'name',
      platform: '',
      provider: connection,
      ...extraArgs,
    });

    expect(dockerAPI.buildImage).toBeCalledWith({} as NodeJS.ReadableStream, {
      registryconfig: {},
      platform: '',
      dockerfile: '/dir/dockerfile',
      t: 'name',
      ...extraArgs,
    });
  }

  test('verify buildImage receives correct args on non-Windows OS', async () => {
    await verifyBuildImage({});
  });

  test('verify buildImage receives correct args on non-Windows OS with extrahosts', async () => {
    await verifyBuildImage({ extrahosts: 'a string' });
  });

  test('verify buildImage receives correct args on non-Windows OS with remote', async () => {
    await verifyBuildImage({ remote: 'a string' });
  });

  test('verify buildImage receives correct args on non-Windows OS with q', async () => {
    await verifyBuildImage({ q: true });
  });

  test('verify buildImage receives correct args on non-Windows OS with cachefrom', async () => {
    await verifyBuildImage({ cachefrom: 'quay.io/ubi9/ubi' });
  });

  test('verify buildImage receives correct args on non-Windows OS with pull', async () => {
    await verifyBuildImage({ pull: 'quay.io/ubi9/ubi' });
  });

  test('verify buildImage receives correct args on non-Windows OS with rm', async () => {
    await verifyBuildImage({ rm: true });
  });

  test('verify buildImage receives correct args on non-Windows OS with forcerm', async () => {
    await verifyBuildImage({ forcerm: true });
  });

  test('verify buildImage receives correct args on non-Windows OS with memory', async () => {
    await verifyBuildImage({ memory: 12 });
  });

  test('verify buildImage receives correct args on non-Windows OS with memswap', async () => {
    await verifyBuildImage({ memswap: 13 });
  });

  test('verify buildImage receives correct args on non-Windows OS with cpushares', async () => {
    await verifyBuildImage({ cpushares: 14 });
  });

  test('verify buildImage receives correct args on non-Windows OS with cpusetcpus', async () => {
    await verifyBuildImage({ cpusetcpus: 15 });
  });

  test('verify buildImage receives correct args on non-Windows OS with cpuperiod', async () => {
    await verifyBuildImage({ cpuperiod: 16 });
  });

  test('verify buildImage receives correct args on non-Windows OS with cpuquota', async () => {
    await verifyBuildImage({ cpuquota: 17 });
  });

  test('verify buildImage receives correct args on non-Windows OS with buildargs', async () => {
    await verifyBuildImage({ buildargs: { KEY1: 'VALUE1' } });
  });

  test('verify buildImage receives correct args on non-Windows OS with shmsize', async () => {
    await verifyBuildImage({ shmsize: 18 });
  });

  test('verify buildImage receives correct args on non-Windows OS with squash', async () => {
    await verifyBuildImage({ squash: false });
  });

  test('verify buildImage receives correct args on non-Windows OS with labels', async () => {
    await verifyBuildImage({ labels: { LABEL1: 'VALUE_LABEL1' } });
  });

  test('verify buildImage receives correct args on non-Windows OS with networkmode', async () => {
    await verifyBuildImage({ networkmode: 'bridge' });
  });

  test('verify buildImage receives correct args on non-Windows OS with target', async () => {
    await verifyBuildImage({ target: 'target' });
  });

  test('verify buildImage receives correct args on non-Windows OS with outputs', async () => {
    await verifyBuildImage({ outputs: 'outputs' });
  });

  test('verify buildImage receives correct args on non-Windows OS with nocache', async () => {
    await verifyBuildImage({ nocache: true });
  });
});

describe('listVolumes', () => {
  test('with fetching the volumes size', async () => {
    const volumesDataMock = {
      Volumes: [
        {
          CreatedAt: '2023-08-21T18:35:28+02:00',
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/foo/_data',
          Name: 'foo',
          Options: {},
          Scope: 'local',
        },
        {
          CreatedAt: '2023-08-21T18:35:34+02:00',
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fooeeee/_data',
          Name: 'fooeeee',
          Options: {},
          Scope: 'local',
        },
        {
          CreatedAt: '2023-08-21T10:50:52+02:00',
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/myFirstVolume/_data',
          Name: 'myFirstVolume',
          Options: {},
          Scope: 'local',
        },
      ],
      Warnings: [],
    };

    const systemDfDataMock = {
      LayersSize: 0,
      // empty images for mock
      Images: [],
      Containers: [
        {
          Id: '5c69247085f8ae225535a6051515eb08a6d1e79ff8d70d57fda52555b5fce0dd',
          Names: ['strange_rhodes'],
          Image: 'ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
          ImageID: 'ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
          Command: '/entrypoint.sh',
          Created: 1692607778,
          Ports: null,
          SizeRw: 1921681,
          SizeRootFs: 647340350,
          Labels: {},
          State: 'running',
          Status: 'running',
          HostConfig: {},
          NetworkSettings: null,
          Mounts: null,
        },
        {
          Id: 'ae84549539d26cdcafb9865a77bce53ea072fd256cc419b376ce3f33d66bbe75',
          Names: ['kind_antonelli'],
          Image: 'ab73c7fd672341e41ec600081253d0b99ea31d0c1acdfb46a1485004472da7ac',
          ImageID: 'ab73c7fd672341e41ec600081253d0b99ea31d0c1acdfb46a1485004472da7ac',
          Command: 'nginx -g daemon off;',
          Created: 1692624321,
          Ports: null,
          SizeRw: 12595,
          SizeRootFs: 196209217,
          Labels: {},
          State: 'running',
          Status: 'running',
          HostConfig: {},
          NetworkSettings: null,
          Mounts: null,
        },
        {
          Id: 'afa18fe0f64509ce24011a0a402852ceb393448951421199c214d912aadc3cf6',
          Names: ['elegant_mirzakhani'],
          Image: 'ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
          ImageID: 'ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
          Command: '/entrypoint.sh',
          Created: 1692607777,
          Ports: null,
          SizeRw: 1921687,
          SizeRootFs: 647340356,
          Labels: {},
          State: 'running',
          Status: 'running',
          HostConfig: {},
          NetworkSettings: null,
          Mounts: null,
        },
        {
          Id: 'e471d29de42a8a411b7bcd6fb0fa1a0f24ce28284d42bd11bd1decd7946dfa3a',
          Names: ['friendly_keldysh'],
          Image: 'ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
          ImageID: 'ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
          Command: '/entrypoint.sh',
          Created: 1692634818,
          Ports: null,
          SizeRw: 1920353,
          SizeRootFs: 647339022,
          Labels: {},
          State: 'running',
          Status: 'running',
          HostConfig: {},
          NetworkSettings: null,
          Mounts: null,
        },
        {
          Id: 'e679f6fde4504a9323810548045ac6bee8dbb006869324b0b80c446b464407f0',
          Names: ['amazing_tharp'],
          Image: 'ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
          ImageID: 'ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
          Command: '/entrypoint.sh',
          Created: 1692607778,
          Ports: null,
          SizeRw: 1922070,
          SizeRootFs: 647340739,
          Labels: {},
          State: 'running',
          Status: 'running',
          HostConfig: {},
          NetworkSettings: null,
          Mounts: null,
        },
      ],
      Volumes: [
        {
          Driver: '',
          Labels: {},
          Mountpoint: '',
          Name: 'foo',
          Options: null,
          Scope: 'local',
          UsageData: { RefCount: 0, Size: 0 },
        },
        {
          Driver: '',
          Labels: {},
          Mountpoint: '',
          Name: 'fooeeee',
          Options: null,
          Scope: 'local',
          UsageData: { RefCount: 0, Size: 0 },
        },
        {
          Driver: '',
          Labels: {},
          Mountpoint: '',
          Name: 'myFirstVolume',
          Options: null,
          Scope: 'local',
          UsageData: { RefCount: 1, Size: 83990640 },
        },
      ],
      BuildCache: [],
    };

    const containersJsonMock = [
      {
        Id: 'ae84549539d26cdcafb9865a77bce53ea072fd256cc419b376ce3f33d66bbe75',
        Names: ['/kind_antonelli'],
        Image: 'foo-image',
        ImageID: 'sha256:ab73c7fd672341e41ec600081253d0b99ea31d0c1acdfb46a1485004472da7ac',
        Created: 1692624321,
        Mounts: [
          {
            Type: 'volume',
            Name: 'myFirstVolume',
            Source: '/var/lib/containers/storage/volumes/myFirstVolume/_data',
            Destination: '/app',
            Driver: 'local',
            Mode: '',
            RW: true,
            Propagation: 'rprivate',
          },
        ],
      },
      {
        Id: 'afa18fe0f64509ce24011a0a402852ceb393448951421199c214d912aadc3cf6',
        Names: ['/elegant_mirzakhani'],
        Image: 'foo-image',
        ImageID: 'sha256:ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
        Command: '/entrypoint.sh',
        Created: 1692607777,
        Mounts: [],
      },
      {
        Id: 'e471d29de42a8a411b7bcd6fb0fa1a0f24ce28284d42bd11bd1decd7946dfa3a',
        Names: ['/friendly_keldysh'],
        Image: 'foo-image',
        ImageID: 'sha256:ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
        Command: '/entrypoint.sh',
        Created: 1692634818,
        Mounts: [],
      },
      {
        Id: 'e679f6fde4504a9323810548045ac6bee8dbb006869324b0b80c446b464407f0',
        Names: ['/amazing_tharp'],
        Image: 'foo-image',
        ImageID: 'sha256:ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
        Command: '/entrypoint.sh',
        Created: 1692607778,
        Ports: [],
        Mounts: [],
      },
    ];

    const handlers = [
      http.get('http://localhost/volumes', () => HttpResponse.json(volumesDataMock)),

      http.get('http://localhost/containers/json', () => HttpResponse.json(containersJsonMock)),

      http.get('http://localhost/system/df', () => HttpResponse.json(systemDfDataMock)),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set provider
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    // ask for volumes and data
    const volumes = await containerRegistry.listVolumes(true);

    // ensure the field are correct
    expect(volumes).toBeDefined();
    expect(volumes).toHaveLength(1);
    const volume = volumes[0];
    expect(volume?.engineId).toBe('podman1');
    expect(volume?.engineName).toBe('podman');
    expect(volume?.Volumes).toHaveLength(3);

    const volumeData = volume?.Volumes[2];

    expect(volumeData?.Name).toBe('myFirstVolume');

    // check UsageData is set (provided by system/df)
    // refcount is 1 as one container is using it
    expect(volumeData?.UsageData).toStrictEqual({
      RefCount: 1,
      Size: 83990640,
    });
  });

  test('without fetching the volumes size', async () => {
    const volumesDataMock = {
      Volumes: [
        {
          CreatedAt: '2023-08-21T18:35:28+02:00',
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/foo/_data',
          Name: 'foo',
          Options: {},
          Scope: 'local',
        },
        {
          CreatedAt: '2023-08-21T18:35:34+02:00',
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fooeeee/_data',
          Name: 'fooeeee',
          Options: {},
          Scope: 'local',
        },
        {
          CreatedAt: '2023-08-21T10:50:52+02:00',
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/myFirstVolume/_data',
          Name: 'myFirstVolume',
          Options: {},
          Scope: 'local',
        },
      ],
      Warnings: [],
    };

    const containersJsonMock = [
      {
        Id: 'ae84549539d26cdcafb9865a77bce53ea072fd256cc419b376ce3f33d66bbe75',
        Names: ['/kind_antonelli'],
        Image: 'foo-image',
        ImageID: 'sha256:ab73c7fd672341e41ec600081253d0b99ea31d0c1acdfb46a1485004472da7ac',
        Created: 1692624321,
        Mounts: [
          {
            Type: 'volume',
            Name: 'myFirstVolume',
            Source: '/var/lib/containers/storage/volumes/myFirstVolume/_data',
            Destination: '/app',
            Driver: 'local',
            Mode: '',
            RW: true,
            Propagation: 'rprivate',
          },
        ],
      },
      {
        Id: 'afa18fe0f64509ce24011a0a402852ceb393448951421199c214d912aadc3cf6',
        Names: ['/elegant_mirzakhani'],
        Image: 'foo-image',
        ImageID: 'sha256:ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
        Command: '/entrypoint.sh',
        Created: 1692607777,
        Mounts: [],
      },
      {
        Id: 'e471d29de42a8a411b7bcd6fb0fa1a0f24ce28284d42bd11bd1decd7946dfa3a',
        Names: ['/friendly_keldysh'],
        Image: 'foo-image',
        ImageID: 'sha256:ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
        Command: '/entrypoint.sh',
        Created: 1692634818,
        Mounts: [],
      },
      {
        Id: 'e679f6fde4504a9323810548045ac6bee8dbb006869324b0b80c446b464407f0',
        Names: ['/amazing_tharp'],
        Image: 'foo-image',
        ImageID: 'sha256:ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
        Command: '/entrypoint.sh',
        Created: 1692607778,
        Ports: [],
        Mounts: [],
      },
    ];
    const handlers = [
      http.get('http://localhost/volumes', () => HttpResponse.json(volumesDataMock)),

      http.get('http://localhost/containers/json', () => HttpResponse.json(containersJsonMock)),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set provider
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    // ask for volumes and data
    const volumes = await containerRegistry.listVolumes(false);

    // ensure the field are correct
    expect(volumes).toBeDefined();
    expect(volumes).toHaveLength(1);
    const volume = volumes[0];
    expect(volume?.engineId).toBe('podman1');
    expect(volume?.engineName).toBe('podman');
    expect(volume?.Volumes).toHaveLength(3);

    const volumeData = volume?.Volumes[2];

    expect(volumeData?.Name).toBe('myFirstVolume');

    // check UsageData is set (provided by system/df)
    // refcount is 1 as one container is using it
    // but size is -1 as we skip system df call
    expect(volumeData?.UsageData).toStrictEqual({
      RefCount: 1,
      Size: -1,
    });
  });
  test('without mounts being populated', async () => {
    const volumesDataMock = {
      Volumes: [
        {
          CreatedAt: '2023-08-21T18:35:28+02:00',
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/foo/_data',
          Name: 'foo',
          Options: {},
          Scope: 'local',
        },
      ],
      Warnings: [],
    };

    const containersJsonMock = [
      {
        Id: 'ae84549539d26cdcafb9865a77bce53ea072fd256cc419b376ce3f33d66bbe75',
        Names: ['/kind_antonelli'],
        Image: 'foo-image',
        ImageID: 'sha256:ab73c7fd672341e41ec600081253d0b99ea31d0c1acdfb46a1485004472da7ac',
        Created: 1692624321,
        Mounts: null,
      },
      {
        Id: 'afa18fe0f64509ce24011a0a402852ceb393448951421199c214d912aadc3cf6',
        Names: ['/elegant_mirzakhani'],
        Image: 'foo-image',
        ImageID: 'sha256:ee9bfd27b1dbb584a40687ec1f9db5f5c16c53c2f3041cf702e9495ceda22195',
        Command: '/entrypoint.sh',
        Created: 1692607777,
        Mounts: null,
      },
    ];

    const handlers = [
      http.get('http://localhost/volumes', () => HttpResponse.json(volumesDataMock)),

      http.get('http://localhost/containers/json', () => HttpResponse.json(containersJsonMock)),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set provider
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    // ask for volumes and data
    const volumes = await containerRegistry.listVolumes(false);

    // ensure the field are correct
    expect(volumes).toBeDefined();
    expect(volumes).toHaveLength(1);
    const volume = volumes[0];
    expect(volume?.engineId).toBe('podman1');
    expect(volume?.engineName).toBe('podman');
    expect(volume?.Volumes).toHaveLength(1);
  });
});

describe('listNetworks', () => {
  test('listNetworks with podman', async () => {
    const networksDataMock = [
      {
        Name: 'podify',
        Id: '621fda08b8bc4c2fc',
        Created: '2023-09-28T13:40:45.534269058+02:00',
        Scope: 'local',
        Driver: 'bridge',
        EnableIPv6: false,
        IPAM: {
          Driver: 'default',
          Options: {
            driver: 'host-local',
          },
          Config: [
            {
              Subnet: '10.89.2.0/24',
              Gateway: '10.89.2.1',
            },
          ],
        },
        Internal: false,
        Attachable: false,
        Ingress: false,
        ConfigFrom: {
          Network: '',
        },
        ConfigOnly: false,
        Containers: {
          '45dc7a4d75056f281ecdf4c292879c572fface4f37454fa921e9dcffe4a250d1': {},
          '7770a57a1579ec7523800cb18976248e0efccae920680f4889d65ba3fb48d384': {},
        },
        Options: {},
        Labels: {},
      },
      {
        Name: 'bridge',
        Id: '123456',
        Created: '2023-10-02T14:44:37.092685487+02:00',
        Scope: 'local',
        Driver: 'bridge',
        EnableIPv6: false,
        IPAM: {
          Driver: 'default',
          Options: {
            driver: 'host-local',
          },
          Config: [
            {
              Subnet: '10.88.0.0/16',
              Gateway: '10.88.0.1',
            },
          ],
        },
        Internal: false,
        Attachable: false,
        Ingress: false,
        ConfigFrom: {
          Network: '',
        },
        ConfigOnly: false,
        Containers: {},
        Options: {},
        Labels: {},
      },
    ];

    server = setupServer(http.get('http://localhost/networks', () => HttpResponse.json(networksDataMock)));
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    // set provider
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman1',
      displayName: 'podman',
      api,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    // ask for networks
    const networks = await containerRegistry.listNetworks();

    // ensure the field are correct
    expect(networks).toBeDefined();
    expect(networks).toHaveLength(2);
    const network = networks[0];
    expect(network?.engineId).toBe('podman1');
    expect(network?.engineName).toBe('podman');

    expect(network?.Name).toBe('podify');
  });
});

test('removeNetwork', async () => {
  const removeMock = vi.fn();
  const api = {
    getNetwork: vi.fn().mockReturnValue({ remove: removeMock }),
  } as unknown as Dockerode;

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman1',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    api: api,
  } as InternalContainerProvider);

  await containerRegistry.removeNetwork('podman1', 'network1');

  expect(api.getNetwork).toHaveBeenCalledWith('network1');
  expect(removeMock).toHaveBeenCalled();
});

test('updateNetwork', async () => {
  const libPodApi = {
    updateNetwork: vi.fn(),
  } as unknown as LibPod;

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman1',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    api: {} as unknown as Dockerode,
    libpodApi: libPodApi,
  } as InternalContainerProvider);

  await containerRegistry.updateNetwork('podman1', 'network1', ['1.1.1.1'], []);

  expect(libPodApi.updateNetwork).toHaveBeenCalledWith('network1', ['1.1.1.1'], []);
});

describe('info', () => {
  function mockPodmanInfo(host: Partial<Info['host']>): LibPod {
    return {
      podmanInfo: vi.fn().mockResolvedValue({
        host: {
          cpus: 4,
          cpuUtilization: { idlePercent: 90 },
          memTotal: 1000,
          memFree: 100,
          ...host,
        },
        store: {
          graphRootAllocated: 2000,
          graphRootUsed: 500,
        },
      } as unknown as Info),
    } as unknown as LibPod;
  }

  test('memAvailable present and valid computes memoryUsed from memAvailable', async () => {
    const libPodApi = mockPodmanInfo({ memAvailable: 400 });

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api: {} as unknown as Dockerode,
      libpodApi: libPodApi,
    } as InternalContainerProvider);

    const info = await containerRegistry.info('podman1');

    expect(info.memory).toBe(1000);
    expect(info.memoryUsed).toBe(600);
  });

  test('memAvailable absent falls back to memTotal - memFree (older Podman)', async () => {
    const libPodApi = mockPodmanInfo({});

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api: {} as unknown as Dockerode,
      libpodApi: libPodApi,
    } as InternalContainerProvider);

    const info = await containerRegistry.info('podman1');

    expect(info.memory).toBe(1000);
    expect(info.memoryUsed).toBe(900);
  });

  test('memAvailable equal to -1 (non-Linux sentinel) falls back to memTotal - memFree', async () => {
    const libPodApi = mockPodmanInfo({ memAvailable: -1 });

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api: {} as unknown as Dockerode,
      libpodApi: libPodApi,
    } as InternalContainerProvider);

    const info = await containerRegistry.info('podman1');

    expect(info.memory).toBe(1000);
    expect(info.memoryUsed).toBe(900);
  });
});

describe('createVolume', () => {
  test('provided name', async () => {
    server = setupServer(http.post('http://localhost/volumes/create', () => HttpResponse.json('')));
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    const providerConnectionInfo: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: 'started',
    } as unknown as ProviderContainerConnectionInfo;

    // set provider
    containerRegistry.addInternalProvider('podman', internalContainerProvider);

    // check that it's calling the right mock method
    await containerRegistry.createVolume(providerConnectionInfo, { Name: 'myFirstVolume' });
  });

  test('no name', async () => {
    server = setupServer(http.post('http://localhost/volumes/create', () => HttpResponse.json('')));
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    const providerConnectionInfo: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: 'started',
    } as unknown as ProviderContainerConnectionInfo;

    // set provider
    containerRegistry.addInternalProvider('podman', internalContainerProvider);

    // check that it's calling the right mock method
    await containerRegistry.createVolume(providerConnectionInfo, {});
  });

  test('provided user API connection', async () => {
    server = setupServer(http.post('http://localhost/volumes/create', () => HttpResponse.json('')));
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    const containerProviderConnection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    } as unknown as podmanDesktopAPI.ContainerProviderConnection;

    // set provider
    containerRegistry.addInternalProvider('podman', internalContainerProvider);

    // check that it's calling the right mock method
    await containerRegistry.createVolume(containerProviderConnection, { Name: 'myFirstVolume' });
  });

  test('no provider', async () => {
    server = setupServer(
      http.post('http://localhost/volumes/create', () => HttpResponse.json('')),
      http.get('http://localhost/events', () => HttpResponse.json({}, { status: 200 })),
    );
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };
    // set provider
    containerRegistry.addInternalProvider('podman.podman', internalContainerProvider);

    const containerProviderConnection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'podman',
      type: 'podman',
      displayName: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    } as unknown as podmanDesktopAPI.ContainerProviderConnection;

    const podmanProvider = {
      name: 'podman',
      id: 'podman',
    } as unknown as podmanDesktopAPI.Provider;

    const providerRegistry: ProviderRegistry = {
      onBeforeDidUpdateContainerConnection: vi.fn(),
      onDidUpdateContainerConnection: vi.fn(),
    } as unknown as ProviderRegistry;

    containerRegistry.registerContainerConnection(podmanProvider, containerProviderConnection, providerRegistry);

    // check that it's calling the right mock method
    await containerRegistry.createVolume(undefined, { Name: 'myFirstVolume' });
  });
});

describe('deleteVolume', () => {
  test('no provider', async () => {
    const handlers = [
      http.delete('http://localhost/volumes/myFirstVolume', () => new HttpResponse(undefined, { status: 204 })),
      http.get('http://localhost/events', () => HttpResponse.json({}, { status: 200 })),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };
    // set provider
    containerRegistry.addInternalProvider('podman.podman', internalContainerProvider);

    const containerProviderConnection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    } as unknown as podmanDesktopAPI.ContainerProviderConnection;

    const podmanProvider = {
      name: 'podman',
      id: 'podman',
    } as unknown as podmanDesktopAPI.Provider;

    const providerRegistry: ProviderRegistry = {
      onBeforeDidUpdateContainerConnection: vi.fn(),
      onDidUpdateContainerConnection: vi.fn(),
    } as unknown as ProviderRegistry;

    containerRegistry.registerContainerConnection(podmanProvider, containerProviderConnection, providerRegistry);

    // check that it's calling the right mock method
    await containerRegistry.deleteVolume('myFirstVolume');
  });

  test('provided connection', async () => {
    const handlers = [
      http.delete('http://localhost/volumes/myFirstVolume', () => new HttpResponse(undefined, { status: 204 })),
      http.get('http://localhost/events', () => HttpResponse.json({}, { status: 200 })),
    ];
    server = setupServer(...handlers);
    server.listen({ onUnhandledRequest: 'error' });

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    const containerProviderConnection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    } as unknown as podmanDesktopAPI.ContainerProviderConnection;

    // set provider
    containerRegistry.addInternalProvider('podman', internalContainerProvider);
    // check that it's calling the right mock method
    await containerRegistry.deleteVolume('myFirstVolume', { provider: containerProviderConnection });
  });
});

test('container logs callback notified when messages arrive', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockResolvedValue({ Config: { Tty: true } }),
  } as unknown as Dockerode.Container;

  vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(dockerodeContainer);
  let deferredResolve: (value: unknown) => void;
  const firstMessagePromise = new Promise(resolve => {
    deferredResolve = resolve;
  });
  const callback = vi.fn().mockImplementation(() => {
    deferredResolve(undefined);
  });
  await containerRegistry.logsContainer({ engineId: 'podman', id: 'containerId', callback });

  const callArgs = vi.mocked(dockerodeContainer.logs).mock.calls[0]?.[0];

  expect(callArgs).toStrictEqual({
    follow: true,
    stdout: true,
    stderr: true,
    abortSignal: undefined,
    tail: undefined,
    timestamps: undefined,
  });

  setTimeout(() => {
    stream.emit('data', 'log message');
    stream.emit('end', '');
  });

  await firstMessagePromise;
  expect(callback).toHaveBeenCalledWith('first-message', '');
  expect(callback).toHaveBeenCalledWith('data', 'log message');
  expect(callback).toHaveBeenCalledWith('end', '');
  expect(telemetry.track).toHaveBeenCalled();
});

// collects the payloads passed to the logsContainer callback until the stream ends
function collectContainerLogs(container: Dockerode.Container): {
  dataChunks: string[];
  endPromise: Promise<void>;
} {
  const dataChunks: string[] = [];
  const endPromise = new Promise<void>((resolve, reject) => {
    const callback = (name: string, data: string): void => {
      if (name === 'data') {
        dataChunks.push(data);
      } else if (name === 'end') {
        resolve();
      }
    };
    vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(container);
    containerRegistry
      .logsContainer({ engineId: 'podman', id: 'containerId', callback })
      .catch((err: unknown) => reject(err instanceof Error ? err : new Error(String(err))));
  });
  return { dataChunks, endPromise };
}

test('container logs reassembles multi-byte UTF-8 characters split across chunks', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockResolvedValue({ Config: { Tty: true } }),
  } as unknown as Dockerode.Container;

  const { dataChunks, endPromise } = collectContainerLogs(dockerodeContainer);

  // "🚀" (U+1F680) is four UTF-8 bytes: F0 9F 9A 80. Split it across two
  // chunks so neither chunk holds a complete character on its own.
  const rocketBytes = Buffer.from('🚀', 'utf-8');
  const firstHalf = rocketBytes.subarray(0, 2);
  const secondHalf = rocketBytes.subarray(2);

  setTimeout(() => {
    stream.emit('data', Buffer.concat([Buffer.from('start '), firstHalf]));
    stream.emit('data', Buffer.concat([secondHalf, Buffer.from(' end')]));
    stream.emit('end', '');
  });

  await endPromise;

  expect(dataChunks.join('')).toBe('start 🚀 end');
  expect(dataChunks.join('')).not.toContain('\uFFFD');
});

test('container logs flushes buffered bytes when the stream ends mid-character', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockResolvedValue({ Config: { Tty: true } }),
  } as unknown as Dockerode.Container;

  const { dataChunks, endPromise } = collectContainerLogs(dockerodeContainer);

  // Emit only the first two bytes of "🚀" then end the stream, leaving an
  // incomplete sequence buffered inside the decoder.
  const rocketBytes = Buffer.from('🚀', 'utf-8');

  setTimeout(() => {
    stream.emit('data', Buffer.concat([Buffer.from('truncated '), rocketBytes.subarray(0, 2)]));
    stream.emit('end', '');
  });

  await endPromise;

  // The decoder flushes the incomplete sequence on end(), so the buffered bytes
  // are reported instead of being silently dropped.
  expect(dataChunks.length).toBe(2);
  expect(dataChunks[0]).toBe('truncated ');
  expect(dataChunks[1]).toBe('\uFFFD');
});

// builds a frame of a multiplexed container stream: 8-byte header (stream type + payload size)
// followed by the payload itself
function buildLogFrameFromBytes(body: Buffer, streamType = 1): Buffer {
  const header = Buffer.alloc(8);
  header[0] = streamType;
  header.writeUInt32BE(body.length, 4);
  return Buffer.concat([header, body]);
}

function buildLogFrame(payload: string, streamType = 1): Buffer {
  return buildLogFrameFromBytes(Buffer.from(payload, 'utf-8'), streamType);
}

test('container logs strips the multiplexed stream header of non-TTY containers', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockResolvedValue({ Config: { Tty: false } }),
    modem: new Dockerode().modem,
  } as unknown as Dockerode.Container;

  const { dataChunks, endPromise } = collectContainerLogs(dockerodeContainer);

  setTimeout(() => {
    stream.emit('data', buildLogFrame('hello\n'));
    stream.emit('data', buildLogFrame('world\n', 2));
    stream.emit('end', '');
  });

  await endPromise;

  // the 8-byte header must not leak into the rendered logs
  expect(dataChunks.join('')).toBe('hello\nworld\n');
});

test('container logs buffers multiplexed frames split across chunks', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockResolvedValue({ Config: { Tty: false } }),
    modem: new Dockerode().modem,
  } as unknown as Dockerode.Container;

  const { dataChunks, endPromise } = collectContainerLogs(dockerodeContainer);

  const frame = buildLogFrame('split payload\n');

  setTimeout(() => {
    // cut in the middle of the header, then in the middle of the payload
    stream.emit('data', frame.subarray(0, 3));
    stream.emit('data', frame.subarray(3, 10));
    stream.emit('data', frame.subarray(10));
    stream.emit('end', '');
  });

  await endPromise;

  expect(dataChunks.join('')).toBe('split payload\n');
});

test('container logs decodes stdout and stderr with separate decoders', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockResolvedValue({ Config: { Tty: false } }),
    modem: new Dockerode().modem,
  } as unknown as Dockerode.Container;

  const { dataChunks, endPromise } = collectContainerLogs(dockerodeContainer);

  // "🚀" split over two stdout frames, with a stderr frame emitted in between: a shared decoder
  // would let the stderr payload complete the pending stdout character and corrupt both streams
  const rocketBytes = Buffer.from('🚀', 'utf-8');
  const firstHalf = buildLogFrameFromBytes(rocketBytes.subarray(0, 2), 1);
  const secondHalf = buildLogFrameFromBytes(rocketBytes.subarray(2), 1);

  setTimeout(() => {
    stream.emit('data', firstHalf);
    stream.emit('data', buildLogFrame('err\n', 2));
    stream.emit('data', secondHalf);
    stream.emit('end', '');
  });

  await endPromise;

  expect(dataChunks.join('')).toBe('err\n🚀');
});

test('container logs forwards the raw stream of a TTY container', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockResolvedValue({ Config: { Tty: true } }),
  } as unknown as Dockerode.Container;

  const { dataChunks, endPromise } = collectContainerLogs(dockerodeContainer);

  setTimeout(() => {
    stream.emit('data', Buffer.from('raw log\n'));
    stream.emit('end', '');
  });

  await endPromise;

  expect(dataChunks.join('')).toBe('raw log\n');
});

test('container logs forwards the raw stream when the container cannot be inspected', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockRejectedValue(new Error('no such container')),
  } as unknown as Dockerode.Container;

  const { dataChunks, endPromise } = collectContainerLogs(dockerodeContainer);

  setTimeout(() => {
    stream.emit('data', Buffer.from('raw log\n'));
    stream.emit('end', '');
  });

  await endPromise;

  // an unreadable TTY mode must not break the logs: the stream is forwarded as-is
  expect(dataChunks.join('')).toBe('raw log\n');
});

test('container logs forwards the since option', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
    inspect: vi.fn().mockResolvedValue({ Config: { Tty: true } }),
  } as unknown as Dockerode.Container;

  vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(dockerodeContainer);

  await containerRegistry.logsContainer({
    engineId: 'podman',
    id: 'containerId',
    callback: vi.fn(),
    since: '1700000000',
  });

  expect(vi.mocked(dockerodeContainer.logs).mock.calls[0]?.[0]).toStrictEqual({
    follow: true,
    stdout: true,
    stderr: true,
    abortSignal: undefined,
    tail: undefined,
    timestamps: undefined,
    since: '1700000000',
  });
});

describe('createContainer', () => {
  test('test create and start Container', async () => {
    const createdId = '1234';

    const startMock = vi.fn();
    const inspectMock = vi.fn();
    const createContainerMock = vi
      .fn()
      .mockResolvedValue({ id: createdId, start: startMock, inspect: inspectMock } as unknown as Dockerode.Container);

    inspectMock.mockResolvedValue({
      Config: {
        Tty: false,
        OpenStdin: false,
      },
    });

    const fakeDockerode = {
      createContainer: createContainerMock,
    } as unknown as Dockerode;

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    const container = await containerRegistry.createContainer('podman1', { start: true });

    expect(container.id).toBe(createdId);
    expect(container.engineId).toBe('podman1');
    expect(createContainerMock).toHaveBeenCalled();
    expect(startMock).toHaveBeenCalled();
  });

  test('test create and start Container with envfiles', async () => {
    const createdId = '1234';

    const startMock = vi.fn();
    const inspectMock = vi.fn();
    const createContainerMock = vi
      .fn()
      .mockResolvedValue({ id: createdId, start: startMock, inspect: inspectMock } as unknown as Dockerode.Container);

    inspectMock.mockResolvedValue({
      Config: {
        Tty: false,
        OpenStdin: false,
      },
    });

    const fakeDockerode = {
      createContainer: createContainerMock,
    } as unknown as Dockerode;

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    const spyEnvParser = vi.spyOn(containerRegistry, 'getEnvFileParser');
    const parseEnvFilesMock = vi.fn();
    parseEnvFilesMock.mockReturnValueOnce(['HELLO=WORLD', 'FOO=']);

    spyEnvParser.mockReturnValue({ parseEnvFiles: parseEnvFilesMock } as unknown as EnvfileParser);

    const container = await containerRegistry.createContainer('podman1', { EnvFiles: ['file1', 'file2'] });

    expect(container.id).toBe(createdId);
    expect(createContainerMock).toHaveBeenCalled();
    expect(startMock).toHaveBeenCalled();

    // expect we received a call to parse the env files
    expect(parseEnvFilesMock).toHaveBeenCalledWith(['file1', 'file2']);

    // expect content of env files to be set
    expect(createContainerMock).toHaveBeenCalledWith(expect.objectContaining({ Env: ['HELLO=WORLD', 'FOO='] }));

    // Check EnvFiles is not propagated to the remote
    expect(createContainerMock).toHaveBeenCalledWith(expect.not.objectContaining({ EnvFiles: ['file1', 'file2'] }));
  });

  async function verifyCreateContainer(options: object): Promise<void> {
    const createdId = '1234';

    const startMock = vi.fn();
    const inspectMock = vi.fn();
    const createContainerMock = vi
      .fn()
      .mockResolvedValue({ id: createdId, start: startMock, inspect: inspectMock } as unknown as Dockerode.Container);

    inspectMock.mockResolvedValue({
      Config: {
        Tty: false,
        OpenStdin: false,
      },
    });

    const fakeDockerode = {
      createContainer: createContainerMock,
    } as unknown as Dockerode;

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    const container = await containerRegistry.createContainer('podman1', options);

    expect(container.id).toBe(createdId);
    expect(createContainerMock).toHaveBeenCalled();
    expect(startMock).toHaveBeenCalled();

    // expect healthcheck to be set
    expect(createContainerMock).toHaveBeenCalledWith(expect.objectContaining(options));
  }

  test('test create and start Container with platform', async () => {
    await verifyCreateContainer({ platform: 'linux-arm64' });
  });

  test('test create and start Container with Domainname', async () => {
    await verifyCreateContainer({ Domainname: 'my-domain' });
  });

  test('test create and start Container with healthcheck', async () => {
    await verifyCreateContainer({ HealthCheck: { Test: ['cmd', 'arg1'] } });
  });

  test('test create and start Container with ArgsEscaped', async () => {
    await verifyCreateContainer({ ArgsEscaped: true });
  });

  test('test create and start Container with Volumes', async () => {
    await verifyCreateContainer({ Volumes: { Vol1: {} } });
  });

  test('test create and start Container with WorkingDir', async () => {
    await verifyCreateContainer({ WorkingDir: 'workdir' });
  });

  test('test create and start Container with custom HostIp', async () => {
    const hostConfig: HostConfig = { PortBindings: { '123/tcp': [{ HostIp: '123.123.123.123' }] } };
    await verifyCreateContainer({ HostConfig: hostConfig });
  });

  test('test create and start Container with custom HostPort', async () => {
    const hostConfig: HostConfig = { PortBindings: { '123/tcp': [{ HostPort: '8000' }] } };
    await verifyCreateContainer({ HostConfig: hostConfig });
  });

  test('test container is created but not started', async () => {
    const createdId = '1234';

    const startMock = vi.fn();
    const inspectMock = vi.fn();
    const createContainerMock = vi
      .fn()
      .mockResolvedValue({ id: createdId, start: startMock, inspect: inspectMock } as unknown as Dockerode.Container);

    inspectMock.mockResolvedValue({
      Config: {
        Tty: false,
        OpenStdin: false,
      },
    });

    const fakeDockerode = {
      createContainer: createContainerMock,
    } as unknown as Dockerode;

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    const container = await containerRegistry.createContainer('podman1', { start: false });

    expect(container.id).toBe(createdId);
    expect(createContainerMock).toHaveBeenCalled();
    expect(startMock).not.toHaveBeenCalled();
  });

  test('test error reported if start fails', async () => {
    const createdId = '1234';

    const startMock = vi.fn().mockRejectedValue(new Error('start failed'));
    const inspectMock = vi.fn();
    const createContainerMock = vi
      .fn()
      .mockResolvedValue({ id: createdId, start: startMock, inspect: inspectMock } as unknown as Dockerode.Container);

    inspectMock.mockResolvedValue({
      Config: {
        Tty: false,
        OpenStdin: false,
      },
    });

    const fakeDockerode = {
      createContainer: createContainerMock,
    } as unknown as Dockerode;

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    let error: unknown | undefined;
    try {
      await containerRegistry.createContainer('podman1', { start: true });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(createContainerMock).toHaveBeenCalled();
    expect(startMock).toHaveBeenCalled();
  });
});

describe('unpauseContainer', () => {
  test('test unpause Container', async () => {
    const unpauseMock = vi.fn().mockResolvedValue({});

    const fakeDockerodeContainer = {
      unpause: unpauseMock,
    } as unknown as Dockerode.Container;

    vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(fakeDockerodeContainer);

    await containerRegistry.unpauseContainer('podman1', '1234');

    expect(unpauseMock).toHaveBeenCalled();
  });

  test('test unpause Container for error handling', async () => {
    const unpauseError = new Error('unpause failed');
    const unpauseMock = vi.fn().mockRejectedValue(unpauseError);

    const fakeDockerodeContainer = {
      unpause: unpauseMock,
    } as unknown as Dockerode.Container;

    vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(fakeDockerodeContainer);

    await expect(containerRegistry.unpauseContainer('podman1', '1234')).rejects.toThrow(unpauseError);

    expect(telemetry.track).toHaveBeenCalledWith(
      'unpauseContainer',
      expect.objectContaining({
        error: unpauseError,
      }),
    );
    expect(unpauseMock).toHaveBeenCalled();
  });
});

describe('attach container', () => {
  test('container attach stream', async () => {
    // create a read/write stream
    const stream = new PassThrough();

    const spyStream = vi.spyOn(stream, 'write');
    const attachMock = vi.fn();
    // need to reply with a stream
    attachMock.mockResolvedValue(stream);

    const dockerodeContainer = {
      id: '1234',
      attach: attachMock,
    } as unknown as Dockerode.Container;

    vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(dockerodeContainer);

    const onData = vi.fn();
    const onError = vi.fn();
    const onEnd = vi.fn();

    const response = await containerRegistry.attachContainer('podman', dockerodeContainer.id, onData, onError, onEnd);

    // wait for having init
    await new Promise(resolve => setTimeout(resolve, 500));

    response('log message');
    stream.end();

    await new Promise(resolve => setTimeout(resolve, 500));

    expect(onData).toBeCalledWith('log message');
    expect(onError).not.toBeCalled();
    expect(onEnd).toBeCalled();

    // expect we wrote something on the stream
    expect(spyStream).toHaveBeenNthCalledWith(1, 'log message');

    expect(telemetry.track).toHaveBeenCalled();
  });

  test('container attach stream with previous data', async () => {
    // create a read/write stream
    const stream = new PassThrough();
    const attachMock = vi.fn();
    // need to reply with a stream
    attachMock.mockResolvedValue(stream);

    const dockerodeContainer = {
      id: '1234',
      attach: attachMock,
    } as unknown as Dockerode.Container;

    vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(dockerodeContainer);

    // add some previous data
    const buffer: Buffer = Buffer.from('previous data');
    containerRegistry.setStreamsOutputPerContainerId(dockerodeContainer.id, [buffer]);

    const onData = vi.fn();
    const onError = vi.fn();
    const onEnd = vi.fn();

    await containerRegistry.attachContainer('podman', dockerodeContainer.id, onData, onError, onEnd);

    // send data
    setTimeout(() => {
      stream.write('log message');
      stream.end();
    });

    // wait for having some output
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(onData).toHaveBeenNthCalledWith(1, 'previous data');
    expect(onData).toHaveBeenNthCalledWith(2, 'log message');
    expect(onError).not.toBeCalled();
    expect(onEnd).toBeCalled();

    expect(telemetry.track).toHaveBeenCalled();
  });

  test('container attach stream with previous stream', async () => {
    // create a read/write stream
    const stream = new PassThrough();

    const dockerodeContainer = {
      id: '1234',
    } as unknown as Dockerode.Container;

    containerRegistry.setStreamsPerContainerId(dockerodeContainer.id, stream);

    const onData = vi.fn();
    const onError = vi.fn();
    const onEnd = vi.fn();

    await containerRegistry.attachContainer('podman', dockerodeContainer.id, onData, onError, onEnd);

    // send data
    setTimeout(() => {
      stream.write('log message');
      stream.end();
    });

    // wait for having some output
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(onData).toBeCalledWith('log message');
    expect(onError).not.toBeCalled();
    expect(onEnd).toBeCalled();

    expect(telemetry.track).toHaveBeenCalled();
  });

  test('container attach stream error', async () => {
    // create a read/write stream
    const stream = new PassThrough();
    const attachMock = vi.fn();
    // need to reply with a stream
    attachMock.mockResolvedValue(stream);

    const dockerodeContainer = {
      id: '1234',
      attach: attachMock,
    } as unknown as Dockerode.Container;

    vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(dockerodeContainer);

    const onData = vi.fn();
    const onError = vi.fn();
    const onEnd = vi.fn();

    await containerRegistry.attachContainer('podman', dockerodeContainer.id, onData, onError, onEnd);

    const customError = new Error('my custom error');
    // send data
    setTimeout(() => {
      stream.emit('error', customError);
      stream.end();
    });

    // wait for having some output
    await new Promise(resolve => setTimeout(resolve, 500));

    expect(onData).not.toBeCalled();
    expect(onError).toBeCalledWith(String(customError));
    expect(onEnd).toBeCalled();

    expect(telemetry.track).toHaveBeenCalled();
  });
});

describe('attachToContainer', () => {
  test('container attach stream compat API', async () => {
    const fakeDockerode = {} as Dockerode;

    const engine = {
      name: 'docker1',
      id: 'docker1',
      connection: {
        type: 'docker',
      },
      api: fakeDockerode,
    } as InternalContainerProvider;

    const attachMock = vi.fn();
    const inspectMock = vi.fn();

    const dockerodeContainer = {
      id: '1234',
      attach: attachMock,
      inspect: inspectMock,
    } as unknown as Dockerode.Container;

    inspectMock.mockResolvedValue({
      Config: {
        Tty: true,
        OpenStdin: true,
      },
    });

    // create a read/write stream
    const stream = new PassThrough();
    // need to reply with a stream
    attachMock.mockResolvedValue(stream);

    await containerRegistry.attachToContainer(engine, dockerodeContainer);

    const data = 'log message';
    //send some data
    stream.write(data);

    expect(attachMock).toBeCalledWith({ stream: true, stdin: true, stdout: true, stderr: true, hijack: true });

    const streams = containerRegistry.getStreamsOutputPerContainerId().get(dockerodeContainer.id);
    expect(streams).toBeDefined();

    expect(String(streams)).toBe(data);

    const streamPerContainer = containerRegistry.getStreamsPerContainerId().get(dockerodeContainer.id);
    expect(streamPerContainer).toBeDefined();
    expect(streamPerContainer).toBe(stream);

    // now end the stream
    stream.end();

    // wait a little
    await new Promise(resolve => setTimeout(resolve, 500));

    // check that the data has been cleaned-up
    expect(containerRegistry.getStreamsOutputPerContainerId().get(dockerodeContainer.id)).toBeUndefined();
    expect(containerRegistry.getStreamsPerContainerId().get(dockerodeContainer.id)).toBeUndefined();
  });

  test('container attach stream LIBPOD API', async () => {
    const attachMock = vi.fn();

    const fakeLibPod = {
      podmanAttach: attachMock,
    } as unknown as LibPod;

    const engine = {
      name: 'podman1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      libpodApi: fakeLibPod,
    } as InternalContainerProvider;

    const container = {
      id: '1234',
    } as unknown as Dockerode.Container;

    // create a read/write stream
    const stream = new PassThrough();
    // need to reply with a stream
    attachMock.mockResolvedValue(stream);

    await containerRegistry.attachToContainer(engine, container, true, true);

    const data = 'log message';
    //send some data
    stream.write(data);

    expect(attachMock).toBeCalledWith(container.id);

    const streams = containerRegistry.getStreamsOutputPerContainerId().get(container.id);
    expect(streams).toBeDefined();

    expect(String(streams)).toBe(data);

    const streamPerContainer = containerRegistry.getStreamsPerContainerId().get(container.id);
    expect(streamPerContainer).toBeDefined();
    expect(streamPerContainer).toBe(stream);

    // now end the stream
    stream.end();

    // wait a little
    await new Promise(resolve => setTimeout(resolve, 500));

    // check that the data has been cleaned-up
    expect(containerRegistry.getStreamsOutputPerContainerId().get(container.id)).toBeUndefined();
    expect(containerRegistry.getStreamsPerContainerId().get(container.id)).toBeUndefined();
  });

  test('container do not attach stream as no tty', async () => {
    const fakeDockerode = {} as Dockerode;

    const engine = {
      name: 'docker1',
      id: 'docker1',
      connection: {
        type: 'docker',
      },
      api: fakeDockerode,
    } as InternalContainerProvider;

    const attachMock = vi.fn();
    const inspectMock = vi.fn();

    const dockerodeContainer = {
      id: '1234',
      attach: attachMock,
      inspect: inspectMock,
    } as unknown as Dockerode.Container;

    inspectMock.mockResolvedValue({
      Config: {
        Tty: false,
        OpenStdin: false,
      },
    });

    // create a read/write stream
    const stream = new PassThrough();
    // need to reply with a stream
    attachMock.mockResolvedValue(stream);

    await containerRegistry.attachToContainer(engine, dockerodeContainer);

    const data = 'log message';
    //send some data
    stream.write(data);

    expect(attachMock).not.toBeCalled();
    expect(containerRegistry.getStreamsOutputPerContainerId().get(dockerodeContainer.id)).toBeUndefined();
    expect(containerRegistry.getStreamsPerContainerId().get(dockerodeContainer.id)).toBeUndefined();
  });

  test('container do not attach stream as tty but no OpenStdin', async () => {
    const fakeDockerode = {} as Dockerode;

    const engine = {
      name: 'docker1',
      id: 'docker1',
      connection: {
        type: 'docker',
      },
      api: fakeDockerode,
    } as InternalContainerProvider;

    const attachMock = vi.fn();
    const inspectMock = vi.fn();

    const dockerodeContainer = {
      id: '1234',
      attach: attachMock,
      inspect: inspectMock,
    } as unknown as Dockerode.Container;

    inspectMock.mockResolvedValue({
      Config: {
        Tty: true,
        OpenStdin: false,
      },
    });

    // create a read/write stream
    const stream = new PassThrough();
    // need to reply with a stream
    attachMock.mockResolvedValue(stream);

    await containerRegistry.attachToContainer(engine, dockerodeContainer);

    const data = 'log message';
    //send some data
    stream.write(data);

    expect(attachMock).not.toBeCalled();
    expect(containerRegistry.getStreamsOutputPerContainerId().get(dockerodeContainer.id)).toBeUndefined();
    expect(containerRegistry.getStreamsPerContainerId().get(dockerodeContainer.id)).toBeUndefined();
  });
});

test('createNetwork', async () => {
  const networkId = 'network123456';
  server = setupServer(http.post('http://localhost/networks/create', () => HttpResponse.json({ Id: networkId })));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  const internalContainerProvider: InternalContainerProvider = {
    name: 'podman',
    id: 'podman1',
    api,
    connection: {
      type: 'podman',
      displayName: 'podman',
      name: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    },
  };

  const providerConnectionInfo: ProviderContainerConnectionInfo = {
    connectionType: 'container',
    name: 'podman',
    type: 'podman',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status: 'started',
  } as unknown as ProviderContainerConnectionInfo;

  // set provider
  containerRegistry.addInternalProvider('podman', internalContainerProvider);

  // check that it returns both Id and engineId
  const result = await containerRegistry.createNetwork(providerConnectionInfo, { Name: 'myNetwork' });
  expect(result.Id).toBe(networkId);
  expect(result.engineId).toBe('podman1');
});

test('setupConnectionAPI with errors', async () => {
  // create a stream that we return to mock
  const stream = new PassThrough();

  // need to reply with a stream
  server = setupServer(
    http.get('http://localhost/events', () => new HttpResponse(stream as unknown as ReadableStream)),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const internalContainerProvider: InternalContainerProvider = {
    name: 'podman',
    id: 'podman1',
    connection: {
      type: 'podman',
      displayName: 'podman',
      name: 'podman',
      endpoint: {
        socketPath: 'http://localhost',
      },
      status: () => 'started',
    },
  };

  const providerConnectionInfo: podmanDesktopAPI.ContainerProviderConnection = {
    name: 'podman',
    displayName: 'podman',
    type: 'podman',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status: () => 'started',
  };

  // check that api is being added
  expect(internalContainerProvider.api).toBeUndefined();
  expect(internalContainerProvider.libpodApi).toBeUndefined();
  containerRegistry.setupConnectionAPI(internalContainerProvider, providerConnectionInfo);

  // change delay of setRetryDelayEvents to be 200ms
  containerRegistry.setRetryDelayEvents(200);

  // wait 0.5s
  await new Promise(resolve => setTimeout(resolve, 500));
  expect(internalContainerProvider.api).toBeDefined();

  // ok now send an error

  // and send an error in the stream
  stream.emit('error', new Error('my error'));
  // close the stream
  stream.end();

  // we should not have the api anymore
  await vi.waitFor(() => expect(internalContainerProvider.api).toBeUndefined());

  // and it should try to reconnect to the mock

  // wait 0.5s before providing a new stream
  await new Promise(resolve => setTimeout(resolve, 500));

  // mock again /events
  const stream2 = new PassThrough();
  server.use(http.get('http://localhost/events', () => new HttpResponse(stream2 as unknown as ReadableStream)));

  // emit a container start event, we should proceed it as expected
  const fakeId = '123456';
  stream2.write(
    JSON.stringify({
      status: 'start',
      Type: 'container',
      id: fakeId,
    }),
  );
  // check apiSender if we have a message 'container-started-event' with the right id
  await new Promise(resolve => setTimeout(resolve, 1000));
  expect(internalContainerProvider.api).toBeDefined();

  // last call should be with the 'container-started-event' message
  const allCalls = vi.mocked(apiSender.send).mock.calls;
  expect(allCalls).toBeDefined();

  // filter calls to find the one with container-started-event
  const containerStartedEventCalls = allCalls.filter(call => call[0] === 'container-started-event');
  expect(containerStartedEventCalls).toHaveLength(0);

  stream2.end();

  // it should have reconnect to the stream now and add again the api object
  expect(internalContainerProvider.api).toBeDefined();
});

test('setupConnectionAPI with errors after machine being removed', async () => {
  const internalContainerProvider: InternalContainerProvider = {
    name: 'podman',
    id: 'podman1',
    connection: {
      type: 'podman',
      name: 'podman',
      displayName: 'podman',
      endpoint: {
        socketPath: 'http://localhost',
      },
      status: () => 'started',
    },
  };

  const undefinedStatus: podmanDesktopAPI.ProviderConnectionStatus =
    undefined as unknown as podmanDesktopAPI.ProviderConnectionStatus;

  const providerConnectionInfo: podmanDesktopAPI.ContainerProviderConnection = {
    name: 'podman',
    displayName: 'podman',
    type: 'podman',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status: () => undefinedStatus,
  };

  // check that api is being added
  expect(internalContainerProvider.api).toBeUndefined();
  expect(internalContainerProvider.libpodApi).toBeUndefined();

  const originalConsoleLog = console.log;
  const mockedConsoleLog = vi.fn();
  console.log = mockedConsoleLog;
  try {
    containerRegistry.setupConnectionAPI(internalContainerProvider, providerConnectionInfo);
  } finally {
    console.log = originalConsoleLog;
  }

  // should have returned immediately and nothing should be setup
  expect(internalContainerProvider.api).toBeUndefined();
  expect(internalContainerProvider.libpodApi).toBeUndefined();

  expect(apiSender.send).not.toHaveBeenCalled();

  expect(mockedConsoleLog).toHaveBeenCalledWith(
    'Aborting reconnect due to error as connection has been removed (probably machine has been removed)',
  );
});

test('check handleEvents with loadArchive', async () => {
  const consoleLogSpy = vi.spyOn(console, 'log');
  const getEventsMock = vi.fn();
  let eventsMockCallback: ((ignored: unknown, stream: PassThrough) => void) | undefined;
  // keep the function passed in parameter of getEventsMock
  getEventsMock.mockImplementation((options: (ignored: unknown, stream: PassThrough) => void) => {
    eventsMockCallback = options;
  });

  const passThrough = new PassThrough();
  const fakeDockerode = {
    getEvents: getEventsMock,
  } as unknown as Dockerode;

  const errorCallback = vi.fn();

  containerRegistry.handleEvents(fakeDockerode, errorCallback);

  if (eventsMockCallback) {
    eventsMockCallback?.(undefined, passThrough);
  }

  // send loadArchive event
  const content = { status: 'loadfromarchive', Type: 'image', id: '123456' };
  passThrough.emit('data', JSON.stringify(content));

  // wait 1s
  await new Promise(resolve => setTimeout(resolve, 3000));

  // check callback is defined
  expect(eventsMockCallback).toBeDefined();

  // check we send the event to notify renderer part
  expect(apiSender.send).toBeCalledWith('image-loadfromarchive-event', '123456');

  // expect we have a call to log the event
  expect(consoleLogSpy).toBeCalledWith('event is', content);
});

test('check handleEvents is not calling the console.log for health_status event', async () => {
  const consoleLogSpy = vi.spyOn(console, 'log');
  consoleLogSpy.mockClear();
  const getEventsMock = vi.fn();
  let eventsMockCallback: ((ignored: unknown, stream: PassThrough) => void) | undefined;
  // keep the function passed in parameter of getEventsMock
  getEventsMock.mockImplementation((options: (ignored: unknown, stream: PassThrough) => void) => {
    eventsMockCallback = options;
  });

  const passThrough = new PassThrough();
  const fakeDockerode = {
    getEvents: getEventsMock,
  } as unknown as Dockerode;

  const errorCallback = vi.fn();

  containerRegistry.handleEvents(fakeDockerode, errorCallback);

  if (eventsMockCallback) {
    eventsMockCallback?.(undefined, passThrough);
  }

  // send loadArchive event
  passThrough.emit('data', JSON.stringify({ status: 'health_status', HealthStatus: 'healthy' }));

  // check callback is defined
  await vi.waitFor(() => expect(eventsMockCallback).toBeDefined());

  // check we didn't call the console.log method
  expect(consoleLogSpy).not.toBeCalled();
});

test('check handleEvents with Docker API v1.52+ event shape', async () => {
  const getEventsMock = vi.fn();
  let eventsMockCallback: ((ignored: unknown, stream: PassThrough) => void) | undefined;
  getEventsMock.mockImplementation((options: (ignored: unknown, stream: PassThrough) => void) => {
    eventsMockCallback = options;
  });

  const passThrough = new PassThrough();
  const fakeDockerode = {
    getEvents: getEventsMock,
  } as unknown as Dockerode;

  const errorCallback = vi.fn();

  containerRegistry.handleEvents(fakeDockerode, errorCallback);

  if (eventsMockCallback) {
    eventsMockCallback?.(undefined, passThrough);
  }

  passThrough.emit(
    'data',
    JSON.stringify({
      Type: 'container',
      Action: 'start',
      Actor: {
        ID: 'abc123',
      },
    }),
  );

  await vi.waitFor(() => expect(apiSender.send).toBeCalledWith('container-started-event', 'abc123'));
});

test('check handleEvents normalizes Docker v1.52+ event before emitting to extensions', async () => {
  const getEventsMock = vi.fn();
  let eventsMockCallback: ((ignored: unknown, stream: PassThrough) => void) | undefined;
  getEventsMock.mockImplementation((options: (ignored: unknown, stream: PassThrough) => void) => {
    eventsMockCallback = options;
  });

  const passThrough = new PassThrough();
  const fakeDockerode = {
    getEvents: getEventsMock,
  } as unknown as Dockerode;

  const errorCallback = vi.fn();
  const receivedEvents: unknown[] = [];
  containerRegistry.onEvent(event => receivedEvents.push(event));

  containerRegistry.handleEvents(fakeDockerode, errorCallback);

  if (eventsMockCallback) {
    eventsMockCallback?.(undefined, passThrough);
  }

  passThrough.emit(
    'data',
    JSON.stringify({
      Type: 'container',
      Action: 'stop',
      Actor: { ID: 'docker29-id' },
    }),
  );

  await vi.waitFor(() => expect(receivedEvents.length).toBe(1));
  expect(receivedEvents[0]).toMatchObject({
    status: 'stop',
    id: 'docker29-id',
    Type: 'container',
  });
});

test('check handleEvents does not log Docker compound health_status actions', async () => {
  const consoleLogSpy = vi.spyOn(console, 'log');
  consoleLogSpy.mockClear();

  const getEventsMock = vi.fn();
  let eventsMockCallback: ((ignored: unknown, stream: PassThrough) => void) | undefined;
  getEventsMock.mockImplementation((options: (ignored: unknown, stream: PassThrough) => void) => {
    eventsMockCallback = options;
  });

  const passThrough = new PassThrough();
  const fakeDockerode = {
    getEvents: getEventsMock,
  } as unknown as Dockerode;

  const errorCallback = vi.fn();
  containerRegistry.handleEvents(fakeDockerode, errorCallback);

  if (eventsMockCallback) {
    eventsMockCallback?.(undefined, passThrough);
  }

  passThrough.emit(
    'data',
    JSON.stringify({
      Type: 'container',
      Action: 'health_status: healthy',
      Actor: {
        ID: 'abc123',
      },
    }),
  );

  await vi.waitFor(() => expect(eventsMockCallback).toBeDefined());
  expect(consoleLogSpy).not.toBeCalled();
});

test('check handleEvents prefers Podman-style fields over Docker-style fields', async () => {
  const getEventsMock = vi.fn();
  let eventsMockCallback: ((ignored: unknown, stream: PassThrough) => void) | undefined;
  getEventsMock.mockImplementation((options: (ignored: unknown, stream: PassThrough) => void) => {
    eventsMockCallback = options;
  });

  const passThrough = new PassThrough();
  const fakeDockerode = {
    getEvents: getEventsMock,
  } as unknown as Dockerode;

  const errorCallback = vi.fn();

  containerRegistry.handleEvents(fakeDockerode, errorCallback);

  if (eventsMockCallback) {
    eventsMockCallback?.(undefined, passThrough);
  }

  passThrough.emit(
    'data',
    JSON.stringify({
      status: 'stop',
      id: 'podman-id',
      Type: 'container',
      Action: 'start',
      Actor: { ID: 'docker-id' },
    }),
  );

  await vi.waitFor(() => expect(apiSender.send).toBeCalledWith('container-stopped-event', 'podman-id'));
  expect(apiSender.send).not.toBeCalledWith('container-started-event', 'docker-id');
});

test('check handleEvents tracks telemetry when stream emits error', async () => {
  telemetryTrackMock.mockClear();
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const getEventsMock = vi.fn();
  let eventsMockCallback: ((ignored: unknown, stream: PassThrough) => void) | undefined;
  // keep the function passed in parameter of getEventsMock
  getEventsMock.mockImplementation((options: (ignored: unknown, stream: PassThrough) => void) => {
    eventsMockCallback = options;
  });

  const passThrough = new PassThrough();
  const fakeDockerode = {
    getEvents: getEventsMock,
  } as unknown as Dockerode;

  const errorCallback = vi.fn();

  containerRegistry.handleEvents(fakeDockerode, errorCallback);

  if (eventsMockCallback) {
    eventsMockCallback?.(undefined, passThrough);
  }

  // emit an error on the stream
  const testError = new Error('stream connection error');
  passThrough.emit('error', testError);

  // wait for error handling
  await vi.waitFor(() => expect(errorCallback).toHaveBeenCalled());

  // check that telemetry was tracked with correct event name and properties
  expect(telemetry.track).toHaveBeenCalledWith(
    'container-events-failure',
    expect.objectContaining({
      nbEvents: expect.any(Number),
      failureAfter: expect.any(Number),
      error: testError,
    }),
  );

  // verify error was logged
  expect(consoleErrorSpy).toHaveBeenCalledWith('/event stream received an error.', testError);

  // verify error callback was called with wrapped error
  expect(errorCallback).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error in handling events' }));

  consoleErrorSpy.mockRestore();
});

test('check handleEvents calls errorCallback and destroys pipeline on parse error', async () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const getEventsMock = vi.fn();
  let eventsMockCallback: ((ignored: unknown, stream: PassThrough) => void) | undefined;
  getEventsMock.mockImplementation((options: (ignored: unknown, stream: PassThrough) => void) => {
    eventsMockCallback = options;
  });

  const passThrough = new PassThrough();
  const fakeDockerode = {
    getEvents: getEventsMock,
  } as unknown as Dockerode;

  const errorCallback = vi.fn();

  containerRegistry.handleEvents(fakeDockerode, errorCallback);

  if (eventsMockCallback) {
    eventsMockCallback?.(undefined, passThrough);
  }

  // send malformed data to trigger a JSON parse error in the pipeline
  passThrough.write('this is not valid JSON{{{');
  passThrough.end();

  await vi.waitFor(() => expect(errorCallback).toHaveBeenCalled());

  expect(consoleErrorSpy).toHaveBeenCalledWith('Error while parsing events', expect.any(Error));
  expect(errorCallback).toHaveBeenCalledWith(expect.objectContaining({ message: 'Error while parsing events' }));

  consoleErrorSpy.mockRestore();
});

test('check volume mounted is replicated when executing replicatePodmanContainer with named volume', async () => {
  const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

  const createPodmanContainerMock = vi.fn();
  const fakeLibPod = {
    createPodmanContainer: createPodmanContainerMock,
  } as unknown as LibPod;

  const inspectMock = vi.fn().mockResolvedValue(fakeContainerInspectInfoWithVolume);

  const dockerodeContainer = {
    inspect: inspectMock,
  } as unknown as Dockerode.Container;

  vi.spyOn(dockerAPI, 'getContainer').mockReturnValue(dockerodeContainer);

  // set providers with docker being first
  containerRegistry.addInternalProvider('podman1', {
    name: 'podman',
    id: 'podman1',
    api: dockerAPI,
    libpodApi: fakeLibPod,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  await containerRegistry.replicatePodmanContainer(
    {
      engineId: 'podman1',
      id: 'id',
    },
    {
      engineId: 'podman1',
    },
    {},
  );

  expect(createPodmanContainerMock).toBeCalledWith({
    command: fakeContainerInspectInfo.Config.Cmd,
    entrypoint: fakeContainerInspectInfo.Config.Entrypoint,
    env: {},
    image: fakeContainerInspectInfo.Config.Image,
    mounts: [],
    volumes: [{ Dest: '/destination', Name: 'vol1' }],
  });
});

test('check volume mounted is replicated when executing replicatePodmanContainer', async () => {
  const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

  const createPodmanContainerMock = vi.fn();
  const fakeLibPod = {
    createPodmanContainer: createPodmanContainerMock,
  } as unknown as LibPod;

  const inspectMock = vi.fn().mockResolvedValue(fakeContainerInspectInfo);

  const dockerodeContainer = {
    inspect: inspectMock,
  } as unknown as Dockerode.Container;

  vi.spyOn(dockerAPI, 'getContainer').mockReturnValue(dockerodeContainer);

  // set providers with docker being first
  containerRegistry.addInternalProvider('podman1', {
    name: 'podman',
    id: 'podman1',
    api: dockerAPI,
    libpodApi: fakeLibPod,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  await containerRegistry.replicatePodmanContainer(
    {
      engineId: 'podman1',
      id: 'id',
    },
    {
      engineId: 'podman1',
    },
    {},
  );

  expect(createPodmanContainerMock).toBeCalledWith({
    command: fakeContainerInspectInfo.Config.Cmd,
    entrypoint: fakeContainerInspectInfo.Config.Entrypoint,
    env: {},
    image: fakeContainerInspectInfo.Config.Image,
    mounts: fakeContainerInspectInfo.Mounts,
    volumes: [],
  });
});

test('test that pushManifest does not error', async () => {
  const pushManifestMock = vi.fn();

  const fakeLibPod = {
    podmanPushManifest: pushManifestMock,
  } as unknown as LibPod;

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman',
    id: 'podman1',
    libpodApi: fakeLibPod,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  // Spy on the pushManifest function
  const spyPushManifest = vi.spyOn(fakeLibPod, 'podmanPushManifest');

  const result = await containerRegistry.pushManifest({ name: 'testid1', destination: 'testid1' });

  // Expect PushManifest to be called
  expect(spyPushManifest).toHaveBeenCalled();

  // Expect to not error
  expect(result).toBeUndefined();
});

test('check that createManifest returns an Id value after running podmanCreateManifest', async () => {
  const createManifestMock = vi.fn().mockResolvedValue({
    Id: 'testid1',
  });

  const fakeLibPod = {
    podmanCreateManifest: createManifestMock,
  } as unknown as LibPod;

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman',
    id: 'podman1',
    libpodApi: fakeLibPod,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const result = await containerRegistry.createManifest({
    name: 'manifest',
    images: ['image1', 'image2'],
  });

  expect(result.Id).toBe('testid1');
});

test('check that createManifest errors with The matching provider does not support the Podman API if the provider has no libpodApi', async () => {
  const fakeDockerode = {
    createManifest: vi.fn(),
  } as unknown as LibPod;

  const internalProvider = {
    name: 'podman1',
    id: 'podman1',
    connection: {
      name: 'podman1',
      type: 'podman',
      endpoint: {
        socketPath: 'podman.sock',
      },
    },
    // Purposely NOT have libpodApi, but just have normal api
    api: fakeDockerode,
  } as unknown as InternalContainerProvider;

  containerRegistry.addInternalProvider('podman1', internalProvider);

  const containerProviderConnection: podmanDesktopAPI.ContainerProviderConnection = {
    name: 'podman1',
    displayName: 'podman',
    endpoint: {
      socketPath: 'podman.sock',
    },
    status: vi.fn(),
    type: 'podman',
  };

  await expect(
    containerRegistry.createManifest({
      name: 'manifest',
      images: ['image1', 'image2'],
      provider: containerProviderConnection,
    }),
  ).rejects.toThrowError('The matching provider does not support the Podman API');
});

test('check createPod uses running podman connection if no selectedProvider is provided', async () => {
  const createPodMock = vi.fn().mockResolvedValue({
    Id: 'id',
  });
  const fakeDockerode = {
    createPod: createPodMock,
  } as unknown as Dockerode;

  const internalProvider = {
    name: 'podman1',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    api: fakeDockerode,
    libpodApi: fakeDockerode,
  } as unknown as InternalContainerProvider;

  containerRegistry.addInternalProvider('podman2', internalProvider);
  const result = await containerRegistry.createPod({
    name: 'pod',
  });
  expect(result.Id).equal('id');
  expect(result.engineId).equal('podman1');
});

test('check createPod uses running podman connection if ContainerProviderConnection is provided', async () => {
  const createPodMock = vi.fn().mockResolvedValue({
    Id: 'id',
  });
  const fakeDockerode = {
    createPod: createPodMock,
  } as unknown as Dockerode;

  const internalProvider = {
    name: 'podman1',
    id: 'podman1',
    connection: {
      name: 'podman1',
      type: 'podman',
      endpoint: {
        socketPath: 'podman.sock',
      },
    },
    api: fakeDockerode,
    libpodApi: fakeDockerode,
  } as unknown as InternalContainerProvider;

  containerRegistry.addInternalProvider('podman1', internalProvider);

  const containerProviderConnection: podmanDesktopAPI.ContainerProviderConnection = {
    name: 'podman1',
    displayName: 'podman',
    endpoint: {
      socketPath: 'podman.sock',
    },
    status: vi.fn(),
    type: 'podman',
  };

  const result = await containerRegistry.createPod({
    name: 'pod',
    provider: containerProviderConnection,
  });
  expect(result.Id).equal('id');
  expect(result.engineId).equal('podman1');
});

test('check createPod uses running podman connection if ProviderContainerConnectionInfo is provided', async () => {
  const createPodMock = vi.fn().mockResolvedValue({
    Id: 'id',
  });
  const fakeDockerode = {
    createPod: createPodMock,
  } as unknown as Dockerode;

  const internalProvider = {
    name: 'podman1',
    id: 'podman1',
    connection: {
      name: 'podman1',
      type: 'podman',
      endpoint: {
        socketPath: 'podman.sock',
      },
    },
    api: fakeDockerode,
    libpodApi: fakeDockerode,
  } as unknown as InternalContainerProvider;

  containerRegistry.addInternalProvider('podman1', internalProvider);

  const containerProviderConnection: ProviderContainerConnectionInfo = {
    connectionType: 'container',
    name: 'podman1',
    displayName: 'podman1',
    endpoint: {
      socketPath: 'podman.sock',
    },
    status: 'started',
    type: 'podman',
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
  };

  const result = await containerRegistry.createPod({
    name: 'pod',
    provider: containerProviderConnection,
  });
  expect(result.Id).equal('id');
  expect(result.engineId).equal('podman1');
});

describe('unpausePod', () => {
  test('test unpause Pod', async () => {
    const unpauseMock = vi.fn().mockResolvedValue({});

    const fakeLibPod = {
      unpausePod: unpauseMock,
    } as unknown as LibPod;

    vi.spyOn(containerRegistry, 'getMatchingPodmanEngineLibPod').mockReturnValue(fakeLibPod);

    await containerRegistry.unpausePod('podman1', '1234');
    expect(unpauseMock).toHaveBeenCalled();
  });

  test('test unpause Pod for error handling', async () => {
    const unpauseError = new Error('unpause failed');
    const unpauseMock = vi.fn().mockRejectedValue(unpauseError);

    const fakeLibPod = {
      unpausePod: unpauseMock,
    } as unknown as LibPod;

    vi.spyOn(containerRegistry, 'getMatchingPodmanEngineLibPod').mockReturnValue(fakeLibPod);

    await expect(containerRegistry.unpausePod('podman1', '1234')).rejects.toThrow(unpauseError);

    expect(telemetry.track).toHaveBeenCalledWith(
      'unpausePod',
      expect.objectContaining({
        error: unpauseError,
      }),
    );
    expect(unpauseMock).toHaveBeenCalled();
  });
});

test('check that fails if there is no podman provider running', async () => {
  const internalProvider = {
    name: 'podman1',
    id: 'podman1',
    connection: {
      name: 'podman1',
      type: 'podman',
    },
  } as unknown as InternalContainerProvider;

  containerRegistry.addInternalProvider('podman1', internalProvider);
  await expect(
    containerRegistry.createPod({
      name: 'pod',
    }),
  ).rejects.toThrowError('No podman provider with a running engine');
});

test('check that fails if selected provider is not a podman one', async () => {
  const createPodMock = vi.fn().mockResolvedValue({
    Id: 'id',
  });
  const fakeDockerode = {
    createPod: createPodMock,
  } as unknown as Dockerode;

  const internalProvider = {
    name: 'podman1',
    id: 'podman1',
    connection: {
      name: 'podman1',
      type: 'docker',
    },
    api: fakeDockerode,
  } as unknown as InternalContainerProvider;

  containerRegistry.addInternalProvider('podman1', internalProvider);
  await expect(
    containerRegistry.createPod({
      name: 'pod',
    }),
  ).rejects.toThrowError('No podman provider with a running engine');
});

test('list pods', async () => {
  const podsList = [
    {
      Labels: {
        key1: 'value1',
        key2: 'value2',
      },
    },
  ];

  server = setupServer(http.get('http://localhost/v4.2.0/libpod/pods/json', () => HttpResponse.json(podsList)));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set provider
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const pods = await containerRegistry.listPods();
  // ensure the field are correct
  expect(pods).toBeDefined();
  expect(pods).toHaveLength(1);
  const pod = pods[0];
  expect(pod?.engineId).toBe('podman1');
  expect(pod?.engineName).toBe('podman');
  expect(pod?.kind).toBe('podman');
  expect(pod?.Labels).toStrictEqual({
    key1: 'value1',
    key2: 'value2',
  });
});

describe('getMatchingPodmanEngine', () => {
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  test('should throw error if no engine is found', () => {
    expect(() => containerRegistry.getMatchingPodmanEngine('podman')).toThrowError('no engine matching this engine');
  });
  test('should throw error if engine has no api', () => {
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);
    expect(() => containerRegistry.getMatchingPodmanEngine('podman')).toThrowError(
      'no running provider for the matching engine',
    );
  });
  test('should throw error if engine has no libPodApi', () => {
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);
    expect(() => containerRegistry.getMatchingPodmanEngine('podman')).toThrowError(
      'LibPod is not supported by this engine',
    );
  });
  test('should return found engine', () => {
    const containerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      libpodApi: api,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider;
    containerRegistry.addInternalProvider('podman', containerProvider);
    const result = containerRegistry.getMatchingPodmanEngine('podman');
    expect(result).equal(containerProvider);
  });
});
describe('getMatchingPodmanEngineLibPod', () => {
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  test('should return found lib', () => {
    const containerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      libpodApi: api,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider;
    containerRegistry.addInternalProvider('podman', containerProvider);
    const result = containerRegistry.getMatchingPodmanEngineLibPod('podman');
    expect(result).equal(api);
  });
});

describe('createContainerLibPod', () => {
  test('throw if there is no podman engine running', async () => {
    await expect(() =>
      containerRegistry.createContainer('engine', {
        Image: 'image',
        Env: ['key=value'],
        pod: 'pod',
        name: 'name',
      }),
    ).rejects.toThrowError('no engine matching this engine');
  });
  test('check the createPodmanContainer is correctly called with options param', async () => {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    const libpod = new LibpodDockerode();
    libpod.enhancePrototypeWithLibPod();
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const createPodmanContainerMock = vi
      .spyOn(dockerAPI as unknown as LibPod, 'createPodmanContainer')
      .mockImplementation(_options =>
        Promise.resolve({
          Id: 'id',
          Warnings: [],
        }),
      );
    vi.spyOn(dockerAPI as unknown as Dockerode, 'getContainer').mockImplementation((_id: string) => {
      return {
        start: () => {},
      } as unknown as Dockerode.Container;
    });
    const options: ContainerCreateOptions = {
      Image: 'image',
      Env: ['key=value'],
      pod: 'pod',
      name: 'name',
      HostConfig: {
        Devices: [
          {
            PathOnHost: 'device1',
            PathInContainer: '',
            CgroupPermissions: '',
          },
        ],
        Mounts: [
          {
            Target: 'destination',
            Source: 'source',
            Type: 'bind',
            BindOptions: {
              Propagation: 'rprivate',
            },
            ReadOnly: false,
          },
        ],
        NetworkMode: 'mode',
        SecurityOpt: ['default', 'label=disable'],
        PortBindings: {
          '8080': [
            {
              HostPort: '8080',
            },
          ],
        },
        RestartPolicy: {
          Name: 'restartpolicy',
          MaximumRetryCount: 2,
        },
        AutoRemove: true,
        CapAdd: ['add'],
        CapDrop: ['drop'],
        Privileged: true,
        ReadonlyRootfs: true,
        UsernsMode: 'userns',
      },
      Cmd: ['cmd'],
      Entrypoint: 'entrypoint',
      Hostname: 'hostname',
      User: 'user',
      Labels: {
        label: '1',
      },
      WorkingDir: 'work_dir',
      StopTimeout: 2,
      HealthCheck: {
        Timeout: 100,
      },
    };
    const expectedOptions: PodmanContainerCreateOptions = {
      name: options.name,
      command: options.Cmd,
      devices: [{ path: 'device1' }],
      entrypoint: [options.Entrypoint as string],
      env: {
        key: 'value',
      },
      image: options.Image,
      pod: options.pod,
      hostname: options.Hostname,
      mounts: [
        {
          Destination: 'destination',
          Source: 'source',
          Type: 'bind',
          Propagation: 'rprivate',
          RW: true,
          Options: [],
        },
      ],
      netns: {
        nsmode: 'mode',
      },
      seccomp_policy: 'default',
      selinux_opts: ['disable'],
      portmappings: [
        {
          container_port: 8080,
          host_port: 8080,
        },
      ],
      user: options.User,
      labels: options.Labels,
      work_dir: options.WorkingDir,
      stop_timeout: options.StopTimeout,
      healthconfig: options.HealthCheck,
      restart_policy: options.HostConfig?.RestartPolicy?.Name,
      restart_tries: options.HostConfig?.RestartPolicy?.MaximumRetryCount,
      remove: options.HostConfig?.AutoRemove,
      cap_add: options.HostConfig?.CapAdd,
      cap_drop: options.HostConfig?.CapDrop,
      privileged: options.HostConfig?.Privileged,
      read_only_filesystem: options.HostConfig?.ReadonlyRootfs,
      hostadd: options.HostConfig?.ExtraHosts,
      userns: options.HostConfig?.UsernsMode,
    };
    vi.spyOn(containerRegistry, 'attachToContainer').mockImplementation(
      (
        _engine: InternalContainerProvider,
        _container: Dockerode.Container,
        _hasTty?: boolean,
        _openStdin?: boolean,
      ) => {
        return Promise.resolve();
      },
    );
    await containerRegistry.createContainer('podman1', options);
    expect(createPodmanContainerMock).toBeCalledWith(expectedOptions);

    // check the case when an array is passed in for Entrypoint
    createPodmanContainerMock.mockClear();
    options.Entrypoint = ['array_entrypoint'];
    expectedOptions.entrypoint = options.Entrypoint;
    await containerRegistry.createContainer('podman1', options);
    expect(createPodmanContainerMock).toBeCalledWith(expectedOptions);

    // check the case when an undefined is passed in for Entrypoint
    createPodmanContainerMock.mockClear();
    options.Entrypoint = undefined;
    expectedOptions.entrypoint = options.Entrypoint;
    await containerRegistry.createContainer('podman1', options);
    expect(createPodmanContainerMock).toBeCalledWith(expectedOptions);

    // check the case when array with mulpile entries is passed as entrypoint
    createPodmanContainerMock.mockClear();
    options.Entrypoint = ['entrypoint', 'arg1'];
    expectedOptions.entrypoint = options.Entrypoint;
    await containerRegistry.createContainer('podman1', options);
    expect(createPodmanContainerMock).toBeCalledWith(expectedOptions);
  });

  test('check that use of libPod is forced by request for nvidia device', async () => {
    const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

    const libpod = new LibpodDockerode();
    libpod.enhancePrototypeWithLibPod();
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: dockerAPI,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    const createPodmanContainerMock = vi
      .spyOn(dockerAPI as unknown as LibPod, 'createPodmanContainer')
      .mockImplementation(_options =>
        Promise.resolve({
          Id: 'id',
          Warnings: [],
        }),
      );
    vi.spyOn(dockerAPI as unknown as Dockerode, 'getContainer').mockImplementation((_id: string) => {
      return {
        start: () => {},
      } as unknown as Dockerode.Container;
    });
    // use minimum set as the full of options is validated in the previous test
    const options: ContainerCreateOptions = {
      Image: 'image',
      name: 'name',
      HostConfig: {
        Devices: [
          {
            PathOnHost: 'nvidia.com/gpu=all',
            PathInContainer: '',
            CgroupPermissions: '',
          },
        ],
        NetworkMode: 'mode',
        AutoRemove: true,
      },
      Cmd: ['cmd'],
      Entrypoint: 'entrypoint',
      User: 'user',
    };
    const expectedOptions: PodmanContainerCreateOptions = {
      image: options.Image,
      name: options.name,
      devices: [{ path: 'nvidia.com/gpu=all' }],
      netns: {
        nsmode: 'mode',
      },
      command: options.Cmd,
      entrypoint: [options.Entrypoint as string],
      user: options.User,
      cap_add: undefined,
      cap_drop: undefined,
      dns_server: undefined,
      env: undefined,
      healthconfig: undefined,
      hostadd: undefined,
      hostname: undefined,
      labels: undefined,
      mounts: undefined,
      pod: undefined,
      portmappings: undefined,
      privileged: undefined,
      read_only_filesystem: undefined,
      remove: true,
      restart_policy: undefined,
      restart_tries: undefined,
      seccomp_policy: undefined,
      seccomp_profile_path: undefined,
      selinux_opts: [],
      stop_timeout: undefined,
      userns: undefined,
      work_dir: undefined,
    };
    vi.spyOn(containerRegistry, 'attachToContainer').mockImplementation(
      (
        _engine: InternalContainerProvider,
        _container: Dockerode.Container,
        _hasTty?: boolean,
        _openStdin?: boolean,
      ) => {
        return Promise.resolve();
      },
    );
    await containerRegistry.createContainer('podman1', options);
    expect(createPodmanContainerMock).toBeCalledWith(expectedOptions);
  });

  test('expect createContainer to use compat api for non-podman options', async () => {
    vi.spyOn(containerRegistry, 'attachToContainer').mockResolvedValue();

    const dockerAPI = {
      createContainer: vi.fn(),
    } as unknown as Dockerode;
    const libpodAPI = {
      createPodmanContainer: vi.fn(),
    } as unknown as LibPod;

    vi.mocked(dockerAPI.createContainer).mockResolvedValue({
      start: () => {},
      inspect: () => {},
    } as unknown as Dockerode.Container);

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: libpodAPI,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    await containerRegistry.createContainer('podman1', {
      Image: 'image',
      name: 'name',
    });

    expect(dockerAPI.createContainer).toHaveBeenCalledExactlyOnceWith({
      Image: 'image',
      name: 'name',
    });
    expect(libpodAPI.createPodmanContainer).not.toHaveBeenCalled();
  });

  test('check that secrets and secret_env are passed to createPodmanContainer', async () => {
    vi.spyOn(containerRegistry, 'attachToContainer').mockResolvedValue();

    const dockerAPI = {
      createContainer: vi.fn(),
      getContainer: vi.fn(),
    } as unknown as Dockerode;
    const libpodAPI = {
      createPodmanContainer: vi.fn(),
    } as unknown as LibPod;

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: dockerAPI,
      libpodApi: libpodAPI,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);

    vi.mocked(dockerAPI.getContainer).mockResolvedValue({
      start: vi.fn(),
    } as unknown as Dockerode.Container);

    vi.mocked(libpodAPI.createPodmanContainer).mockResolvedValue({
      Id: 'id',
      Warnings: [],
    });

    vi.spyOn(containerRegistry, 'attachToContainer').mockResolvedValue();

    const options: ContainerCreateOptions = {
      Image: 'image',
      name: 'name',
      Secrets: [{ Source: 'my-secret', Target: '/run/secrets/my-secret' }],
      SecretEnv: { FOO_DATA: 'foo-data' },
    };

    await containerRegistry.createContainer('podman1', options);

    expect(dockerAPI.createContainer).not.toHaveBeenCalled();
    expect(libpodAPI.createPodmanContainer).toBeCalledWith(
      expect.objectContaining({
        secrets: [{ Source: 'my-secret', Target: '/run/secrets/my-secret' }],
        secret_env: { FOO_DATA: 'foo-data' },
      }),
    );
  });
});

describe('getContainerCreateMountOptionFromBind', () => {
  interface OptionFromBindOptions {
    destination: string;
    source: string;
    mode?: string;
    propagation?: string;
  }
  function verifyGetContainerCreateMountOptionFromBind(options: OptionFromBindOptions): void {
    let bind = `${options.source}:${options.destination}`;
    const mountOptions = ['rbind'];
    if (options.mode ?? options.propagation) {
      bind += ':';
      if (options.mode) {
        mountOptions.push(options.mode);
        bind += `${options.mode},`;
      }
      if (options.propagation) {
        bind += `${options.propagation}`;
      }
    }
    const result = containerRegistry.getContainerCreateMountOptionFromBind(bind);

    expect(result).toStrictEqual({
      Destination: options.destination,
      Source: options.source,
      Propagation: options.propagation ?? 'rprivate',
      Type: 'bind',
      RW: true,
      Options: mountOptions,
    });
  }
  test('return undefined if bind has an invalid value', () => {
    const result = containerRegistry.getContainerCreateMountOptionFromBind('invalidBind');
    expect(result).toBeUndefined();
  });
  test('return option with default propagation and mode if no flag is specified', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
    });
  });
  test('return option with default propagation and mode as per flag - Z', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      mode: 'Z',
    });
  });
  test('return option with default propagation and mode as per flag - z', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      mode: 'z',
    });
  });
  test('return option with default mode and propagation as per flag - rprivate', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      propagation: 'rprivate',
    });
  });
  test('return option with default mode and propagation as per flag - private', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      propagation: 'private',
    });
  });
  test('return option with default mode and propagation as per flag - shared', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      propagation: 'shared',
    });
  });
  test('return option with default mode and propagation as per flag - rshared', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      propagation: 'rshared',
    });
  });
  test('return option with default mode and propagation as per flag - slave', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      propagation: 'slave',
    });
  });
  test('return option with default mode and propagation as per flag - rslave', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      propagation: 'rslave',
    });
  });
  test('return option with mode and propagation as per flag - Z and rslave', () => {
    verifyGetContainerCreateMountOptionFromBind({
      destination: 'v2',
      source: 'v1',
      mode: 'Z',
      propagation: 'rslave',
    });
  });
});

test('list images with listImages correctly', async () => {
  const imagesList = [
    {
      Id: 'dummyImageId',
      Digest: 'fooDigest',
    },
  ];
  server = setupServer(http.get('http://localhost/v4.2.0/libpod/images/json', () => HttpResponse.json(imagesList)));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set provider
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image?.engineId).toBe('podman1');
  expect(image?.engineName).toBe('podman');
  expect(image?.Id).toBe('sha256:dummyImageId');
});

test('expect images with podmanListImages to also include History as well as engineId and engineName', async () => {
  const imagesList = [
    {
      Id: 'dummyImageId',
      History: ['history1', 'history2'],
    },
  ];

  server = setupServer(http.get('http://localhost/v4.2.0/libpod/images/json', () => HttpResponse.json(imagesList)));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set provider
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image?.engineId).toBe('podman1');
  expect(image?.engineName).toBe('podman');
  expect(image?.History).toStrictEqual(['history1', 'history2']);
});

test('expect images with podmanListImages to also include Digest as engineId and engineName', async () => {
  const imagesList = [
    {
      Id: 'dummyImageId',
      Digest: 'dummyDigest',
    },
  ];

  server = setupServer(http.get('http://localhost/v4.2.0/libpod/images/json', () => HttpResponse.json(imagesList)));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set provider
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image?.engineId).toBe('podman1');
  expect(image?.engineName).toBe('podman');
  expect(image?.Digest).toBe('dummyDigest');
});

test('If image does not have Digest in list images, expect the Digest to be sha256:ID', async () => {
  // Purposely be missing Digest, it should return Digest as sha256:ID
  // this is because the compat API does not provide Digest return.
  const imagesList = [
    {
      Id: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2',
    },
  ];

  server = setupServer(http.get('http://localhost/v4.2.0/libpod/images/json', () => HttpResponse.json(imagesList)));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set provider
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();

  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image?.engineId).toBe('podman1');
  expect(image?.engineName).toBe('podman');
  expect(image?.Digest).toBe('sha256:c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2');
});

test('expect to fall back to compat api images if podman provider does not have libpodApi', async () => {
  const imagesList = [
    {
      Id: 'dummyImageId',
    },
  ];

  const imagesList2 = [
    {
      Id: 'dummyImageId2',
    },
  ];
  server = setupServer(
    http.get('http://localhost/v4.2.0/libpod/images/json', () => HttpResponse.json(imagesList)),
    http.get('http://localhost/images/json', () => HttpResponse.json(imagesList2)),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set provider
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    connection: {
      type: 'podman',
    },
    // purposely NOT have libpodApi
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  expect(images[0]?.Id).toBe('dummyImageId2');
});

test('pass options to compat api when using podmanListImages', async () => {
  const imagesList = [{ Id: 'dummyImageId' }];
  server = setupServer(http.get('http://localhost/images/json', () => HttpResponse.json(imagesList)));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });
  const listImagesSpy = vi.spyOn(api, 'listImages');

  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  await containerRegistry.listImages({ all: true, filters: '{"dangling":["false"]}' });

  expect(vi.mocked(listImagesSpy)).toHaveBeenCalledWith({
    all: true,
    digests: true,
    filters: '{"dangling":["false"]}',
  });
});

test('expect a blank array if there is no api or libpod API when doing podmanListImages', async () => {
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    // purposely NOT have api or libpodApi
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(0);
});

test('expect to get get zero images if podman provider has neither libpod API nor compat api', async () => {
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    // purposely NOT have libpod API or compat api
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(0);
});

test('expect podmanListImages to return images from working providers even if one fails', async () => {
  const consoleErrorSpy = vi.spyOn(console, 'error');

  const workingProviderImages = [
    {
      Id: 'workingImageId',
      Digest: 'fooDigest',
    },
  ];

  // Setup working provider
  server = setupServer(
    http.get('http://localhost/v4.2.0/libpod/images/json', () => HttpResponse.json(workingProviderImages)),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const workingApi = new Dockerode({ protocol: 'http', host: 'localhost' });

  // Add working provider
  containerRegistry.addInternalProvider('podman-working', {
    name: 'podman-working',
    id: 'podman-working',
    api: workingApi,
    libpodApi: workingApi,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  // Add failing provider
  const failingError = new Error('Connection failed');
  const failingApi = {
    podmanListImages: vi.fn().mockRejectedValue(failingError),
    listImages: vi.fn().mockRejectedValue(failingError),
  };

  containerRegistry.addInternalProvider('podman-failing', {
    name: 'podman-failing',
    id: 'podman-failing',
    api: failingApi,
    libpodApi: failingApi,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();

  // Should return images from working provider despite the error
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  expect(images[0]?.Id).toBe('sha256:workingImageId');
  expect(images[0]?.engineId).toBe('podman-working');
  expect(images[0]?.engineName).toBe('podman-working');

  // Should log error for failed provider with provider context
  expect(consoleErrorSpy).toHaveBeenCalledWith(
    'Error listing images from provider podman-failing (podman-failing):',
    failingError,
  );
});

test('listInfos without provider', async () => {
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set providers
  containerRegistry.addInternalProvider('podman1', {
    name: 'podman-1',
    id: 'podman1',
    api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);
  containerRegistry.addInternalProvider('podman2', {
    name: 'podman-2',
    id: 'podman2',
    api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  vi.spyOn(containerRegistry, 'info').mockImplementation(
    async (engineId: string) =>
      ({
        engineId,
      }) as podmanDesktopAPI.ContainerEngineInfo,
  );
  const infos = await containerRegistry.listInfos();
  expect(infos).toEqual([
    {
      engineId: 'podman1',
    },
    {
      engineId: 'podman2',
    },
  ]);
});

test('listInfos with provider', async () => {
  const getMatchingContainerProviderMock = vi.spyOn(containerRegistry, 'getMatchingContainerProvider');
  const internalContainerProvider = {
    name: 'podman-2',
    id: 'podman2',
  } as unknown as InternalContainerProvider;
  getMatchingContainerProviderMock.mockReturnValue(internalContainerProvider);

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set providers
  containerRegistry.addInternalProvider('podman1', {
    name: 'podman-1',
    id: 'podman1',
    api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);
  containerRegistry.addInternalProvider('podman2', {
    name: 'podman-2',
    id: 'podman2',
    api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  vi.spyOn(containerRegistry, 'info').mockImplementation(
    async (engineId: string) =>
      ({
        engineId,
      }) as podmanDesktopAPI.ContainerEngineInfo,
  );
  const infos = await containerRegistry.listInfos({
    provider: {
      id: 'podman2',
    } as unknown as podmanDesktopAPI.ContainerProviderConnection,
  });
  expect(infos).toEqual([
    {
      engineId: 'podman2',
    },
  ]);
});

describe('importContainer', () => {
  test('throw if there is no matching engine', async () => {
    await expect(
      containerRegistry.importContainer({
        archivePath: 'archive',
        imageTag: 'image',
        provider: {
          name: 'engine',
          endpoint: {
            socketPath: '/endpoint1.sock',
          },
        } as ProviderContainerConnectionInfo,
      }),
    ).rejects.toThrowError('no running provider for the matching container');
  });
  test('expect importImage to be called with imageTag added by user', async () => {
    const importImageMock = vi.fn();
    const fakeDockerode = {
      importImage: importImageMock,
    } as unknown as Dockerode;
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman',
      connection: {
        name: 'podman',
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);
    await containerRegistry.importContainer({
      archivePath: 'archive.tar',
      imageTag: 'image:v1',
      provider: {
        name: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
      } as ProviderContainerConnectionInfo,
    });
    expect(importImageMock).toBeCalledWith('archive.tar', {
      repo: 'image',
      tag: 'v1',
    });
  });
  test('expect importImage to be called with latest tag if it is not specified by user', async () => {
    const importImageMock = vi.fn();
    const fakeDockerode = {
      importImage: importImageMock,
    } as unknown as Dockerode;
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman',
      connection: {
        name: 'podman',
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);
    await containerRegistry.importContainer({
      archivePath: 'archive.tar',
      imageTag: 'image',
      provider: {
        name: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
      } as ProviderContainerConnectionInfo,
    });
    expect(importImageMock).toBeCalledWith('archive.tar', {
      repo: 'image',
      tag: 'latest',
    });
  });
});

describe('exportContainer', () => {
  function setExportContainerTestEnv(): void {
    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const exportMock = vi.fn().mockResolvedValue({
      on: vi.fn().mockImplementationOnce((event: string, cb: (arg0: string) => string) => {
        if (event === 'close') {
          cb('');
        }
      }),
    } as unknown as NodeJS.ReadableStream);
    const dockerodeContainer = {
      export: exportMock,
    } as unknown as Dockerode.Container;

    vi.spyOn(api, 'getContainer').mockReturnValue(dockerodeContainer);

    // set providers
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman-1',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);
  }
  test('throw if no engine matching the container', async () => {
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman-1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);
    await expect(
      containerRegistry.exportContainer('engine', {
        id: 'id',
        outputTarget: 'dir/name',
      }),
    ).rejects.toThrowError('no engine matching this container');
  });
  test('throw if no provider matching the container', async () => {
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman-1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);
    await expect(
      containerRegistry.exportContainer('podman1', {
        id: 'id',
        outputTarget: 'dir/name',
      }),
    ).rejects.toThrowError('no running provider for the matching container');
  });
  test('should export container to given location', async () => {
    setExportContainerTestEnv();
    vi.spyOn(fs.promises, 'readdir').mockResolvedValue([]);

    const createWriteStreamMock = vi.mocked(fs.createWriteStream).mockReturnValue({
      write: vi.fn(),
      close: vi.fn(),
    } as unknown as fs.WriteStream);
    await containerRegistry.exportContainer('podman1', {
      id: 'id',
      outputTarget: 'dir/name',
    });
    expect(createWriteStreamMock).toBeCalledWith('dir/name', {
      flags: 'w',
    });
  });
});

describe('saveImages', () => {
  test('reject if it is unable to retrieve images as provider is not running', async () => {
    containerRegistry.addInternalProvider('podman1', {
      name: 'podman-1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
    } as unknown as InternalContainerProvider);
    await expect(() =>
      containerRegistry.saveImages({
        outputTarget: 'path',
        images: [
          {
            id: 'id',
            engineId: 'podman1',
          },
          {
            id: 'id2',
            engineId: 'podman1',
          },
        ],
      }),
    ).rejects.toThrow('Unable to save images id, id2. Error: No running provider for the matching images');
  });
  test('expect to call getImages once if we are saving images from one engine', async () => {
    const dockerode = new Dockerode({ protocol: 'http', host: 'localhost' });
    const stream = new PassThrough();
    const getImagesMock = vi.fn().mockResolvedValue(stream);

    const api = {
      ...dockerode,
      getImages: getImagesMock,
    };

    const pipelineMock = vi
      .spyOn(streamPromises, 'pipeline')
      .mockImplementation((_source: NodeJS.ReadableStream, _destination: NodeJS.WritableStream) => {
        return Promise.resolve();
      });

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman-1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api,
    } as unknown as InternalContainerProvider);
    await containerRegistry.saveImages({
      outputTarget: 'path',
      images: [
        {
          id: 'id',
          engineId: 'podman1',
        },
        {
          id: 'id2',
          engineId: 'podman1',
        },
      ],
    });

    expect(getImagesMock).toBeCalledWith({
      names: ['id', 'id2'],
    });
    expect(pipelineMock).toBeCalledTimes(1);
  });
  test('expect to call getImages twice if we are saving images from two engines', async () => {
    const dockerode = new Dockerode({ protocol: 'http', host: 'localhost' });
    const stream = new PassThrough();
    const getImagesMock = vi.fn().mockResolvedValue(stream);

    const api = {
      ...dockerode,
      getImages: getImagesMock,
    };

    const pipelineMock = vi
      .spyOn(streamPromises, 'pipeline')
      .mockImplementation((_source: NodeJS.ReadableStream, _destination: NodeJS.WritableStream) => {
        return Promise.resolve();
      });

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman-1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api,
    } as unknown as InternalContainerProvider);
    containerRegistry.addInternalProvider('podman2', {
      name: 'podman-2',
      id: 'podman2',
      connection: {
        type: 'podman',
      },
      api,
    } as unknown as InternalContainerProvider);
    pipelineMock.mockClear();
    await containerRegistry.saveImages({
      outputTarget: 'path',
      images: [
        {
          id: 'id',
          engineId: 'podman1',
        },
        {
          id: 'id2',
          engineId: 'podman2',
        },
      ],
    });

    expect(getImagesMock).toBeCalledWith({
      names: ['id'],
    });
    expect(getImagesMock).toBeCalledWith({
      names: ['id2'],
    });
    expect(getImagesMock).toBeCalledTimes(2);
    expect(pipelineMock).toBeCalledTimes(2);
  });

  test('reject if it fails at saving the images', async () => {
    const dockerode = new Dockerode({ protocol: 'http', host: 'localhost' });
    const stream = new PassThrough();
    const getImagesMock = vi.fn().mockResolvedValue(stream);

    const api = {
      ...dockerode,
      getImages: getImagesMock,
    };

    vi.spyOn(streamPromises, 'pipeline').mockRejectedValue('error when saving on filesystem');

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman-1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api,
    } as unknown as InternalContainerProvider);
    await expect(() =>
      containerRegistry.saveImages({
        outputTarget: 'path',
        images: [
          {
            id: 'id',
            engineId: 'podman1',
          },
          {
            id: 'id2',
            engineId: 'podman1',
          },
        ],
      }),
    ).rejects.toThrow('Unable to save images id, id2. Error: error when saving on filesystem');
  });
});

describe('loadImages', () => {
  test('throw if there is no matching engine', async () => {
    await expect(
      containerRegistry.loadImages({
        provider: {
          name: 'engine',
          endpoint: {
            socketPath: '/endpoint1.sock',
          },
        } as ProviderContainerConnectionInfo,
        archives: ['archive.tar'],
      }),
    ).rejects.toThrowError('no running provider for the matching container');
  });
  test('expect loadImage to be called with archive selected by user', async () => {
    const loadImageMock = vi.fn();
    const fakeDockerode = {
      loadImage: loadImageMock,
    } as unknown as Dockerode;
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman',
      connection: {
        name: 'podman',
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);
    await containerRegistry.loadImages({
      provider: {
        name: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
      } as ProviderContainerConnectionInfo,
      archives: ['archive.tar'],
    });
    expect(loadImageMock).toBeCalledWith('archive.tar');
  });
  test('expect rejects if loadImage fails', async () => {
    const loadImageMock = vi.fn().mockRejectedValue('loading error');
    const fakeDockerode = {
      loadImage: loadImageMock,
    } as unknown as Dockerode;
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman',
      connection: {
        name: 'podman',
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);
    await expect(() =>
      containerRegistry.loadImages({
        provider: {
          name: 'podman',
          endpoint: {
            socketPath: '/endpoint1.sock',
          },
        } as ProviderContainerConnectionInfo,
        archives: ['archive.tar'],
      }),
    ).rejects.toThrow('Unable to load archive.tar. Error: loading error\n');
  });
  test('expect rejects if loadImage fails multiple times', async () => {
    const loadImageMock = vi.fn().mockRejectedValue('loading error');
    const fakeDockerode = {
      loadImage: loadImageMock,
    } as unknown as Dockerode;
    containerRegistry.addInternalProvider('podman', {
      name: 'podman',
      id: 'podman',
      connection: {
        name: 'podman',
        type: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);
    await expect(() =>
      containerRegistry.loadImages({
        provider: {
          name: 'podman',
          endpoint: {
            socketPath: '/endpoint1.sock',
          },
        } as ProviderContainerConnectionInfo,
        archives: ['archive.tar', 'archive2.tar'],
      }),
    ).rejects.toThrow(
      'Unable to load archive.tar. Error: loading error\nUnable to load archive2.tar. Error: loading error\n',
    );
  });
});

test('manifest is listed as true with podmanListImages correctly', async () => {
  const manifestImage = {
    Id: 'manifestImage',
    Labels: {},
    ParentId: '',
    RepoTags: ['manifestTag'],
    RepoDigests: ['manifestDigest'],
    Created: 0,
    Size: 0,
    VirtualSize: 40 * 1024, // 40KB (less than 50KB threshold)
    SharedSize: 0,
    Containers: 0,
  };

  // Purposely set isManifestList to false
  const manifestImageWithIsManifestListFalse = {
    ...manifestImage,
    isManifestList: false,
  };

  // Purpose set isManifestList to true
  const manifestImageWithIsManifestListTrue = {
    ...manifestImage,
    isManifestList: true,
  };

  const regularImage = {
    Id: 'ee301c921b8aadc002973b2e0c3da17d701dcd994b606769a7e6eaa100b81d44',
    Labels: {},
    ParentId: '',
    RepoTags: ['testdomain.io/library/hello:latest'],
    RepoDigests: [
      'testdomain.io/library/hello@sha256:2d4e459f4ecb5329407ae3e47cbc107a2fbace221354ca75960af4c047b3cb13',
      'testdomain.io/library/hello@sha256:53641cd209a4fecfc68e21a99871ce8c6920b2e7502df0a20671c6fccc73a7c6',
    ],
    Created: 1683046167,
    Size: 23301,
    VirtualSize: 23301, // Directly matches Size in this case
    SharedSize: 0,
    Containers: 0,
    History: ['testdomain.io/library/hello:latest'],
  };

  const inspectManifestMock = vi.fn().mockResolvedValue({
    engineId: 'podman1',
    engineName: 'podman',
    manifests: [
      {
        digest: 'sha256:digest123',
        mediaType: 'mediaType',
        platform: {
          architecture: 'architecture',
          features: [],
          os: 'os',
          variant: 'variant',
        },
        size: 100,
        urls: ['url1', 'url2'],
      },
    ],
    mediaType: 'mediaType',
    schemaVersion: 1,
  });

  const imagesList = [
    manifestImage,
    regularImage,
    manifestImageWithIsManifestListFalse,
    manifestImageWithIsManifestListTrue,
  ];

  server = setupServer(http.get('http://localhost/v4.2.0/libpod/images/json', () => HttpResponse.json(imagesList)));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  const fakeLibPod = {
    podmanInspectManifest: inspectManifestMock,
    podmanListImages: vi.fn().mockResolvedValue(imagesList),
  } as unknown as LibPod;

  // set provider
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: fakeLibPod,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(4);

  // Expect that inspectManifest was called with manifestId
  expect(inspectManifestMock).toBeCalledWith('manifestImage');

  // Check the first image
  const image = images[0];
  expect(image?.engineId).toBe('podman1');
  expect(image?.engineName).toBe('podman');
  expect(image?.Id).toBe('manifestImage');
  expect(image?.isManifest).toBe(true);

  // Check that the manifest returned sha:256:digest123
  expect(image?.manifests).toBeDefined();
  expect(image?.manifests).toHaveLength(1);
  if (image?.manifests) {
    expect(image?.manifests[0]?.digest).toBe('sha256:digest123');
  }

  // Check the second image
  const image2 = images[1];
  expect(image2?.engineId).toBe('podman1');
  expect(image2?.engineName).toBe('podman');
  expect(image2?.Id).toBe('ee301c921b8aadc002973b2e0c3da17d701dcd994b606769a7e6eaa100b81d44');
  expect(image2?.isManifest).toBe(false);

  // Check the third image manifest is false due to isManifestList despite all the "guesses" that it should be a manifest
  const image3 = images[2];
  expect(image3?.isManifest).toBe(false);

  // Check the fourth image manifest is true due to isManifestList being true
  const image4 = images[3];
  expect(image4?.isManifest).toBe(true);
});

test('if configuration setting is disabled for using libpodApi, it should fall back to compat api', async () => {
  // Mock that the configuration value returns FALSE
  // so that the test will instead use the /images/json endpoint NOT /libpod/images/json
  getConfigMock.mockReturnValue(false);

  const imagesList = [
    {
      Id: 'dummyImageId',
    },
  ];

  server = setupServer(http.get('http://localhost/images/json', () => HttpResponse.json(imagesList)));
  server.listen({ onUnhandledRequest: 'error' });

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  // set provider
  containerRegistry.addInternalProvider('podman', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const images = await containerRegistry.listImages();

  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image?.engineId).toBe('podman1');
  expect(image?.engineName).toBe('podman');
});

test('check that inspectManifest returns information from libPod.podmanInspectManifest', async () => {
  const inspectManifestMock = vi.fn().mockResolvedValue({
    engineId: 'podman1',
    engineName: 'podman',
    manifests: [
      {
        digest: 'digest',
        mediaType: 'mediaType',
        platform: {
          architecture: 'architecture',
          features: [],
          os: 'os',
          variant: 'variant',
        },
        size: 100,
        urls: ['url1', 'url2'],
      },
    ],
    mediaType: 'mediaType',
    schemaVersion: 1,
  });

  const fakeLibPod = {
    podmanInspectManifest: inspectManifestMock,
  } as unknown as LibPod;

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: fakeLibPod,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const result = await containerRegistry.inspectManifest('podman1', 'manifestId');

  // Expect that inspectManifest was called with manifestId
  expect(inspectManifestMock).toBeCalledWith('manifestId');

  // Check the results are as expected
  expect(result).toBeDefined();
  expect(result.engineId).toBe('podman1');
  expect(result.engineName).toBe('podman');
  expect(result.manifests).toBeDefined();
});

test('inspectManifest should fail if libpod is missing from the provider', async () => {
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman',
    id: 'podman1',
    api,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  await expect(() => containerRegistry.inspectManifest('podman1', 'manifestId')).rejects.toThrowError(
    'LibPod is not supported by this engine',
  );
});

test('test removeManifest', async () => {
  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  const removeManifestMock = vi.fn();

  const fakeLibPod = {
    podmanRemoveManifest: removeManifestMock,
  } as unknown as LibPod;

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman',
    id: 'podman1',
    api,
    libpodApi: fakeLibPod,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider);

  const result = await containerRegistry.removeManifest('podman1', 'manifestId');
  expect(removeManifestMock).toBeCalledWith('manifestId');
  expect(result).toBeUndefined();
});

test('saveImage succeeds', async () => {
  const dockerode = new Dockerode({ protocol: 'http', host: 'localhost' });
  const stream: Dockerode.Image = {
    get: vi.fn(),
  } as unknown as Dockerode.Image;
  const getImageMock = vi.fn().mockReturnValue(stream);
  const api = {
    ...dockerode,
    getImage: getImageMock,
  };

  const pipelineMock = vi
    .spyOn(streamPromises, 'pipeline')
    .mockImplementation((_source: NodeJS.ReadableStream, _destination: NodeJS.WritableStream) => {
      return Promise.resolve();
    });

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman-1',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    api,
  } as unknown as InternalContainerProvider);
  pipelineMock.mockClear();
  await containerRegistry.saveImage('podman1', 'an-image', '/path/to/file');

  expect(pipelineMock).toHaveBeenCalledOnce();
});

test('saveImage succeeds when a passing a cancellable token never canceled', async () => {
  const cancellationTokenRegistry = new CancellationTokenRegistry();
  const cancellableTokenId = cancellationTokenRegistry.createCancellationTokenSource();
  const token = cancellationTokenRegistry.getCancellationTokenSource(cancellableTokenId)?.token;
  const dockerode = new Dockerode({ protocol: 'http', host: 'localhost' });
  const stream: Dockerode.Image = {
    get: vi.fn(),
  } as unknown as Dockerode.Image;
  const getImageMock = vi.fn().mockReturnValue(stream);
  const api = {
    ...dockerode,
    getImage: getImageMock,
  };

  const pipelineMock = vi
    .spyOn(streamPromises, 'pipeline')
    .mockImplementation((_source: NodeJS.ReadableStream, _destination: NodeJS.WritableStream) => {
      return Promise.resolve();
    });

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman-1',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    api,
  } as unknown as InternalContainerProvider);
  pipelineMock.mockClear();
  await containerRegistry.saveImage('podman1', 'an-image', '/path/to/file', token);

  expect(pipelineMock).toHaveBeenCalledOnce();
});

describe('using fake timers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('saveImage canceled during image download', async () => {
    const cancellationTokenRegistry = new CancellationTokenRegistry();
    const cancellableTokenId = cancellationTokenRegistry.createCancellationTokenSource();
    const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(cancellableTokenId);
    const token = tokenSource?.token;
    const dockerode = new Dockerode({ protocol: 'http', host: 'localhost' });
    const imageObjectGetMock = vi.fn().mockReturnValue(
      new Promise(resolve => {
        setTimeout(() => {
          resolve(undefined);
        }, 1000);
      }),
    );
    const stream: Dockerode.Image = {
      get: imageObjectGetMock,
    } as unknown as Dockerode.Image;
    const getImageMock = vi.fn().mockReturnValue(stream);
    const api = {
      ...dockerode,
      getImage: getImageMock,
    };

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman-1',
      id: 'podman1',
      connection: {
        type: 'podman',
      },
      api,
    } as unknown as InternalContainerProvider);
    setTimeout(() => {
      tokenSource?.cancel();
    }, 500);

    const savePromise = containerRegistry.saveImage('podman1', 'an-image', '/path/to/file', token);
    vi.advanceTimersByTime(2000);

    await expect(savePromise).rejects.toThrowError('saveImage operation canceled');
  });
});

test('saveImage canceled during image saving on filesystem', async () => {
  const streamModule = await vi.importActual<typeof import('node:stream/promises')>('node:stream/promises');
  const fsModule = await vi.importActual<typeof import('node:fs')>('node:fs');
  vi.mocked(streamPromises.pipeline).mockImplementation(streamModule.pipeline);
  vi.mocked(fs.createWriteStream).mockImplementation(fsModule.createWriteStream);
  const cancellationTokenRegistry = new CancellationTokenRegistry();
  const cancellableTokenId = cancellationTokenRegistry.createCancellationTokenSource();
  const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(cancellableTokenId);
  const token = tokenSource?.token;
  const dockerode = new Dockerode({ protocol: 'http', host: 'localhost' });
  const imageObjectGetMock = vi.fn().mockResolvedValue(() => {
    const stream = Readable.from(Buffer.from('a content'));
    stream.on('readable', () => {
      setTimeout(() => {
        // too late
        stream.read();
      }, 300);
    });
    return stream;
  });
  const stream: Dockerode.Image = {
    get: imageObjectGetMock,
  } as unknown as Dockerode.Image;
  const getImageMock = vi.fn().mockReturnValue(stream);
  const api = {
    ...dockerode,
    getImage: getImageMock,
  };

  containerRegistry.addInternalProvider('podman1', {
    name: 'podman-1',
    id: 'podman1',
    connection: {
      type: 'podman',
    },
    api,
  } as unknown as InternalContainerProvider);
  setTimeout(() => {
    tokenSource?.cancel();
  }, 50);

  const tmpdir = os.tmpdir();
  const savePromise = containerRegistry.saveImage('podman1', 'an-image', path.join(tmpdir, 'image-to-save'), token);
  await expect(savePromise).rejects.toThrowError('The operation was aborted');
});

describe('provider update', () => {
  test('stopped update should reset connection API', async () => {
    const statusMock = vi.fn();

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: undefined,
      libpodApi: undefined,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: statusMock,
      },
    };
    // set provider
    containerRegistry.addInternalProvider('podman.podman', internalContainerProvider);

    const containerProviderConnection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: statusMock,
    } as unknown as podmanDesktopAPI.ContainerProviderConnection;

    const podmanProvider = {
      name: 'podman',
      id: 'podman',
    } as unknown as podmanDesktopAPI.Provider;

    const onBeforeUpdateListeners: ((event: podmanDesktopAPI.UpdateContainerConnectionEvent) => void)[] = [];

    const providerRegistry: ProviderRegistry = {
      onBeforeDidUpdateContainerConnection: (
        listener: (event: podmanDesktopAPI.UpdateContainerConnectionEvent) => void,
      ) => onBeforeUpdateListeners.push(listener),
    } as unknown as ProviderRegistry;

    // default to started
    statusMock.mockReturnValue('started');

    containerRegistry.registerContainerConnection(podmanProvider, containerProviderConnection, providerRegistry);

    // when the provider is started, we should get the provider
    const internal = containerRegistry.getMatchingPodmanEngine('podman.podman');
    expect(internal.api).toBeDefined();
    expect(internal.libpodApi).toBeDefined();

    // mock the status to stopped
    statusMock.mockReturnValue('stopped');
    const event: podmanDesktopAPI.UpdateContainerConnectionEvent = {
      providerId: 'podman',
      connection: containerProviderConnection,
      status: 'stopped',
    };

    // send the stopped event
    onBeforeUpdateListeners.forEach(listener => listener(event));

    // ensure the provider is not running
    expect(() => containerRegistry.getMatchingPodmanEngine('podman.podman')).toThrowError(
      'no running provider for the matching engine',
    );
  });

  test('started update should setup connection API ', async () => {
    vi.useFakeTimers();
    expect(vi.isFakeTimers()).toBeTruthy();

    const statusMock = vi.fn();

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: undefined,
      libpodApi: undefined,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: statusMock,
      },
    };
    // set provider
    containerRegistry.addInternalProvider('podman.podman', internalContainerProvider);

    const containerProviderConnection: podmanDesktopAPI.ContainerProviderConnection = {
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: statusMock,
    } as unknown as podmanDesktopAPI.ContainerProviderConnection;

    const podmanProvider = {
      name: 'podman',
      id: 'podman',
    } as unknown as podmanDesktopAPI.Provider;

    const providerRegistry: ProviderRegistry = {
      onBeforeDidUpdateContainerConnection: vi.fn(),
    } as unknown as ProviderRegistry;

    // default to stopped
    statusMock.mockReturnValue('stopped');

    containerRegistry.registerContainerConnection(podmanProvider, containerProviderConnection, providerRegistry);

    // ensure the provider is not running
    expect(() => containerRegistry.getMatchingPodmanEngine('podman.podman')).toThrowError(
      'no running provider for the matching engine',
    );

    // mock the new status to started
    statusMock.mockReturnValue('started');

    vi.advanceTimersByTime(2000);

    // wait for SetInterval to proceed the update
    await vi.waitFor(() => {
      // let's get the podman engine, it should be running, and have defined api&libpodApi
      const internal = containerRegistry.getMatchingPodmanEngine('podman.podman');
      expect(internal.api).toBeDefined();
      expect(internal.libpodApi).toBeDefined();
    });
  });
});

describe('extractContainerEnvironment', () => {
  test('simple env', async () => {
    // create a fake inspect info object with env
    const inspectInfo = {
      Config: {
        Env: ['TERM=xterm', 'HOME=/root'],
      },
    } as unknown as ContainerInspectInfo;

    const env = containerRegistry.extractContainerEnvironment(inspectInfo);

    expect(env).toBeDefined();
    expect(Object.keys(env)).toHaveLength(2);

    expect(env['TERM']).toBe('xterm');
    expect(env['HOME']).toBe('/root');
  });

  test('simple complex env', async () => {
    // create a fake inspect info object with env
    const inspectInfo = {
      Config: {
        Env: ['HOME=/root', 'SERVER_ARGS=--host-config=host-secondary.xml --foo-=bar'],
      },
    } as unknown as ContainerInspectInfo;

    const env = containerRegistry.extractContainerEnvironment(inspectInfo);

    expect(env).toBeDefined();
    expect(Object.keys(env)).toHaveLength(2);

    expect(env['HOME']).toBe('/root');
    expect(env['SERVER_ARGS']).toBe('--host-config=host-secondary.xml --foo-=bar');
  });
});

test('resolve Podman image shortname to FQN', async () => {
  const getMatchingContainerProviderMock = vi.spyOn(containerRegistry, 'getMatchingContainerProvider');

  server = setupServer(
    http.get('http://localhost/v5.0.0/libpod/images/shortname/resolve', () =>
      HttpResponse.json({ Names: ['someregistry/shortname', 'docker.io/shortname', 'quay.io/shortname'] }),
    ),
  );
  server.listen({ onUnhandledRequest: 'error' });

  const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

  const libpod = new LibpodDockerode();
  libpod.enhancePrototypeWithLibPod();

  const internalContainerProviderMock = {
    name: 'podman',
    id: 'podman1',
    api: dockerAPI,
    libpodApi: dockerAPI,
    connection: {
      type: 'podman',
    },
  } as unknown as InternalContainerProvider;

  containerRegistry.addInternalProvider('podman1', internalContainerProviderMock);

  getMatchingContainerProviderMock.mockReturnValue(internalContainerProviderMock);

  let imagesNames = await containerRegistry.resolveShortnameImage(
    {} as unknown as ProviderContainerConnectionInfo,
    'shortname',
  );
  expect(imagesNames.length).toBe(3);
  expect(imagesNames[0]).toBe('someregistry/shortname');
  expect(imagesNames[1]).toBe('docker.io/shortname');
  expect(imagesNames[2]).toBe('quay.io/shortname');

  server.use(
    http.get('http://localhost/v5.0.0/libpod/images/shortname/resolve', () => HttpResponse.json({ Names: [] })),
  );
  imagesNames = await containerRegistry.resolveShortnameImage(
    {} as unknown as ProviderContainerConnectionInfo,
    'shortname',
  );
  expect(imagesNames.length).toBe(1);
  expect(imagesNames[0]).toBe('shortname');
});

test('resolve Docker image shortname to FQN', async () => {
  const getMatchingContainerProviderMock = vi.spyOn(containerRegistry, 'getMatchingContainerProvider');
  const dockerAPI = new Dockerode({ protocol: 'http', host: 'localhost' });

  const libpod = new LibpodDockerode();
  libpod.enhancePrototypeWithLibPod();

  const internalContainerProviderMock = {
    name: 'docker1',
    id: 'docker1',
    api: dockerAPI,
    connection: {
      type: 'docker',
    },
  } as unknown as InternalContainerProvider;

  containerRegistry.addInternalProvider('docker1', internalContainerProviderMock);

  getMatchingContainerProviderMock.mockReturnValue(internalContainerProviderMock);
  const imagesNames = await containerRegistry.resolveShortnameImage(
    {} as unknown as ProviderContainerConnectionInfo,
    'shortname',
  );
  expect(imagesNames.length).toBe(1);
  expect(imagesNames[0]).toBe('shortname');
});

describe('prune images', () => {
  const dockerProvider: InternalContainerProvider = {
    name: 'docker',
    id: 'docker1',
    api: {
      pruneImages: vi.fn(),
    } as unknown as Dockerode,
    libpodApi: undefined,
    connection: {
      type: 'docker',
      name: 'docker',
      displayName: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: vi.fn(),
    },
  };

  const podmanProvider: InternalContainerProvider = {
    name: 'podman',
    id: 'podman1',
    api: undefined,
    libpodApi: {
      pruneAllImages: vi.fn(),
    } as unknown as LibPod,
    connection: {
      type: 'podman',
      name: 'podman',
      displayName: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: vi.fn(),
    },
  };
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('prune all with podman ', async () => {
    // set provider
    containerRegistry.addInternalProvider('podman.podman', podmanProvider);

    // call
    await containerRegistry.pruneImages('podman.podman', true);

    // check we called the libpodApi
    expect(podmanProvider.libpodApi?.pruneAllImages).toBeCalledWith(true);
  });

  test('prune partial with podman ', async () => {
    // set provider
    containerRegistry.addInternalProvider('podman.podman', podmanProvider);

    // call
    await containerRegistry.pruneImages('podman.podman', false);

    // check we called the libpodApi
    expect(podmanProvider.libpodApi?.pruneAllImages).toBeCalledWith(false);
  });

  test('prune all with docker ', async () => {
    // set provider
    containerRegistry.addInternalProvider('docker.docker', dockerProvider);

    // call
    await containerRegistry.pruneImages('docker.docker', true);

    // check we called the api
    expect(dockerProvider.api?.pruneImages).toBeCalledWith({ filters: { dangling: { false: true } } });
  });

  test('prune partial with docker ', async () => {
    // set provider
    containerRegistry.addInternalProvider('docker.docker', dockerProvider);

    // call
    await containerRegistry.pruneImages('docker.docker', false);

    // check we called the api
    expect(dockerProvider.api?.pruneImages).toBeCalledWith({ filters: { dangling: { false: false } } });
  });
});

describe('pruneVolumes', () => {
  test('prune with Podman >= 6.0 passes all filter', async () => {
    const provider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {
        pruneVolumes: vi.fn(),
        version: vi.fn().mockResolvedValue({ Version: '6.0.1' }),
      } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: vi.fn(),
      },
    };

    containerRegistry.addInternalProvider('podman.new', provider);

    await containerRegistry.pruneVolumes('podman.new');

    expect(provider.api?.pruneVolumes).toBeCalledWith({ filters: { all: ['true'] } });
  });

  test('prune with Podman < 6.0 skips all filter', async () => {
    const provider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {
        pruneVolumes: vi.fn(),
        version: vi.fn().mockResolvedValue({ Version: '5.4.2' }),
      } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: vi.fn(),
      },
    };

    containerRegistry.addInternalProvider('podman.old', provider);

    await containerRegistry.pruneVolumes('podman.old');

    expect(provider.api?.pruneVolumes).toBeCalledWith();
  });

  test('prune with Docker passes all filter', async () => {
    const provider: InternalContainerProvider = {
      name: 'docker',
      id: 'docker1',
      api: {
        pruneVolumes: vi.fn(),
      } as unknown as Dockerode,
      libpodApi: undefined,
      connection: {
        type: 'docker',
        name: 'docker',
        displayName: 'docker',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: vi.fn(),
      },
    };

    containerRegistry.addInternalProvider('docker.test', provider);

    await containerRegistry.pruneVolumes('docker.test');

    expect(provider.api?.pruneVolumes).toBeCalledWith({ filters: { all: ['true'] } });
  });
});

describe('kube play', () => {
  const PODMAN_PROVIDER: InternalContainerProvider & { api: Dockerode; libpodApi: LibPod } = {
    name: 'podman',
    id: 'podman1',
    api: {
      version: vi.fn(),
    } as unknown as Dockerode,
    libpodApi: {
      playKube: vi.fn(),
    } as unknown as LibPod,
    connection: {
      type: 'podman',
      name: 'podman',
      displayName: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: vi.fn(),
    },
  };

  const PODMAN_523_VERSION: Dockerode.DockerVersion = {
    Version: '5.2.3',
    ApiVersion: '1.41',
  } as unknown as Dockerode.DockerVersion;

  const PODMAN_531_VERSION: Dockerode.DockerVersion = {
    Version: '5.3.1',
    ApiVersion: '1.41',
  } as unknown as Dockerode.DockerVersion;

  const KUBE_PLAY_OPT = {
    replace: true,
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('non-supported version should throw an error', async () => {
    vi.mocked(PODMAN_PROVIDER.api.version).mockResolvedValue(PODMAN_523_VERSION);

    // set provider
    containerRegistry.addInternalProvider('podman.podman', PODMAN_PROVIDER);

    await expect(async () => {
      await containerRegistry.playKube(
        { type: 'path', value: 'dummy-file' },
        {
          name: PODMAN_PROVIDER.name,
          endpoint: PODMAN_PROVIDER.connection.endpoint,
        } as unknown as ProviderContainerConnectionInfo,
        {
          build: true,
        },
      );
    }).rejects.toThrowError('kube play build is not supported on podman: Podman 5.3.0 and above supports this feature');
  });

  test('build option false should use playKube with YAML file', async () => {
    // set provider
    containerRegistry.addInternalProvider('podman.podman', PODMAN_PROVIDER);

    await containerRegistry.playKube(
      { type: 'path', value: 'dummy-file' },
      {
        name: PODMAN_PROVIDER.name,
        endpoint: PODMAN_PROVIDER.connection.endpoint,
      } as unknown as ProviderContainerConnectionInfo,
      KUBE_PLAY_OPT,
    );

    expect(PODMAN_PROVIDER.libpodApi.playKube).toHaveBeenCalledWith('dummy-file', KUBE_PLAY_OPT);
  });

  test('KubePlayContext returning zero build contexts should play kube with file', async () => {
    vi.mocked(PODMAN_PROVIDER.api.version).mockResolvedValue(PODMAN_531_VERSION);
    vi.mocked(KubePlayContext.prototype.getBuildContexts).mockReturnValue([]); // mock no contexts

    // set provider
    containerRegistry.addInternalProvider('podman.podman', PODMAN_PROVIDER);

    await containerRegistry.playKube(
      { type: 'path', value: 'dummy-file' },
      {
        name: PODMAN_PROVIDER.name,
        endpoint: PODMAN_PROVIDER.connection.endpoint,
      } as unknown as ProviderContainerConnectionInfo,
      KUBE_PLAY_OPT,
    );

    expect(PODMAN_PROVIDER.libpodApi.playKube).toHaveBeenCalledWith('dummy-file', KUBE_PLAY_OPT);
  });

  test('abortSignal should be passed down to libpod', async () => {
    const ABORT_SIGNAL = new AbortController().signal;
    vi.mocked(PODMAN_PROVIDER.api.version).mockResolvedValue(PODMAN_531_VERSION);
    vi.mocked(KubePlayContext.prototype.getBuildContexts).mockReturnValue([]); // mock no contexts

    // set provider
    containerRegistry.addInternalProvider('podman.podman', PODMAN_PROVIDER);

    await containerRegistry.playKube(
      { type: 'path', value: 'dummy-file' },
      {
        name: PODMAN_PROVIDER.name,
        endpoint: PODMAN_PROVIDER.connection.endpoint,
      } as unknown as ProviderContainerConnectionInfo,
      {
        abortSignal: ABORT_SIGNAL,
      },
    );

    expect(PODMAN_PROVIDER.libpodApi.playKube).toHaveBeenCalledWith('dummy-file', {
      abortSignal: ABORT_SIGNAL,
    });
  });

  test('content input without build should call playKube with a Readable stream', async () => {
    const RAW_YAML = 'apiVersion: v1\nkind: Pod\n';

    // set provider
    containerRegistry.addInternalProvider('podman.podman', PODMAN_PROVIDER);

    await containerRegistry.playKube(
      { type: 'content', value: RAW_YAML },
      {
        name: PODMAN_PROVIDER.name,
        endpoint: PODMAN_PROVIDER.connection.endpoint,
      } as unknown as ProviderContainerConnectionInfo,
      KUBE_PLAY_OPT,
    );

    expect(PODMAN_PROVIDER.libpodApi.playKube).toHaveBeenCalledWith(expect.any(Readable), KUBE_PLAY_OPT);
    const stream = vi.mocked(PODMAN_PROVIDER.libpodApi.playKube).mock.calls[0]?.[0] as Readable;
    const chunks: string[] = [];
    for await (const chunk of stream) {
      chunks.push(String(chunk));
    }
    expect(chunks.join('')).toBe(RAW_YAML);
  });

  test('content input with build and no build contexts should play kube with a Readable stream', async () => {
    const RAW_YAML = 'apiVersion: v1\nkind: Pod\n';
    vi.mocked(PODMAN_PROVIDER.api.version).mockResolvedValue(PODMAN_531_VERSION);
    const fakeKubePlayContext = {
      init: vi.fn().mockResolvedValue(undefined),
      getBuildContexts: vi.fn().mockReturnValue([]),
    } as unknown as KubePlayContext;
    vi.mocked(KubePlayContext.fromContent).mockReturnValue(fakeKubePlayContext);

    // set provider
    containerRegistry.addInternalProvider('podman.podman', PODMAN_PROVIDER);

    await containerRegistry.playKube(
      { type: 'content', value: RAW_YAML },
      {
        name: PODMAN_PROVIDER.name,
        endpoint: PODMAN_PROVIDER.connection.endpoint,
      } as unknown as ProviderContainerConnectionInfo,
      { build: true },
    );

    expect(KubePlayContext.fromContent).toHaveBeenCalledWith(RAW_YAML, expect.any(String));
    expect(PODMAN_PROVIDER.libpodApi.playKube).toHaveBeenCalledWith(expect.any(Readable), { build: true });
  });
});

describe('getNetworkDrivers', () => {
  test('returns network drivers from info API', async () => {
    const infoMock = vi.fn().mockResolvedValue({
      Plugins: {
        Network: ['bridge', 'macvlan', 'ipvlan'],
      },
    });

    const fakeDockerode = {
      info: infoMock,
    } as unknown as Dockerode;

    const providerConnectionInfo: ProviderContainerConnectionInfo = {
      name: 'engine1',
      endpoint: {
        socketPath: '/engine1.socket',
      },
    } as ProviderContainerConnectionInfo;

    containerRegistry.addInternalProvider('engine1', {
      name: 'engine1',
      id: 'engine1',
      connection: {
        type: 'podman',
        name: 'engine1',
        endpoint: {
          socketPath: '/engine1.socket',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    const result = await containerRegistry.getNetworkDrivers(providerConnectionInfo);

    expect(result).toEqual(['bridge', 'macvlan', 'ipvlan']);
  });

  test('returns empty array when Plugins is undefined', async () => {
    const infoMock = vi.fn().mockResolvedValue({});

    const fakeDockerode = {
      info: infoMock,
    } as unknown as Dockerode;

    const providerConnectionInfo: ProviderContainerConnectionInfo = {
      name: 'engine2',
      endpoint: {
        socketPath: '/engine2.socket',
      },
    } as ProviderContainerConnectionInfo;

    containerRegistry.addInternalProvider('engine2', {
      name: 'engine2',
      id: 'engine2',
      connection: {
        type: 'docker',
        name: 'engine2',
        endpoint: {
          socketPath: '/engine2.socket',
        },
      },
      api: fakeDockerode,
    } as InternalContainerProvider);

    const result = await containerRegistry.getNetworkDrivers(providerConnectionInfo);

    expect(result).toEqual([]);
  });

  test('throws error when engine not found', async () => {
    const nonexistentConnectionInfo: ProviderContainerConnectionInfo = {
      name: 'nonexistent',
      endpoint: {
        socketPath: '/nonexistent.socket',
      },
    } as ProviderContainerConnectionInfo;

    await expect(containerRegistry.getNetworkDrivers(nonexistentConnectionInfo)).rejects.toThrow(
      'no running provider for the matching container',
    );
  });
});

describe('ContainerRegistrySettings', () => {
  test('init should register provider timeout configuration', () => {
    const registerConfigurationsMock = vi.fn();
    const configRegistry = {
      registerConfigurations: registerConfigurationsMock,
    } as unknown as ConfigurationRegistry;

    const proxy: Proxy = {
      onDidStateChange: vi.fn(),
      onDidUpdateProxy: vi.fn(),
      isEnabled: vi.fn(),
    } as unknown as Proxy;

    const imageRegistry = new ImageRegistry(
      {} as ApiSenderType,
      { track: vi.fn() } as unknown as Telemetry,
      {} as Certificates,
      proxy,
    );

    const apiSender: ApiSenderType = {
      send: vi.fn(),
      receive: vi.fn(),
    };

    const containerProviderRegistry = new TestContainerProviderRegistry(apiSender, configRegistry, imageRegistry, {
      track: vi.fn(),
    } as unknown as Telemetry);

    containerProviderRegistry.init();

    expect(registerConfigurationsMock).toHaveBeenCalledOnce();
    const registeredConfig = registerConfigurationsMock.mock.calls[0]?.[0]?.[0] as IConfigurationNode | undefined;
    expect(registeredConfig?.id).toBe('preferences.container-registry');
    expect(registeredConfig?.properties?.['container-registry.providerTimeout']).toBeDefined();
    expect(registeredConfig?.properties?.['container-registry.providerTimeout']?.type).toBe('number');
    expect(registeredConfig?.properties?.['container-registry.providerTimeout']?.default).toBe(30);
    expect(registeredConfig?.properties?.['container-registry.providerTimeout']?.minimum).toBe(5);
    expect(registeredConfig?.properties?.['container-registry.providerTimeout']?.maximum).toBe(120);
  });
});

describe('createSecret', () => {
  test('should throw if no selectedProvider', async () => {
    await expect(
      containerRegistry.createSecret({
        name: 'my-secret',
        data: 'secret-value',
        provider: undefined,
      }),
    ).rejects.toThrow('cannot create secret without selected provider');
  });

  test('should throw if provider has no api', async () => {
    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: undefined,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman', internalContainerProvider);

    await expect(
      containerRegistry.createSecret({
        name: 'my-secret',
        data: 'secret-value',
        provider: {
          name: 'podman',
          endpoint: { socketPath: '/endpoint1.sock' },
        } as ProviderContainerConnectionInfo,
      }),
    ).rejects.toThrow('no running provider for the matching container');
  });

  test('should create secret with base64-encoded data', async () => {
    const createSecretMock = vi.fn().mockResolvedValue({ id: 'secret-id-123' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {
        createSecret: createSecretMock,
      } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman', internalContainerProvider);

    const result = await containerRegistry.createSecret({
      name: 'my-secret',
      data: 'secret-value',
      provider: {
        name: 'podman',
        endpoint: { socketPath: '/endpoint1.sock' },
      } as ProviderContainerConnectionInfo,
    });

    expect(result).toEqual({ id: 'secret-id-123', engineId: 'podman1' });
    expect(createSecretMock).toHaveBeenCalledWith({
      Data: Buffer.from('secret-value').toString('base64'),
      Name: 'my-secret',
      Labels: undefined,
    });
  });

  test('should pass labels when provided', async () => {
    const createSecretMock = vi.fn().mockResolvedValue({ id: 'secret-id-456' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {
        createSecret: createSecretMock,
      } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman', internalContainerProvider);

    await containerRegistry.createSecret({
      name: 'my-secret',
      data: 'secret-value',
      labels: { env: 'prod' },
      provider: {
        name: 'podman',
        endpoint: { socketPath: '/endpoint1.sock' },
      } as ProviderContainerConnectionInfo,
    });

    expect(createSecretMock).toHaveBeenCalledWith(
      expect.objectContaining({
        Labels: { env: 'prod' },
      }),
    );
  });

  test('should track telemetry on success', async () => {
    const createSecretMock = vi.fn().mockResolvedValue({ id: 'secret-id-123' });
    const api = {
      createSecret: createSecretMock,
    } as unknown as Dockerode;

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman', internalContainerProvider);
    telemetryTrackMock.mockClear();

    await containerRegistry.createSecret({
      name: 'my-secret',
      data: 'secret-value',
      provider: {
        name: 'podman',
        endpoint: { socketPath: '/endpoint1.sock' },
      } as ProviderContainerConnectionInfo,
    });

    expect(telemetryTrackMock).toHaveBeenCalledWith('createSecret', {});
  });

  test('should track telemetry with error on failure', async () => {
    const error = new Error('create failed');
    const createSecretMock = vi.fn().mockRejectedValue(error);

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {
        createSecret: createSecretMock,
      } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman', internalContainerProvider);
    telemetryTrackMock.mockClear();

    await expect(
      containerRegistry.createSecret({
        name: 'my-secret',
        data: 'secret-value',
        provider: {
          name: 'podman',
          endpoint: { socketPath: '/endpoint1.sock' },
        } as ProviderContainerConnectionInfo,
      }),
    ).rejects.toThrow('create failed');

    expect(telemetryTrackMock).toHaveBeenCalledWith('createSecret', { error });
  });
});

describe('removeSecret', () => {
  test('should throw if no matching engine', async () => {
    await expect(containerRegistry.removeSecret('nonexistent', 'secret1')).rejects.toThrow(
      'internal providers with engineId nonexistent has no api',
    );
  });

  test('should use libpodApi when available', async () => {
    const removeSecretMock = vi.fn().mockResolvedValue(undefined);

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {} as unknown as Dockerode,
      libpodApi: {
        removeSecret: removeSecretMock,
      } as unknown as LibPod,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman1', internalContainerProvider);

    await containerRegistry.removeSecret('podman1', 'secret123');

    expect(removeSecretMock).toHaveBeenCalledWith('secret123');
  });

  test('should fall back to dockerode api when libpodApi is not available', async () => {
    const removeMock = vi.fn().mockResolvedValue(undefined);
    const getSecretMock = vi.fn().mockReturnValue({ remove: removeMock });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'docker',
      id: 'docker1',
      api: {
        getSecret: getSecretMock,
      } as unknown as Dockerode,
      connection: {
        type: 'docker',
        name: 'docker',
        displayName: 'docker',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('docker1', internalContainerProvider);

    await containerRegistry.removeSecret('docker1', 'secret456');

    expect(getSecretMock).toHaveBeenCalledWith('secret456');
    expect(removeMock).toHaveBeenCalled();
  });

  test('should track telemetry on success', async () => {
    const removeSecretMock = vi.fn().mockResolvedValue(undefined);

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {} as unknown as Dockerode,
      libpodApi: {
        removeSecret: removeSecretMock,
      } as unknown as LibPod,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman1', internalContainerProvider);
    telemetryTrackMock.mockClear();

    await containerRegistry.removeSecret('podman1', 'secret123');

    expect(telemetryTrackMock).toHaveBeenCalledWith('removeSecret', {});
  });

  test('should track telemetry with error on failure', async () => {
    const error = new Error('remove failed');
    const removeSecretMock = vi.fn().mockRejectedValue(error);

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {} as unknown as Dockerode,
      libpodApi: {
        removeSecret: removeSecretMock,
      } as unknown as LibPod,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman1', internalContainerProvider);
    telemetryTrackMock.mockClear();

    await expect(containerRegistry.removeSecret('podman1', 'secret123')).rejects.toThrow('remove failed');

    expect(telemetryTrackMock).toHaveBeenCalledWith('removeSecret', { error });
  });
});

describe('listSecrets', () => {
  test('should return empty array when no providers', async () => {
    const result = await containerRegistry.listSecrets();
    expect(result).toEqual([]);
  });

  test('should return empty array when provider has no api', async () => {
    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: undefined,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman1', internalContainerProvider);

    const result = await containerRegistry.listSecrets();
    expect(result).toEqual([]);
  });

  test('should list secrets from a single provider', async () => {
    const mockSecrets = [
      {
        ID: 'secret1',
        Spec: { Name: 'my-secret', Labels: { env: 'dev' } },
        CreatedAt: '2024-01-01T00:00:00Z',
        UpdatedAt: '2024-01-02T00:00:00Z',
      },
    ];

    const listSecretsMock = vi.fn().mockResolvedValue(mockSecrets);

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {
        listSecrets: listSecretsMock,
      } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman1', internalContainerProvider);

    const result = await containerRegistry.listSecrets();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      engineName: 'podman',
      engineId: 'podman1',
      engineType: 'podman',
      Name: 'my-secret',
      Id: 'secret1',
      CreatedAt: '2024-01-01T00:00:00Z',
      UpdatedAt: '2024-01-02T00:00:00Z',
      Labels: { env: 'dev' },
      SecretData: undefined,
    });
  });

  test('should aggregate secrets from multiple providers', async () => {
    const listSecretsMock1 = vi.fn().mockResolvedValue([
      {
        ID: 'secret1',
        Spec: { Name: 'secret-a' },
        CreatedAt: '2024-01-01T00:00:00Z',
        UpdatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    const listSecretsMock2 = vi.fn().mockResolvedValue([
      {
        ID: 'secret2',
        Spec: { Name: 'secret-b' },
        CreatedAt: '2024-02-01T00:00:00Z',
        UpdatedAt: '2024-02-01T00:00:00Z',
      },
    ]);

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: { listSecrets: listSecretsMock1 } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: { socketPath: '/endpoint1.sock' },
        status: () => 'started',
      },
    });

    containerRegistry.addInternalProvider('docker1', {
      name: 'docker',
      id: 'docker1',
      api: { listSecrets: listSecretsMock2 } as unknown as Dockerode,
      connection: {
        type: 'docker',
        name: 'docker',
        displayName: 'docker',
        endpoint: { socketPath: '/endpoint2.sock' },
        status: () => 'started',
      },
    });

    const result = await containerRegistry.listSecrets();

    expect(result).toHaveLength(2);
    expect(result.map(s => s.Id)).toEqual(['secret1', 'secret2']);
  });

  test('should use secret ID as Name when Spec.Name is missing', async () => {
    const listSecretsMock = vi.fn().mockResolvedValue([
      {
        ID: 'secret-no-name',
        Spec: {},
        CreatedAt: '2024-01-01T00:00:00Z',
        UpdatedAt: '2024-01-01T00:00:00Z',
      },
    ]);

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: { listSecrets: listSecretsMock } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: { socketPath: '/endpoint1.sock' },
        status: () => 'started',
      },
    });

    const result = await containerRegistry.listSecrets();

    expect(result).toHaveLength(1);
    expect(result[0]?.Name).toBe('secret-no-name');
  });

  test('should gracefully handle provider errors and return empty for that provider', async () => {
    const listSecretsMockOk = vi.fn().mockResolvedValue([
      {
        ID: 'secret1',
        Spec: { Name: 'good-secret' },
        CreatedAt: '2024-01-01T00:00:00Z',
        UpdatedAt: '2024-01-01T00:00:00Z',
      },
    ]);
    const listSecretsMockFail = vi.fn().mockRejectedValue(new Error('connection refused'));

    containerRegistry.addInternalProvider('podman1', {
      name: 'podman',
      id: 'podman1',
      api: { listSecrets: listSecretsMockOk } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: { socketPath: '/endpoint1.sock' },
        status: () => 'started',
      },
    });

    containerRegistry.addInternalProvider('docker1', {
      name: 'docker',
      id: 'docker1',
      api: { listSecrets: listSecretsMockFail } as unknown as Dockerode,
      connection: {
        type: 'docker',
        name: 'docker',
        displayName: 'docker',
        endpoint: { socketPath: '/endpoint2.sock' },
        status: () => 'started',
      },
    });

    const result = await containerRegistry.listSecrets();

    expect(result).toHaveLength(1);
    expect(result[0]?.Id).toBe('secret1');
  });
});

describe('inspectSecret', () => {
  test('should throw if no matching engine', async () => {
    await expect(containerRegistry.inspectSecret('nonexistent', 'secret1')).rejects.toThrow(
      'internal providers with engineId nonexistent has no api',
    );
  });

  test('should return secret info on success', async () => {
    const inspectMock = vi.fn().mockResolvedValue({
      ID: 'secret-id-123',
      Spec: { Name: 'my-secret' },
      CreatedAt: '2024-01-01T00:00:00Z',
      UpdatedAt: '2024-01-02T00:00:00Z',
    });
    const getSecretMock = vi.fn().mockReturnValue({ inspect: inspectMock });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api: {
        getSecret: getSecretMock,
      } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    containerRegistry.addInternalProvider('podman1', internalContainerProvider);

    const result = await containerRegistry.inspectSecret('podman1', 'secret-id-123');

    expect(getSecretMock).toHaveBeenCalledWith('secret-id-123');
    expect(inspectMock).toHaveBeenCalled();
    expect(result).toEqual({
      engineName: 'podman',
      engineId: 'podman1',
      engineType: 'podman',
      Name: 'my-secret',
      Id: 'secret-id-123',
      CreatedAt: '2024-01-01T00:00:00Z',
      UpdatedAt: '2024-01-02T00:00:00Z',
    });
  });
});

describe('getImageInspect', () => {
  test('should throw if no matching engine', async () => {
    await expect(containerRegistry.getImageInspect('nonexistent', 'secret1')).rejects.toThrow(
      'no engine matching this container',
    );
  });

  test('should use the getImage & inspect', async () => {
    // setup
    const imageMock: Dockerode.Image = {
      inspect: vi.fn(),
    } as unknown as Dockerode.Image;
    const imageInspectMock: Dockerode.ImageInspectInfo = {} as unknown as Dockerode.ImageInspectInfo;

    const internalContainerProvider: InternalContainerProvider & { api: Dockerode } = {
      name: 'podman',
      id: 'podman1',
      api: {
        getImage: vi.fn(),
      } as unknown as Dockerode,
      connection: {
        type: 'podman',
        name: 'podman',
        displayName: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };
    vi.mocked(internalContainerProvider.api.getImage).mockReturnValue(imageMock);
    vi.mocked(imageMock.inspect).mockResolvedValue(imageInspectMock);
    containerRegistry.addInternalProvider('podman1', internalContainerProvider);

    // get the inspect
    const image = await containerRegistry.getImageInspect('podman1', 'bar');
    expect(image).toEqual(expect.objectContaining(imageInspectMock));
    expect(image.engineType).toBe(internalContainerProvider.connection.type);

    expect(internalContainerProvider.api.getImage).toHaveBeenCalledExactlyOnceWith('bar');
    expect(imageMock.inspect).toHaveBeenCalledOnce();
  });
});

describe('imageExist', () => {
  test('should use ContainerRegistry#getImageInspect', async () => {
    // mock error on getImageInspect
    vi.spyOn(containerRegistry, 'getImageInspect').mockRejectedValue(new Error('does not exists'));

    const exists = await containerRegistry.imageExist('foo', 'bar', 'fi');
    expect(exists).toBeFalsy();
  });

  test('should match tag in RepoTags', async () => {
    const imageInspectMock: ImageInspectInfo = {
      RepoTags: ['localhost/foo:latest'],
    } as unknown as ImageInspectInfo;

    vi.spyOn(containerRegistry, 'getImageInspect').mockResolvedValue(imageInspectMock);

    const exists = await containerRegistry.imageExist('foo', 'bar', 'localhost/foo:latest');
    expect(exists).toBeTruthy();
  });
});

describe('updateImages', () => {
  const pullMock = vi.fn();
  const followProgressMock = vi.fn();
  const imageInspectMock = vi.fn();
  const getImageMock = vi.fn(() => ({ inspect: imageInspectMock }));
  const fakeDockerode = {
    pull: pullMock,
    modem: { followProgress: followProgressMock },
    getImage: getImageMock,
  } as unknown as Dockerode;

  beforeEach(() => {
    pullMock.mockReset();
    followProgressMock.mockReset();
    getImageMock.mockClear();
    imageInspectMock.mockReset();
    imageInspectMock.mockResolvedValue({ RepoDigests: ['nginx@sha256:old'] });
    telemetryTrackMock.mockReset();
    followProgressMock.mockImplementation((_s: unknown, f: (err: Error | null) => void) => f(null));
    containerRegistry.addInternalProvider('testEngine', {
      name: 'testEngine',
      id: 'testEngine',
      connection: { type: 'podman', endpoint: { socketPath: '/test.socket' } },
      api: fakeDockerode,
    } as unknown as InternalContainerProvider);
  });

  test('returns an up-to-date result without pulling the image', async () => {
    vi.spyOn(ImageRegistry.prototype, 'checkImageUpdateStatus').mockResolvedValue({
      status: 'normal',
      updateAvailable: false,
      message: 'Up to date',
    });

    const [result] = await containerRegistry.updateImages([
      { engineId: 'testEngine', image: 'nginx:latest', tag: 'latest' },
    ]);

    expect(result).toEqual({ imageRef: 'nginx:latest', updated: false, status: 'normal', message: 'Up to date' });
    expect(pullMock).not.toHaveBeenCalled();
    expect(telemetryTrackMock).toHaveBeenCalledExactlyOnceWith('updateImages', {
      count: 1,
      updated: 0,
      upToDate: 1,
      skipped: 0,
      failed: 0,
    });
  });

  test('cancels in-progress image pulls through the abort signal', async () => {
    vi.spyOn(ImageRegistry.prototype, 'checkImageUpdateStatus').mockResolvedValue({
      status: 'normal',
      updateAvailable: true,
      remoteDigest: 'sha256:new',
      message: '',
    });
    vi.spyOn(ImageRegistry.prototype, 'getAuthconfigForImage').mockReturnValue(undefined);
    pullMock.mockResolvedValue({});
    followProgressMock.mockImplementation((_stream: unknown, onFinished: (error: Error | null) => void): void => {
      const abortSignal = pullMock.mock.calls[0]?.[1]?.abortSignal as AbortSignal;
      abortSignal.addEventListener('abort', () => onFinished(new Error('Update canceled')));
    });

    const abortController = new AbortController();
    const updatePromise = containerRegistry.updateImages(
      [{ engineId: 'testEngine', image: 'nginx:latest', tag: 'latest' }],
      abortController.signal,
    );
    await vi.waitFor(() => expect(followProgressMock).toHaveBeenCalledOnce());

    abortController.abort();

    await expect(updatePromise).resolves.toEqual([
      { imageRef: 'nginx:latest', updated: false, status: 'error', message: 'Update canceled' },
    ]);
    expect(pullMock).toHaveBeenCalledWith('nginx:latest', {
      authconfig: undefined,
      abortSignal: expect.objectContaining({ aborted: true }),
    });
  });

  test('does not pull when the update is skipped', async () => {
    const mockStatus: ImageUpdateStatus = { status: 'skipped', updateAvailable: false, message: 'Skipped' };
    vi.spyOn(ImageRegistry.prototype, 'checkImageUpdateStatus').mockResolvedValue(mockStatus);

    const [result] = await containerRegistry.updateImages([
      { engineId: 'testEngine', image: 'nginx:latest', tag: 'latest' },
    ]);

    expect(result!.updated).toBe(false);
    expect(result!.status).toBe(mockStatus.status);
    expect(pullMock).not.toHaveBeenCalled();
    expect(telemetryTrackMock).toHaveBeenCalledTimes(1);
    expect(telemetryTrackMock).toHaveBeenCalledWith('updateImages', expect.objectContaining({ skipped: 1 }));
  });

  test('checks update status with current repository digests from the backend', async () => {
    const checkImageUpdateStatusMock = vi.spyOn(ImageRegistry.prototype, 'checkImageUpdateStatus').mockResolvedValue({
      status: 'normal',
      updateAvailable: false,
      message: 'Up to date',
    });

    imageInspectMock.mockResolvedValue({ RepoDigests: ['nginx@sha256:manifestdigest'] });

    await containerRegistry.updateImages([{ engineId: 'testEngine', image: 'nginx:latest', tag: 'latest' }]);

    expect(imageInspectMock).toHaveBeenCalledOnce();
    expect(checkImageUpdateStatusMock).toHaveBeenCalledWith('nginx:latest', 'latest', ['nginx@sha256:manifestdigest']);
    expect(pullMock).not.toHaveBeenCalled();
  });

  test('checks and updates each tag independently when an image has multiple tags', async () => {
    imageInspectMock.mockResolvedValue({ RepoDigests: ['example.com/app@sha256:old'] });
    vi.spyOn(ImageRegistry.prototype, 'checkImageUpdateStatus')
      .mockResolvedValueOnce({ status: 'normal', updateAvailable: false, message: 'Up to date' })
      .mockResolvedValueOnce({ status: 'normal', updateAvailable: true, message: 'Update available' });
    vi.spyOn(ImageRegistry.prototype, 'getAuthconfigForImage').mockReturnValue(undefined);
    pullMock.mockResolvedValue({});

    const results = await containerRegistry.updateImages([
      { engineId: 'testEngine', image: 'example.com/app:stable', tag: 'stable' },
      { engineId: 'testEngine', image: 'example.com/app:latest', tag: 'latest' },
    ]);

    expect(getImageMock).toHaveBeenCalledWith('example.com/app:stable');
    expect(getImageMock).toHaveBeenCalledWith('example.com/app:latest');
    expect(pullMock).toHaveBeenCalledExactlyOnceWith('example.com/app:latest', {
      authconfig: undefined,
      abortSignal: undefined,
    });
    expect(results).toEqual([
      { imageRef: 'example.com/app:stable', updated: false, status: 'normal', message: 'Up to date' },
      {
        imageRef: 'example.com/app:latest',
        updated: true,
        status: 'updated',
        message: 'Image updated successfully',
      },
    ]);
  });

  test('returns error when engine not found', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);
    const checkImageUpdateStatusMock = vi.spyOn(ImageRegistry.prototype, 'checkImageUpdateStatus');
    checkImageUpdateStatusMock.mockClear();

    const [result] = await containerRegistry.updateImages([
      { engineId: 'nonexistent', image: 'nginx:latest', tag: 'latest' },
    ]);

    expect(result!.updated).toBe(false);
    expect(result!.status).toBe('error');
    expect(result!.message).toContain('no engine matching this engine');
    expect(checkImageUpdateStatusMock).not.toHaveBeenCalled();
    expect(telemetryTrackMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating image nginx:latest', expect.any(Error));
    expect(telemetryTrackMock).toHaveBeenCalledWith('updateImages', {
      count: 1,
      updated: 0,
      upToDate: 0,
      skipped: 0,
      failed: 1,
    });
  });

  test('returns every result when one image update rejects', async () => {
    vi.spyOn(console, 'error').mockReturnValue(undefined);
    vi.spyOn(ImageRegistry.prototype, 'checkImageUpdateStatus').mockResolvedValue({
      status: 'normal',
      updateAvailable: false,
      message: 'Up to date',
    });

    const results = await containerRegistry.updateImages([
      { engineId: 'nonexistent', image: 'missing:latest', tag: 'latest' },
      { engineId: 'testEngine', image: 'nginx:latest', tag: 'latest' },
    ]);

    expect(results).toEqual([
      expect.objectContaining({ imageRef: 'missing:latest', updated: false, status: 'error' }),
      { imageRef: 'nginx:latest', updated: false, status: 'normal', message: 'Up to date' },
    ]);
    expect(telemetryTrackMock).toHaveBeenCalledTimes(1);
    expect(telemetryTrackMock).toHaveBeenCalledWith(
      'updateImages',
      expect.objectContaining({ count: 2, upToDate: 1, failed: 1 }),
    );
  });

  test('pulls updated images, skips failures, and tracks one batch event', async () => {
    vi.spyOn(ImageRegistry.prototype, 'checkImageUpdateStatus')
      .mockResolvedValueOnce({
        status: 'normal',
        updateAvailable: true,
        remoteDigest: 'sha256:new',
        message: '',
      })
      .mockResolvedValueOnce({
        status: 'error',
        updateAvailable: false,
        message: 'Registry unavailable',
      });
    vi.spyOn(ImageRegistry.prototype, 'getAuthconfigForImage').mockReturnValue(undefined);
    pullMock.mockResolvedValue({});

    const results = await containerRegistry.updateImages([
      { engineId: 'testEngine', image: 'nginx:latest', tag: 'latest' },
      { engineId: 'testEngine', image: 'redis:latest', tag: 'latest' },
    ]);

    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(expect.objectContaining({ updated: true, status: 'updated', imageRef: 'nginx:latest' }));
    expect(results[1]?.updated).toBe(false);
    expect(results[1]?.status).toBe('error');
    expect(pullMock).toHaveBeenCalledTimes(1);
    expect(pullMock).toHaveBeenCalledWith('nginx:latest', {
      authconfig: undefined,
      abortSignal: undefined,
    });
    expect(telemetryTrackMock).toHaveBeenCalledTimes(1);
    expect(telemetryTrackMock).toHaveBeenCalledWith('updateImages', {
      count: 2,
      updated: 1,
      upToDate: 0,
      skipped: 0,
      failed: 1,
    });
  });
});
