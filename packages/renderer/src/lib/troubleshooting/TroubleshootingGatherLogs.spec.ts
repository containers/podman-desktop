/*********************************************************************
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
 ********************************************************************/

import '@testing-library/jest-dom/vitest';

import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import TroubleshootingGatherLogs from '/@/lib/troubleshooting/TroubleshootingGatherLogs.svelte';

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.troubleshootingSaveLogs).mockResolvedValue([]);
});

test('button should be enabled', async () => {
  const { getByRole } = render(TroubleshootingGatherLogs);

  const btn = getByRole('button', {
    name: 'Collect and save logs as .zip',
  });
  expect(btn).not.toHaveAttribute('aria-disabled', 'true');
});

test('save button should call window#troubleshootingSaveLogs', async () => {
  const { getByRole } = render(TroubleshootingGatherLogs);

  const btn = getByRole('button', {
    name: 'Collect and save logs as .zip',
  });

  await fireEvent.click(btn);

  expect(window.troubleshootingSaveLogs).toHaveBeenCalledOnce();
});
