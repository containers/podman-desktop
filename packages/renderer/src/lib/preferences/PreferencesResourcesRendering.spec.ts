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
import { render, screen } from '@testing-library/svelte';
import PreferencesResourcesRendering from './PreferencesResourcesRendering.svelte';
import { providerInfos } from '../../stores/providers';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';

const providerInfo: ProviderInfo = {
  id: 'podman',
  name: 'podman',
  images: {
    icon: 'img',
  },
  status: 'started',
  warnings: undefined,
  containerProviderConnectionCreation: true,
  detectionChecks: undefined,
  containerConnections: [
    {
      name: 'machine',
      status: 'started',
      endpoint: {
        socketPath: 'socket',
      },
      lifecycleMethods: ['start', 'stop', 'delete'],
      type: 'podman',
    },
  ],
  installationSupport: undefined,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: true,
  links: undefined,
  containerProviderConnectionInitialization: false,
  containerProviderConnectionCreationDisplayName: 'Podman machine',
  kubernetesProviderConnectionInitialization: false,
};

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

beforeEach(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: vi.fn(),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).telemetryPage = vi.fn().mockResolvedValue(undefined);
});

test('Expect to see elements regarding default provider name', async () => {
  // clone providerInfo and change id to foo
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  // change name of the provider
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Create new foo-provider' });
  expect(button).toBeInTheDocument();
  // expect default create title
  expect(button).toHaveTextContent('Create new ...');
});

test('Expect to see elements regarding foo provider', async () => {
  // clone providerInfo and change id to foo
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  customProviderInfo.containerProviderConnectionCreationDisplayName = 'foo';
  customProviderInfo.containerProviderConnectionCreationButtonTitle = 'Connect';
  providerInfos.set([customProviderInfo]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Create new foo' });
  expect(button).toBeInTheDocument();
  // expect custom create title
  expect(button).toHaveTextContent('Connect ...');
});

test('Expect to see elements regarding podman provider', async () => {
  providerInfos.set([providerInfo]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Create new Podman machine' });
  expect(button).toBeInTheDocument();
});

test('Expect to be start, delete actions enabled and stop, restart disabled when container stopped', async () => {
  providerInfo.containerConnections[0].status = 'stopped';
  providerInfos.set([providerInfo]);
  render(PreferencesResourcesRendering, {});
  const startButton = screen.getByRole('button', { name: 'Start' });
  expect(startButton).toBeInTheDocument();
  expect(!startButton.classList.contains('cursor-not-allowed'));
  const stopButton = screen.getByRole('button', { name: 'Stop' });
  expect(stopButton).toBeInTheDocument();
  expect(stopButton.classList.contains('cursor-not-allowed'));
  const restartButton = screen.getByRole('button', { name: 'Restart' });
  expect(restartButton).toBeInTheDocument();
  expect(restartButton.classList.contains('cursor-not-allowed'));
  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(!deleteButton.classList.contains('cursor-not-allowed'));
});

test('Expect to be start, delete actions disabled and stop, restart enabled when container running', async () => {
  providerInfo.containerConnections[0].status = 'started';
  providerInfos.set([providerInfo]);
  render(PreferencesResourcesRendering, {});
  const startButton = screen.getByRole('button', { name: 'Start' });
  expect(startButton).toBeInTheDocument();
  expect(startButton.classList.contains('cursor-not-allowed'));
  const stopButton = screen.getByRole('button', { name: 'Stop' });
  expect(stopButton).toBeInTheDocument();
  expect(!stopButton.classList.contains('cursor-not-allowed'));
  const restartButton = screen.getByRole('button', { name: 'Restart' });
  expect(restartButton).toBeInTheDocument();
  expect(!restartButton.classList.contains('cursor-not-allowed'));
  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(deleteButton.classList.contains('cursor-not-allowed'));
});

test('Expect to see the no resource message when there is no providers', async () => {
  providerInfos.set([]);
  render(PreferencesResourcesRendering, {});
  const panel = screen.getByText('No resources found');
  expect(panel).toBeInTheDocument();
});

test('Expect to redirect to create New page if provider is installed', async () => {
  // clone providerInfo and change id and status
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  // change name of the provider
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Create new foo-provider' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);
  // redirect to create new page
  expect(router.goto).toHaveBeenCalledWith(`/preferences/provider/${customProviderInfo.internalId}`);
});

test('Expect to display the dialog if missing requirements for installation', async () => {
  const installPreflightMock = vi.fn().mockResolvedValue(false);
  const installProviderMock = vi.fn().mockResolvedValue(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).runInstallPreflightChecks = installPreflightMock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).installProvider = installProviderMock;
  // clone providerInfo and change id and status
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  // change name of the provider
  customProviderInfo.status = 'not-installed';
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Create new foo-provider' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);
  // provider is not installed, it checks the requirements, something fails and the dialog about missing reqs is shown
  expect(installPreflightMock).toBeCalled();
  expect(installProviderMock).not.toHaveBeenCalled();
  const modal = screen.getByLabelText('install provider');
  expect(modal).toBeInTheDocument();
});

test('Expect to directly install the provider if requirements are met', async () => {
  const installPreflightMock = vi.fn().mockResolvedValue(true);
  const installProviderMock = vi.fn().mockResolvedValue(undefined);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).runInstallPreflightChecks = installPreflightMock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).installProvider = installProviderMock;
  // clone providerInfo and change id and status
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  // change name of the provider
  customProviderInfo.status = 'not-installed';
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Create new foo-provider' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);
  // all requirements are met so the installProvider function is called
  expect(installPreflightMock).toBeCalled();
  expect(installProviderMock).toBeCalled();
});
