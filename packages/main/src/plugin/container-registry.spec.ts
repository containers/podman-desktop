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

import { EventEmitter } from 'node:events';
import * as fs from 'node:fs';
import { PassThrough } from 'node:stream';
import * as streamPromises from 'node:stream/promises';

import type * as podmanDesktopAPI from '@podman-desktop/api';
import Dockerode from 'dockerode';
import moment from 'moment';
import nock from 'nock';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ApiSenderType } from '/@/plugin/api.js';
import type { Certificates } from '/@/plugin/certificates.js';
import type { InternalContainerProvider } from '/@/plugin/container-registry.js';
import { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import { ImageRegistry } from '/@/plugin/image-registry.js';
import type { Proxy } from '/@/plugin/proxy.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import type { ContainerCreateOptions } from '/@api/container-info.js';
import type { ImageInfo } from '/@api/image-info.js';
import type { ProviderContainerConnectionInfo } from '/@api/provider-info.js';

import * as util from '../util.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { ContainerCreateOptions as PodmanContainerCreateOptions, LibPod } from './dockerode/libpod-dockerode.js';
import { LibpodDockerode } from './dockerode/libpod-dockerode.js';
import type { EnvfileParser } from './env-file-parser.js';
import type { ProviderRegistry } from './provider-registry.js';

const tar: { pack: (dir: string) => NodeJS.ReadableStream } = require('tar-fs');

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-null/no-null */

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

class TestContainerProviderRegistry extends ContainerProviderRegistry {
  public getMatchingEngine(engineId: string): Dockerode {
    return super.getMatchingEngine(engineId);
  }

  public getMatchingContainer(engineId: string, containerId: string): Dockerode.Container {
    return super.getMatchingContainer(engineId, containerId);
  }

  public getMatchingPodmanEngine(engineId: string): InternalContainerProvider {
    return super.getMatchingPodmanEngine(engineId);
  }

  public getMatchingPodmanEngineLibPod(engineId: string): LibPod {
    return super.getMatchingPodmanEngineLibPod(engineId);
  }

  public getMatchingContainerProvider(
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

  getMatchingEngineFromConnection(providerContainerConnectionInfo: ProviderContainerConnectionInfo): Dockerode {
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

vi.mock('node:fs', async () => {
  return {
    promises: {
      readdir: vi.fn(),
    },
    createWriteStream: vi.fn(),
  };
});

vi.mock('node:stream/promises', async () => {
  return {
    pipeline: vi.fn(),
  };
});

beforeEach(() => {
  nock.cleanAll();
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
    const startStream = new EventEmitter();

    // add a destroy method
    const destroyMock = vi.fn();
    (startStream as any).destroy = destroyMock;

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

    nock('http://localhost').get('/v4.2.0/libpod/containers/json?all=true').reply(200, containersWithPodmanAPI);

    // mock listPods

    nock('http://localhost').get('/v4.2.0/libpod/pods/json').reply(200, []);

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
    expect(container.engineId).toBe('podman1');
    expect(container.engineName).toBe('podman');
    expect(container.engineType).toBe('podman');
    expect(container.StartedAt).toBe('2023-08-10T13:37:44.000Z');
    expect(container.pod).toBeUndefined();
    expect(container.Id).toBe('31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4');
    expect(container.Command).toBe('httpd-foreground');
    expect(container.Names).toStrictEqual(['/admiring_wing']);
    expect(container.Image).toBe('docker.io/library/httpd:latest');
    expect(container.ImageID).toBe('sha256:911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a');
    expect(container.Created).toBe(1691674664);
    expect(container.ImageBase64RepoTag).toBe('ZG9ja2VyLmlvL2xpYnJhcnkvaHR0cGQ6bGF0ZXN0');
    expect(container.Ports).toStrictEqual([
      {
        IP: '',
        PrivatePort: 8080,
        PublicPort: 8080,
        Type: 'tcp',
      },
    ]);
    expect(container.Labels).toStrictEqual({
      'io.buildah.version': '1.30.0',
      maintainer: 'Podman Maintainers',
    });
    expect(container.State).toBe('running');
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

    nock('http://localhost').get('/containers/json?all=true').reply(200, containersWithDockerAPI);

    // mock listPods

    nock('http://localhost').get('/v4.2.0/libpod/pods/json').reply(200, []);

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
    expect(container.engineId).toBe('docker1');
    expect(container.engineName).toBe('docker');
    expect(container.engineType).toBe('docker');

    // grab StartedAt from the containerWithDockerAPI
    const started = container.StartedAt;

    //convert with moment
    const diff = moment.now() - moment(started).toDate().getTime();
    const delta = Math.round(moment.duration(diff).asMinutes());

    // expect delta to be 2 minutes
    expect(delta).toBe(2);
    expect(container.pod).toBeUndefined();

    expect(container.Id).toBe('31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4');
    expect(container.Command).toBe('httpd-foreground');
    expect(container.Names).toStrictEqual(['/admiring_wing']);
    expect(container.Image).toBe('docker.io/library/httpd:latest');
    expect(container.ImageID).toBe('sha256:911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a');
    expect(container.Created).toBe(1691674664);
    expect(container.Ports).toStrictEqual([
      {
        PrivatePort: 8080,
        PublicPort: 8080,
        Type: 'tcp',
      },
    ]);
    expect(container.Labels).toStrictEqual({
      'io.buildah.version': '1.30.0',
      maintainer: 'Podman Maintainers',
    });
    expect(container.State).toBe('running');
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

    nock('http://localhost').get('/v4.2.0/libpod/containers/json?all=true').reply(200, containersWithPodmanAPI);

    // mock listPods

    nock('http://localhost').get('/v4.2.0/libpod/pods/json').reply(200, []);

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
    expect(container.engineId).toBe('podman1');
    expect(container.engineName).toBe('podman');
    expect(container.engineType).toBe('podman');
    expect(container.StartedAt).toBe('2023-08-10T13:37:44.000Z');
    expect(container.pod).toBeUndefined();
    expect(container.Id).toBe('31a4b282691420be2611817f203765402d8da7e13cd530f80a6ddd1bb4aa63b4');
    expect(container.Command).toBe(undefined);
    expect(container.Names).toStrictEqual(['/admiring_wing']);
    expect(container.Image).toBe('docker.io/library/httpd:latest');
    expect(container.ImageID).toBe('sha256:911d72fc5020723f0c003a134a8d2f062b4aea884474a11d1db7dcd28ce61d6a');
    expect(container.Created).toBe(1691674664);
    expect(container.Ports).toStrictEqual([
      {
        IP: '',
        PrivatePort: 8080,
        PublicPort: 8080,
        Type: 'tcp',
      },
    ]);
    expect(container.Labels).toStrictEqual({
      'io.buildah.version': '1.30.0',
      maintainer: 'Podman Maintainers',
    });
    expect(container.State).toBe('running');
  });
});

test('pull unknown image fails with error 403', async () => {
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
  const error = new Error('access denied');
  (error as any).statusCode = 403;

  pullMock.mockRejectedValue(error);

  const callback = vi.fn();
  // check that we have a nice error message
  await expect(containerRegistry.pullImage(containerConnectionInfo, 'unknown-image', callback)).rejects.toThrow(
    'access to image "unknown-image" is denied (403 error). Can also be that image does not exist',
  );
});

test('pull unknown image fails with error 401', async () => {
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
  const error = new Error('access denied');
  (error as any).statusCode = 401;

  pullMock.mockRejectedValue(error);

  const callback = vi.fn();
  // check that we have a nice error message
  await expect(containerRegistry.pullImage(containerConnectionInfo, 'unknown-image', callback)).rejects.toThrow(
    'access to image "unknown-image" is denied (401 error). Can also be that the registry requires authentication.',
  );
});

test('pull unknown image fails with error 500', async () => {
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
  const error = new Error('access denied');
  (error as any).statusCode = 500;

  pullMock.mockRejectedValue(error);

  const callback = vi.fn();
  // check that we have a nice error message
  await expect(containerRegistry.pullImage(containerConnectionInfo, 'unknown-image', callback)).rejects.toThrow(
    'access to image "unknown-image" is denied (500 error). Can also be that the registry requires authentication.',
  );
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
      name: 'connection',
      type: 'docker',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
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
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
    };

    vi.spyOn(util, 'isWindows').mockImplementation(() => false);
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
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    };

    vi.spyOn(util, 'isWindows').mockImplementation(() => false);
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
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
    };

    vi.spyOn(util, 'isWindows').mockImplementation(() => true);
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
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    };

    vi.spyOn(util, 'isWindows').mockImplementation(() => true);
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
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      lifecycleMethods: undefined,
      status: 'started',
    };

    vi.spyOn(util, 'isWindows').mockImplementation(() => false);
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

    nock('http://localhost').get('/volumes').reply(200, volumesDataMock);
    nock('http://localhost').get('/containers/json?all=true').reply(200, containersJsonMock);
    nock('http://localhost').get('/system/df').reply(200, systemDfDataMock);

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
    expect(volume.engineId).toBe('podman1');
    expect(volume.engineName).toBe('podman');
    expect(volume.Volumes).toHaveLength(3);

    const volumeData = volume.Volumes[2];

    expect(volumeData.Name).toBe('myFirstVolume');

    // check UsageData is set (provided by system/df)
    // refcount is 1 as one container is using it
    expect(volumeData.UsageData).toStrictEqual({
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

    nock('http://localhost').get('/volumes').reply(200, volumesDataMock);
    nock('http://localhost').get('/containers/json?all=true').reply(200, containersJsonMock);
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
    expect(volume.engineId).toBe('podman1');
    expect(volume.engineName).toBe('podman');
    expect(volume.Volumes).toHaveLength(3);

    const volumeData = volume.Volumes[2];

    expect(volumeData.Name).toBe('myFirstVolume');

    // check UsageData is set (provided by system/df)
    // refcount is 1 as one container is using it
    // but size is -1 as we skip system df call
    expect(volumeData.UsageData).toStrictEqual({
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

    nock('http://localhost').get('/volumes').reply(200, volumesDataMock);
    nock('http://localhost').get('/containers/json?all=true').reply(200, containersJsonMock);
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
    expect(volume.engineId).toBe('podman1');
    expect(volume.engineName).toBe('podman');
    expect(volume.Volumes).toHaveLength(1);
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

    nock('http://localhost').get('/networks').reply(200, networksDataMock);
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

    // ask for networks
    const networks = await containerRegistry.listNetworks();

    // ensure the field are correct
    expect(networks).toBeDefined();
    expect(networks).toHaveLength(2);
    const network = networks[0];
    expect(network.engineId).toBe('podman1');
    expect(network.engineName).toBe('podman');

    expect(network.Name).toBe('podify');
  });
});

