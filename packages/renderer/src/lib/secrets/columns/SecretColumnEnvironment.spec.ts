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
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import SecretColumnEnvironment from './SecretColumnEnvironment.svelte';

const secret: SecretInfo = {
  engineId: 'podman1',
  engineName: 'Podman 1',
  engineType: 'podman',
  Id: 'secret-id-1',
  Name: 'my-secret',
  CreatedAt: '2026-01-01T00:00:00Z',
};

test('Expect environment provider info to be displayed', async () => {
  render(SecretColumnEnvironment, { object: secret });

  const text = screen.getByText('Podman 1');
  expect(text).toBeInTheDocument();
});
