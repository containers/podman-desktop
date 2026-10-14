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

import type { ContainerInfo, ViewInfoUI } from '@desktop-framework/api';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';
import { beforeEach, expect, test, vi } from 'vitest';

import { ContextUI } from '/@/lib/context/context';

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
  expect(groups).toHaveLength(1);
  const group = groups[0];
  expect(group.name).toBe(groupName);
  expect(group.type).toBe(ContainerGroupInfoTypeUI.COMPOSE);
  expect(group.status).toBe('RUNNING');
});

test('same group name but different engine is should results in two groups', async () => {
  const groupName = 'compose-group';
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Labels: { 'com.docker.compose.project': groupName },
    Names: ['container1'],
    State: 'RUNNING',
    ImageID: 'sha256:dummy-sha256',
    engineId: 'docker',
  } as unknown as ContainerInfo;

  const groups = containerUtils.getContainerGroups([
    containerUtils.getContainerInfoUI({
      ...containerInfo,
      engineId: 'podman-1',
    }),
    containerUtils.getContainerInfoUI({
      ...containerInfo,
      engineId: 'podman-2',
    }),
  ]);
  expect(groups).toHaveLength(2);
  const [groupA, groupB] = groups;

  expect(groupA.name).toBe(groupName);
  expect(groupB.name).toBe(groupName);

  expect(groupA.id).not.eq(groupB.id);
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
    engineName: 'podman',
  } as unknown as ContainerInfo;
  const containerInfo2 = {
    Id: 'container2',
    Image: 'docker.io/kindest/node:foobar',
    Labels: { 'com.docker.compose.project': groupName },
    Names: ['container2'],
    State: 'STOPPED',
    ImageID: 'sha256:dummy-sha256',
    engineName: 'podman',
  } as unknown as ContainerInfo;
  const groups = containerUtils.getContainerGroups([
    containerUtils.getContainerInfoUI(containerInfo),
    containerUtils.getContainerInfoUI(containerInfo2),
  ]);

  const group = groups[0];
  expect(group.name).toBe(groupName);
  expect(group.type).toBe(ContainerGroupInfoTypeUI.COMPOSE);
  expect(group.status).toBe('STOPPED');
  expect(group.engineName).toBe('podman');
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
    engineName: 'podman',
  } as unknown as ContainerInfo;
  const containerInfo2 = {
    Id: 'container2',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container2'],
    State: 'RUNNING',
    pod: pod,
    ImageID: 'sha256:dummy-sha256',
    engineName: 'podman',
  } as unknown as ContainerInfo;
  const groups = containerUtils.getContainerGroups([
    containerUtils.getContainerInfoUI(containerInfo),
    containerUtils.getContainerInfoUI(containerInfo2),
  ]);
  const group = groups[0];
  expect(group.name).toBe(groupName);
  expect(group.type).toBe(ContainerGroupInfoTypeUI.POD);
  expect(group.status).toBe('RUNNING');
  expect(group.engineName).toBe('podman');
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

test('containers in same named compose project on two different engine should have different group id', async () => {
  const COMPOSE_CONTAINER: ContainerInfo = {
    engineId: '',
    engineName: '',
    engineType: 'podman',
    Id: 'container1',
    Image: 'registry.k8s.io/pause:3.7',
    Labels: {
      'com.docker.compose.project': 'compose',
      'com.docker.compose.service': 'compose_container',
    },
    Names: ['/compose-compose_container-1'],
    State: 'RUNNING',
  } as unknown as ContainerInfo;

  const foo = containerUtils.getContainerGroup({
    ...COMPOSE_CONTAINER,
    engineId: 'foo',
  });

  const bar = containerUtils.getContainerGroup({
    ...COMPOSE_CONTAINER,
    engineId: 'bar',
  });

  expect(foo.id).not.eq(bar.id);
});

test('should expect icon to be undefined if no context/view is passed', async () => {
  const containerInfoUI = {
    image: 'docker.io/kindest/node:foobar',
    Ports: [
      {
        PublicPort: 80,
      },
      {
        PublicPort: 8022,
      },
    ],
  } as unknown as ContainerInfoUI;
  const icon = containerUtils.iconClass(containerInfoUI);
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
  const containerInfoUI = {
    image: 'docker.io/kindest/node:foobar',
    labels: {
      'io.x-k8s.kind.cluster': 'ok',
    },
  } as unknown as ContainerInfoUI;
  const icon = containerUtils.iconClass(containerInfoUI, context, [view]);
  expect(icon).toBe('podman-desktop-icon-kind-icon');
});

