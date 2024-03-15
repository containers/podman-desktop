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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';

import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { providerInfos } from '../../stores/providers';
import PreferencesKubernetesConnectionRendering from './PreferencesKubernetesConnectionRendering.svelte';

test('Expect that removing the connection is going back to the previous page', async () => {
  const kindCluster1 = 'kind cluster 1';
  const kindCluster2 = 'kind cluster 2';
  const kindCluster3 = 'kind cluster 3';

  const routerGotoSpy = vi.spyOn(router, 'goto');

  const deleteMock = vi.fn();
  (window as any).deleteProviderConnectionLifecycle = deleteMock;

  const providerInfo: ProviderInfo = {
    id: 'kind',
    name: 'kind',
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
    kubernetesConnections: [
      {
        name: kindCluster1,
        status: 'started',
        endpoint: {
          apiURL: 'http://localhost:8080',
        },
      },
      {
        name: kindCluster2,
        status: 'stopped',
        endpoint: {
          apiURL: 'http://localhost:8181',
        },
        lifecycleMethods: ['delete'],
      },
      {
        name: kindCluster3,
        status: 'started',
        endpoint: {
          apiURL: 'http://localhost:8282',
        },
      },
    ],
    kubernetesProviderConnectionCreation: true,
    links: [],
    containerProviderConnectionInitialization: false,
    containerProviderConnectionCreationDisplayName: 'Podman machine',
    kubernetesProviderConnectionInitialization: false,
    extensionId: '',
    cleanupSupport: false,
  };

  // 3 connections with the same socket path
  providerInfos.set([providerInfo]);

  // encode apiUrl of the second cluster
  const apiUrlBase64 = Buffer.from('http://localhost:8181').toString('base64');

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // delete current cluster 2 from the provider info
  deleteMock.mockImplementation(() => {
    providerInfos.update(providerInfos =>
      providerInfos.map(provider => {
        provider.kubernetesConnections = provider.kubernetesConnections.filter(
          kubeConnection => kubeConnection.name !== kindCluster2,
        );
        return provider;
      }),
    );
  });

  render(PreferencesKubernetesConnectionRendering, {
    apiUrlBase64,
    providerInternalId: '0',
  });

  // expect to have the second machine being displayed (and not the first one that also match socket path)
  const title = screen.getByRole('heading', { name: 'kind cluster 2', level: 1 });
  expect(title).toBeInTheDocument();

  // ok now we delete the connection
  const deleteButton = screen.getByRole('button', { name: 'Delete' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  // click on it
  await userEvent.click(deleteButton);

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});

test('Expect to see error message if action fails', async () => {
  const apiURL = 'http://localhost:8081';
  const kindCluster = 'kind cluster';

  const deleteMock = vi.fn();
  (window as any).deleteProviderConnectionLifecycle = deleteMock;

  const providerInfo: ProviderInfo = {
    id: 'kind',
    name: 'kind',
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
    kubernetesConnections: [
      {
        name: kindCluster,
        status: 'stopped',
        endpoint: {
          apiURL,
        },
        lifecycleMethods: ['delete'],
      },
    ],
    kubernetesProviderConnectionCreation: true,
    links: [],
    containerProviderConnectionInitialization: false,
    containerProviderConnectionCreationDisplayName: 'Podman machine',
    kubernetesProviderConnectionInitialization: false,
    extensionId: '',
    cleanupSupport: false,
  };

  providerInfos.set([providerInfo]);

  // encode apiUrl of the second cluster
  const apiUrlBase64 = Buffer.from(apiURL).toString('base64');

  // simulate that the delete action fails
  deleteMock.mockRejectedValue('failed to delete machine');

  render(PreferencesKubernetesConnectionRendering, {
    apiUrlBase64,
    providerInternalId: '0',
  });

  // expect to have the machine title being displayed
  const title = screen.getByRole('heading', { name: 'kind cluster', level: 1 });
  expect(title).toBeInTheDocument();

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
