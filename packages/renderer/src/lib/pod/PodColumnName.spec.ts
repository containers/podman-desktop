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
  node: 'node1',
  namespace: 'default',
};

test('Expect simple column styling', async () => {
  render(PodColumnName, { object: pod });

  const text = screen.getByText(pod.name);
  expect(text).toBeInTheDocument();
  expect(text).toHaveClass('text-[var(--pd-table-body-text-highlight)]');

  const id = screen.getByText(pod.shortId);
  expect(id).toBeInTheDocument();
  expect(id).toHaveClass('text-[var(--pd-table-body-text)]');
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

test('Expect kubernetes pod information', async () => {
  const fakeKubernetesInfo: PodInfoUI = {
    id: 'pod-id',
    shortId: 'short-id',
    name: 'my-pod',
    engineId: 'kubernetes',
    engineName: '',
    status: '',
    age: '',
    created: '',
    selected: false,
    containers: [],
    kind: 'kubernetes',
    node: 'node1',
    namespace: 'customnamespace',
  };

  render(PodColumnName, { object: fakeKubernetesInfo });

  const id = screen.getByText('customnamespace');
  expect(id).toBeInTheDocument();

  const node = screen.getByText('node1');
  expect(node).toBeInTheDocument();
});

test('Do not expect undefined anywhere on the page', async () => {
  render(PodColumnName, { object: pod });

  expect(screen.queryByText('undefined')).not.toBeInTheDocument();
});
