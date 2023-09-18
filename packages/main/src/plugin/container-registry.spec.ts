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

import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { InternalContainerProvider } from '/@/plugin/container-registry.js';
import { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import type { Certificates } from '/@/plugin/certificates.js';
import type { Proxy } from '/@/plugin/proxy.js';
import { ImageRegistry } from '/@/plugin/image-registry.js';
import type { ApiSenderType } from '/@/plugin/api.js';
import Dockerode from 'dockerode';
import { EventEmitter } from 'node:events';
import type * as podmanDesktopAPI from '@podman-desktop/api';
import nock from 'nock';
import type { LibPod } from './dockerode/libpod-dockerode.js';
import { LibpodDockerode } from './dockerode/libpod-dockerode.js';
import moment from 'moment';
import type { ProviderContainerConnectionInfo } from './api/provider-info.js';
import * as util from '../util.js';
import { PassThrough } from 'node:stream';
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
class TestContainerProviderRegistry extends ContainerProviderRegistry {
  public getMatchingEngine(engineId: string): Dockerode {
    return super.getMatchingEngine(engineId);
  }

  public getMatchingContainer(engineId: string, containerId: string): Dockerode.Container {
    return super.getMatchingContainer(engineId, containerId);
  }

  addInternalProvider(name: string, provider: InternalContainerProvider): void {
    this.internalProviders.set(name, provider);
  }

  addContainerProvider(name: string, provider: podmanDesktopAPI.ContainerProviderConnection): void {
    this.containerProviders.set(name, provider);
  }

  getMatchingEngineFromConnection(providerContainerConnectionInfo: ProviderContainerConnectionInfo): Dockerode {
    return this.getMatchingEngineFromConnection(providerContainerConnectionInfo);
  }

  setStreamsOutputPerContainerId(id: string, data: Buffer[]) {
    this.streamsOutputPerContainerId.set(id, data);
  }

  getStreamsOutputPerContainerId(): Map<string, Buffer[]> {
    return this.streamsOutputPerContainerId;
  }

  getStreamsPerContainerId(): Map<string, NodeJS.ReadWriteStream> {
    return this.streamsPerContainerId;
  }

  setStreamsPerContainerId(id: string, data: NodeJS.ReadWriteStream) {
    this.streamsPerContainerId.set(id, data);
  }
}

let containerRegistry: TestContainerProviderRegistry;

const telemetryTrackMock = vi.fn().mockResolvedValue({});
const telemetry: Telemetry = { track: telemetryTrackMock } as unknown as Telemetry;

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

beforeEach(() => {
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
  containerRegistry = new TestContainerProviderRegistry(apiSender, imageRegistry, telemetry);
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
  const writeData = (eventEmitter: EventEmitter, type: 'stdout' | 'stderr', data: string) => {
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
    const stdoutFunction = (data: Buffer) => {
      stdout += data.toString();
    };

    let stderr = '';
    const stderrFunction = (data: Buffer) => {
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
    const stdoutFunction = (data: Buffer) => {
      stdout += data.toString();
    };

    let stderr = '';
    const stderrFunction = (data: Buffer) => {
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

test('pull unknown image ', async () => {
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

describe('buildImage', () => {
  test('throw if there is no running provider', async () => {
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
    await expect(containerRegistry.buildImage('context', 'file', 'name', connection, () => {})).rejects.toThrow(
      'No provider with a running engine',
    );
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

    await expect(containerRegistry.buildImage('context', 'file', 'name', connection, () => {})).rejects.toThrow(
      'human error message',
    );
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

    await containerRegistry.buildImage('context', '\\path\\file', 'name', connection, () => {});

    expect(dockerAPI.buildImage).toBeCalledWith({} as NodeJS.ReadableStream, {
      registryconfig: {},
      dockerfile: '/path/file',
      t: 'name',
    });
  });

  test('verify buildImage receives correct args on non-Windows OS', async () => {
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

    await containerRegistry.buildImage('context', '/dir/dockerfile', 'name', connection, () => {});

    expect(dockerAPI.buildImage).toBeCalledWith({} as NodeJS.ReadableStream, {
      registryconfig: {},
      dockerfile: '/dir/dockerfile',
      t: 'name',
    });
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

test('test createAndStartContainer', async () => {
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

  const container = await containerRegistry.createAndStartContainer('podman1', {});

  expect(container.id).toBe(createdId);
  expect(createContainerMock).toHaveBeenCalled();
  expect(startMock).toHaveBeenCalled();
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
