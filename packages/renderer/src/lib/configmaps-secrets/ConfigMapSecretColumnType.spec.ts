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

import ConfigMapSecretColumnType from './ConfigMapSecretColumnType.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

test('Expect type display for ConfigMap', async () => {
  const configMap: ConfigMapSecretUI = {
    name: 'my-configmap',
    namespace: '',
    selected: false,
    type: 'ConfigMap',
    status: '',
    keys: [],
  };

  render(ConfigMapSecretColumnType, { object: configMap });

  const text = screen.getByText('ConfigMap');
  expect(text).toBeInTheDocument();
  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-running)]');
});

test('Expect type display for Secret', async () => {
  const secret: ConfigMapSecretUI = {
    name: 'my-secret',
    namespace: '',
    selected: false,
    type: 'Secret',
    status: '',
    keys: [],
  };

  render(ConfigMapSecretColumnType, { object: secret });

  const text = screen.getByText('Secret');
  expect(text).toBeInTheDocument();
  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-running)]');
});
