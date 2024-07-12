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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import LabelSpec from './LabelSpec.svelte';

test('Expect basic styling', async () => {
  const text = 'A label';
  render(LabelSpec, {
    name: text,
    slot: 'slot',
  });
  const label = screen.getByText(text);
  expect(label).toBeInTheDocument();
  expect(label.parentElement).toHaveClass('bg-[var(--pd-label-bg)]');
  expect(label.parentElement).toHaveClass('text-[var(--pd-label-text)]');
  expect(label.parentElement).toHaveClass('text-sm');
  expect(label.parentElement).toHaveClass('rounded-md');
  expect(label.parentElement).toHaveClass('p-1');
  expect(label.parentElement).toHaveClass('gap-x-1');
});

test('Expect tooltip', async () => {
  const tip = 'a tooltip';
  render(LabelSpec, {
    name: 'label',
    tip: tip,
  });
  const label = screen.getByText(tip);
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
});

test('Expect role to be defined', async () => {
  const role = 'test';
  render(LabelSpec, {
    name: 'A label',
    role: role,
  });
  const label = screen.getByRole(role);
  expect(label).toBeInTheDocument();
});

test('Expect no capitalization', async () => {
  render(LabelSpec, {
    name: 'label',
  });
  const label = screen.getByText('label');
  expect(label).toBeInTheDocument();
  expect(label).not.toHaveClass('capitalize');
});

test('Expect capitalization', async () => {
  render(LabelSpec, {
    name: 'label',
    capitalize: true,
  });
  const label = screen.getByText('label');
  expect(label).toBeInTheDocument();
  expect(label).toHaveClass('capitalize');
});
