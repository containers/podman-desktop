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
import { beforeAll, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import AppNavigation from './AppNavigation.svelte';
import type { TinroRouteMeta } from 'tinro';
import { kubernetesContexts } from './stores/kubernetes-contexts';

const eventsMock = vi.fn();
const getConfigurationValueMock = vi.fn();

// fake the window object
beforeAll(() => {
  (window as any).events = eventsMock;
  (window as any).getConfigurationValue = getConfigurationValueMock;
});

test('Test rendering of the navigation bar with empty items', () => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  const navigationBar = screen.getByRole('navigation', { name: 'AppNavigation' });
  expect(navigationBar).toBeInTheDocument();

  const dasboard = screen.getByRole('link', { name: 'Dashboard' });
  expect(dasboard).toBeInTheDocument();
  const containers = screen.getByRole('link', { name: 'Containers' });
  expect(containers).toBeInTheDocument();
  const pods = screen.getByRole('link', { name: 'Pods' });
  expect(pods).toBeInTheDocument();
  const images = screen.getByRole('link', { name: 'Images' });
  expect(images).toBeInTheDocument();
  const volumes = screen.getByRole('link', { name: 'Volumes' });
  expect(volumes).toBeInTheDocument();
  const settings = screen.getByRole('link', { name: 'Settings' });
  expect(settings).toBeInTheDocument();

  const deployments = screen.queryByRole('link', { name: 'Deployments' });
  expect(deployments).not.toBeInTheDocument();
  const services = screen.queryByRole('link', { name: 'Services' });
  expect(services).not.toBeInTheDocument();
});

test('Test Kubernetes experimental hidden with valid context', async () => {
  kubernetesContexts.set([
    {
      name: 'context-name',
      cluster: 'cluster-name',
      user: 'user-name',
      clusterInfo: {
        name: 'cluster-name',
        server: 'https://server-name',
      },
    },
  ]);
  getConfigurationValueMock.mockResolvedValue(false);

  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  const navigationBar = screen.getByRole('navigation', { name: 'AppNavigation' });
  expect(navigationBar).toBeInTheDocument();

  // wait 100ms for stores to initialize
  await new Promise(resolve => setTimeout(resolve, 100));

  const deployments = screen.queryByRole('link', { name: 'Deployments' });
  expect(deployments).not.toBeInTheDocument();
  const services = screen.queryByRole('link', { name: 'Services' });
  expect(services).not.toBeInTheDocument();
});

test('Test Kubernetes experimental enablement', async () => {
  kubernetesContexts.set([
    {
      name: 'context-name',
      cluster: 'cluster-name',
      user: 'user-name',
      clusterInfo: {
        name: 'cluster-name',
        server: 'https://server-name',
      },
    },
  ]);
  getConfigurationValueMock.mockResolvedValue(true);

  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });

  const navigationBar = screen.getByRole('navigation', { name: 'AppNavigation' });
  expect(navigationBar).toBeInTheDocument();

  // wait 100ms for stores to initialize
  await new Promise(resolve => setTimeout(resolve, 100));

  const deployments = screen.getByRole('link', { name: 'Deployments' });
  expect(deployments).toBeInTheDocument();
  const services = screen.getByRole('link', { name: 'Services' });
  expect(services).toBeInTheDocument();
});
