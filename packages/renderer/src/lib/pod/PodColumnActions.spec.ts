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

import type { ContainerInfo, Port } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import PodColumnActions from './PodColumnActions.svelte';
import type { PodInfoUI } from './PodInfoUI';

const listContainersMock = vi.fn();
const getContributedMenusMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'listContainers', { value: listContainersMock });
  Object.defineProperty(window, 'getContributedMenus', { value: getContributedMenusMock });
});

beforeEach(() => {
  listContainersMock.mockResolvedValue([
    { Id: 'pod', Ports: [{ PublicPort: 8080 } as Port] as Port[] } as ContainerInfo,
  ]);

  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect action buttons', async () => {
  const pod: PodInfoUI = {
    id: 'pod-id',
    shortId: '',
    name: '',
    engineId: '',
    engineName: '',
    status: '',
    age: '2 days',
    created: '',
    selected: false,
    containers: [],
    kind: 'podman',
  };

  render(PodColumnActions, { object: pod });

  const buttons = await screen.findAllByRole('button');
  expect(buttons).toHaveLength(4);
});

test('Expect error message', async () => {
  const pod: PodInfoUI = {
    id: 'pod-id',
    shortId: '',
    name: '',
    engineId: '',
    engineName: '',
    status: '',
    age: '2 days',
    created: '',
    selected: false,
    containers: [],
    kind: 'podman',
    actionError: 'Pod failed',
  };

  render(PodColumnActions, { object: pod });

  const error = screen.getByText('Pod failed');
  expect(error).toBeInTheDocument();
});
