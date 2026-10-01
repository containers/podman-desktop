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
import StatusDotIcon from './StatusDotIcon.svelte';

test.each([
  ['started', 'Installed', 'text-(--pd-status-running)', 'running'],
  ['stopping', 'Disabling', 'text-(--pd-status-waiting)', 'waiting'],
  ['failed', 'Failed', 'text-(--pd-status-terminated)', 'terminated'],
])('renders extension state %s as %s', (status, label, labelClass, icon) => {
  const statusRender = render(ExtensionStatus, { status });

  expect(screen.getByText(label)).toHaveClass(labelClass);
  const renderedIcon = statusRender.container.querySelector('[data-testid="status-dot-icon"]');
  expect(renderedIcon).toHaveAttribute('aria-hidden', 'true');
  expect(renderedIcon).not.toHaveAttribute('role');
  expect(renderedIcon).not.toHaveAttribute('aria-label');

  const expectedIcon = render(StatusDotIcon, { status: icon }).container.querySelector(
    '[data-testid="status-dot-icon"]',
  );
  expect(renderedIcon?.querySelector('path')).toHaveAttribute(
    'd',
    expectedIcon?.querySelector('path')?.getAttribute('d'),
  );
});

test('preserves the downloadable presentation', () => {
  render(ExtensionStatus, { status: 'downloadable' });

  expect(screen.getByText('DOWNLOADABLE')).toHaveClass('font-bold', 'text-[9px]', 'text-(--pd-status-ready)');
  expect(screen.getByTestId('status-dot-icon').querySelector('path')).toHaveAttribute(
    'fill',
    'var(--pd-notification-dot)',
  );
});

test('renders unsupported states with the unknown presentation', () => {
  render(ExtensionStatus, { status: 'unexpected' });

  expect(screen.getByText('Unexpected')).toHaveClass('text-(--pd-status-unknown)');
});

test('provides an accessible status locator and forwards HTML attributes', () => {
  render(ExtensionStatus, {
    status: 'started',
    class: 'custom-class',
    title: 'Extension status title',
    'data-source': 'extension',
  });

  const status = screen.getByRole('status', { name: 'Extension status' });
  expect(status).toHaveClass('custom-class');
  expect(status).toHaveAttribute('title', 'Extension status title');
  expect(status).toHaveAttribute('data-source', 'extension');
});
