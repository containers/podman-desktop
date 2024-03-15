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

import PodColumnName from './PodColumnName.svelte';
import type { PodInfoUI } from './PodInfoUI';

const pod: PodInfoUI = {
  id: 'pod-id',
  shortId: 'short-id',
  name: 'my-pod',
  engineId: 'podman',
  engineName: '',
  status: '',
  age: '',
  created: '',
  selected: false,
  containers: [],
  kind: 'podman',
};

test('Expect simple column styling', async () => {
  render(PodColumnName, { object: pod });

  const text = screen.getByText(pod.name);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-sm');
  expect(text).toHaveClass('text-gray-300');

  const id = screen.getByText(pod.shortId);
  expect(id).toBeInTheDocument();
  expect(id).toHaveClass('text-xs');
  expect(id).toHaveClass('text-violet-400');
});

test('Expect clicking works', async () => {
  render(PodColumnName, { object: pod });

  const text = screen.getByText(pod.name);
  expect(text).toBeInTheDocument();

  // test click
  const routerGotoSpy = vi.spyOn(router, 'goto');

  fireEvent.click(text);

  expect(routerGotoSpy).toBeCalledWith('/pods/podman/my-pod/podman/');
});
