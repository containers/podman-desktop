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

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { ContextUI } from '/@/lib/context/context';

import WhenDebug from './WhenDebug.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

test('undefined expression should result in enabled', async () => {
  render(WhenDebug);

  const span = screen.getByRole('status');
  await vi.waitFor(() => {
    expect(span.classList).toContain('enabled');
  });
});

test('false context expression should result in not enabled', async () => {
  render(WhenDebug, {
    expression: 'false',
  });

  const span = screen.getByRole('status');
  await vi.waitFor(() => {
    expect(span.classList).not.toContain('enabled');
  });
});

test('true context expression should result in enabled', async () => {
  render(WhenDebug, {
    expression: 'true',
  });

  const span = screen.getByRole('status');
  await vi.waitFor(() => {
    expect(span.classList).toContain('enabled');
  });
});

test('custom context with valid expression should be enabled', async () => {
  const context = new ContextUI();
  context.setValue('fruits', ['banana', 'pineapple']);

  render(WhenDebug, {
    expression: 'banana in fruits',
    contextUI: context,
  });

  const span = screen.getByRole('status');
  await vi.waitFor(() => {
    expect(span.classList).toContain('enabled');
  });
});

test('custom context with invalid expression should not be enabled', async () => {
  const context = new ContextUI();
  context.setValue('fruits', ['banana', 'pineapple']);

  render(WhenDebug, {
    expression: 'potato in fruits',
    contextUI: context,
  });

  const span = screen.getByRole('status');
  await vi.waitFor(() => {
    expect(span.classList).not.toContain('enabled');
  });
});
