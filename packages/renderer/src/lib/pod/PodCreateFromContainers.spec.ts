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

import '@testing-library/jest-dom/vitest';

import type { ContainerInspectInfo, ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import { type PodCreation, podCreationHolder } from '/@/stores/creation-from-containers-store';
import { providerInfos } from '/@/stores/providers';

import PodCreateFromContainers from './PodCreateFromContainers.svelte';

const providerInfo: ProviderInfo = {
  id: 'podman',
  name: 'podman',
  images: {
    icon: 'img',
  },
  status: 'started',
  canStart: false,
  canStop: false,
  warnings: [],
  containerProviderConnectionCreation: true,
  detectionChecks: [],
  containerConnections: [
    {
      connectionType: 'container',
      name: 'machine',
      displayName: 'machine',
      status: 'started',
      endpoint: {
        socketPath: 'socket',
      },
      lifecycleMethods: ['start', 'stop', 'delete'],
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
      type: 'podman',
    },
  ],
  installationSupport: false,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: true,
  links: [],
  containerProviderConnectionInitialization: false,
  containerProviderConnectionCreationDisplayName: 'Podman machine',
  kubernetesProviderConnectionInitialization: false,
  extensionId: '',
  cleanupSupport: false,
  vmConnections: [],
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
};

const podCreation: PodCreation = {
  containers: [
    {
      engineId: 'podman',
      id: 'id',
      name: 'cont_1',
      ports: [
        {
          PublicPort: 9090,
          IP: 'ip',
          PrivatePort: 80,
          Type: 'type',
        },
        {
          PublicPort: 8080,
          IP: 'ip',
          PrivatePort: 81,
          Type: 'type',
        },
      ],
    },
  ],
  name: 'pod',
};

const podCreationSamePortContainers: PodCreation = {
  containers: [
    {
      engineId: 'podman',
      id: 'id',
      name: 'cont_1',
      ports: [
        {
          PublicPort: 9090,
          IP: 'ip',
          PrivatePort: 80,
          Type: 'type',
        },
        {
          PublicPort: 8080,
          IP: 'ip',
          PrivatePort: 80,
          Type: 'type',
        },
      ],
    },
  ],
  name: 'pod',
};

const containerInspectInfo: ContainerInspectInfo = {
  engineId: '',
  engineName: '',
  Id: '',
  Created: '',
  Path: '',
  Args: [],
  State: {
    Status: '',
    Running: false,
    Paused: false,
    Restarting: false,
    OOMKilled: false,
    Dead: false,
    Pid: 0,
    ExitCode: 0,
    Error: '',
    StartedAt: '',
    FinishedAt: '',
    Health: {
      Status: '',
      FailingStreak: 0,
      Log: [],
    },
  },
  Image: '',
  ResolvConfPath: '',
  HostnamePath: '',
  HostsPath: '',
  LogPath: '',
  Name: '',
  RestartCount: 0,
  Driver: '',
  Platform: '',
  MountLabel: '',
  ProcessLabel: '',
  AppArmorProfile: '',
  HostConfig: {
    PortBindings: {
      9090: [
        {
          HostPort: '8383',
          HostIp: '',
        },
      ],
    },
  },
  GraphDriver: {
    Name: '',
    Data: {
      DeviceId: '',
      DeviceName: '',
      DeviceSize: '',
    },
  },
  Mounts: [],
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
    Entrypoint: '',
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
    Node: {
      ID: '',
      IP: '',
      Addr: '',
      Name: '',
      Cpus: 0,
      Memory: 0,
      Labels: undefined,
    },
  },
};

test('Expect to see name input, containers and exposed ports list', async () => {
  providerInfos.set([providerInfo]);
  podCreationHolder.set(podCreation);

  render(PodCreateFromContainers, {});
  const nameInput = screen.getByRole('textbox', { name: 'Pod name' });
  expect(nameInput).toBeInTheDocument();
  const containersLabel = screen.getByLabelText('Containers');
  expect(containersLabel).toBeInTheDocument();
  const exposedPortsLabel = screen.getByLabelText('Exposed ports');
  expect(exposedPortsLabel).toBeInTheDocument();
});

