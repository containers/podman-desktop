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

import ServiceColumnType from './ServiceColumnType.svelte';
import type { ServiceUI } from './ServiceUI';

const service: ServiceUI = {
  name: 'my-service',
  status: '',
  namespace: '',
  selected: false,
  type: 'unknown',
  clusterIP: '',
  ports: '',
};

test('Expect basic column styling', async () => {
  const result = render(ServiceColumnType, { object: JSON.parse(JSON.stringify(service)) });

  const text = screen.getByText(service.type);
  expect(text).toBeInTheDocument();

  const dot = text.parentElement?.children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('text-gray-600');
  result.unmount();
});

test('Expect column styling ClusterIP', async () => {
  service.type = 'ClusterIP';
  render(ServiceColumnType, { object: JSON.parse(JSON.stringify(service)) });

  const text = screen.getByText(service.type);
  expect(text).toBeInTheDocument();

  const dot = text.parentElement?.children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('text-sky-500');
});

test('Expect column styling LoadBalancer', async () => {
  service.type = 'LoadBalancer';
  render(ServiceColumnType, { object: JSON.parse(JSON.stringify(service)) });

  const text = screen.getByText(service.type);
  expect(text).toBeInTheDocument();

  const dot = text.parentElement?.children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('text-purple-500');
});

test('Expect column styling NodePort', async () => {
  service.type = 'NodePort';
  render(ServiceColumnType, { object: JSON.parse(JSON.stringify(service)) });

  const text = screen.getByText(service.type);
  expect(text).toBeInTheDocument();

  const dot = text.parentElement?.children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('text-fuschia-600');
});
