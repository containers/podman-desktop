/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import StateChange from './StateChange.svelte';

test('Check status starting', async () => {
  render(StateChange, { state: 'STARTING' });

  const step = screen.getByText('Starting...');
  expect(step).toBeInTheDocument();
});

test('Check status stopping', async () => {
  render(StateChange, { state: 'STOPPING' });

  const status = screen.getByText('Stopping...');
  expect(status).toBeInTheDocument();
});

test('Check status deleting', async () => {
  render(StateChange, { state: 'DELETING' });

  const status = screen.getByText('Deleting...');
  expect(status).toBeInTheDocument();
});
