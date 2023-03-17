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

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PreferencesResourcesRendering from './PreferencesResourcesRendering.svelte';
import { providerInfos } from '../../stores/providers';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

const providerInfo: ProviderInfo = {
  id: 'podman',
  name: 'podman',
  images: {
    icon: 'img',
  },
  status: 'started',
  warnings: undefined,
  containerProviderConnectionCreation: true,
  detectionChecks: undefined,
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
  installationSupport: undefined,
  internalId: '0',
  kubernetesConnections: [],
  kubernetesProviderConnectionCreation: true,
  links: undefined,
};

beforeEach(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: vi.fn(),
  };
});

test('Expect to see elements regarding podman provider', async () => {
  providerInfos.set([providerInfo]);
  render(PreferencesResourcesRendering, {});
  const button = screen.getByRole('button', { name: 'Create new podman machine' });
  expect(button).toBeInTheDocument();
});

test('Expect to be start, delete actions enabled and stop, restart disabled when container stopped', async () => {
  providerInfo.containerConnections[0].status = 'stopped';
  providerInfos.set([providerInfo]);
  render(PreferencesResourcesRendering, {});
  const startButton = screen.getByRole('button', { name: 'Start' });
  expect(startButton).toBeInTheDocument();
  expect(!startButton.classList.contains('cursor-not-allowed'));
  const stopButton = screen.getByRole('button', { name: 'Stop' });
  expect(stopButton).toBeInTheDocument();
  expect(stopButton.classList.contains('cursor-not-allowed'));
  const restartButton = screen.getByRole('button', { name: 'Restart' });
  expect(restartButton).toBeInTheDocument();
  expect(restartButton.classList.contains('cursor-not-allowed'));
  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(!deleteButton.classList.contains('cursor-not-allowed'));
});

test('Expect to be start, delete actions disabled and stop, restart enabled when container running', async () => {
  providerInfo.containerConnections[0].status = 'started';
  providerInfos.set([providerInfo]);
  render(PreferencesResourcesRendering, {});
  const startButton = screen.getByRole('button', { name: 'Start' });
  expect(startButton).toBeInTheDocument();
  expect(startButton.classList.contains('cursor-not-allowed'));
  const stopButton = screen.getByRole('button', { name: 'Stop' });
  expect(stopButton).toBeInTheDocument();
  expect(!stopButton.classList.contains('cursor-not-allowed'));
  const restartButton = screen.getByRole('button', { name: 'Restart' });
  expect(restartButton).toBeInTheDocument();
  expect(!restartButton.classList.contains('cursor-not-allowed'));
  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeInTheDocument();
  expect(deleteButton.classList.contains('cursor-not-allowed'));
});
