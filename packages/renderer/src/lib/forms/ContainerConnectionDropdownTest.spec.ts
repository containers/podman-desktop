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

import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import ContainerConnectionDropdownTest from '/@/lib/forms/ContainerConnectionDropdownTest.svelte';

const MULTI_CONNECTIONS: ProviderContainerConnectionInfo[] = Array.from({ length: 5 }).map((_, index) => ({
  connectionType: 'container',
  name: `connection-${index}`,
  displayName: `Connection ${index}`,
  endpoint: {
    socketPath: `socket-${index}`,
  },
  status: 'started',
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
  type: 'podman',
}));

beforeEach(() => {
  vi.resetAllMocks();
});

test('every connection should have a visible option', async () => {
  const { getByRole } = render(ContainerConnectionDropdownTest, {
    connections: MULTI_CONNECTIONS,
  });

  const dropdown = getByRole('button', { name: 'Container Engine' });
  expect(dropdown).toBeEnabled();

  // open the dropdown
  await fireEvent.click(dropdown);

  MULTI_CONNECTIONS.forEach(option => {
    const button = getByRole('button', { name: option.name });
    expect(button).toBeDefined();
  });
});

test('changing value should update binding value', async () => {
  const { getByRole } = render(ContainerConnectionDropdownTest, {
    connections: MULTI_CONNECTIONS,
  });

  const dropdown = getByRole('button', { name: 'Container Engine' });
  expect(dropdown).toBeEnabled();

  // open the dropdown
  await fireEvent.click(dropdown);

  const button = getByRole('button', { name: MULTI_CONNECTIONS[3].name });
  expect(button).toBeDefined();

  await fireEvent.click(button);

  const alert = await vi.waitFor(() => {
    return getByRole('alert');
  });
  expect(alert).toBeDefined();
  expect(alert).toHaveTextContent(MULTI_CONNECTIONS[3].name);
});