describe('createVolume', () => {
  test('provided name', async () => {
    nock('http://localhost').post('/volumes/create?Name=myFirstVolume').reply(200, '');

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    const providerConnectionInfo: ProviderContainerConnectionInfo = {
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: 'started',
    } as unknown as ProviderContainerConnectionInfo;

    // set provider
    containerRegistry.addInternalProvider('podman', internalContainerProvider);

    // check that it's calling the right nock method
    await containerRegistry.createVolume(providerConnectionInfo, { Name: 'myFirstVolume' });
  });

  test('no name', async () => {
    nock('http://localhost').post('/volumes/create').reply(200, '');

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
        endpoint: {
          socketPath: '/endpoint1.sock',
        },
        status: () => 'started',
      },
    };

    const providerConnectionInfo: ProviderContainerConnectionInfo = {
      name: 'podman',
      type: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: 'started',
    } as unknown as ProviderContainerConnectionInfo;

    // set provider
    containerRegistry.addInternalProvider('podman', internalContainerProvider);

    // check that it's calling the right nock method
    await containerRegistry.createVolume(providerConnectionInfo, {});
  });

  test('provided user API connection', async () => {
    nock('http://localhost').post('/volumes/create?Name=myFirstVolume').reply(200, '');

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
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

    // check that it's calling the right nock method
    await containerRegistry.createVolume(containerProviderConnection, { Name: 'myFirstVolume' });
  });

  test('no provider', async () => {
    nock('http://localhost').post('/volumes/create?Name=myFirstVolume').reply(200, '');

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
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

    // check that it's calling the right nock method
    await containerRegistry.createVolume(undefined, { Name: 'myFirstVolume' });
  });
});

