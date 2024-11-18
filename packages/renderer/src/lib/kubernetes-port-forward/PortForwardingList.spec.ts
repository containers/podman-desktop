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

import { render } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import PortForwardList from './PortForwardingList.svelte';

vi.mock('/@/stores/kubernetes-contexts-state', async () => ({}));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([]);
});

test('empty kubernetesCurrentContextPortForwards store should display empty screen', async () => {
  const { getByText } = render(PortForwardList);

  const text = getByText('Start forwarding ports from the Pod Details > Summary tab');
  expect(text).toBeDefined();
});
