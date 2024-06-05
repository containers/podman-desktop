/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import type { DeploymentCondition } from './DeploymentUI';

function createDeploymentUI(conditions: DeploymentCondition[]) {
  return {
    name: 'my-deployment',
    status: '',
    namespace: '',
    replicas: 0,
    ready: 0,
    selected: false,
    conditions: conditions,
  };
}

test('Expect column styling available', async () => {
  const deployment = createDeploymentUI([{ type: 'Available', message: 'Running fine' }]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Available');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-gray-500');

  const dot = text.parentElement?.children[0].children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('text-green-600');
});

test('Expect column styling failure', async () => {
  const deployment = createDeploymentUI([{ type: 'ReplicaFailure', message: 'It failed!' }]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('ReplicaFailure');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-gray-500');

  const dot = text.parentElement?.children[0].children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('text-amber-600');
});

test('Expect column styling progressing', async () => {
  const deployment = createDeploymentUI([{ type: 'Progressing', message: 'Working on it', reason: '' }]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Progressing');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-gray-500');

  const dot = text.parentElement?.children[0].children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('text-sky-400');
});

test('Expect column styling progressed', async () => {
  const deployment = createDeploymentUI([
    { type: 'Progressing', message: 'Successfully progressed', reason: 'NewReplicaSetAvailable' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Progressed');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-gray-500');

  const dot = text.parentElement?.children[0].children[0];
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('text-sky-400');
});
