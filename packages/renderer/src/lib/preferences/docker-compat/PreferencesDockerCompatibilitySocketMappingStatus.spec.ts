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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, expect, type Mock, test, vi } from 'vitest';

import type { DockerSocketMappingStatusInfo, DockerSocketServerInfoType } from '/@api/docker-compatibility-info';

import PreferencesDockerCompatibilitySocketMappingStatus from './PreferencesDockerCompatibilitySocketMappingStatus.svelte';

const podmanServerInfo = {
  type: 'podman' as DockerSocketServerInfoType,
  serverVersion: '1.0.0',
  operatingSystem: 'Linux',
  osType: 'linux',
  architecture: 'arm64',
};

const dockerServerInfo = {
  type: 'docker' as DockerSocketServerInfoType,
  serverVersion: '1.0.0',
  operatingSystem: 'Linux',
  osType: 'linux',
  architecture: 'x86_64',
};

const podmanConnectionInfo = {
  provider: {
    id: 'fooId',
    name: 'foo name',
  },
  link: 'providerLink',
  name: 'connection name',
  displayName: 'My awesome connection',
};

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

const getOsPlatformMock: Mock<() => Promise<string>> = vi.fn();
const getSystemDockerSocketMappingStatusMock: Mock<() => Promise<DockerSocketMappingStatusInfo>> = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(global, 'window', {
    value: {
      getOsPlatform: getOsPlatformMock,
      getSystemDockerSocketMappingStatus: getSystemDockerSocketMappingStatusMock,
    },
    writable: true,
  });
});

test('socket running', async () => {
  getSystemDockerSocketMappingStatusMock.mockResolvedValue({
    status: 'running',
    serverInfo: podmanServerInfo,
  });

  render(PreferencesDockerCompatibilitySocketMappingStatus);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getSystemDockerSocketMappingStatusMock).toBeCalled());

  expect(screen.getByText('podman is listening')).toBeInTheDocument();
});

test('socket unreachable', async () => {
  getSystemDockerSocketMappingStatusMock.mockResolvedValue({
    status: 'unreachable',
  });

  render(PreferencesDockerCompatibilitySocketMappingStatus);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getSystemDockerSocketMappingStatusMock).toBeCalled());

  expect(screen.getByText('socket not reachable')).toBeInTheDocument();
});

test('socket status link on Windows', async () => {
  getOsPlatformMock.mockResolvedValue('win32');
  getSystemDockerSocketMappingStatusMock.mockResolvedValue({
    status: 'running',
  });

  render(PreferencesDockerCompatibilitySocketMappingStatus);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getSystemDockerSocketMappingStatusMock).toBeCalled());

  // get div description of the status
  const description = screen.getByRole('status', { name: 'description of the status' });
  expect(description).toBeInTheDocument();
  expect(description).toHaveTextContent('Status of the system //./pipe/docker_engine');
});

test('socket status link on macOS', async () => {
  getOsPlatformMock.mockResolvedValue('darwin');
  getSystemDockerSocketMappingStatusMock.mockResolvedValue({
    status: 'running',
    serverInfo: dockerServerInfo,
  });

  render(PreferencesDockerCompatibilitySocketMappingStatus);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getSystemDockerSocketMappingStatusMock).toBeCalled());

  // get div description of the status
  const description = screen.getByRole('status', { name: 'description of the status' });
  expect(description).toBeInTheDocument();
  expect(description).toHaveTextContent('Status of the system /var/run/docker.sock socket');
});

test('socket status link on Linux', async () => {
  getOsPlatformMock.mockResolvedValue('linux');
  getSystemDockerSocketMappingStatusMock.mockResolvedValue({
    status: 'running',
    serverInfo: dockerServerInfo,
  });

  render(PreferencesDockerCompatibilitySocketMappingStatus);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getSystemDockerSocketMappingStatusMock).toBeCalled());

  // get div description of the status
  const description = screen.getByRole('status', { name: 'description of the status' });
  expect(description).toBeInTheDocument();
  expect(description).toHaveTextContent('Status of the system /var/run/docker.sock socket');
});

test('podman text', async () => {
  getOsPlatformMock.mockResolvedValue('linux');
  getSystemDockerSocketMappingStatusMock.mockResolvedValue({
    status: 'running',
    serverInfo: podmanServerInfo,
  });

  render(PreferencesDockerCompatibilitySocketMappingStatus);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getSystemDockerSocketMappingStatusMock).toBeCalled());

  // check we have text for podman if podman engine
  expect(
    screen.getByText('Any docker commands using this socket are redirected to the Podman Engine instead'),
  ).toBeInTheDocument();
});

test('check connection info', async () => {
  getOsPlatformMock.mockResolvedValue('darwin');
  getSystemDockerSocketMappingStatusMock.mockResolvedValue({
    status: 'running',
    serverInfo: podmanServerInfo,
    connectionInfo: podmanConnectionInfo,
  });

  render(PreferencesDockerCompatibilitySocketMappingStatus);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getSystemDockerSocketMappingStatusMock).toBeCalled());

  // check we have the connection link
  const connectionInfo = screen.getByRole('status', { name: 'Connection information' });
  expect(connectionInfo).toBeInTheDocument();

  // check we have the connection link
  const connectionLink = screen.getByRole('button', { name: 'foo name details' });
  expect(connectionLink).toBeInTheDocument();

  // click on the link
  await fireEvent.click(connectionLink);
  // check clicked
  expect(router.goto).toBeCalledWith('providerLink');
});

test('check server info grid', async () => {
  getOsPlatformMock.mockResolvedValue('win32');
  getSystemDockerSocketMappingStatusMock.mockResolvedValue({
    status: 'running',
    serverInfo: podmanServerInfo,
  });

  render(PreferencesDockerCompatibilitySocketMappingStatus);

  // wait for the promise to resolve
  await vi.waitFor(() => expect(getSystemDockerSocketMappingStatusMock).toBeCalled());

  // check we have the connection link
  const serverInfo = screen.getByRole('status', { name: 'Server information' });
  expect(serverInfo).toBeInTheDocument();

  // check we have the properties
  expect(serverInfo).toHaveTextContent('Operating System');
  expect(serverInfo).toHaveTextContent('linux/arm64');
  expect(serverInfo).toHaveTextContent('Server');
  expect(serverInfo).toHaveTextContent('Version');
});
