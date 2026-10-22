/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import StatusDotIcon from './StatusDotIcon.svelte';

const allStatuses = [
  'running',
  'terminated',
  'waiting',
  'stopped',
  'paused',
  'exited',
  'dead',
  'created',
  'degraded',
  'downloadable',
];

test.each(allStatuses)('Expect SVG icon to render for %s status', (status: string) => {
  render(StatusDotIcon, { status });
  const svg = screen.getByTestId('status-dot-icon');
  expect(svg).toBeInTheDocument();
  expect(svg.tagName.toLowerCase()).toBe('svg');
});

test.each(allStatuses)('Expect correct aria-label for %s status', (status: string) => {
  render(StatusDotIcon, { status });
  const svg = screen.getByTestId('status-dot-icon');
  const expected = status.charAt(0).toUpperCase() + status.slice(1);
  expect(svg).toHaveAttribute('aria-label', expected);
});

test.each(allStatuses)('Expect role="img" for %s status', (status: string) => {
  render(StatusDotIcon, { status });
  const svg = screen.getByTestId('status-dot-icon');
  expect(svg).toHaveAttribute('role', 'img');
});

test.each(allStatuses.filter(status => status !== 'downloadable'))(
  'Expect correct fill color for %s status',
  (status: string) => {
    render(StatusDotIcon, { status });
    const svg = screen.getByTestId('status-dot-icon');
    const path = svg.querySelector('path');
    expect(path).not.toBeNull();
    expect(path).toHaveAttribute('fill', `var(--pd-status-${status})`);
  },
);

test('Expect downloadable status to preserve notification dot color', () => {
  render(StatusDotIcon, { status: 'downloadable' });
  expect(screen.getByTestId('status-dot-icon').querySelector('path')).toHaveAttribute(
    'fill',
    'var(--pd-notification-dot)',
  );
});

test('Expect unknown status to use unknown fill color', () => {
  render(StatusDotIcon, { status: 'somethingelse' });
  const svg = screen.getByTestId('status-dot-icon');
  const path = svg.querySelector('path');
  expect(path).toHaveAttribute('fill', 'var(--pd-status-unknown)');
});

test('Expect default size to be 12', () => {
  render(StatusDotIcon, { status: 'running' });
  const svg = screen.getByTestId('status-dot-icon');
  expect(svg).toHaveAttribute('width', '12');
  expect(svg).toHaveAttribute('height', '12');
});

test('Expect custom size to be applied', () => {
  render(StatusDotIcon, { status: 'running', size: '16' });
  const svg = screen.getByTestId('status-dot-icon');
  expect(svg).toHaveAttribute('width', '16');
  expect(svg).toHaveAttribute('height', '16');
});

test('Expect custom class to be applied', () => {
  render(StatusDotIcon, { status: 'running', class: 'my-custom-class' });
  const svg = screen.getByTestId('status-dot-icon');
  expect(svg).toHaveClass('my-custom-class');
});

test('Expect decorative icon to be hidden from assistive technology', () => {
  render(StatusDotIcon, { status: 'running', decorative: true });
  const svg = screen.getByTestId('status-dot-icon');
  expect(svg).toHaveAttribute('aria-hidden', 'true');
  expect(svg).not.toHaveAttribute('role');
  expect(svg).not.toHaveAttribute('aria-label');
});
