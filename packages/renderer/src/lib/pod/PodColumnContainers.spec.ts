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

import { fireEvent } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import PodColumnContainers from './PodColumnContainers.svelte';
import type { PodInfoUI } from './PodInfoUI';

const pod: PodInfoUI = {
  id: 'pod-id',
  shortId: 'short-id',
  name: '',
  engineId: '',
  engineName: '',
  status: '',
  age: '',
  created: '',
  selected: false,
  containers: [
    {
      Id: 'container1',
      Names: 'container1',
      Status: 'RUNNING',
    },
  ],
  kind: 'podman',
};

test('Expect simple column styling', async () => {
  render(PodColumnContainers, { object: pod });

  const dot = screen.getByTestId('status-dot');
  expect(dot).toBeInTheDocument();
  expect(dot).toHaveClass('bg-[var(--pd-status-running)]');
});

test('Expect clicking works', async () => {
  render(PodColumnContainers, { object: pod });

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();

  const routerGotoSpy = vi.spyOn(router, 'goto');
  fireEvent.click(button);

  expect(routerGotoSpy).toBeCalledWith('/containers/?filter=short-id');
});
