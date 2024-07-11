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

import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import { configurationProperties } from '/@/stores/configurationProperties';
import { providerInfos } from '/@/stores/providers';
import type { ProviderInfo } from '/@api/provider-info';

import OnboardingComponent from './OnboardingComponent.svelte';

const providerInfo: ProviderInfo = {
  id: 'podman',
  name: 'podman',
  images: {
    icon: 'img',
  },
  status: 'started',
  warnings: [],
  containerProviderConnectionCreation: true,
  detectionChecks: [],
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
  installationSupport: false,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: true,
  links: [],
  containerProviderConnectionInitialization: false,
  containerProviderConnectionCreationDisplayName: 'Podman machine',
  kubernetesProviderConnectionInitialization: false,
  extensionId: 'id',
  cleanupSupport: false,
};

async function waitRender(customProperties: any): Promise<void> {
  render(OnboardingComponent, { ...customProperties });
  await tick();
}

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();
  (window as any).getOsMemory = vi.fn();
  (window as any).getOsCpu = vi.fn();
  (window as any).getOsFreeDiskSize = vi.fn();
  (window as any).getCancellableTokenSource = vi.fn();
  (window as any).auditConnectionParameters = vi.fn();
  (window as any).telemetryTrack = vi.fn();

  Object.defineProperty(window, 'matchMedia', {
    value: () => {
      return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
      };
    },
  });
});

test('Expect to find PreferencesConnectionCreationRendering component if step includes "create" component', async () => {
  configurationProperties.set([]);
  providerInfos.set([providerInfo]);
  await waitRender({
    component: 'createContainerProviderConnection',
    extensionId: 'id',
  });

  const title = screen.getAllByRole('heading', { name: 'title' });
  expect(title[0].textContent).equal('Create a Podman machine');
});

test('Expect to find "not supported" message if step includes a component not supported by the provider', async () => {
  const customProviderInfo = providerInfo;
  customProviderInfo.containerProviderConnectionCreation = false;
  configurationProperties.set([]);
  providerInfos.set([customProviderInfo]);
  await waitRender({
    component: 'createContainerProviderConnection',
    extensionId: 'id',
  });

  const div = screen.getByLabelText('not supported warning');
  expect(div).toBeInTheDocument();
  expect(div.textContent).toContain(
    'This extension does not provide a component of type "createContainerProviderConnection"',
  );
});
