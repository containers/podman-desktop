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

import '@testing-library/jest-dom';
import { beforeAll, test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ProviderInstalled from '/@/lib/dashboard/ProviderInstalled.svelte';
import type {ProviderInfo} from '../../../../main/src/plugin/api/provider-info';


// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect installed provider shows button', async () => {
  const provider: ProviderInfo = {
    containerConnections: [],
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: false,
    detectionChecks: [],
    id: 'providerid',
    images: undefined,
    installationSupport: false,
    internalId: 'providerid',
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    kubernetesProviderConnectionInitialization: false,
    links: [],
    name: 'Provider',
    status: 'installed',
    warnings: [],
  };

  //eslint-disable-next-line @typescript-eslint/no-empty-function
  render(ProviderInstalled, { provider: provider, updateInitializationMode: () => {}});

  // get by title
  const firstExtension = screen.getByTitle('This is FooBar description');
  expect(firstExtension).toBeInTheDocument();
});
