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
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ExtensionStatus from './ExtensionStatus.svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

test('Expect green text and icon when connection is running', async () => {
  render(ExtensionStatus, { status: 'started' });
  const icon = screen.getByLabelText('connection-status-icon');
  const label = screen.getByLabelText('connection-status-label');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-green-500');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-green-500');
  expect(label).toHaveTextContent('ENABLED');
});

test('Expect green text and icon when connection is starting', async () => {
  render(ExtensionStatus, { status: 'starting' });
  const icon = screen.getByLabelText('connection-status-icon');
  const label = screen.getByLabelText('connection-status-label');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-green-500');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-green-500');
  expect(label).toHaveTextContent('ENABLING');
});

test('Expect green text and icon when connection is stopped', async () => {
  render(ExtensionStatus, { status: 'stopped' });
  const icon = screen.getByLabelText('connection-status-icon');
  const label = screen.getByLabelText('connection-status-label');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-gray-900');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-gray-900');
  expect(label).toHaveTextContent('DISABLED');
});

test('Expect green text and icon when connection is stopping', async () => {
  render(ExtensionStatus, { status: 'stopping' });
  const icon = screen.getByLabelText('connection-status-icon');
  const label = screen.getByLabelText('connection-status-label');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-red-500');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-red-500');
  expect(label).toHaveTextContent('DISABLING');
});

test('Expect green text and icon when connection is unknown', async () => {
  render(ExtensionStatus, { status: 'unknown' });
  const icon = screen.getByLabelText('connection-status-icon');
  const label = screen.getByLabelText('connection-status-label');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-gray-900');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-gray-900');
  expect(label).toHaveTextContent('UNKNOWN');
});
