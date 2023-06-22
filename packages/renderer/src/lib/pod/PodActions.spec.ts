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

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PodActions from './PodActions.svelte';
import type { PodInfoUI } from './PodInfoUI';
import { router } from 'tinro';

const pod: PodInfoUI = {
  id: 'pod',
} as PodInfoUI;

const errorCallback = vi.fn();

// mock router import { router } from 'tinro';
vi.mock('tinro', () => ({
  router: {
    goto: vi.fn(),
  },
}));

beforeEach(() => {
  (window as any).kubernetesDeletePod = vi.fn();
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect to redirect to /pods page after deletion', async () => {
  render(PodActions, { pod, errorCallback });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);

  expect(errorCallback).not.toHaveBeenCalled();

  // check that router has been called
  expect(router.goto).toHaveBeenCalledWith('/pods/');
});

test('Expect no redirect to /pods page after deletion if configured', async () => {
  render(PodActions, { pod, errorCallback, redirectAfterDelete: false });

  // click on delete button
  const deleteButton = screen.getByRole('button', { name: 'Delete Pod' });
  await fireEvent.click(deleteButton);

  expect(errorCallback).not.toHaveBeenCalled();

  // check that router has not been called
  expect(router.goto).not.toHaveBeenCalledWith('/pods');
});
