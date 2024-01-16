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
import StatusIcon from './StatusIcon.svelte';

test('Expect starting styling', async () => {
  const status = 'STARTING';
  render(StatusIcon, { status });
  const icon = screen.getByRole('status');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('title', status);

  expect(icon).toHaveClass('bg-green-600');
});

test('Expect running styling', async () => {
  const status = 'RUNNING';
  render(StatusIcon, { status });
  const icon = screen.getByRole('status');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('title', status);

  expect(icon).toHaveClass('bg-green-400');
});

test('Expect degraded styling', async () => {
  const status = 'DEGRADED';
  render(StatusIcon, { status });
  const icon = screen.getByRole('status');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('title', status);

  expect(icon).toHaveClass('bg-amber-600');
});

test('Expect deleting styling', async () => {
  const status = 'DELETING';
  render(StatusIcon, { status });
  const icon = screen.getByRole('status');
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveAttribute('title', status);
  expect(icon).not.toHaveAttribute('border');

  const spinner = screen.getByRole('img');
  expect(spinner).toBeInTheDocument();
  expect(spinner).toHaveAttribute('width', '1.4em');
});

test('Expect fixed width/height and font size for font icon with default size', async () => {
  render(StatusIcon, { icon: 'custom-font' });
  const icon = screen.getByRole('status');
  expect(icon).toBeInTheDocument();

  // get child element of icon element
  const iconChild = icon.firstChild;

  // expect element is 20px x 20px
  expect(iconChild).toHaveStyle('width: 20px');
  expect(iconChild).toHaveStyle('height: 20px');
  expect(iconChild).toHaveStyle('font-size: 20px');
  expect(iconChild).toHaveStyle('line-height: 20px');
});

test('Expect fixed width/height and font size for font icon with custom size', async () => {
  render(StatusIcon, { icon: 'custom-font', size: 24 });
  const icon = screen.getByRole('status');
  expect(icon).toBeInTheDocument();

  // get child element of icon element
  const iconChild = icon.firstChild;

  // expect element is 20px x 20px
  expect(iconChild).toHaveStyle('width: 24px');
  expect(iconChild).toHaveStyle('height: 24px');
  expect(iconChild).toHaveStyle('font-size: 24px');
  expect(iconChild).toHaveStyle('line-height: 24px');
});
