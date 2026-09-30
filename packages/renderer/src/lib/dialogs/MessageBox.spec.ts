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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import MessageBox from './MessageBox.svelte';
import type { MessageBoxOptions } from './messagebox-input';

describe('MessageBox', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  function showMessageBox(options: MessageBoxOptions): void {
    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(options);
        }
        return { dispose: vi.fn() };
      },
    );
    render(MessageBox, {});
  }
  test('Expect that title, message, and buttons are displayed', async () => {
    const idRequest = 123;

    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'My custom title',
      message: 'My message',
      detail: 'A more detailed message',
      footerMarkdownDescription: 'Footer message in markdown',
      buttons: ['Dismiss', 'Not OK'],
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    const title = await screen.findByText(messageBoxOptions.title);
    expect(title).toBeInTheDocument();
    const message = await screen.findAllByText(messageBoxOptions.message ?? '');
    expect(message[0]).toBeInTheDocument();
    const detail = await screen.findByText(messageBoxOptions.detail ?? '');
    expect(detail).toBeInTheDocument();
    const footerMarkdownDescription = await screen.findAllByText(messageBoxOptions.footerMarkdownDescription ?? '');
    expect(footerMarkdownDescription[0]).toBeInTheDocument();
    const button1 = await screen.findByText((messageBoxOptions.buttons?.[0] as string) ?? '');
    expect(button1).toBeInTheDocument();
    const button2 = await screen.findByText((messageBoxOptions.buttons?.[1] as string) ?? '');
    expect(button2).toBeInTheDocument();
  });

  test('Expect that default Dismiss button is displayed and works', async () => {
    const idRequest = 234;

    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'My custom title',
      message: 'My message',
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    const dismiss = await screen.findByText('Dismiss');
    expect(dismiss).toBeInTheDocument();
    await fireEvent.click(dismiss);
    expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest, 0, undefined);
  });

  test('Expect that Esc closes', async () => {
    const idRequest = 456;

    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'My custom title',
      message: 'My message',
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    await userEvent.keyboard('{Escape}');
    expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest, undefined);
  });

  test('Expect that tabbing works', async () => {
    const idRequest = 567;

    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'My custom title',
      message: 'My message',
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    await userEvent.keyboard('{Tab}');
    await userEvent.keyboard('{Tab}');

    const dismiss = await screen.findByText('Dismiss');
    expect(dismiss).toEqual(document.activeElement);

    await userEvent.keyboard('{Tab}');
    expect(dismiss).not.toEqual(document.activeElement);

    await userEvent.keyboard('{Tab}');
    expect(dismiss).toEqual(document.activeElement);
  });

  test('Expect to see two messagebox in a row', async () => {
    const idRequest1 = 686;
    const idRequest2 = 687;

    const messageBoxOptions1: MessageBoxOptions = {
      id: idRequest1,
      title: 'My custom title',
      message: 'My message',
    };

    const messageBoxOptions2: MessageBoxOptions = {
      id: idRequest2,
      title: 'My custom second title',
      message: 'My second message',
    };

    let eventCallback: ((options: MessageBoxOptions) => void) | undefined;
    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          eventCallback = callback;
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    // wait that the event callback is set
    await vi.waitFor(() => eventCallback !== undefined);

    expect(eventCallback).toBeDefined();
    eventCallback?.(messageBoxOptions1);

    const dismiss1 = await screen.findByText('Dismiss');
    expect(dismiss1).toBeInTheDocument();

    const title1 = await screen.findByText(messageBoxOptions1.title);
    expect(title1).toBeInTheDocument();
    await fireEvent.click(dismiss1);
    await vi.waitFor(() => expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest1, 0, undefined));
    eventCallback?.(messageBoxOptions2);

    const dismiss2 = await screen.findByText('Dismiss');
    expect(dismiss2).toBeInTheDocument();

    const title2 = await screen.findByText(messageBoxOptions2.title);
    expect(title2).toBeInTheDocument();
    await fireEvent.click(dismiss2);
  });

  test('Expect danger type to keep default button first in layout', async () => {
    const idRequest = 700;
    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'Danger',
      message: 'Danger Message',
      type: 'danger',
      buttons: ['Delete', 'Cancel'],
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    const allButtons = screen.getAllByRole('button');
    expect(allButtons[1]).toHaveTextContent('Cancel');
    expect(allButtons[2]).toHaveTextContent('Delete');
    await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest, 1, undefined);
  });

  test('Expect explicit default and cancel ids to be honored', async () => {
    const idRequest = 701;
    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'Explicit ids',
      message: 'Message',
      type: 'warning',
      buttons: ['Ignore', 'Abort'],
      cancelId: 1,
      defaultId: 1,
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    const allButtons = screen.getAllByRole('button');
    expect(allButtons[1]).toHaveTextContent('Cancel');
    expect(allButtons[2]).toHaveTextContent('Ignore');
    await userEvent.keyboard('{Escape}');
    expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest, 1);
  });

  test('Expect cancel at index 0 to move default to index 1', async () => {
    const idRequest = 702;
    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'Cancel first',
      message: 'Message',
      buttons: ['Cancel', 'Proceed'],
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    const allButtons = screen.getAllByRole('button');
    expect(allButtons[1]).toHaveTextContent('Cancel');
    expect(allButtons[2]).toHaveTextContent('Proceed');
    await fireEvent.click(screen.getByRole('button', { name: 'Proceed' }));
    expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest, 1, undefined);
  });

  test('Expect danger default button to use danger styling', async () => {
    const messageBoxOptions: MessageBoxOptions = {
      id: 703,
      title: 'Danger default',
      message: 'Message',
      type: 'danger',
      buttons: ['Cancel', 'Delete'],
      defaultId: 1,
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton.className).toContain('pd-button-danger-bg');
  });

  test.each([
    { id: 704, title: 'Warn', message: 'Message', type: 'warning' as const },
    { id: 705, title: 'Info', message: 'Message', type: 'info' as const },
    { id: 706, title: 'Question', message: 'Message', type: 'question' as const },
  ])('Expect $type icon to render', async messageBoxOptions => {
    let eventCallback: ((options: MessageBoxOptions) => void) | undefined;
    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          eventCallback = callback;
        }
        return { dispose: vi.fn() };
      },
    );
    render(MessageBox, {});

    await vi.waitFor(() => eventCallback !== undefined);

    eventCallback?.(messageBoxOptions);
    expect(await screen.findByText(messageBoxOptions.title)).toBeInTheDocument();

    if (messageBoxOptions.type === 'info') {
      expect(document.querySelectorAll('.place-content-center').length).toBeGreaterThanOrEqual(2);
    }
  });

  test('Expect dropdown button to call selection with dropdown index', async () => {
    const idRequest = 707;
    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'Actions',
      message: 'Message',
      buttons: [{ type: 'dropdownButton', heading: 'More', buttons: ['A', 'B'] }],
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    await fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await fireEvent.click(await screen.findByText('B'));
    expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest, 0, 1);
  });

  test('Expect icon button to call selection', async () => {
    const idRequest = 708;
    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'Actions',
      message: 'Message',
      buttons: [{ type: 'iconButton', label: 'Run', icon: 'fas fa-play' }],
    };

    vi.mocked(window.events.receive).mockImplementation(
      (message: string, callback: (options: MessageBoxOptions) => void) => {
        if (message === 'showMessageBox:open') {
          callback(messageBoxOptions);
        }
        return { dispose: vi.fn() };
      },
    );

    render(MessageBox, {});

    await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Run' })).toBeInTheDocument());
    await fireEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest, 0, undefined);
  });

  test('Expect cancelId: 0 to honor button at index 0 even when label is not "Cancel"', async () => {
    const idRequest = 7015;
    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'Delete file',
      message: 'Delete this file?',
      buttons: ['Keep', 'Delete'],
      cancelId: 0,
    };

    showMessageBox(messageBoxOptions);

    // Button at index 0 is treated as cancel (rendered as "Cancel" link on left, triggered by Escape)
    // Note: allButtons[0] is the dialog close button, so action buttons start at index 1
    const allButtons = screen.getAllByRole('button');
    expect(allButtons[1]).toHaveTextContent('Cancel');
    expect(allButtons[2]).toHaveTextContent('Delete');

    await userEvent.keyboard('{Escape}');
    expect(window.sendShowMessageBoxOnSelect).toBeCalledWith(idRequest, 0);
  });

  test('Expect explicit defaultId: 0 to be honored', async () => {
    const idRequest = 710;
    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'Default at zero',
      message: 'Message',
      buttons: ['Delete', 'Proceed', 'Cancel'],
      defaultId: 0,
      cancelId: 2,
    };

    showMessageBox(messageBoxOptions);

    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    expect(deleteButton.className).toContain('pd-button-primary-bg');
  });

  test.each([
    {
      title: 'with',
      buttons: ['Proceed', 'Cancel'],
      expectedIndex: 1,
      hasCancelButton: true,
    },
    {
      title: 'without',
      buttons: ['Proceed', 'Abort'],
      expectedIndex: undefined,
      hasCancelButton: false,
    },
  ])(
    'Expect cancelId: -1 $title Cancel button to behave correctly on Escape',
    async ({ buttons, expectedIndex, hasCancelButton }) => {
      const messageBoxOptions: MessageBoxOptions = {
        id: 711,
        title: 'Negative cancelId test',
        message: 'Message',
        buttons,
        cancelId: -1,
      };

      showMessageBox(messageBoxOptions);

      if (hasCancelButton) {
        // Cancel should be auto-detected and placed on the left
        const cancelButton = screen.getByRole('button', { name: 'Cancel' });
        const otherButton = screen.getByRole('button', { name: buttons[0] });
        expect(cancelButton.compareDocumentPosition(otherButton)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
      }

      await userEvent.keyboard('{Escape}');
      expect(window.sendShowMessageBoxOnSelect).toHaveBeenCalledWith(messageBoxOptions.id, expectedIndex);
    },
  );

  test('Expect cancelId: 0 and defaultId: 0 to place button at index 0 on the left as cancel', async () => {
    const idRequest = 714;
    const messageBoxOptions: MessageBoxOptions = {
      id: idRequest,
      title: 'Both IDs at zero',
      message: 'Message',
      buttons: ['Abort', 'Continue'],
      cancelId: 0,
      defaultId: 0,
    };

    showMessageBox(messageBoxOptions);

    // When both IDs point to index 0, cancel placement takes precedence (left side)
    // Note: allButtons[0] is the dialog close button, so action buttons start at index 1
    const allButtons = screen.getAllByRole('button');
    expect(allButtons[1]).toHaveTextContent('Cancel');
    expect(allButtons[2]).toHaveTextContent('Continue');

    // Initial focus should be on the Cancel button (first) when defaultId === cancelId
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await vi.waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });

    // Escape should trigger button at index 0
    await userEvent.keyboard('{Escape}');
    expect(window.sendShowMessageBoxOnSelect).toHaveBeenCalledWith(idRequest, 0);
  });

  test('Expect out-of-range defaultId to fall back to auto-detection', async () => {
    const messageBoxOptions: MessageBoxOptions = {
      id: 714,
      title: 'Out of range default',
      message: 'Message',
      buttons: ['Option A', 'Option B', 'Cancel'],
      defaultId: 5, // out of range (only 3 buttons)
      cancelId: 2,
    };

    showMessageBox(messageBoxOptions);

    // With out-of-range defaultId, should fall back to first non-cancel button (index 0)
    const optionAButton = screen.getByRole('button', { name: 'Option A' });
    expect(optionAButton.className).toContain('pd-button-primary-bg');
  });

  test('Expect defaultId: -1 to use no primary button styling and focus first button', async () => {
    const messageBoxOptions: MessageBoxOptions = {
      id: 713,
      title: 'Negative default',
      message: 'Message',
      buttons: ['Cancel', 'Option A', 'Option B'],
      defaultId: -1,
      cancelId: 0,
    };

    showMessageBox(messageBoxOptions);

    // With defaultId: -1, no button should have primary styling
    const optionAButton = screen.getByRole('button', { name: 'Option A' });
    const optionBButton = screen.getByRole('button', { name: 'Option B' });
    expect(optionAButton.className).toContain('pd-button-secondary-bg');
    expect(optionBButton.className).toContain('pd-button-secondary-bg');

    // Initial focus should be on first button (Cancel), not last
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await vi.waitFor(() => {
      expect(cancelButton).toHaveFocus();
    });
  });

  test('Expect both cancelId: -1 and defaultId: -1 to show all secondary buttons', async () => {
    const messageBoxOptions: MessageBoxOptions = {
      id: 716,
      title: 'No cancel or default',
      message: 'Message',
      buttons: ['Option A', 'Option B', 'Option C'],
      cancelId: -1,
      defaultId: -1,
    };

    showMessageBox(messageBoxOptions);

    // All buttons should have secondary styling
    const optionAButton = screen.getByRole('button', { name: 'Option A' });
    const optionBButton = screen.getByRole('button', { name: 'Option B' });
    const optionCButton = screen.getByRole('button', { name: 'Option C' });
    expect(optionAButton.className).toContain('pd-button-secondary-bg');
    expect(optionBButton.className).toContain('pd-button-secondary-bg');
    expect(optionCButton.className).toContain('pd-button-secondary-bg');

    // Buttons should keep their original labels (not replaced with "Cancel")
    expect(optionAButton).toHaveTextContent('Option A');

    // Escape should send undefined (no cancel button)
    await userEvent.keyboard('{Escape}');
    expect(window.sendShowMessageBoxOnSelect).toHaveBeenCalledWith(messageBoxOptions.id, undefined);
  });

  test('Expect danger MessageBox with Cancel to focus Cancel button, not dialog container', async () => {
    const messageBoxOptions: MessageBoxOptions = {
      id: 709,
      title: 'Delete resource',
      message: 'Are you sure?',
      type: 'danger',
      buttons: ['Cancel', 'Delete'],
    };

    showMessageBox(messageBoxOptions);

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' });

    // Cancel button should have focus, not the dialog
    expect(cancelButton).toHaveFocus();
  });

  test('Expect non-danger MessageBox to focus default button on mount', async () => {
    const messageBoxOptions: MessageBoxOptions = {
      id: 710,
      title: 'Confirm action',
      message: 'Would you like to proceed?',
      type: 'question',
      buttons: ['Cancel', 'Proceed'],
    };

    showMessageBox(messageBoxOptions);

    const proceedButton = await screen.findByRole('button', { name: 'Proceed' });
    expect(proceedButton).toHaveFocus();
  });

  test('Expect danger MessageBox without Cancel button to focus dialog container instead of button', async () => {
    const messageBoxOptions: MessageBoxOptions = {
      id: 712,
      title: 'Danger without cancel',
      message: 'This is dangerous',
      type: 'danger',
      buttons: ['Delete'],
    };

    showMessageBox(messageBoxOptions);

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAttribute('tabindex', '-1');
    await vi.waitFor(() => expect(dialog).toHaveFocus());
  });
});
