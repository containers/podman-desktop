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

import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import PreferencesContainerConnectionDetailsSummary from './PreferencesContainerConnectionDetailsSummary.svelte';

const podmanContainerConnection: ProviderContainerConnectionInfo = {
  name: 'connection',
  endpoint: {
    socketPath: 'socket',
  },
  status: 'started',
  type: 'podman',
};

const dockerContainerConnection: ProviderContainerConnectionInfo = {
  name: 'connection',
  endpoint: {
    socketPath: 'socket',
  },
  status: 'started',
  type: 'docker',
};

test('Expect that name, socket and type are displayed for Podman', async () => {
  render(PreferencesContainerConnectionDetailsSummary, {
    containerConnectionInfo: podmanContainerConnection,
  });
  const spanConnection = screen.getByLabelText('connection');
  expect(spanConnection).toBeInTheDocument();
  const spanSocket = screen.getByLabelText('socket');
  expect(spanSocket).toBeInTheDocument();
  const spanType = screen.getByLabelText('podman');
  expect(spanType).toBeInTheDocument();
  expect(spanType.textContent).toBe('Podman');
});

test('Expect that name, socket and type are displayed for Docker', async () => {
  render(PreferencesContainerConnectionDetailsSummary, {
    containerConnectionInfo: dockerContainerConnection,
  });
  const spanConnection = screen.getByLabelText('connection');
  expect(spanConnection).toBeInTheDocument();
  const spanSocket = screen.getByLabelText('socket');
  expect(spanSocket).toBeInTheDocument();
  const spanType = screen.getByLabelText('docker');
  expect(spanType).toBeInTheDocument();
  expect(spanType.textContent).toBe('Docker');
});