describe('deleteVolume', () => {
  test('no provider', async () => {
    nock('http://localhost').delete('/volumes/myFirstVolume').reply(204, '');

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
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

    // check that it's calling the right nock method
    await containerRegistry.deleteVolume('myFirstVolume');
  });

  test('provided connection', async () => {
    nock('http://localhost').delete('/volumes/myFirstVolume').reply(204, '');

    const api = new Dockerode({ protocol: 'http', host: 'localhost' });

    const internalContainerProvider: InternalContainerProvider = {
      name: 'podman',
      id: 'podman1',
      api,
      connection: {
        type: 'podman',
        name: 'podman',
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
    // check that it's calling the right nock method
    await containerRegistry.deleteVolume('myFirstVolume', { provider: containerProviderConnection });
  });
});

test('container logs callback notified when messages arrive', async () => {
  const stream = new EventEmitter();
  const dockerodeContainer = {
    logs: vi.fn().mockResolvedValue(stream),
  } as unknown as Dockerode.Container;

  vi.spyOn(containerRegistry, 'getMatchingContainer').mockReturnValue(dockerodeContainer);
  let deferredResolve: (value: unknown) => void;
  const firstMessagePromise = new Promise(resolve => {
    deferredResolve = resolve;
  });
  const callback = vi.fn().mockImplementation(() => {
    deferredResolve(undefined);
  });
  await containerRegistry.logsContainer('podman', 'containerId', callback);

  setTimeout(() => {
    stream.emit('data', 'log message');
    stream.emit('end', '');
  });

  await firstMessagePromise;
  expect(callback).toHaveBeenCalledWith('first-message', '');
  expect(callback).toHaveBeenCalledWith('data', 'log message');
  expect(callback).toHaveBeenCalledWith('end', '');
  expect(telemetry.track).toHaveBeenCalled;
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
  nock('http://localhost').post('/networks/create?Name=myNetwork').reply(200, '');

  const api = new Dockerode({ protocol: 'http', host: 'localhost' });

  const internalContainerProvider: InternalContainerProvider = {
    name: 'podman',
    id: 'podman1',
    api,
    connection: {
      type: 'podman',
      name: 'podman',
      endpoint: {
        socketPath: '/endpoint1.sock',
      },
      status: () => 'started',
    },
  };

  const providerConnectionInfo: ProviderContainerConnectionInfo = {
    name: 'podman',
    type: 'podman',
    endpoint: {
      socketPath: '/endpoint1.sock',
    },
    status: 'started',
  } as unknown as ProviderContainerConnectionInfo;

  // set provider
  containerRegistry.addInternalProvider('podman', internalContainerProvider);

  // check that it's calling the right nock method
  await containerRegistry.createNetwork(providerConnectionInfo, { Name: 'myNetwork' });
});

test('setupConnectionAPI with errors', async () => {
  // create a stream that we return to nock
  const stream = new PassThrough();
  // need to reply with a stream
  nock('http://localhost').get('/events').reply(200, stream);

  const internalContainerProvider: InternalContainerProvider = {
    name: 'podman',
    id: 'podman1',
    connection: {
      type: 'podman',
      name: 'podman',
      endpoint: {
        socketPath: 'http://localhost',
      },
      status: () => 'started',
    },
  };

  const providerConnectionInfo: podmanDesktopAPI.ContainerProviderConnection = {
    name: 'podman',
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
  expect(internalContainerProvider.api).toBeUndefined();

  // and it should try to reconnect to the nock

  // wait 0.5s
  await new Promise(resolve => setTimeout(resolve, 500));

  // mock again /events
  const stream2 = new PassThrough();
  nock('http://localhost').get('/events').reply(200, stream2);

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
  expect(containerStartedEventCalls).toHaveLength(1);
  expect(containerStartedEventCalls[0][1]).toBe(fakeId);

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
  const getEventsMock = vi.fn();
  let eventsMockCallback: any;
  // keep the function passed in parameter of getEventsMock
  getEventsMock.mockImplementation((options: any) => {
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
  passThrough.emit('data', JSON.stringify({ status: 'loadfromarchive', Type: 'image', id: '123456' }));

  // wait 1s
  await new Promise(resolve => setTimeout(resolve, 3000));

  // check callback is defined
  expect(eventsMockCallback).toBeDefined();

  // check we send the event to notify renderer part
  expect(apiSender.send).toBeCalledWith('image-loadfromarchive-event', '123456');
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
  });
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
    name: 'podman1',
    endpoint: {
      socketPath: 'podman.sock',
    },
    status: 'started',
    type: 'podman',
  };

  const result = await containerRegistry.createPod({
    name: 'pod',
    provider: containerProviderConnection,
  });
  expect(result.Id).equal('id');
  expect(result.engineId).equal('podman1');
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

  nock('http://localhost').get('/v4.2.0/libpod/pods/json').reply(200, podsList);

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
  expect(pod.engineId).toBe('podman1');
  expect(pod.engineName).toBe('podman');
  expect(pod.kind).toBe('podman');
  expect(pod.Labels).toStrictEqual({
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
        SecurityOpt: ['default'],
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
      entrypoint: options.Entrypoint,
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
    if (options.mode || options.propagation) {
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

describe('listImages', () => {
  test('list images without arguments', async () => {
    const result = await containerRegistry.listImages();
    expect(result.length).toBe(0);

    expect(vi.spyOn(containerRegistry, 'getMatchingContainerProvider')).not.toHaveBeenCalled();
  });

  test('list images on a specific provider', async () => {
    const getMatchingContainerProviderMock = vi.spyOn(containerRegistry, 'getMatchingContainerProvider');
    const internalContainerProvider = {
      name: 'dummyName',
      id: 'dummyId',
      api: {
        listImages: vi.fn(),
      },
    } as unknown as InternalContainerProvider;
    getMatchingContainerProviderMock.mockReturnValue(internalContainerProvider);

    const api = internalContainerProvider.api;
    if (api === undefined) throw new Error('api should not be undefined');
    vi.spyOn(api, 'listImages').mockResolvedValue([
      {
        Id: 'dummyImageId',
      } as unknown as ImageInfo,
    ]);

    // List images
    const result = await containerRegistry.listImages({
      provider: {
        id: 'dummyProviderId',
      } as unknown as podmanDesktopAPI.ContainerProviderConnection,
    });

    expect(getMatchingContainerProviderMock).toHaveBeenCalled();
    expect(api.listImages).toHaveBeenCalled();

    expect(result.length).toBe(1);
    expect(result[0]).toStrictEqual({
      Id: 'dummyImageId',
      engineId: 'dummyId',
      engineName: 'dummyName',
      Digest: 'sha256:dummyImageId',
    });
  });
});

test('list images with podmanListImages correctly', async () => {
  const imagesList = [
    {
      Id: 'dummyImageId',
      Digest: 'fooDigest',
    },
  ];

  nock('http://localhost').get('/v4.2.0/libpod/images/json').reply(200, imagesList);

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

  const images = await containerRegistry.podmanListImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image.engineId).toBe('podman1');
  expect(image.engineName).toBe('podman');
  expect(image.Id).toBe('sha256:dummyImageId');
});

test('expect images with podmanListImages to also include History as well as engineId and engineName', async () => {
  const imagesList = [
    {
      Id: 'dummyImageId',
      History: ['history1', 'history2'],
    },
  ];

  nock('http://localhost').get('/v4.2.0/libpod/images/json').reply(200, imagesList);

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

  const images = await containerRegistry.podmanListImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image.engineId).toBe('podman1');
  expect(image.engineName).toBe('podman');
  expect(image.History).toStrictEqual(['history1', 'history2']);
});

test('expect images with podmanListImages to also include Digest as engineId and engineName', async () => {
  const imagesList = [
    {
      Id: 'dummyImageId',
      Digest: 'dummyDigest',
    },
  ];

  nock('http://localhost').get('/v4.2.0/libpod/images/json').reply(200, imagesList);

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

  const images = await containerRegistry.podmanListImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image.engineId).toBe('podman1');
  expect(image.engineName).toBe('podman');
  expect(image.Digest).toBe('dummyDigest');
});

test('If image does not have Digest in list images, expect the Digest to be sha256:ID', async () => {
  // Purposely be missing Digest, it should return Digest as sha256:ID
  // this is because the compat API does not provide Digest return.
  const imagesList = [
    {
      Id: 'c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2',
    },
  ];

  nock('http://localhost').get('/v4.2.0/libpod/images/json').reply(200, imagesList);

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

  const images = await containerRegistry.podmanListImages();

  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image.engineId).toBe('podman1');
  expect(image.engineName).toBe('podman');
  expect(image.Digest).toBe('sha256:c3ab8ff13720e8ad9047dd39466b3c8974e592c2fa383d4a3960714caef0c4f2');
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

  nock('http://localhost').get('/v4.2.0/libpod/images/json').reply(200, imagesList);
  nock('http://localhost').get('/images/json?all=false').reply(200, imagesList2);

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

  const images = await containerRegistry.podmanListImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  expect(images[0].Id).toBe('dummyImageId2');
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

  const images = await containerRegistry.podmanListImages();
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

  const images = await containerRegistry.podmanListImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(0);
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

    const createWriteStreamMock = vi.spyOn(fs, 'createWriteStream').mockReturnValue({
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

  const imagesList = [manifestImage, regularImage];
  nock('http://localhost').get('/v4.2.0/libpod/images/json').reply(200, imagesList);
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

  const images = await containerRegistry.podmanListImages();
  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(2);

  // Expect that inspectManifest was called with manifestId
  expect(inspectManifestMock).toBeCalledWith('manifestImage');

  // Check the first image
  const image = images[0];
  expect(image.engineId).toBe('podman1');
  expect(image.engineName).toBe('podman');
  expect(image.Id).toBe('manifestImage');
  expect(image.isManifest).toBe(true);

  // Check that the manifest returned sha:256:digest123
  expect(image.manifests).toBeDefined();
  expect(image.manifests).toHaveLength(1);
  if (image.manifests) {
    expect(image.manifests[0].digest).toBe('sha256:digest123');
  }

  // Check the second image
  const image2 = images[1];
  expect(image2.engineId).toBe('podman1');
  expect(image2.engineName).toBe('podman');
  expect(image2.Id).toBe('ee301c921b8aadc002973b2e0c3da17d701dcd994b606769a7e6eaa100b81d44');
  expect(image2.isManifest).toBe(false);
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

  nock('http://localhost').get('/images/json?all=false').reply(200, imagesList);

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

  const images = await containerRegistry.podmanListImages();

  // ensure the field are correct
  expect(images).toBeDefined();
  expect(images).toHaveLength(1);
  const image = images[0];
  expect(image.engineId).toBe('podman1');
  expect(image.engineName).toBe('podman');
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
