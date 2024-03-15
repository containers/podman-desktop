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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import ProviderStatus from './ProviderStatus.svelte';

const connectionStatusLabel = 'Connection Status Label';
const connectionStatusIcon = 'Connection Status Icon';

test('Expect green text and icon when connection is running', async () => {
  render(ProviderStatus, { status: 'started' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-green-500');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-green-500');
  expect(label).toHaveTextContent('RUNNING');
});

test('Expect green text and icon when connection is starting', async () => {
  render(ProviderStatus, { status: 'starting' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-green-500');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-green-500');
  expect(label).toHaveTextContent('STARTING');
});

test('Expect green text and icon when connection is stopped', async () => {
  render(ProviderStatus, { status: 'stopped' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-gray-900');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-gray-900');
  expect(label).toHaveTextContent('STOPPED');
});

test('Expect green text and icon when connection is stopping', async () => {
  render(ProviderStatus, { status: 'stopping' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-red-500');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-red-500');
  expect(label).toHaveTextContent('STOPPING');
});

test('Expect green text and icon when connection is unknown', async () => {
  render(ProviderStatus, { status: 'unknown' });
  const icon = screen.getByLabelText(connectionStatusIcon);
  const label = screen.getByLabelText(connectionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-gray-900');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-gray-900');
  expect(label).toHaveTextContent('UNKNOWN');
});
