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

import DeploymentColumnConditions from './DeploymentColumnConditions.svelte';
import type { DeploymentUI } from './DeploymentUI';

const deployment: DeploymentUI = {
  name: 'my-deployment',
  status: '',
  namespace: '',
  replicas: 0,
  ready: 0,
  selected: false,
  conditions: [
    { type: 'Available', message: 'Running fine' },
    { type: 'ReplicaFailure', message: 'It failed!' },
    { type: 'Progressing', message: 'Working on it' },
  ],
};

test('Expect column styling available', async () => {
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText(deployment.conditions[0].type);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-gray-500');

  const dot = text.parentElement?.children[0].children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('bg-green-600');
});

test('Expect column styling failure', async () => {
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText(deployment.conditions[1].type);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-gray-500');

  const dot = text.parentElement?.children[0].children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('bg-amber-600');
});

test('Expect column styling progressing', async () => {
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText(deployment.conditions[2].type);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-gray-500');

  const dot = text.parentElement?.children[0].children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('bg-sky-400');
});
