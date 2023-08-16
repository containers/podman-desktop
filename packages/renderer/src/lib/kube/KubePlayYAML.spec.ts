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

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { providerInfos } from '../../stores/providers';
import { render, screen } from '@testing-library/svelte';
import KubePlayYAML from './KubePlayYAML.svelte';
import type { ProviderStatus } from '@podman-desktop/api';
import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import userEvent from '@testing-library/user-event';
import type { PlayKubeInfo } from '../../../../main/src/plugin/dockerode/libpod-dockerode';

const mockedErroredPlayKubeInfo: PlayKubeInfo = {
  Pods: [
    {
      ContainerErrors: ['error 1', 'error 2'],
      Containers: ['container 1', 'container 2'],
      Id: 'pod-id',
      InitContainers: ['init-container 1', 'init-container 2'],
      Logs: ['log 1', 'log 2'],
    },
  ],
  RmReport: [
    {
      Err: 'rm error',
      Id: 'rm-id',
    },
  ],
  Secrets: [
    {
      CreateReport: {
        ID: 'secret-id',
      },
    },
  ],
  StopReport: [
    {
      Err: 'stop error',
      Id: 'stop-id',
    },
  ],
  Volumes: [
    {
      Name: 'volume 1',
    },
    {
      Name: 'volume 2',
    },
  ],
};

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).getConfigurationValue = vi.fn();
  (window as any).matchMedia = vi.fn().mockReturnValue({
    addListener: vi.fn(),
  });
  (window as any).openFileDialog = vi.fn().mockResolvedValue({ canceled: false, filePaths: ['Containerfile'] });
  (window as any).telemetryPage = vi.fn();
  (window as any).kubernetesGetCurrentContextName = vi.fn();
  (window as any).kubernetesGetCurrentNamespace = vi.fn();
  (window as any).kubernetesListNamespaces = vi.fn();
});

function setup() {
  const pStatus: ProviderStatus = 'started';
  const pInfo: ProviderContainerConnectionInfo = {
    name: 'test',
    status: 'started',
    endpoint: {
      socketPath: '',
    },
    type: 'podman',
  };
  const providerInfo = {
    id: 'test',
    internalId: 'id',
    name: '',
    containerConnections: [pInfo],
    kubernetesConnections: undefined,
    status: pStatus,
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: false,
    kubernetesProviderConnectionCreation: false,
    kubernetesProviderConnectionInitialization: false,
    links: undefined,
    detectionChecks: undefined,
    warnings: undefined,
    images: undefined,
    installationSupport: undefined,
  };
  providerInfos.set([providerInfo]);
}

test('error: When pressing the Play button, expect us to show the errors to the user', async () => {
  (window as any).playKube = vi.fn().mockResolvedValue(mockedErroredPlayKubeInfo);

  // Render the component
  setup();
  render(KubePlayYAML, {});

  // Simulate selecting a file
  const fileInput = screen.getByRole('textbox', { name: 'Kubernetes YAML file' });
  expect(fileInput).toBeInTheDocument();
  await userEvent.click(fileInput);

  // Simulate selecting a runtime
  const runtimeOption = screen.getByText('Using a Podman container engine');
  expect(runtimeOption).toBeInTheDocument();

  // Simulate clicking the "Play" button
  const playButton = screen.getByRole('button', { name: 'Play' });
  expect(playButton).toBeInTheDocument();
  await userEvent.click(playButton);

  // Since we error out with the mocked kubePlay function (see very top of tests)
  // Expect the following error to be in in the document.
  const error = screen.getByText('The following pods were created but failed to start: error 1, error 2');
  expect(error).toBeInTheDocument();
});

test('expect done button is there at the end', async () => {
  (window as any).playKube = vi.fn().mockResolvedValue({
    Pods: [],
  });

  // Render the component
  setup();
  render(KubePlayYAML, {});

  // Simulate selecting a file
  const fileInput = screen.getByRole('textbox', { name: 'Kubernetes YAML file' });
  expect(fileInput).toBeInTheDocument();
  await userEvent.click(fileInput);

  // Simulate selecting a runtime
  const runtimeOption = screen.getByText('Using a Podman container engine');
  expect(runtimeOption).toBeInTheDocument();

  // Simulate clicking the "Play" button
  const playButton = screen.getByRole('button', { name: 'Play' });
  expect(playButton).toBeInTheDocument();
  await userEvent.click(playButton);

  // search the done button
  const doneButton = screen.getByRole('button', { name: 'Done' });
  expect(doneButton).toBeInTheDocument();
  // check that text value is also 'Done'
  expect(doneButton).toHaveTextContent('Done');
});
