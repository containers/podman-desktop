/**********************************************************************
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
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';

import type { ProviderInfo } from '@desktop-framework/api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';

import * as preferencesConnectionActions from './PreferencesConnectionActions.svelte';
import PreferencesVmConnectionRendering from './PreferencesVmConnectionRendering.svelte';
import type { IConnectionRestart } from './Util';

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.showMessageBox).mockResolvedValue({
    response: 'Delete',
  });
});

test('Expect that removing the connection is going back to the previous page', async () => {
  const vm1 = 'vm 1';
  const vm2 = 'vm 2';
  const vm3 = 'vm 3';

  const routerGotoSpy = vi.spyOn(router, 'goto');

  const providerInfo: ProviderInfo = {
    id: 'vmprovider',
    name: 'vmp',
    images: {
      icon: 'img',
    },
    status: 'started',
    warnings: [],
    containerProviderConnectionCreation: true,
    detectionChecks: [],
    containerConnections: [],
    installationSupport: false,
    internalId: '0',
    vmConnections: [
      {
        connectionType: 'vm',
        name: vm1,
        status: 'started',
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: false,
      },
      {
        connectionType: 'vm',
        name: vm2,
        status: 'stopped',
        lifecycleMethods: ['delete'],
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: true,
      },
      {
        connectionType: 'vm',
        name: vm3,
        status: 'started',
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: false,
      },
    ],
    vmProviderConnectionCreation: true,
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
    links: [],
    containerProviderConnectionInitialization: false,
    containerProviderConnectionCreationDisplayName: 'Podman machine',
    kubernetesProviderConnectionInitialization: false,
    extensionId: '',
    cleanupSupport: false,
    canStart: false,
    canStop: false,
  };

  providerInfos.set([providerInfo]);

  // delete current vm 2 from the provider info
  vi.mocked(window.deleteProviderConnectionLifecycle).mockImplementation(async () => {
    providerInfos.update(providerInfos =>
      providerInfos.map(provider => {
        provider.vmConnections = provider.vmConnections.filter(vmConnection => vmConnection.name !== vm2);
        return provider;
      }),
    );
  });

  render(PreferencesVmConnectionRendering, {
    providerInternalId: '0',
    connectionName: 'vm 2',
  });

  // expect to have the second machine being displayed
  screen.getByRole('heading', { name: 'vm 2', level: 1 });

  // ok now we delete the connection
  const deleteButton = screen.getByRole('button', { name: 'Delete' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  // click on it
  await userEvent.click(deleteButton);

  // expect that we have called the router when page has been removed
  // to jump to the resources page
  expect(routerGotoSpy).toBeCalledWith('/preferences/resources');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/preferences/resources');
});

test('Expect to see error message if action fails', async () => {
  const vm1 = 'vm 1';

  const providerInfo: ProviderInfo = {
    id: 'vmprovider',
    name: 'vmp',
    images: {
      icon: 'img',
    },
    status: 'started',
    warnings: [],
    containerProviderConnectionCreation: true,
    detectionChecks: [],
    containerConnections: [],
    installationSupport: false,
    internalId: '0',
    vmConnections: [
      {
        connectionType: 'vm',
        name: vm1,
        status: 'stopped',
        lifecycleMethods: ['delete'],
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: true,
      },
    ],
    vmProviderConnectionCreation: true,
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
    links: [],
    containerProviderConnectionInitialization: false,
    containerProviderConnectionCreationDisplayName: 'Podman machine',
    kubernetesProviderConnectionInitialization: false,
    extensionId: '',
    cleanupSupport: false,
    canStart: false,
    canStop: false,
  };

  providerInfos.set([providerInfo]);

  // simulate that the delete action fails
  vi.mocked(window.deleteProviderConnectionLifecycle).mockRejectedValue('failed to delete machine');

  render(PreferencesVmConnectionRendering, {
    connectionName: 'vm 1',
    providerInternalId: '0',
  });

  // expect to have the machine title being displayed
  screen.getByRole('heading', { name: 'vm 1', level: 1 });

  let deleteFailedButton = screen.queryByRole('button', { name: 'delete failed' });

  // expect that the delete failed button is not in the page
  expect(deleteFailedButton).not.toBeInTheDocument();

  // ok now we delete the connection
  const deleteButton = screen.getByRole('button', { name: 'Delete' });

  // click on it
  await userEvent.click(deleteButton);

  deleteFailedButton = screen.getByRole('button', { name: 'delete failed' });

  // expect to see the delete failed button
  expect(deleteFailedButton).toBeInTheDocument();
});

test('startProviderConnectionLifecycle is called when addConnectionToRestartingQueue is called by sub-component', async () => {
  vi.spyOn(preferencesConnectionActions, 'default');
  const providerInfo: ProviderInfo = {
    id: 'vmprovider',
    name: 'vmp',
    images: {
      icon: 'img',
    },
    status: 'started',
    warnings: [],
    containerProviderConnectionCreation: true,
    detectionChecks: [],
    containerConnections: [],
    installationSupport: false,
    internalId: '0',
    vmConnections: [
      {
        connectionType: 'vm',
        name: 'vm 1',
        status: 'stopped',
        lifecycleMethods: ['delete'],
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: false,
      },
    ],
    vmProviderConnectionCreation: true,
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
    links: [],
    containerProviderConnectionInitialization: false,
    containerProviderConnectionCreationDisplayName: 'Podman machine',
    kubernetesProviderConnectionInitialization: false,
    extensionId: '',
    cleanupSupport: false,
    canStart: false,
    canStop: false,
  };

  providerInfos.set([providerInfo]);
  render(PreferencesVmConnectionRendering, {
    connectionName: 'vm 1',
    providerInternalId: '0',
  });

  // simulate PreferencesConnectionActions is calling addConnectionToRestartingQueue
  expect(preferencesConnectionActions.default).toHaveBeenCalledOnce();
  const params = vi.mocked(preferencesConnectionActions.default).mock.calls[0][1];
  assert(params);
  const addConnectionToRestartingQueue = params['addConnectionToRestartingQueue'];

  addConnectionToRestartingQueue({
    loggerHandlerKey: (): void => {},
  } as unknown as IConnectionRestart);

  providerInfo.vmConnections[0].status = 'started';
  providerInfos.set([providerInfo]);
  expect(window.startProviderConnectionLifecycle).toHaveBeenCalledOnce();
});

test('connectionInfo passed to startProviderConnectionLifecycle survives structuredClone (IPC guard)', async () => {
  vi.spyOn(preferencesConnectionActions, 'default');
  const providerInfo: ProviderInfo = {
    id: 'vmprovider',
    name: 'vmp',
    images: {
      icon: 'img',
    },
    status: 'started',
    warnings: [],
    containerProviderConnectionCreation: true,
    detectionChecks: [],
    containerConnections: [],
    installationSupport: false,
    internalId: '0',
    vmConnections: [
      {
        connectionType: 'vm',
        name: 'vm 1',
        status: 'stopped',
        lifecycleMethods: ['delete'],
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: false,
      },
    ],
    vmProviderConnectionCreation: true,
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
    links: [],
    containerProviderConnectionInitialization: false,
    containerProviderConnectionCreationDisplayName: 'Podman machine',
    kubernetesProviderConnectionInitialization: false,
    extensionId: '',
    cleanupSupport: false,
    canStart: false,
    canStop: false,
  };

  providerInfos.set([providerInfo]);
  render(PreferencesVmConnectionRendering, {
    connectionName: 'vm 1',
    providerInternalId: '0',
  });

  expect(preferencesConnectionActions.default).toHaveBeenCalledOnce();
  const params = vi.mocked(preferencesConnectionActions.default).mock.calls[0][1];
  assert(params);
  const addConnectionToRestartingQueue = params['addConnectionToRestartingQueue'];

  addConnectionToRestartingQueue({
    loggerHandlerKey: (): void => {},
  } as unknown as IConnectionRestart);

  providerInfo.vmConnections[0].status = 'started';
  providerInfos.set([providerInfo]);
  expect(window.startProviderConnectionLifecycle).toHaveBeenCalledOnce();

  const passedConnectionInfo = vi.mocked(window.startProviderConnectionLifecycle).mock.calls[0][1];
  expect(() => structuredClone(passedConnectionInfo)).not.toThrow();
});
