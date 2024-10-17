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

import ExtensionStatus from './ExtensionStatus.svelte';

const extensionStatusLabel = 'Extension Status Label';
const extensionStatusIcon = 'Extension Status Icon';

test('Expect green text and icon when extension is running', async () => {
  render(ExtensionStatus, { status: 'started' });
  const icon = screen.getByLabelText(extensionStatusIcon);
  const label = screen.getByLabelText(extensionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-running)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-running)]');
  expect(label).toHaveTextContent('ACTIVE');
});

test('Expect green text and icon when extension is starting', async () => {
  render(ExtensionStatus, { status: 'starting' });
  const icon = screen.getByLabelText(extensionStatusIcon);
  const label = screen.getByLabelText(extensionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-starting)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-starting)]');
  expect(label).toHaveTextContent('ACTIVATING');
});

test('Expect green text and icon when extension is stopped', async () => {
  render(ExtensionStatus, { status: 'stopped' });
  const icon = screen.getByLabelText(extensionStatusIcon);
  const label = screen.getByLabelText(extensionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-stopped)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-stopped)]');
  expect(label).toHaveTextContent('DISABLED');
});

test('Expect green text and icon when extension is stopping', async () => {
  render(ExtensionStatus, { status: 'stopping' });
  const icon = screen.getByLabelText(extensionStatusIcon);
  const label = screen.getByLabelText(extensionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-terminated)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-terminated)]');
  expect(label).toHaveTextContent('DISABLING');
});
test('Expect green text and icon when extension is unknown', async () => {
  render(ExtensionStatus, { status: 'unknown' });
  const icon = screen.getByLabelText(extensionStatusIcon);
  const label = screen.getByLabelText(extensionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-status-unknown)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-unknown)]');
  expect(label).toHaveTextContent('UNKNOWN');
});

test('Expect purple text and icon when extension is downloadable', async () => {
  render(ExtensionStatus, { status: 'downloadable' });
  const icon = screen.getByLabelText(extensionStatusIcon);
  const label = screen.getByLabelText(extensionStatusLabel);
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('bg-[var(--pd-notification-dot)]');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('text-[var(--pd-status-ready)]');
  expect(label).toHaveTextContent('DOWNLOADABLE');
});
