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
import { expect, test } from 'vitest';

import VolumeColumnStatus from './VolumeColumnStatus.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

test('Expect simple column styling', async () => {
  const volume: VolumeInfoUI = {
    name: '',
    shortName: '',
    mountPoint: '',
    scope: '',
    driver: '',
    created: '',
    age: '',
    size: 0,
    humanSize: '',
    engineId: '',
    engineName: '',
    selected: false,
    status: 'USED',
    containersUsage: [],
  };
  render(VolumeColumnStatus, { object: volume });

  const status = screen.getByRole('status');
  expect(status).toBeInTheDocument();
  expect(status).toHaveClass('bg-[var(--pd-status-running)]');
});
