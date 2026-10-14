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

import { NavigationPage, type SecretInfo } from '@desktop-framework/api';
import { render, waitFor } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { handleNavigation } from '/@/navigation';
import { secretsInfo } from '/@/stores/secrets';

import SecretDetails from './SecretDetails.svelte';

vi.mock(import('/@/navigation'));

const secret: SecretInfo = {
  engineId: 'engine-id-1',
  engineName: 'Podman 1',
  engineType: 'podman',
  Id: 'secret-id-1',
  Name: 'my-secret',
  CreatedAt: '2026-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.resetAllMocks();
  secretsInfo.set([]);

  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
});

test('expect secret details page to render when secret exists', async () => {
  secretsInfo.set([secret]);
  router.goto('/secrets/engine-id-1/secret-id-1/summary');

  const { getByText, getByRole } = render(SecretDetails, { secretId: 'secret-id-1', engineId: 'engine-id-1' });

  await waitFor(() => {
    expect(getByText('my-secret')).toBeInTheDocument();
    expect(getByText('secret-id-1')).toBeInTheDocument();
    expect(getByRole('link', { name: 'Summary' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Inspect' })).toBeInTheDocument();
  });
});

test('expect navigation back to list when secret does not exist', async () => {
  render(SecretDetails, { secretId: 'missing-secret', engineId: 'engine-id-1' });

  await waitFor(() => {
    expect(handleNavigation).toHaveBeenCalledWith({ page: NavigationPage.SECRETS });
  });
});
