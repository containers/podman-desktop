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

import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import * as uiSvelte from '@podman-desktop/ui-svelte';
import { render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import * as kubernetesCheckConnection from '/@/lib/ui/KubernetesCheckConnection.svelte';

import KubernetesEmptyScreen from './KubernetesEmptyScreen.svelte';

test('KubernetesCheckConnection is called', async () => {
  const kubernetesCheckConnectionSpy = vi.spyOn(kubernetesCheckConnection, 'default');
  render(KubernetesEmptyScreen);
  expect(kubernetesCheckConnectionSpy).toHaveBeenCalledWith(expect.anything(), {});
});

test('EmptyScreen is called with properties', async () => {
  const emptyScreenSpy = vi.spyOn(uiSvelte, 'EmptyScreen');
  render(KubernetesEmptyScreen, {
    icon: faRefresh,
    title: 'A TITLE',
    message: 'A MESSAGE',
  });
  expect(emptyScreenSpy).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      icon: faRefresh,
      title: 'A TITLE',
      message: 'A MESSAGE',
    }),
  );
});
