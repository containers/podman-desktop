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

import ContainerColumnStatus from './ContainerColumnStatus.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';

test('Expect simple column styling - container', async () => {
  const container: ContainerInfoUI = {
    id: '',
    shortId: '',
    name: '',
    image: '',
    shortImage: '',
    engineId: '',
    engineName: '',
    engineType: 'podman',
    state: 'RUNNING',
    uptime: '',
    startedAt: '',
    ports: [],
    portsAsString: '',
    displayPort: '',
    hasPublicPort: false,
    groupInfo: {} as ContainerGroupInfoUI,
    selected: false,
    created: 0,
    labels: {},
    imageBase64RepoTag: '',
  };
  render(ContainerColumnStatus, { object: container });

  const text = screen.getByRole('status');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('bg-[var(--pd-status-running)]');
});

test('Expect simple column styling - pod', async () => {
  const pod: ContainerGroupInfoUI = {
    type: ContainerGroupInfoTypeUI.POD,
    expanded: false,
    status: 'RUNNING',
    selected: false,
    allContainersCount: 0,
    containers: [],
    name: '',
  };
  render(ContainerColumnStatus, { object: pod });

  const text = screen.getByRole('status');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('bg-[var(--pd-status-running)]');
});

test('Expect simple column styling - compose', async () => {
  const compose: ContainerGroupInfoUI = {
    type: ContainerGroupInfoTypeUI.COMPOSE,
    expanded: false,
    status: 'RUNNING',
    selected: false,
    allContainersCount: 0,
    containers: [],
    name: '',
  };
  render(ContainerColumnStatus, { object: compose });

  const text = screen.getByRole('status');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('bg-[var(--pd-status-running)]');
});
