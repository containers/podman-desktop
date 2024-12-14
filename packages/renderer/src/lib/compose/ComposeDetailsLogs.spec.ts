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
import { beforeAll, expect, test, vi } from 'vitest';

import { mockBreadcrumb } from '../../stores/breadcrumb.spec';
import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from '../container/ContainerInfoUI';
import ComposeDetailsLogs from './ComposeDetailsLogs.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

vi.mock('@xterm/xterm', () => {
  return {
    Terminal: vi
      .fn()
      .mockReturnValue({ loadAddon: vi.fn(), open: vi.fn(), write: vi.fn(), clear: vi.fn(), dispose: vi.fn() }),
  };
});

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn() });
  Object.defineProperty(window, 'ResizeObserver', {
    value: vi.fn().mockReturnValue({ observe: vi.fn(), unobserve: vi.fn() }),
  });
  Object.defineProperty(window, 'telemetryPage', { value: vi.fn().mockResolvedValue(undefined) });
  Object.defineProperty(window, 'logsContainer', { value: vi.fn().mockResolvedValue(undefined) });
  Object.defineProperty(window, 'refreshTerminal', { value: vi.fn() });
  mockBreadcrumb();
});

const containerInfoUIMock: ContainerInfoUI = {
  id: 'foobar',
  shortId: 'foobar',
  name: 'foobar',
  image: 'foobar',
  shortImage: 'foobar',
  engineId: 'foobar',
  engineName: 'foobar',
  engineType: ContainerGroupInfoTypeUI.PODMAN,
  state: 'running',
  uptime: 'foobar',
  startedAt: 'foobar',
  ports: [],
  portsAsString: 'foobar',
  displayPort: 'foobar',
  command: 'foobar',
  hasPublicPort: false,
  groupInfo: {
    name: 'foobar',
    type: ContainerGroupInfoTypeUI.COMPOSE,
  },
  selected: false,
  created: 0,
  labels: {},
  imageBase64RepoTag: '',
};

const composeInfoUIMock: ComposeInfoUI = {
  engineId: 'foobar',
  engineType: ContainerGroupInfoTypeUI.PODMAN,
  name: 'foobar',
  status: 'running',
  containers: [containerInfoUIMock],
};

test('Render compose logs and expect EmptyScreen and no loading via logsContainer', async () => {
  // Mock compose has no containers, so expect No Log to appear
  render(ComposeDetailsLogs, { compose: composeInfoUIMock });

  // Expect no logs since we mock logs
  const heading = screen.getByRole('heading', { name: 'No Log' });
  expect(heading).toBeInTheDocument();
});
