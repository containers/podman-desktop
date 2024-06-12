/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import NodeColumnStatus from './NodeColumnStatus.svelte';
import type { NodeUI } from './NodeUI';

test('Expect simple column styling', async () => {
  const node: NodeUI = {
    name: 'my-node',
    status: 'RUNNING',
    role: 'control-plane',
    version: '',
    osImage: '',
    kernelVersion: '',
    containerRuntime: '',
  };
  render(NodeColumnStatus, { object: node });

  const text = screen.getByRole('status');
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('bg-[var(--pd-status-running)]');
});
