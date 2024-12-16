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

import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { configurationProperties } from '/@/stores/configurationProperties';
import { onboardingList } from '/@/stores/onboarding';
import { CONFIGURATION_DEFAULT_SCOPE } from '/@api/configuration/constants.js';
import type { OnboardingInfo } from '/@api/onboarding';
import type { ProviderInfo } from '/@api/provider-info';

import { providerInfos } from '../../stores/providers';
import PreferencesResourcesRendering from './PreferencesResourcesRendering.svelte';

const defaultContainerConnectionName = 'machine-default';
const secondaryContainerConnectionName = 'podman-machine-secondary';

const providerInfo: ProviderInfo = {
  id: 'podman',
  name: 'podman',
  extensionId: 'id',
  images: {
    icon: 'img',
  },
  status: 'started',
  warnings: [],
  containerProviderConnectionCreation: true,
  detectionChecks: [],
  containerConnections: [
    {
      name: defaultContainerConnectionName,
      displayName: defaultContainerConnectionName,
      status: 'started',
      endpoint: {
        socketPath: 'socket',
      },
      lifecycleMethods: ['start', 'stop', 'delete'],
      type: 'podman',
      vmType: {
        id: 'libkrun',
        name: 'libkrun',
      },
    },
    {
      name: secondaryContainerConnectionName,
      displayName: 'Dummy Secondary Connection',
      status: 'stopped',
      endpoint: {
        socketPath: 'socket',
      },
      lifecycleMethods: ['start', 'stop', 'delete'],
      type: 'podman',
      vmType: {
        id: 'wsl',
        name: 'wsl',
      },
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
  cleanupSupport: false,
};

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

// getOsPlatformMock is needed when using PreferencesResourcesRenderingCopyButton
const getOsPlatformMock = vi.fn().mockResolvedValue('linux');

beforeAll(() => {
  (window.events as unknown) = {
    receive: vi.fn(),
  };
  Object.defineProperty(window, 'telemetryTrack', { value: vi.fn().mockResolvedValue(undefined) });
  Object.defineProperty(window, 'telemetryPage', { value: vi.fn().mockResolvedValue(undefined) });
  Object.defineProperty(window, 'getOsPlatform', { value: getOsPlatformMock });
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

describe('provider connections', () => {
  test('Expect to have two container connection region', () => {
    providerInfos.set([providerInfo]);
    const { getAllByLabelText } = render(PreferencesResourcesRendering, {});

    const statuses = getAllByLabelText('Connection Status');
    expect(statuses.length).toBe(2);
  });

  test('Expect to be start, delete actions enabled and stop, restart disabled when container stopped', async () => {
    providerInfo.containerConnections[0].status = 'stopped';
    providerInfos.set([providerInfo]);
    const { getByRole } = render(PreferencesResourcesRendering, {});

    // get the region containing the content for the default connection
    const region = getByRole('region', { name: defaultContainerConnectionName });

    const startButton = within(region).getByRole('button', { name: 'Start' });
    expect(startButton).toBeInTheDocument();
    expect(!startButton.classList.contains('cursor-not-allowed')).toBeTruthy();
    const stopButton = within(region).getByRole('button', { name: 'Stop' });
    expect(stopButton).toBeInTheDocument();
    expect(stopButton.classList.contains('cursor-not-allowed')).toBeTruthy();
    const restartButton = within(region).getByRole('button', { name: 'Restart' });
    expect(restartButton).toBeInTheDocument();
    expect(restartButton.classList.contains('cursor-not-allowed')).toBeTruthy();
    const deleteButton = within(region).getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeInTheDocument();
    expect(!deleteButton.classList.contains('cursor-not-allowed')).toBeTruthy();
  });

  test('Expect to be start, delete actions disabled and stop, restart enabled when container running', async () => {
    providerInfo.containerConnections[0].status = 'started';
    providerInfos.set([providerInfo]);
    const { getByRole } = render(PreferencesResourcesRendering, {});

    // get the region containing the content for the default connection
    const region = getByRole('region', { name: defaultContainerConnectionName });

    const startButton = within(region).getByRole('button', { name: 'Start' });
    expect(startButton).toBeInTheDocument();
    expect(startButton.classList.contains('cursor-not-allowed')).toBeTruthy();
    const stopButton = within(region).getByRole('button', { name: 'Stop' });
    expect(stopButton).toBeInTheDocument();
    expect(!stopButton.classList.contains('cursor-not-allowed')).toBeTruthy();
    const restartButton = within(region).getByRole('button', { name: 'Restart' });
    expect(restartButton).toBeInTheDocument();
    expect(!restartButton.classList.contains('cursor-not-allowed')).toBeTruthy();
    const deleteButton = within(region).getByRole('button', { name: 'Delete' });
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton.classList.contains('cursor-not-allowed')).toBeTruthy();
  });

  test('Expect type to be reported for Podman engines', async () => {
    providerInfos.set([providerInfo]);

    const { getByRole } = render(PreferencesResourcesRendering, {});

    // get the region containing the content for the default connection
    const region = getByRole('region', { name: defaultContainerConnectionName });

    const typeDiv = within(region).getByLabelText(`${defaultContainerConnectionName} type`);
    expect(typeDiv.textContent).toBe('Podman endpoint');
    const endpointSpan = await vi.waitFor(() => within(region).getByTitle('unix://socket'));
    expect(endpointSpan.textContent).toBe('unix://socket');
    const connectionType = within(region).getByLabelText('Connection Type');
    expect(connectionType.textContent).equal('Libkrun');
  });

  test('Expect type to be reported for Docker engines', async () => {
    providerInfo.containerConnections[0].type = 'docker';
    providerInfos.set([providerInfo]);

    const { getByRole } = render(PreferencesResourcesRendering, {});

    // get the region containing the content for the default connection
    const region = getByRole('region', { name: defaultContainerConnectionName });

    const typeDiv = within(region).getByLabelText(`${defaultContainerConnectionName} type`);
    expect(typeDiv.textContent).toBe('Docker endpoint');
    const endpointSpan = await vi.waitFor(() => within(region).getByTitle('unix://socket'));
    expect(endpointSpan.textContent).toBe('unix://socket');
  });

  test('Expect display name to be used in favor of name when available', async () => {
    providerInfos.set([providerInfo]);

    const { getByRole } = render(PreferencesResourcesRendering, {});

    // get the region containing the content for the default connection
    const region = getByRole('region', { name: secondaryContainerConnectionName });

    const text = within(region).getByText('Dummy Secondary Connection');
    expect(text).toBeDefined();
  });
});

test('Expect to see the no resource message when there is no providers', async () => {
  providerInfos.set([]);
  render(PreferencesResourcesRendering, {});
  const panel = screen.getByLabelText('no-resource-panel');
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
  // telemetry sent
  expect(window.telemetryTrack).toBeCalledWith('createNewProviderConnectionPageRequested', {
    providerId: customProviderInfo.id,
    name: customProviderInfo.name,
  });
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

test('Expect to redirect to onboarding page if setup button is clicked', async () => {
  // clone providerInfo and change id and status
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  customProviderInfo.status = 'not-installed';
  // change name of the provider
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);

  const onboarding: OnboardingInfo = {
    extension: 'id',
    steps: [],
    title: 'onboarding',
    enablement: 'true',
    name: 'foobar',
    displayName: 'FooBar',
    icon: 'data:image/png;base64,foobar',
  };
  onboardingList.set([onboarding]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Setup foo-provider' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);
  // redirect to create new page
  expect(router.goto).toHaveBeenCalledWith(`/preferences/onboarding/id`);
});

test('Expect setup button to appear even if provider status is set to unknown and enablement is true', async () => {
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  customProviderInfo.status = 'unknown';
  customProviderInfo.name = 'foobar';
  providerInfos.set([customProviderInfo]);

  // Onboarding is enabled
  const onboarding: OnboardingInfo = {
    extension: 'id',
    steps: [],
    title: 'onboarding',
    enablement: 'true',
    name: 'foobar',
    displayName: 'FooBar',
    icon: 'data:image/png;base64,foobar',
  };
  onboardingList.set([onboarding]);
  render(PreferencesResourcesRendering, {});

  // Expect the setup button to appear
  const button = screen.getByRole('button', { name: 'Setup foobar' });
  expect(button).toBeInTheDocument();
});

test('Expect to redirect to extension preferences page if onboarding is disabled and the cog button is clicked', async () => {
  // clone providerInfo and change id and status
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  customProviderInfo.status = 'installed';
  // change name of the provider
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);

  configurationProperties.set([
    {
      parentId: 'preferences.id',
      title: 'record',
      placeholder: 'Example: text',
      description: 'record-description',
      extension: {
        id: 'extension',
      },
      hidden: false,
      id: 'extension.format.prop',
      type: 'string',
      format: 'file',
      scope: CONFIGURATION_DEFAULT_SCOPE,
    },
  ]);

  const onboarding: OnboardingInfo = {
    extension: 'id',
    steps: [],
    title: 'onboarding',
    enablement: 'false',
    name: 'foobar',
    displayName: 'FooBar',
    icon: 'data:image/png;base64,foobar',
  };
  onboardingList.set([onboarding]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Setup foo-provider' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);
  // redirect to create new page
  expect(router.goto).toHaveBeenCalledWith('/preferences/default/preferences.id');
});

test('Expect to not have cog icon button if provider has no active onboarding nor configurations', async () => {
  // clone providerInfo and change id and status
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  customProviderInfo.status = 'installed';
  // change name of the provider
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);
  configurationProperties.set([]);

  const onboarding: OnboardingInfo = {
    extension: 'id',
    steps: [],
    title: 'onboarding',
    enablement: 'false',
    name: 'foobar',
    displayName: 'FooBar',
    icon: 'data:image/png;base64,foobar',
  };
  onboardingList.set([onboarding]);
  render(PreferencesResourcesRendering, {});
  const button = screen.queryByRole('button', { name: 'Setup foo-provider' });
  expect(button).not.toBeInTheDocument();
});

test('Expect to not have cog icon button if provider has no onboarding nor configurations', async () => {
  // clone providerInfo and change id and status
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  customProviderInfo.status = 'installed';
  // change name of the provider
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);
  configurationProperties.set([]);

  onboardingList.set([]);
  render(PreferencesResourcesRendering, {});
  const button = screen.queryByRole('button', { name: 'Setup foo-provider' });
  expect(button).not.toBeInTheDocument();
});

test('Expect to redirect to extension onboarding page if onboarding is enabled and the cog button is clicked', async () => {
  // clone providerInfo and change id and status
  const customProviderInfo: ProviderInfo = { ...providerInfo };
  // remove display name
  customProviderInfo.containerProviderConnectionCreationDisplayName = undefined;
  customProviderInfo.status = 'installed';
  // change name of the provider
  customProviderInfo.name = 'foo-provider';
  providerInfos.set([customProviderInfo]);

  const onboarding: OnboardingInfo = {
    extension: 'id',
    steps: [],
    title: 'onboarding',
    enablement: 'true',
    name: 'foobar',
    displayName: 'FooBar',
    icon: 'data:image/png;base64,foobar',
  };
  onboardingList.set([onboarding]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Setup foo-provider' });
  expect(button).toBeInTheDocument();
  await userEvent.click(button);
  // redirect to create new page
  expect(router.goto).toHaveBeenCalledWith('/preferences/onboarding/id');
});
