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

import type { ProviderStatus } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import type { ComponentProps, SvelteComponent } from 'svelte';
import type Svelte from 'svelte';
import { expect, test } from 'vitest';

import { InitializeAndStartMode } from '/@/lib/dashboard/ProviderInitUtils';
import type { ProviderInfo } from '/@api/provider-info';

type SComponentType<C> = C extends Svelte.SvelteComponent ? Svelte.ComponentType<C> : C;

type SvelteComponentOptions<C extends SvelteComponent> = ComponentProps<C> | { props: ComponentProps<C> };

export function verifyStatus<C extends SvelteComponent>(
  component: SComponentType<C>,
  status: ProviderStatus,
  sameVersions: boolean,
): void {
  const provider: ProviderInfo = {
    containerConnections: [],
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: false,
    detectionChecks: [],
    id: 'myproviderid',
    images: {},
    installationSupport: false,
    internalId: 'myproviderid',
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    kubernetesProviderConnectionInitialization: false,
    links: [],
    name: 'MyProvider',
    status: status,
    warnings: [],
    version: '1.0.0',
    updateInfo: {
      version: sameVersions ? '1.0.0' : '1.0.1',
    },
    extensionId: '',
    cleanupSupport: false,
  };

  const initializationContext = { mode: InitializeAndStartMode };
  render(component, {
    provider: provider,
    initializationContext: initializationContext,
  } as unknown as SvelteComponentOptions<C>);

  const updateButton = screen.queryByRole('button', { name: 'Update to 1.0.1' });
  if (sameVersions) {
    expect(updateButton).not.toBeInTheDocument();
  } else {
    expect(updateButton).toBeInTheDocument();
  }
}

test('vitest does not accept helper files without a test', () => {
  expect(true).toBeTruthy();
});
