/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { ProviderStatus } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import type { ProviderInfo } from '/@api/provider-info';

import ProviderWidgetStatus from './ProviderWidgetStatus.svelte';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

const providerMock = {
  name: 'provider1',
  containerConnections: [],
  kubernetesConnections: [],
  status: 'ready' as ProviderStatus,
  images: {},
} as unknown as ProviderInfo;

test('Expect to have different status icon based on provider status', async () => {
  const renderObject = render(ProviderWidgetStatus, { entry: providerMock });

  let statusIcon = screen.getByLabelText('Connection Status Icon');
  expect(statusIcon).toBeInTheDocument();
  expect(statusIcon).toHaveClass('fa-regular fa-circle-check');

  providerMock.status = 'error';
  await renderObject.rerender({ entry: providerMock });
  expect(statusIcon).toBeInTheDocument();
  expect(statusIcon).toHaveClass('fa-regular fa-circle-xmark');

  providerMock.status = 'unknown';
  await renderObject.rerender({ entry: providerMock });
  expect(statusIcon).toBeInTheDocument();
  expect(statusIcon).toHaveClass('fa-regular fa-circle-question');

  providerMock.status = 'stopping';
  await renderObject.rerender({ entry: providerMock });
  statusIcon = screen.getByLabelText('Connection Status Icon');
  expect(statusIcon).toBeInTheDocument();
  expect(statusIcon).toHaveClass(
    'animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent',
  );
});
