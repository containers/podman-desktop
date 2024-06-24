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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import ConfigMapSecretColumnName from './ConfigMapSecretColumnName.svelte';
import type { ConfigMapSecretUI } from './ConfigMapSecretUI';

const configMap: ConfigMapSecretUI = {
  name: 'my-configmap',
  namespace: 'default',
  selected: false,
  type: 'ConfigMap',
  status: '',
  keys: [],
};

const secret: ConfigMapSecretUI = {
  name: 'my-secret',
  namespace: 'default',
  selected: false,
  type: 'Secret',
  status: '',
  keys: [],
};

test('Expect simple column styling', async () => {
  render(ConfigMapSecretColumnName, { object: configMap });

  const text = screen.getByText(configMap.name);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-sm');
  expect(text).toHaveClass('text-[var(--pd-table-body-text-highlight)]');
});

test('Configmap: Expect clicking works', async () => {
  render(ConfigMapSecretColumnName, { object: configMap });

  const text = screen.getByText(configMap.name);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');

  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith('/configmapsSecrets/configmap/my-configmap/default/summary');
});

test('Secret: Expect clicking works', async () => {
  render(ConfigMapSecretColumnName, { object: secret });

  const text = screen.getByText(secret.name);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');

  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith('/configmapsSecrets/secret/my-secret/default/summary');
});
