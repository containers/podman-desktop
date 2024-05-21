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

import ContainerColumnEnvironment from './ContainerColumnEnvironment.svelte';
import type { ContainerGroupInfoUI, ContainerInfoUI } from './ContainerInfoUI';
import { ContainerGroupInfoTypeUI } from './ContainerInfoUI';

test('Expect simple column styling', async () => {
  const container: ContainerInfoUI = {
    id: 'sha256:1234567890123',
    image: 'sha256:123',
    engineId: 'podman',
    engineName: 'podman',
    shortId: '',
    name: '',
    shortImage: '',
    engineType: 'podman',
    state: '',
    uptime: '',
    startedAt: '',
    ports: [],
    portsAsString: '',
    displayPort: '',
    hasPublicPort: false,
    groupInfo: {
      name: '',
      type: ContainerGroupInfoTypeUI.STANDALONE,
    },
    selected: false,
    created: 0,
    labels: {},
    imageBase64RepoTag: '',
  };
  render(ContainerColumnEnvironment, { object: container });

  const text = screen.getByText(container.engineName);
  expect(text).toBeInTheDocument();
});

test('Expect simple column styling - pod', async () => {
  const pod: ContainerGroupInfoUI = {
    type: ContainerGroupInfoTypeUI.POD,
    expanded: false,
    selected: false,
    allContainersCount: 0,
    containers: [],
    name: '',
    engineType: ContainerGroupInfoTypeUI.PODMAN,
    engineId: '',
  };
  render(ContainerColumnEnvironment, { object: pod });

  const text = screen.getByText('podman');
  expect(text).toBeInTheDocument();
});

test('Expect simple column styling - compose', async () => {
  const compose: ContainerGroupInfoUI = {
    type: ContainerGroupInfoTypeUI.COMPOSE,
    expanded: false,
    selected: false,
    allContainersCount: 0,
    containers: [],
    name: '',
    engineType: ContainerGroupInfoTypeUI.PODMAN,
    engineId: '',
  };
  render(ContainerColumnEnvironment, { object: compose });

  const text = screen.getByText('podman');
  expect(text).toBeInTheDocument();
});
