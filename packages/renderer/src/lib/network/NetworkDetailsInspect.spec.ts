/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { NetworkInspectInfo } from '@desktop-framework/api';
import { render } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import NetworkDetailsInspect from './NetworkDetailsInspect.svelte';
import type { NetworkInfoUI } from './NetworkInfoUI';

const networkInfoUI: NetworkInfoUI = {
  id: '123456789123456',
  shortId: '123456789123',
  name: 'Network 1',
  driver: '',
  created: '',
  engineId: 'podman',
  engineName: 'Podman',
  engineType: 'podman',
  selected: false,
  status: 'USED',
  ipv6_enabled: false,
  containers: [{ id: 'container1', name: 'Container 1' }],
};

const network: NetworkInspectInfo = {
  engineId: 'podman',
  engineName: 'Podman',
  engineType: 'podman',
  Name: 'Network 1',
  Id: '123456789123456',
  Created: '',
  Scope: '',
  Driver: '',
  EnableIPv6: false,
  Internal: false,
  Attachable: false,
  Ingress: false,
  ConfigOnly: false,
  Containers: {
    container1: {
      Name: 'Container 1',
      EndpointID: '123',
      MacAddress: '11:11:11:11:11:11',
      IPv4Address: '1.1.1.1',
      IPv6Address: '2.2.2.2',
    },
  },
};

vi.mock(import('/@/lib/editor/MonacoEditor.svelte'));

beforeEach(() => {
  vi.mocked(window.inspectNetwork).mockResolvedValue(network);
});

test('Expect monaco editor component to be called with inspectNetwork info', async () => {
  render(NetworkDetailsInspect, { network: networkInfoUI });

  expect(window.inspectNetwork).toHaveBeenCalledWith('podman', '123456789123456');

  const inspectInfo = network as Partial<NetworkInspectInfo>;
  delete inspectInfo.engineId;
  delete inspectInfo.engineName;

  await vi.waitFor(() => {
    expect(MonacoEditor).toHaveBeenCalledWith(expect.anything(), {
      content: JSON.stringify(inspectInfo, undefined, 2),
      language: 'json',
    });
  });
});
