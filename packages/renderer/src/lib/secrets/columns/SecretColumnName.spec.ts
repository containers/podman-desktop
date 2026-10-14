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

import { NavigationPage } from '@desktop-framework/api';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import type { SecretInfoUI } from '/@/lib/secrets/SecretInfoUI';
import { handleNavigation } from '/@/navigation';

import SecretColumnName from './SecretColumnName.svelte';

vi.mock(import('/@/navigation'));

const secret: SecretInfoUI = {
  engineId: 'podman1',
  engineName: 'Podman 1',
  engineType: 'podman',
  Id: 'secret-id-1',
  Name: 'my-secret',
  CreatedAt: '2026-01-01T00:00:00Z',
  selected: false,
};

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect secret name to be displayed', async () => {
  const { getByText } = render(SecretColumnName, { object: secret });

  const text = getByText('my-secret');
  expect(text).toBeInTheDocument();
});

test('Expect click to open secret details', async () => {
  const { getByRole } = render(SecretColumnName, { object: secret });

  const secretButton = getByRole('button', { name: 'my-secret' });
  await fireEvent.click(secretButton);

  expect(handleNavigation).toHaveBeenCalledWith({
    page: NavigationPage.SECRET,
    parameters: {
      id: secret.Id,
      engineId: secret.engineId,
    },
  });
});
