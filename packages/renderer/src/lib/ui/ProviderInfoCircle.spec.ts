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

import ProviderInfoCircle from './ProviderInfoCircle.svelte';

test('Expect podman is purple', async () => {
  const type = 'podman';
  render(ProviderInfoCircle, {
    type,
  });

  const circle = screen.getByLabelText('Provider info circle');
  expect(circle).toBeInTheDocument();
  expect(circle).toHaveClass('bg-purple-600');
});

test('Expect kubernetes is purple', async () => {
  const type = 'kubernetes';
  render(ProviderInfoCircle, {
    type,
  });
  const circle = screen.getByLabelText('Provider info circle');
  expect(circle).toBeInTheDocument();
  expect(circle).toHaveClass('bg-sky-600');
});

test('Expect docker is blue', async () => {
  const type = 'docker';
  render(ProviderInfoCircle, {
    type,
  });
  const circle = screen.getByLabelText('Provider info circle');
  expect(circle).toBeInTheDocument();
  expect(circle).toHaveClass('bg-sky-400');
});

test('Expect unknown is gray', async () => {
  const type = undefined;
  render(ProviderInfoCircle, {
    type,
  });
  const circle = screen.getByLabelText('Provider info circle');
  expect(circle).toBeInTheDocument();
  expect(circle).toHaveClass('bg-gray-900');
});

test('Expect missing is gray', async () => {
  render(ProviderInfoCircle);
  const circle = screen.getByLabelText('Provider info circle');
  expect(circle).toBeInTheDocument();
  expect(circle).toHaveClass('bg-gray-900');
});
