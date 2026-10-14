/*********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
 ********************************************************************/

import '@testing-library/jest-dom/vitest';

import type { ProviderInfo } from '@desktop-framework/api';
import { render } from '@testing-library/svelte';
import { readable, writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import type { ImageInfoUI } from '/@/lib/image/ImageInfoUI';
import ImageIcon from '/@/lib/images/ImageIcon.svelte';
import EnvironmentColumn from '/@/lib/table/columns/ContainerEngineEnvironmentColumn.svelte';
import * as providers from '/@/stores/providers';

vi.mock(import('/@/stores/providers'));

const PARTIAL_IMAGE: Omit<ImageInfoUI, 'engineId' | 'engineName' | 'engineType'> = {
  id: 'my-image',
  shortId: '',
  name: '',
  tag: '',
  createdAt: 0,
  age: '',
  arch: '',
  size: 0,
  humanSize: '',
  base64RepoTag: '',
  selected: false,
  status: 'UNUSED',
  icon: ImageIcon,
  badges: [],
  digest: 'sha256:1234567890',
};

const PODMAN_MACHINE_DEFAULT_IMAGE: ImageInfoUI = {
  ...PARTIAL_IMAGE,
  engineId: 'podman.podman-machine-default',
  engineName: 'Podman',
};

const PODMAN_REMOTE_IMAGE: ImageInfoUI = {
  ...PARTIAL_IMAGE,
  engineId: 'podman.remote-podman',
  engineName: 'Podman',
};

const DOCKER_IMAGE: ImageInfoUI = {
  ...PARTIAL_IMAGE,
  engineId: 'docker.docker-context',
  engineName: 'Docker',
};

const PODMAN_PROVIDER: ProviderInfo = {
  id: 'podman',
  name: 'Podman',
  kubernetesConnections: [],
  vmConnections: [],
  containerConnections: [
    {
      name: 'podman-machine-default',
      displayName: 'Podman Machine Default',
      status: 'started',
      type: 'podman',
      endpoint: {
        socketPath: '/var/run/podman-machine.sock',
      },
    },
    {
      name: 'remote-podman',
      displayName: 'Podman Remote',
      status: 'started',
      type: 'podman',
      endpoint: {
        socketPath: '/var/run/podman-remote.sock',
      },
    },
  ],
} as unknown as ProviderInfo;

const DOCKER_PROVIDER: ProviderInfo = {
  id: 'docker',
  name: 'Docker',
  kubernetesConnections: [],
  vmConnections: [],
  containerConnections: [
    {
      name: 'docker-context',
      displayName: 'Docker',
      status: 'started',
      type: 'docker',
      endpoint: {
        socketPath: '/var/run/docker.sock',
      },
    },
  ],
} as unknown as ProviderInfo;

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(providers).containerConnectionCount = readable({
    podman: 2,
    docker: 1,
  });
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);
});

test('single connection connection type should use it as label', async () => {
  const { getByText } = render(EnvironmentColumn, { object: DOCKER_IMAGE });

  const text = getByText('docker');
  expect(text).toBeInTheDocument();
});

test.each<{
  image: ImageInfoUI;
  expected: string;
}>([
  {
    image: PODMAN_REMOTE_IMAGE,
    expected: 'Podman Remote',
  },
  {
    image: PODMAN_MACHINE_DEFAULT_IMAGE,
    expected: 'Podman Machine Default',
  },
])('multiple connection connection type should use the $expected', async ({ image, expected }) => {
  const { getByText } = render(EnvironmentColumn, { object: image });

  const text = getByText(expected);
  expect(text).toBeInTheDocument();
});
