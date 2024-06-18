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
  const deployment = createDeploymentUI([
    { type: 'Available', message: 'Running fine', reason: 'MinimumReplicasAvailable' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Available');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-running)]');
});

test('Expect column styling unavailable', async () => {
  const deployment = createDeploymentUI([
    { type: 'Available', message: 'Running fine', reason: 'MinimumReplicasUnavailable' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Unavailable');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-degraded)]');
});

test('Expect column styling updated', async () => {
  const deployment = createDeploymentUI([
    { type: 'Progressing', message: 'Running fine', reason: 'ReplicaSetUpdated' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Updated');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-updated)]');
});

test('Expect column styling new replica set', async () => {
  const deployment = createDeploymentUI([
    { type: 'Progressing', message: 'Running fine', reason: 'NewReplicaSetCreated' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('New Replica Set');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-updated)]');
});

test('Expect column styling progressed', async () => {
  const deployment = createDeploymentUI([
    { type: 'Progressing', message: 'Running fine', reason: 'NewReplicaSetAvailable' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Progressed');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-running)]');
});

test('Expect column styling scaled up', async () => {
  const deployment = createDeploymentUI([
    { type: 'Progressing', message: 'Running fine', reason: 'ReplicaSetScaledUp' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Scaled Up');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-updated)]');
});

test('Expect column styling scaled down', async () => {
  const deployment = createDeploymentUI([
    { type: 'Progressing', message: 'Running fine', reason: 'ReplicaSetScaledDown' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Scaled Down');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-updated)]');
});

test('Expect column styling deadline exceeded', async () => {
  const deployment = createDeploymentUI([
    { type: 'Progressing', message: 'Running fine', reason: 'ProgressDeadlineExceeded' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Deadline Exceeded');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-dead)]');
});

test('Expect column styling replica failure', async () => {
  const deployment = createDeploymentUI([
    { type: 'ReplicaFailure', message: 'Running fine', reason: 'ReplicaFailure' },
  ]);
  render(DeploymentColumnConditions, { object: deployment });

  const text = screen.getByText('Replica Failure');
  expect(text).toBeInTheDocument();

  const svg = text.parentElement?.querySelector('svg');
  expect(svg).toBeInTheDocument();
  expect(svg).toHaveClass('text-[var(--pd-status-dead)]');
});
