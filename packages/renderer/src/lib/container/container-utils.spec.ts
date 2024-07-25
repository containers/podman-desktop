/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import type { ContainerInfo } from '/@api/container-info';
import type { ViewInfoUI } from '/@api/view-info';

import { ContextUI } from '../context/context';
import { ContainerUtils } from './container-utils';
import { ContainerGroupInfoTypeUI, type ContainerGroupInfoUI, type ContainerInfoUI } from './ContainerInfoUI';

let containerUtils: ContainerUtils;

beforeEach(() => {
  vi.clearAllMocks();
  containerUtils = new ContainerUtils();
});

test('should expect valid memory usage', async () => {
  const size = containerUtils.getMemoryPercentageUsageTitle(4, 1000000);
  expect(size).toBe('4.00% (1 MB)');
});

test('should expect short image for sha256', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node@sha256:61b92f38dff6ccc29969e7aa154d34e38b89443af1a2c14e6cfbd2df6419c66f',
  } as unknown as ContainerInfo;
  const image = containerUtils.getShortImage(containerInfo);
  expect(image).toBe('docker.io/kindest/node@sha256:61b92f3');
});

test('should expect full name for images', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
  } as unknown as ContainerInfo;
  const image = containerUtils.getShortImage(containerInfo);
  expect(image).toBe('docker.io/kindest/node:foobar');
});

test('should expect empty string when there are no public ports', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
  } as unknown as ContainerInfo;
  const ports = containerUtils.getPortsAsString(containerInfo);
  expect(ports).toBe('');
});

test('should expect port as string when there is one public ports', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
    Ports: [
      {
        PublicPort: 80,
      },
    ],
  } as unknown as ContainerInfo;
  const ports = containerUtils.getPortsAsString(containerInfo);
  expect(ports).toBe('80');
});

test('should expect ports as string when there are multiple public ports', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
    Ports: [
      {
        PublicPort: 80,
      },
      {
        PublicPort: 8022,
      },
    ],
  } as unknown as ContainerInfo;
  const ports = containerUtils.getPortsAsString(containerInfo);
  expect(ports).toBe('80, 8022');
});

test('container group status should be running when all compose containers are running', async () => {
  const groupName = 'compose-group';
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Labels: { 'com.docker.compose.project': groupName },
    Names: ['container1'],
    State: 'RUNNING',
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const containerInfo2 = {
    Id: 'container2',
    Image: 'docker.io/kindest/node:foobar',
    Labels: { 'com.docker.compose.project': groupName },
    Names: ['container2'],
    State: 'RUNNING',
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const groups = containerUtils.getContainerGroups([
    containerUtils.getContainerInfoUI(containerInfo),
    containerUtils.getContainerInfoUI(containerInfo2),
  ]);
  const group = groups[0];
  expect(group.name).toBe(groupName);
  expect(group.type).toBe(ContainerGroupInfoTypeUI.COMPOSE);
  expect(group.status).toBe('RUNNING');
});

test('container group status should be stopped when any compose container is stopped', async () => {
  const groupName = 'compose-group';
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Labels: { 'com.docker.compose.project': groupName },
    Names: ['container1'],
    State: 'RUNNING',
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const containerInfo2 = {
    Id: 'container2',
    Image: 'docker.io/kindest/node:foobar',
    Labels: { 'com.docker.compose.project': groupName },
    Names: ['container2'],
    State: 'STOPPED',
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const groups = containerUtils.getContainerGroups([
    containerUtils.getContainerInfoUI(containerInfo),
    containerUtils.getContainerInfoUI(containerInfo2),
  ]);

  const group = groups[0];
  expect(group.name).toBe(groupName);
  expect(group.type).toBe(ContainerGroupInfoTypeUI.COMPOSE);
  expect(group.status).toBe('STOPPED');
});

test('container group status should be running when the pod status is running', async () => {
  const groupName = 'pod-group';
  const pod = {
    id: 'podId',
    name: groupName,
    status: 'RUNNING',
  };
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container1'],
    State: 'RUNNING',
    pod: pod,
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const containerInfo2 = {
    Id: 'container2',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container2'],
    State: 'RUNNING',
    pod: pod,
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const groups = containerUtils.getContainerGroups([
    containerUtils.getContainerInfoUI(containerInfo),
    containerUtils.getContainerInfoUI(containerInfo2),
  ]);
  const group = groups[0];
  expect(group.name).toBe(groupName);
  expect(group.type).toBe(ContainerGroupInfoTypeUI.POD);
  expect(group.status).toBe('RUNNING');
});

test('container group status should be degraded when the pod status is degraded', async () => {
  const groupName = 'pod-group';
  const pod = {
    id: 'podId',
    name: groupName,
    status: 'DEGRADED',
  };
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container1'],
    State: 'RUNNING',
    pod: pod,
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const containerInfo2 = {
    Id: 'container2',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container2'],
    State: 'STOPPED',
    pod: pod,
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const groups = containerUtils.getContainerGroups([
    containerUtils.getContainerInfoUI(containerInfo),
    containerUtils.getContainerInfoUI(containerInfo2),
  ]);

  const group = groups[0];
  expect(group.name).toBe(groupName);
  expect(group.type).toBe(ContainerGroupInfoTypeUI.POD);
  expect(group.status).toBe('DEGRADED');
});

test('should expect icon to be undefined if no context/view is passed', async () => {
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
    Ports: [
      {
        PublicPort: 80,
      },
      {
        PublicPort: 8022,
      },
    ],
  } as unknown as ContainerInfo;
  const icon = containerUtils.iconClass(containerInfo);
  expect(icon).toBe(undefined);
});

test('should expect icon to be valid value with context/view set', async () => {
  const context = new ContextUI();
  const view: ViewInfoUI = {
    extensionId: 'extension',
    viewId: 'id',
    value: {
      icon: '${kind-icon}',
      when: 'io.x-k8s.kind.cluster in containerLabelKeys',
    },
  };
  const containerInfo = {
    Image: 'docker.io/kindest/node:foobar',
    Labels: {
      'io.x-k8s.kind.cluster': 'ok',
    },
  } as unknown as ContainerInfo;
  const icon = containerUtils.iconClass(containerInfo, context, [view]);
  expect(icon).toBe('podman-desktop-icon-kind-icon');
});

test('should expect icon to be ContainerIcon if no context/view is passed', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container1'],
    State: 'STOPPED',
    ImageID: 'sha256:dummy-sha256',
  } as unknown as ContainerInfo;
  const containerUI = containerUtils.getContainerInfoUI(containerInfo);
  expect(containerUI.icon).toBeDefined();
  expect(typeof containerUI.icon !== 'string').toBe(true);
});

test('check parsing of container info without names', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'registry.k8s.io/pause:3.7',
    Labels: {
      'io.cri-containerd.kind': 'sandbox',
    },
    Names: '',
    State: 'RUNNING',
  } as unknown as ContainerInfo;
  const name = containerUtils.getName(containerInfo);
  expect(name).toBe('');
});

