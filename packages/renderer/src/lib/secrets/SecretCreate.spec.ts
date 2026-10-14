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

import { NavigationPage, type ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { handleNavigation } from '/@/navigation';
import { providerInfos } from '/@/stores/providers';

import SecretCreate from './SecretCreate.svelte';

vi.mock(import('/@/navigation'));

const providerInfoMock = {
  id: 'podman',
  internalId: 'podman-internal-id',
  name: 'Podman',
  status: 'started',
  containerConnections: [
    {
      name: 'podman-machine-default',
      status: 'started',
      type: 'podman',
    },
  ],
} as unknown as ProviderInfo;

beforeEach(() => {
  vi.resetAllMocks();
  providerInfos.set([providerInfoMock]);
});

test('Expect create secret to call API and navigate back', async () => {
  vi.mocked(window.createSecret).mockResolvedValue({
    id: 'secret-id',
    engineId: 'podman.podman-machine-default',
  });

  const { getByPlaceholderText, getByRole } = render(SecretCreate);

  expect(getByRole('heading', { name: 'Create a secret' })).toBeInTheDocument();

  await fireEvent.input(getByPlaceholderText('Secret name'), { target: { value: 'my-secret' } });
  await fireEvent.input(getByPlaceholderText('Secret data'), { target: { value: 'my-secret-data' } });

  const createButton = getByRole('button', { name: 'Create' });
  await fireEvent.click(createButton);

  expect(window.createSecret).toHaveBeenCalledTimes(1);
  expect(handleNavigation).toHaveBeenCalledWith({ page: NavigationPage.SECRETS });
});

test('Expect create secret error to be displayed', async () => {
  vi.mocked(window.createSecret).mockRejectedValue(new Error('create failed'));

  const { getByPlaceholderText, getByRole, getByText } = render(SecretCreate);

  await fireEvent.input(getByPlaceholderText('Secret name'), { target: { value: 'my-secret' } });
  await fireEvent.input(getByPlaceholderText('Secret data'), { target: { value: 'my-secret-data' } });
  await fireEvent.click(getByRole('button', { name: 'Create' }));

  expect(getByText('create failed')).toBeInTheDocument();
});
