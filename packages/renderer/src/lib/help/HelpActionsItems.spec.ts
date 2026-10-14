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

import { ActionKind, type ItemInfo } from '@desktop-framework/api';
import { render } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import HelpActionsItems from './HelpActionsItems.svelte';

export const Items: readonly ItemInfo[] = [
  {
    title: 'Getting Started',
    icon: 'fas fa-external-link-alt',
    enabled: true,
    action: {
      kind: ActionKind.LINK,
      parameter: `example.com/docs/intro`,
    },
  },
];

let toggleMenuCallback: () => void;

describe('HelpActionsItems component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(window.events.receive).mockImplementation((channel: string, callback: () => void) => {
      toggleMenuCallback = callback;
      return {
        dispose: (): void => {},
      };
    });
  });

  test('by default is not visible', () => {
    const ha = render(HelpActionsItems, { items: Items });
    const items = ha.queryAllByTitle(Items[0].title);
    expect(items).toHaveLength(0);
  });

  test('simulate clicking outside the menu closes it', async () => {
    const ha = render(HelpActionsItems, { items: Items });

    toggleMenuCallback();

    await vi.waitFor(() => {
      const helpMenu = ha.getByTestId('help-menu');
      expect(helpMenu).toBeVisible();
    });

    // Click "outside" the menu (body)
    const event = new MouseEvent('click', { bubbles: true });
    document.body.dispatchEvent(event);

    await vi.waitFor(() => {
      const helpMenu = ha.queryByTestId('help-menu');
      expect(helpMenu).toBeNull();
    });
  });

  test('create a span that has data-task-button=Help attribute, spy on and make sure that it is only called once each click', async () => {
    render(HelpActionsItems, { items: Items });

    // Create data-task-button=Help to simulate the status bar icon / button
    const span = document.createElement('span');
    span.setAttribute('data-task-button', 'Help');
    document.body.appendChild(span);

    // Click
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    span.dispatchEvent(event);

    // Expect receiveEventMock to have been called
    // why we do this is because we are mocking receiveEvent already, so we're not "toggling" it
    // this test ensures that the event is only called once / we are toggling correctly.
    expect(window.events.receive).toHaveBeenCalledTimes(1);

    // Remove the span after (unsure if needed, but dont want to break other tests)
    span.remove();
  });

  test.each(Items)('contains item with $title', async ({ title, tooltip }) => {
    const ha = render(HelpActionsItems, { items: Items });
    toggleMenuCallback();
    await vi.waitFor(async () => {
      const item = await ha.findByTitle(tooltip ?? title);
      expect(item).toBeVisible();
    });
  });

  test('should dispose of the listener when the component is unmounted', () => {
    const disposeMock = vi.fn();
    vi.mocked(window.events.receive).mockReturnValue({
      dispose: disposeMock,
    });

    const { unmount } = render(HelpActionsItems, { items: Items });

    expect(window.events.receive).toHaveBeenCalledWith('toggle-help-menu', expect.any(Function));

    expect(disposeMock).not.toHaveBeenCalled();

    unmount();

    expect(disposeMock).toHaveBeenCalled();
  });
});
