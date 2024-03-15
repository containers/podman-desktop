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
import { expect, test } from 'vitest';

import type { ProviderKubernetesConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesKubernetesConnectionDetailsSummary from './PreferencesKubernetesConnectionDetailsSummary.svelte';

const kubernetesConnection: ProviderKubernetesConnectionInfo = {
  name: 'connection',
  endpoint: {
    apiURL: 'url',
  },
  status: 'started',
};

test('Expect that name, url and kubernetes are displayed', async () => {
  render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: kubernetesConnection,
  });
  const spanConnection = screen.getByLabelText('connection');
  expect(spanConnection).toBeInTheDocument();
  const spanUrl = screen.getByLabelText('url');
  expect(spanUrl).toBeInTheDocument();
  const kubernetes = screen.getByLabelText('kubernetes');
  expect(kubernetes).toBeInTheDocument();
  expect(kubernetes.textContent).toBe('Kubernetes');
});
