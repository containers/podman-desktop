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

import PodColumnStatus from './PodColumnStatus.svelte';
import type { PodInfoUI } from './PodInfoUI';

const pod: PodInfoUI = {
  id: 'pod-id',
  shortId: '',
  name: '',
  engineId: '',
  engineName: '',
  status: 'RUNNING',
  age: '',
  created: '',
  selected: false,
  containers: [],
  kind: 'podman',
};

test('Expect simple column styling', async () => {
  render(PodColumnStatus, { object: pod });

  const status = screen.getByRole('status');
  expect(status).toBeInTheDocument();
  expect(status).toHaveClass('bg-[var(--pd-status-running)]');
});
