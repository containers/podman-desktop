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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import ProviderInfo from './ProviderInfo.svelte';

test('Expect podman is purple', async () => {
  const provider = 'podman';
  render(ProviderInfo, {
    provider,
  });
  const label = screen.getByText(provider);
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('bg-purple-600');
});

test('Expect Podman (different case) is purple', async () => {
  const provider = 'Podman';
  render(ProviderInfo, {
    provider,
  });
  const label = screen.getByText(provider);
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('bg-purple-600');
});

test('Expect docker is blue', async () => {
  const provider = 'docker';
  render(ProviderInfo, {
    provider,
  });
  const label = screen.getByText(provider);
  expect(label).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toBeInTheDocument();
  expect(label.parentElement?.firstChild).toHaveClass('bg-sky-400');
});
