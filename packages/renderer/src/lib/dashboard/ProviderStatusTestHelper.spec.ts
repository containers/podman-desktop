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

import type { ProviderInfo } from '@desktop-framework/api';
import type { ProviderStatus } from '@desktop-framework/extension-api';
import { render, screen, waitFor } from '@testing-library/svelte';
import type { Component } from 'svelte';
import { expect, test } from 'vitest';

import { type InitializationContext, InitializeAndStartMode } from '/@/lib/dashboard/ProviderInitUtils';

export async function verifyStatus<
  C extends Component<{ provider: ProviderInfo; initializationContext: InitializationContext }>,
>(component: C, status: ProviderStatus, sameVersions: boolean, expectedDisabled?: boolean): Promise<void> {
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
    vmConnections: [],
    vmProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
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
    canStart: false,
    canStop: false,
  };

  const initializationContext: InitializationContext = { mode: InitializeAndStartMode };
  render<Component<{ provider: ProviderInfo; initializationContext: InitializationContext }>>(component, {
    provider: provider,
    initializationContext: initializationContext,
  });

  await waitFor(() => {
    const updateButton = screen.queryByRole('button', { name: 'Update to 1.0.1' });
    if (sameVersions) {
      expect(updateButton).not.toBeInTheDocument();
    } else {
      expect(updateButton).toBeInTheDocument();
      if (expectedDisabled !== undefined) {
        if (expectedDisabled) {
          expect(updateButton).toBeDisabled();
        } else {
          expect(updateButton).toBeEnabled();
        }
      }
    }
  });
}

test('vitest does not accept helper files without a test', () => {
  expect(true).toBeTruthy();
});
