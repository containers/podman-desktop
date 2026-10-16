/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import TroubleshootingPageKubernetes from './TroubleshootingPageKubernetes.svelte';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.kubernetesGetTroubleshootingInformation).mockResolvedValue({
    healthCheckers: [{ contextName: 'ctx1', checking: false, reachable: true }],
    permissionCheckers: [],
    informers: [],
  });
});

test('Expect troubleshooting information to be loaded on mount and refreshed on click', async () => {
  render(TroubleshootingPageKubernetes);

  await waitFor(() => expect(screen.getByText('ctx1')).toBeInTheDocument());
  expect(window.kubernetesGetTroubleshootingInformation).toHaveBeenCalledTimes(1);

  await fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));

  await waitFor(() => expect(window.kubernetesGetTroubleshootingInformation).toHaveBeenCalledTimes(2));
});

test('Expect the refresh icon to use the button icon token', () => {
  render(TroubleshootingPageKubernetes);

  const icon = screen.getByRole('button', { name: 'Refresh' }).querySelector('svg');
  expect(icon).toHaveClass('text-(--pd-button-icon-primary-text)');
});
