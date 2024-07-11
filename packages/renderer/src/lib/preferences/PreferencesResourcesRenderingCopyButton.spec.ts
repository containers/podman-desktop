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

import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import PreferencesResourcesRenderingCopyButton from './PreferencesResourcesRenderingCopyButton.svelte';

const getOsPlatformMock = vi.fn();

beforeEach(() => {
  (window as any).getOsPlatform = getOsPlatformMock;
});

describe('Windows', () => {
  test('Expect copy in clipboard', async () => {
    getOsPlatformMock.mockResolvedValue('win32');

    const socketPath = '/socket';

    await waitRender(socketPath);
    const div = screen.getByText('npipe:///socket');
    expect(div).toBeInTheDocument();
  });
});

describe('macOS', () => {
  test('Expect copy in clipboard', async () => {
    getOsPlatformMock.mockResolvedValue('darwin');

    const socketPath = '/socket';

    await waitRender(socketPath);
    const div = screen.getByText('unix:///socket');
    expect(div).toBeInTheDocument();
  });
});

describe('Linux', () => {
  test('Expect copy in clipboard', async () => {
    getOsPlatformMock.mockResolvedValue('linux');

    const socketPath = '/socket';

    await waitRender(socketPath);
    const div = screen.getByText('unix:///socket');
    expect(div).toBeInTheDocument();
  });
});

async function waitRender(socketPath: string) {
  const result = render(PreferencesResourcesRenderingCopyButton, { path: socketPath });
  await tick();
  await tick();

  return result;
}
