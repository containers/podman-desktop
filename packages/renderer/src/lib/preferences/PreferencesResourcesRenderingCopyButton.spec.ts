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
import { test, expect, vi, beforeEach, describe } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import PreferencesResourcesRenderingCopyButton from './PreferencesResourcesRenderingCopyButton.svelte';

const getOsPlatformMock = vi.fn();

beforeEach(() => {
  (window as any).getOsPlatform = getOsPlatformMock;
});

describe('Windows', () => {
  test('Expect copy in clipboard', async () => {
    getOsPlatformMock.mockResolvedValue('win32');

    const clipboardWriteTextMock = vi.fn().mockImplementation(() => {});
    (window as any).clipboardWriteText = clipboardWriteTextMock;

    const socketPath = '/socket';

    await waitRender(socketPath);

    const button = screen.getByRole('button', { name: 'Copy To Clipboard' });

    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    await fireEvent.click(button);

    const expectedParameter = 'npipe://' + socketPath;
    expect(clipboardWriteTextMock).toBeCalledWith(expectedParameter);
  });
});

describe('macOS', () => {
  test('Expect copy in clipboard', async () => {
    getOsPlatformMock.mockResolvedValue('darwin');

    const clipboardWriteTextMock = vi.fn().mockImplementation(() => {});
    (window as any).clipboardWriteText = clipboardWriteTextMock;

    const socketPath = '/socket';

    await waitRender(socketPath);

    const button = screen.getByRole('button', { name: 'Copy To Clipboard' });

    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    await fireEvent.click(button);

    const expectedParameter = 'unix://' + socketPath;
    expect(clipboardWriteTextMock).toBeCalledWith(expectedParameter);
  });
});

describe('Linux', () => {
  test('Expect copy in clipboard', async () => {
    getOsPlatformMock.mockResolvedValue('linux');

    const clipboardWriteTextMock = vi.fn().mockImplementation(() => {});
    (window as any).clipboardWriteText = clipboardWriteTextMock;

    const socketPath = '/socket';

    await waitRender(socketPath);

    const button = screen.getByRole('button', { name: 'Copy To Clipboard' });

    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    await fireEvent.click(button);

    const expectedParameter = 'unix://' + socketPath;
    expect(clipboardWriteTextMock).toBeCalledWith(expectedParameter);
  });
});
async function waitRender(socketPath: string) {
  const result = render(PreferencesResourcesRenderingCopyButton, { path: socketPath });

  while (result.component.$$.ctx[0] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