test('should expect icon to be valid value with context/view set with containerImageName', async () => {
  const context = new ContextUI();
  const view: ViewInfoUI = {
    extensionId: 'extension',
    viewId: 'id',
    value: {
      icon: '${kind-icon}',
      when: 'containerImageName == docker.io/kindest/node:foobar',
    },
  };
  const containerInfoUI = {
    image: 'docker.io/kindest/node:foobar',
  } as unknown as ContainerInfoUI;
  const icon = containerUtils.iconClass(containerInfoUI, context, [view]);
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
  const containerInfoUI = {
    id: 'container1',
    image: 'registry.k8s.io/pause:3.7',
    labels: '',
    name: 'container1',
    state: 'RUNNING',
  } as unknown as ContainerInfoUI;
  containerUtils.adaptContextOnContainer(context, containerInfoUI);
});

test('should expect imageHref to use image tag', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container1'],
    State: 'STOPPED',
    ImageID: 'sha256:dummy-sha256',
    engineId: 'dummy-engine-id',
    ImageBase64RepoTag: 'ZHVtbXktYmFzZS02NA==', //dummy-base-64
  } as unknown as ContainerInfo;
  const containerUI = containerUtils.getContainerInfoUI(containerInfo);
  expect(containerUI.imageHref).toBe('/images/sha256:dummy-sha256/dummy-engine-id/ZHVtbXktYmFzZS02NA==/summary');
});

test('should expect imageHref to not use image tag', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container1'],
    State: 'STOPPED',
    ImageID: 'sha256:dummy-sha256',
    engineId: 'dummy-engine-id',
    ImageBase64RepoTag: 'c2hhMjU2OmFiYzEyMw==', //sha256:abc123
  } as unknown as ContainerInfo;
  const containerUI = containerUtils.getContainerInfoUI(containerInfo);
  expect(containerUI.imageHref).toBe('/images/sha256:dummy-sha256/dummy-engine-id');
});

test('should expect imageHref to not use image tag when there is no tag', async () => {
  const containerInfo = {
    Id: 'container1',
    Image: 'docker.io/kindest/node:foobar',
    Names: ['container1'],
    State: 'STOPPED',
    ImageID: 'sha256:dummy-sha256',
    engineId: 'dummy-engine-id',
  } as unknown as ContainerInfo;
  const containerUI = containerUtils.getContainerInfoUI(containerInfo);
  expect(containerUI.imageHref).toBe('/images/sha256:dummy-sha256/dummy-engine-id');
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

test('should expect getContainerInfoUI to carry the raw image id and names', async () => {
  const containerInfo = {
    Id: 'id123',
    Names: ['/myproject-web-1', '/web-alias'],
    Image: 'docker.io/library/nginx:latest',
    ImageID: 'sha256:abcdef0123456789',
    State: 'running',
    Labels: {
      'com.docker.compose.project': 'myproject',
    },
    engineId: 'engine',
    engineName: 'podman',
  } as unknown as ContainerInfo;

  const containerUI = containerUtils.getContainerInfoUI(containerInfo);

  // both fields are optional on the type, but the converter always populates them
  expect(containerUI.imageId).toBe('sha256:abcdef0123456789');
  expect(containerUI.names).toStrictEqual(['/myproject-web-1', '/web-alias']);

  // names stays raw where name does not: the leading slash and the compose project
  // prefix survive, which is what alias matching and the navigation label rely on
  expect(containerUI.name).toBe('web-1');
});

test('should expect getContainerInfoUI to default the icon, leaving contributions to the caller', async () => {
  const containerInfo = {
    Id: 'id123',
    Names: ['/container'],
    Image: 'docker.io/kindest/node:foobar',
    State: 'running',
    Labels: {
      'io.x-k8s.kind.cluster': 'ok',
    },
  } as unknown as ContainerInfo;

  // the converter takes one argument now: it cannot see the context or the view
  // contributions, so an extension icon is never resolved here
  expect(containerUtils.getContainerInfoUI(containerInfo).icon).toBe(ContainerIcon);
});