test('Show error if pod creation fails', async () => {
  vi.mocked(window.getContainerInspect).mockResolvedValue(containerInspectInfo);
  vi.mocked(window.createPod).mockRejectedValue('error create pod');
  providerInfos.set([providerInfo]);
  podCreationHolder.set(podCreation);

  render(PodCreateFromContainers, {});
  const createPodButton = screen.getByRole('button', { name: 'Create pod' });
  // expect to have indication why the button is disabled
  expect(createPodButton).toBeInTheDocument();
  await fireEvent.click(createPodButton);

  const exposedPortsLabel = await screen.findByText('error create pod');
  expect(exposedPortsLabel).toBeInTheDocument();
});

test('Show warning if multiple containers use the same port', async () => {
  providerInfos.set([providerInfo]);
  podCreationHolder.set(podCreationSamePortContainers);

  render(PodCreateFromContainers, {});
  const warningLabel = await screen.findByRole('alert');
  expect(warningLabel).toBeInTheDocument();
  expect(warningLabel).toHaveTextContent('Containers cont_1 and cont_1 use same port 80');
});

test('Do not show warning if multiple containers use different ports', async () => {
  providerInfos.set([providerInfo]);
  podCreationHolder.set(podCreation);

  render(PodCreateFromContainers, {});
  const warningLabel = screen.queryByLabelText('warning');
  expect(warningLabel).not.toBeInTheDocument();
});

test('Resets selectedProvider when current provider is stopped', async () => {
  vi.mocked(window.getContainerInspect).mockResolvedValue(containerInspectInfo);
  vi.mocked(window.createPod).mockRejectedValue('abort');
  const multiProviderInfo: ProviderInfo = {
    ...providerInfo,
    containerConnections: [
      {
        ...providerInfo.containerConnections[0],
        name: 'machine-1',
        endpoint: { socketPath: 'socket-1' },
      },
      {
        ...providerInfo.containerConnections[0],
        name: 'machine-2',
        endpoint: { socketPath: 'socket-2' },
      },
    ],
  };
  providerInfos.set([multiProviderInfo]);
  podCreationHolder.set(podCreation);

  render(PodCreateFromContainers, {});

  // Stop machine-1
  const updatedProviderInfo: ProviderInfo = {
    ...multiProviderInfo,
    containerConnections: [
      {
        ...multiProviderInfo.containerConnections[0],
        status: 'stopped',
      },
      multiProviderInfo.containerConnections[1],
    ],
  };
  providerInfos.set([updatedProviderInfo]);

  const createPodButton = screen.getByRole('button', { name: 'Create pod' });
  await fireEvent.click(createPodButton);

  expect(window.createPod).toHaveBeenCalledWith(
    expect.objectContaining({
      provider: expect.objectContaining({ name: 'machine-2' }),
    }),
  );
});

test('Preserves selectedProvider when it is still available', async () => {
  vi.mocked(window.getContainerInspect).mockResolvedValue(containerInspectInfo);
  vi.mocked(window.createPod).mockRejectedValue('abort');
  const multiProviderInfo: ProviderInfo = {
    ...providerInfo,
    containerConnections: [
      {
        ...providerInfo.containerConnections[0],
        name: 'machine-1',
        endpoint: { socketPath: 'socket-1' },
      },
      {
        ...providerInfo.containerConnections[0],
        name: 'machine-2',
        endpoint: { socketPath: 'socket-2' },
      },
    ],
  };
  providerInfos.set([multiProviderInfo]);
  podCreationHolder.set(podCreation);

  render(PodCreateFromContainers, {});

  // Select machine-2 using the dropdown
  const dropdownButton = screen.getByRole('button', { name: 'machine-1' });
  await fireEvent.click(dropdownButton);
  const option = await screen.findByRole('button', { name: 'machine-2' });
  await fireEvent.click(option);

  // Update providerInfos with an unrelated change
  const updatedProviderInfo: ProviderInfo = {
    ...multiProviderInfo,
    containerConnections: [
      ...multiProviderInfo.containerConnections,
      {
        ...providerInfo.containerConnections[0],
        name: 'machine-3',
        endpoint: { socketPath: 'socket-3' },
      },
    ],
  };
  providerInfos.set([updatedProviderInfo]);

  const createPodButton = screen.getByRole('button', { name: 'Create pod' });
  await fireEvent.click(createPodButton);

  expect(window.createPod).toHaveBeenCalledWith(
    expect.objectContaining({
      provider: expect.objectContaining({ name: 'machine-2' }),
    }),
  );
});
