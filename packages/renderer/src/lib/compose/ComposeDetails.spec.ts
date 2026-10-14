/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { ContainerInfo, ContainerInspectInfo, ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { mockBreadcrumb } from '/@/stores/breadcrumb.spec';
import { containersInfos } from '/@/stores/containers';
import { providerInfos } from '/@/stores/providers';

import ComposeDetails from './ComposeDetails.svelte';

vi.mock(import('@xterm/xterm'));
vi.mock(import('/@/lib/editor/MonacoEditor.svelte'));

beforeAll(() => {
  mockBreadcrumb();
});

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });

  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);
  vi.mocked(window.getConfigurationProperties).mockResolvedValue({});
  vi.mocked(window.initializeProvider).mockResolvedValue([]);
  vi.mocked(window.getContainerInspect).mockResolvedValue(containerInspectInfo);
  vi.mocked(window.listNetworks).mockResolvedValue([]);
  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
  vi.mocked(window.getProviderInfos).mockResolvedValue([]);
  vi.mocked(window.onDidUpdateProviderStatus).mockResolvedValue(undefined);
});

async function waitRender(name: string, engineId: string): Promise<void> {
  render(ComposeDetails, { composeName: name, engineId: engineId });
  await tick();
}

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

test('Simple test that compose logs are clickable and loadable', async () => {
  render(ComposeDetails, { composeName: 'foobar', engineId: 'engine' });
  // Click on the logs href
  const logsHref = screen.getByRole('link', { name: 'Logs' });
  await fireEvent.click(logsHref);

  // Checks that the 'emptyscreen' of the logs is displayed
  // which should display "Log output of foobar"
  expect(screen.getByText('Log output of foobar')).toBeInTheDocument();
});

test('Simple test that compose name is displayed', async () => {
  render(ComposeDetails, { composeName: 'foobar', engineId: 'engine' });
  expect(screen.getByText('foobar')).toBeInTheDocument();
});

// Test that compose summary is clickable and loadable
test('Simple test that compose summary is clickable and loadable', async () => {
  render(ComposeDetails, { composeName: 'foobar', engineId: 'engine' });
  // Click on the summary href
  const summaryHref = screen.getByRole('link', { name: 'Summary' });
  await fireEvent.click(summaryHref);

  // Check that 'Name:' is displayed meaning it has loaded correctly.
  expect(screen.getByText('Name')).toBeInTheDocument();
});

test('Compose details inspect is clickable and loadable', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  const mockedContainers: ContainerInfo[] = [
    {
      Id: 'sha256:1234567890123',
      Image: 'sha256:123',
      Names: ['foo'],
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
      Labels: {
        'com.docker.compose.project': 'foobar',
      },
      ImageID: 'sha256:dummy-image-id',
    },
    {
      Id: 'sha256:1234567890124',
      Image: 'sha256:123',
      Names: ['foo2'],
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
      Labels: {
        'com.docker.compose.project': 'foobar',
      },
      ImageID: 'sha256:dummy-image-id',
    },
  ] as unknown as ContainerInfo[];

  vi.mocked(window.listContainers).mockResolvedValue(mockedContainers);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('tray:update-provider'));

  // wait store are populated
  await vi.waitUntil(() => {
    return get(containersInfos).length === 0 && get(providerInfos).length === 0;
  });

  // Wait for the render to completely finish
  await waitRender('foobar', 'podman');

  // Click on the inspect href that it renders correctly / displays the correct data
  const inspectHref = screen.getByRole('link', { name: 'Inspect' });
  await fireEvent.click(inspectHref);
});

test('Test that compose kube tab is clickable and loadable', async () => {
  vi.mocked(window.listContainers).mockResolvedValue([]);

  render(ComposeDetails, { composeName: 'foobar', engineId: 'engine' });
  const kubeHref = screen.getByRole('link', { name: 'Kube' });
  await fireEvent.click(kubeHref);
});

test('Expect compose status RUNNING when every container of the project runs', async () => {
  // ContainerUtils.getState uppercases, so comparing the UI state against 'running'
  // would silently make allRunning false and show the project as STOPPED forever
  vi.mocked(window.listContainers).mockResolvedValue([
    {
      Id: 'sha256:compose1',
      Image: 'sha256:123',
      Names: ['/foobar-web-1'],
      State: 'running',
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'sha256:dummy-image-id',
      Labels: { 'com.docker.compose.project': 'foobar' },
    },
    {
      Id: 'sha256:compose2',
      Image: 'sha256:123',
      Names: ['/foobar-db-1'],
      State: 'running',
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'sha256:dummy-image-id',
      Labels: { 'com.docker.compose.project': 'foobar' },
    },
  ] as unknown as ContainerInfo[]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // wait for the store to actually be populated
  await vi.waitUntil(() => get(containersInfos).length === 2);

  await waitRender('foobar', 'podman');

  expect(screen.getByRole('status', { name: 'RUNNING' })).toBeInTheDocument();
});

test('Expect compose status STOPPED when one container of the project is stopped', async () => {
  vi.mocked(window.listContainers).mockResolvedValue([
    {
      Id: 'sha256:compose1',
      Image: 'sha256:123',
      Names: ['/foobar-web-1'],
      State: 'running',
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'sha256:dummy-image-id',
      Labels: { 'com.docker.compose.project': 'foobar' },
    },
    {
      Id: 'sha256:compose2',
      Image: 'sha256:123',
      Names: ['/foobar-db-1'],
      State: 'exited',
      engineId: 'podman',
      engineName: 'podman',
      ImageID: 'sha256:dummy-image-id',
      Labels: { 'com.docker.compose.project': 'foobar' },
    },
  ] as unknown as ContainerInfo[]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await vi.waitUntil(() => get(containersInfos).length === 2);

  await waitRender('foobar', 'podman');

  expect(screen.getByRole('status', { name: 'STOPPED' })).toBeInTheDocument();
});
