/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { KubernetesObject } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { readable } from 'svelte/store';
import type { TinroRouteMeta } from 'tinro';
import { beforeAll, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';
import type { ContributionInfo } from '/@api/contribution-info';
import type { ContextGeneralState } from '/@api/kubernetes-contexts-states';
import type { ForwardConfig } from '/@api/kubernetes-port-forward-model';

import { AppearanceSettings } from '../../main/src/plugin/appearance-settings';
import AppNavigation from './AppNavigation.svelte';
import { onDidChangeConfiguration } from './stores/configurationProperties';
import { contributions } from './stores/contribs';
import { fetchNavigationRegistries } from './stores/navigation/navigation-registry';

const eventsMock = vi.fn();

const callbacks = new Map<string, (arg: unknown) => void>();

vi.mock('/@/stores/kubernetes-contexts-state', async () => {
  return {};
});

// fake the window object
beforeAll(() => {
  Object.defineProperty(window, 'events', { value: eventsMock });
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn() });
  Object.defineProperty(window, 'sendNavigationItems', { value: vi.fn() });
  onDidChangeConfiguration.addEventListener = vi.fn().mockImplementation((message: string, callback: () => void) => {
    callbacks.set(message, callback);
  });
});

test('Test rendering of the navigation bar with empty items', async (_arg: unknown) => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  // mock no kubernetes resources
  vi.mocked(kubeContextStore).kubernetesCurrentContextDeployments = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextServices = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextIngresses = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextRoutes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextNodes = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextConfigMaps = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextSecrets = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPersistentVolumeClaims = readable<KubernetesObject[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable<ForwardConfig[]>([]);
  vi.mocked(kubeContextStore).kubernetesCurrentContextState = readable<ContextGeneralState>({} as ContextGeneralState);

  // init navigation registry
  await fetchNavigationRegistries();

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

  const kubernetes = screen.queryByRole('link', { name: 'Kubernetes' });
  expect(kubernetes).toBeInTheDocument();
});

test('Test contributions', () => {
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  contributions.set([
    {
      id: 'dashboard-tab',
      name: 'foo1',
      extensionId: 'my.extension1',
    } as unknown as ContributionInfo,
    {
      id: 'dashboard-tab',
      name: 'foo2',
      extensionId: 'my.extension2',
    } as unknown as ContributionInfo,
  ]);

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });
});

test('NAV_BAR_LAYOUT updates on configuration change', async () => {
  const NAV_BAR_LAYOUT = `${AppearanceSettings.SectionName}.${AppearanceSettings.NavigationAppearance}`;
  const meta = {
    url: '/',
  } as unknown as TinroRouteMeta;

  // init navigation registry
  await fetchNavigationRegistries();

  render(AppNavigation, {
    meta,
    exitSettingsCallback: () => {},
  });
  await tick();

  callbacks.get(NAV_BAR_LAYOUT)?.({ detail: { key: NAV_BAR_LAYOUT, value: AppearanceSettings.IconAndTitle } });
  await tick();
  expect(screen.getByLabelText('Dashboard title')).toBeInTheDocument();
  expect(screen.getByRole('navigation')).toHaveClass('min-w-fit');

  callbacks.get(NAV_BAR_LAYOUT)?.({ detail: { key: NAV_BAR_LAYOUT, value: AppearanceSettings.Icon } });
  await tick();
  expect(screen.queryByLabelText('Dashboard title')).not.toBeInTheDocument();
  expect(screen.getByRole('navigation')).toHaveClass('min-w-leftnavbar');
});