test('check that if a container is part of compose, it will use the Names field for output WITHOUT the project name even if there is a name for service', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'registry.k8s.io/pause:3.7',
    Labels: {
      'com.docker.compose.project': 'compose',
      'com.docker.compose.service': 'compose_container',
    },
    Names: ['/compose-compose_container-1'],
    State: 'RUNNING',
  } as unknown as ContainerInfo;
  const name = containerUtils.getName(containerInfo);
  expect(name).toBe('compose_container-1');
});

test('test that if a container is part of compose, and that container_name has been specified, that means that the Names[0] should be used without the project name', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'registry.k8s.io/pause:3.7',
    Labels: {
      'com.docker.compose.project': 'compose',
      'com.docker.compose.service': 'container_name',
    },
    // If container_name was specified in the compose file, this should be used (without the project name).
    Names: ['/container_name'],
    State: 'RUNNING',
  } as unknown as ContainerInfo;
  const name = containerUtils.getName(containerInfo);
  expect(name).toBe('container_name');
});

test('check parsing of container info without labels', async () => {
  const context = new ContextUI();
  const containerInfo = {
    Id: 'container1',
    Image: 'registry.k8s.io/pause:3.7',
    Labels: '',
    Names: ['container1'],
    State: 'RUNNING',
  } as unknown as ContainerInfo;
  containerUtils.adaptContextOnContainer(context, containerInfo);
});

test('should expect imageHref not to have sha256: prefix', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container1'],
    State: 'STOPPED',
    ImageID: 'sha256:dummy-sha256',
    engineId: 'dummy-engine-id',
    ImageBase64RepoTag: 'dummy-base-64',
  } as unknown as ContainerInfo;
  const containerUI = containerUtils.getContainerInfoUI(containerInfo);
  expect(containerUI.imageHref).toBe('/images/dummy-sha256/dummy-engine-id/dummy-base-64/summary');
});

test('should expect imageHref to use exact image id if no sha256: prefix', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container1'],
    State: 'STOPPED',
    ImageID: 'dummy-sha256',
    engineId: 'dummy-engine-id',
    ImageBase64RepoTag: 'dummy-base-64',
  } as unknown as ContainerInfo;
  const containerUI = containerUtils.getContainerInfoUI(containerInfo);
  expect(containerUI.imageHref).toBe('/images/dummy-sha256/dummy-engine-id/dummy-base-64/summary');
});

test('should be able to identify container groups', async () => {
  const containerGroupInfo = {
    id: 'my-pod',
    name: 'My pod',
    type: ContainerGroupInfoTypeUI.POD,
  } as unknown as ContainerGroupInfoUI;
  expect(containerUtils.isContainerGroupInfoUI(containerGroupInfo)).toBe(true);
  expect(containerUtils.isContainerInfoUI(containerGroupInfo)).toBe(false);
});

test('should be able to identify containers', async () => {
  const containerInfo = {
    id: 'container1',
    name: 'a container',
    state: 'RUNNING',
  } as unknown as ContainerInfoUI;
  expect(containerUtils.isContainerInfoUI(containerInfo)).toBe(true);
  expect(containerUtils.isContainerGroupInfoUI(containerInfo)).toBe(false);
});
