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
import { beforeAll, beforeEach, expect, suite, test, vi } from 'vitest';

import HelpActions from './HelpActions.svelte';
import { Items } from './HelpItems';

let toggleMenuCallback: () => void;

const resizeObserverMock = vi.fn();

suite('HelpActions component', () => {
  beforeAll(() => {
    (window.events as unknown) = {
      receive: vi.fn(),
    };
    Object.defineProperty(window, 'ResizeObserver', { value: resizeObserverMock });
  });

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(window.events.receive).mockImplementation((channel: string, callback: () => void) => {
      toggleMenuCallback = callback;
      return {
        dispose: () => {},
      };
    });
    resizeObserverMock.mockReturnValue({ observe: vi.fn(), unobserve: vi.fn() });
  });

  test('by default is not visible', () => {
    const ha = render(HelpActions);
    const items = ha.queryAllByTitle(Items[0].title);
    expect(items).toHaveLength(0);
  });

  test.each(Items)('contains item with $title', async ({ title, tooltip }) => {
    const ha = render(HelpActions);
    toggleMenuCallback();
    await vi.waitFor(async () => {
      const item = await ha.findByTitle(tooltip ?? title);
      expect(item).toBeVisible();
    });
  });
});
