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

import { fireEvent, render } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import PodNameColumn from '/@/lib/kubernetes-port-forward/PodNameColumn.svelte';
import * as store from '/@/stores/pods'; // Adjust the import path as necessary

import type { PodInfo } from '../../../../main/src/plugin/api/pod-info';

vi.mock('/@/stores/pods', async () => ({}));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(store).podsInfos = writable<PodInfo[]>([]);
});

test('name should be visible', () => {
  const { getByText } = render(PodNameColumn, {
    object: {
      name: 'dummy-pod-name',
      namespace: 'dummy-ns',
    },
  });

  const div = getByText('dummy-pod-name');
  expect(div).toBeDefined();
});

test('click on name should redirect to pod page', async () => {
  vi.mocked(store).podsInfos = writable<PodInfo[]>([
    {
      kind: 'kubernetes',
      Name: 'dummy-pod-name',
      Namespace: 'dummy-ns',
      engineId: 'dummy-engine-id',
    } as PodInfo,
  ]);

  const gotoSpy = vi.spyOn(router, 'goto');

  const { getByTitle } = render(PodNameColumn, {
    object: {
      name: 'dummy-pod-name',
      namespace: 'dummy-ns',
    },
  });

  const openBtn = getByTitle('Open pod details');
  expect(openBtn).toBeDefined();

  await fireEvent.click(openBtn);
  expect(gotoSpy).toHaveBeenCalledWith('/pods/kubernetes/dummy-pod-name/dummy-engine-id/');
});
