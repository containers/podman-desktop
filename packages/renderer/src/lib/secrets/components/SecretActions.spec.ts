/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { SecretInfo } from '@desktop-framework/api';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import SecretActions from './SecretActions.svelte';

const secret: SecretInfo = {
  engineId: 'engine1',
  engineName: 'Engine 1',
  engineType: 'podman',
  Id: 'secret123',
  Name: 'my-secret',
  CreatedAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
});

test('Expect delete button to be visible and trigger confirmation', async () => {
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });

  const { getByTitle } = render(SecretActions, { object: secret });

  const deleteButton = getByTitle('Delete Secret');
  expect(deleteButton).toBeInTheDocument();

  await fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(window.showMessageBox).toHaveBeenCalledOnce();
  });

  expect(window.removeSecret).toHaveBeenCalledWith(secret.engineId, secret.Id);
});

describe('contributions', () => {
  test('Expect contributed menus to be fetched on mount', async () => {
    render(SecretActions, { object: secret });

    await waitFor(() => {
      expect(window.getContributedMenus).toHaveBeenCalledWith('dashboard/secret');
    });
  });

  test('Expect contributed menus to be visible', async () => {
    vi.mocked(window.getContributedMenus).mockResolvedValue([
      {
        command: 'foo',
        title: 'Open foo',
      },
    ]);

    const { getByRole, getByTitle } = render(SecretActions, { object: secret });

    const kebabMenu = await waitFor(() => {
      return getByRole('button', { name: 'kebab menu' });
    });

    expect(kebabMenu).toBeInTheDocument();
    await fireEvent.click(kebabMenu);

    const openFoo = await vi.waitFor(() => {
      return getByTitle('Open foo');
    });
    await fireEvent.click(openFoo);

    await vi.waitFor(() => {
      expect(window.executeCommand).toHaveBeenCalledOnce();
      expect(window.executeCommand).toHaveBeenCalledWith('foo', secret);
    });
  });
});
