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

import { beforeEach, expect, test, vi } from 'vitest';
import { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import type { Certificates } from '/@/plugin/certificates.js';
import type { Proxy } from '/@/plugin/proxy.js';
import { ImageRegistry } from '/@/plugin/image-registry.js';
import type { ApiSenderType } from '/@/plugin/api.js';
import type Dockerode from 'dockerode';

/* eslint-disable @typescript-eslint/no-empty-function */

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

vi.mock('dockerode', async () => {
  return {
    default: vi.fn(),
  };
});

class TestContainerProviderRegistry extends ContainerProviderRegistry {
  public getMatchingEngine(engineId: string): Dockerode {
    return super.getMatchingEngine(engineId);
  }
}

let containerRegistry: TestContainerProviderRegistry;

const telemetryTrackMock = vi.fn().mockResolvedValue({});
const telemetry: Telemetry = { track: telemetryTrackMock } as unknown as Telemetry;

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
  containerRegistry = new TestContainerProviderRegistry({} as ApiSenderType, imageRegistry, telemetry);
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
      ]),
    getContainer: vi.fn().mockReturnValue({ restart: vi.fn().mockResolvedValue({}) }),
    listPods: vi.fn().mockResolvedValue([]),
    restartContainer: vi.fn().mockResolvedValue({}),
  };
  vi.spyOn(containerRegistry, 'getMatchingEngine').mockReturnValue(engine as unknown as Dockerode);
  vi.spyOn(containerRegistry, 'listSimpleContainers').mockReturnValue(engine.listSimpleContainers());

  // Spy on restartContainer to make sure it's called
  // it is NOT called if there are no matches.. So it's important tot check this.
  const restartContainer = vi.spyOn(containerRegistry, 'restartContainer');

  // Restart all containers in the 'project1' project
  const result = await containerRegistry.restartContainersByLabel('dummy', 'com.docker.compose.project', 'project1');
  expect(result).toBeUndefined();

  // Expect restartContainer tohave been called 3 times
  expect(restartContainer).toHaveBeenCalledTimes(3);
});
