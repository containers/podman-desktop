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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import TitleBar from './TitleBar.svelte';

const getOsPlatformMock = vi.fn();

beforeAll(() => {
  (window as any).getOsPlatform = getOsPlatformMock;
});

beforeEach(() => {
  vi.resetAllMocks();
});

async function waitRender(customProperties: object): Promise<void> {
  render(TitleBar, { ...customProperties });
  await tick();
}

describe('macOS', () => {
  beforeEach(() => {
    getOsPlatformMock.mockReturnValue('darwin');
  });

  test('Check no control buttons as it is provided by the system', async () => {
    await waitRender({});

    const minimizeButton = screen.queryByRole('button', { name: 'Minimize' });
    expect(minimizeButton).not.toBeInTheDocument();

    const maximizeButton = screen.queryByRole('button', { name: 'Maximize' });
    expect(maximizeButton).not.toBeInTheDocument();

    const closeButton = screen.queryByRole('button', { name: 'Close' });
    expect(closeButton).not.toBeInTheDocument();
  });

  test('Expect no title', async () => {
    await waitRender({});

    const title = screen.queryByText('Podman Desktop');
    expect(title).not.toBeInTheDocument();
  });
});

describe('linux', () => {
  beforeEach(() => {
    getOsPlatformMock.mockReturnValue('linux');
  });

  test('Check control buttons are defined', async () => {
    await waitRender({});

    const minimizeButton = screen.getByRole('button', { name: 'Minimize' });
    expect(minimizeButton).toBeInTheDocument();

    const maximizeButton = screen.queryByRole('button', { name: 'Maximize' });
    expect(maximizeButton).toBeInTheDocument();

    const closeButton = screen.queryByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
  });

  test('Expect title', async () => {
    await waitRender({});

    const title = screen.queryByText('Podman Desktop');
    expect(title).toBeInTheDocument();
  });
});

describe('Windows', () => {
  beforeEach(() => {
    getOsPlatformMock.mockReturnValue('win32');
  });

  test('Check control buttons are defined', async () => {
    await waitRender({});

    const minimizeButton = screen.getByRole('button', { name: 'Minimize' });
    expect(minimizeButton).toBeInTheDocument();

    const maximizeButton = screen.queryByRole('button', { name: 'Maximize' });
    expect(maximizeButton).toBeInTheDocument();

    const closeButton = screen.queryByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
  });

  test('Expect title', async () => {
    await waitRender({});

    const title = screen.queryByText('Podman Desktop');
    expect(title).toBeInTheDocument();
  });
});
