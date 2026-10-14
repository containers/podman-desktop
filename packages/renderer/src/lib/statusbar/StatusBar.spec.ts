/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import { ExperimentalTasksSettings } from '@desktop-framework/api';
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Providers from '/@/lib/statusbar/Providers.svelte';
import StatusBar from '/@/lib/statusbar/StatusBar.svelte';
import { isHighContrast } from '/@/stores/appearance';
import { onDidChangeConfiguration } from '/@/stores/configurationProperties';
import { statusBarEntries } from '/@/stores/statusbar';
import { tasksInfo } from '/@/stores/tasks';

// mock providers component
vi.mock(import('./Providers.svelte'));

const callbacks = new Map<string, (arg: unknown) => void>();

beforeEach(() => {
  vi.resetAllMocks();

  Object.defineProperty(window, 'isExperimentalConfigurationEnabled', { value: vi.fn() });
  onDidChangeConfiguration.addEventListener = vi.fn().mockImplementation((message: string, callback: () => void) => {
    callbacks.set(message, callback);
  });

  // reset stores
  statusBarEntries.set([]);
  isHighContrast.set(false);
  tasksInfo.set([
    {
      name: 'Dummy Task',
      state: 'running',
      status: 'in-progress',
      started: 0,
      id: 'dummy-task',
      cancellable: false,
    },
  ]);
});

test('onMount should call isExperimentalConfigurationEnabled', async () => {
  render(StatusBar);

  await vi.waitFor(() => expect(window.isExperimentalConfigurationEnabled).toBeCalledTimes(2));

  expect(window.isExperimentalConfigurationEnabled).nthCalledWith(
    1,
    `${ExperimentalTasksSettings.SectionName}.${ExperimentalTasksSettings.StatusBar}`,
  );

  expect(window.isExperimentalConfigurationEnabled).nthCalledWith(2, `statusbarProviders.showProviders`);
});

test('tasks should be visible when isExperimentalConfigurationEnabled is true', async () => {
  vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(true);

  const { getByRole } = render(StatusBar);

  await vi.waitFor(() => {
    const status = getByRole('status');
    expect(status).toBeDefined();
    expect(status.textContent).toBe('Dummy Task');
  });
});

test('tasks should not be visible when isExperimentalConfigurationEnabled is false', () => {
  vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(false);

  const { queryByRole } = render(StatusBar);
  const status = queryByRole('status');
  expect(status).toBeNull();
});

test('providers should be visible when isExperimentalConfigurationEnabled is true', async () => {
  vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(true);

  render(StatusBar);

  await vi.waitFor(() => {
    expect(Providers).toHaveBeenCalled();
  });
});

test('statusbar has data-pd-force-theme set to dark in non-hc mode', async () => {
  isHighContrast.set(false);

  const { getByRole } = render(StatusBar);

  const statusBar = getByRole('contentinfo');
  expect(statusBar).toHaveAttribute('data-pd-force-theme', 'dark');
});

test('statusbar has data-pd-force-theme set to hc-dark in high-contrast mode', async () => {
  isHighContrast.set(true);

  const { getByRole } = render(StatusBar);

  const statusBar = getByRole('contentinfo');
  expect(statusBar).toHaveAttribute('data-pd-force-theme', 'hc-dark');
});

describe('providers', () => {
  test('providers should not be visible when isExperimentalConfigurationEnabled is false', () => {
    vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(false);

    render(StatusBar);

    expect(Providers).not.toHaveBeenCalled();
  });

  test('providers should show up when configuration changes from false to true', async () => {
    vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(true);
    render(StatusBar);

    await vi.waitFor(() => expect(window.isExperimentalConfigurationEnabled).toBeCalledTimes(1));

    expect(Providers).not.toHaveBeenCalled();

    callbacks.get(`statusbarProviders.showProviders`)?.({
      detail: { key: `statusbarProviders.showProviders`, value: {} },
    });

    await vi.waitFor(() => expect(Providers).toHaveBeenCalled());
  });

  test('providers are hidden when configuration changes from true to false', async () => {
    vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValueOnce(false);
    vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValueOnce(true);

    render(StatusBar);

    await vi.waitFor(() => {
      expect(Providers).toHaveBeenCalled();
    });

    vi.mocked(Providers).mockReset();

    callbacks.get(`statusbarProviders.showProviders`)?.({
      detail: { key: `statusbarProviders.showProviders`, value: undefined },
    });

    await tick();

    expect(Providers).not.toHaveBeenCalled();
  });
});
