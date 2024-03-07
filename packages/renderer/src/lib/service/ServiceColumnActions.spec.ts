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

import '@testing-library/jest-dom/vitest';
import { test, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

import type { ServiceUI } from './ServiceUI';
import ServiceColumnActions from './ServiceColumnActions.svelte';
import * as contextStore from '/@/stores/context';
import { writable } from 'svelte/store';
import { ContextUI } from '../context/context';

vi.mock('/@/stores/context', async () => {
  return {
    context: vi.fn(),
  };
});

beforeEach(() => {
  vi.mocked(contextStore).context = writable(new ContextUI());
});

test('Expect action buttons', async () => {
  const service: ServiceUI = {
    name: 'my-service',
    status: 'RUNNING',
    namespace: '',
    selected: false,
    type: '',
    clusterIP: '',
    ports: '',
  };

  render(ServiceColumnActions, { object: service });

  const buttons = await screen.findAllByRole('button');
  expect(buttons).toHaveLength(1);
});
