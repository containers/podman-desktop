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
import userEvent from '@testing-library/user-event';
import { createRawSnippet } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import Modal from './Modal.svelte';

test('modal should be visible', async () => {
  render(Modal);

  const bg = screen.getByLabelText('fade-bg');
  expect(bg).toBeDefined();
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeDefined();
});

test('bg click should trigger close event', async () => {
  const closeMock = vi.fn();
  render(Modal, { onclose: closeMock });

  const bg = screen.getByLabelText('fade-bg');
  await userEvent.click(bg);

  expect(closeMock).toHaveBeenCalled();
});

test('bg click should NOT trigger close event if ignoreFocusOut is true', async () => {
  const closeMock = vi.fn();
  render(Modal, { onclose: closeMock, ignoreFocusOut: true });

  const bg = screen.getByLabelText('fade-bg');
  await userEvent.click(bg);

  expect(closeMock).not.toHaveBeenCalled();
});

test('Escape key should trigger close', async () => {
  const closeMock = vi.fn();
  render(Modal, { onclose: closeMock });

  await userEvent.keyboard('{Escape}');
  expect(closeMock).toHaveBeenCalled();
});

describe('Enter activates the default button', () => {
  const defaultClick = vi.fn();
  const otherClick = vi.fn();

  function renderWithButtons(markDefault = true): void {
    const children = createRawSnippet(() => ({
      render: (): string =>
        `<div><input aria-label="name" /><textarea aria-label="notes"></textarea><button type="button">Other</button><button type="button" ${markDefault ? 'data-default' : ''}>OK</button></div>`,
    }));
    render(Modal, { children });
    screen.getByRole('button', { name: 'OK' }).addEventListener('click', defaultClick);
    screen.getByRole('button', { name: 'Other' }).addEventListener('click', otherClick);
  }

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('Enter in a text input clicks the default button', async () => {
    renderWithButtons();
    await userEvent.type(screen.getByLabelText('name'), 'x{Enter}');

    expect(defaultClick).toHaveBeenCalledOnce();
    expect(otherClick).not.toHaveBeenCalled();
  });

  test('Enter with focus dropped to the body clicks the default button', async () => {
    renderWithButtons();
    (document.activeElement as HTMLElement | null)?.blur();
    await userEvent.keyboard('{Enter}');

    expect(defaultClick).toHaveBeenCalledOnce();
  });

  test('Enter in an input outside the modal does not click the default button', async () => {
    renderWithButtons();
    const outside = document.createElement('input');
    document.body.appendChild(outside);
    await userEvent.type(outside, '{Enter}');
    outside.remove();

    expect(defaultClick).not.toHaveBeenCalled();
  });

  test('Enter does nothing when no button is marked default', async () => {
    renderWithButtons(false);
    await userEvent.type(screen.getByLabelText('name'), '{Enter}');

    expect(defaultClick).not.toHaveBeenCalled();
  });

  test('Enter in a textarea does not click the default button', async () => {
    renderWithButtons();
    await userEvent.type(screen.getByLabelText('notes'), '{Enter}');

    expect(defaultClick).not.toHaveBeenCalled();
  });

  test('Enter on a focused non-default button activates only that button', async () => {
    renderWithButtons();
    screen.getByRole('button', { name: 'Other' }).focus();
    await userEvent.keyboard('{Enter}');

    expect(otherClick).toHaveBeenCalledOnce();
    expect(defaultClick).not.toHaveBeenCalled();
  });

  test('Space on a focused non-default button activates only that button', async () => {
    renderWithButtons();
    screen.getByRole('button', { name: 'Other' }).focus();
    await userEvent.keyboard(' ');

    expect(otherClick).toHaveBeenCalledOnce();
    expect(defaultClick).not.toHaveBeenCalled();
  });

  test('Enter with a modifier key does not click the default button', async () => {
    renderWithButtons();
    await userEvent.type(screen.getByLabelText('name'), '{Control>}{Enter}{/Control}');

    expect(defaultClick).not.toHaveBeenCalled();
  });

  test('Escape still closes', async () => {
    const closeMock = vi.fn();
    const children = createRawSnippet(() => ({
      render: (): string => '<button type="button" data-default>OK</button>',
    }));
    render(Modal, { onclose: closeMock, children });
    await userEvent.keyboard('{Escape}');

    expect(closeMock).toHaveBeenCalled();
  });
});

describe('translation-y', () => {
  test('default modal should have translate-y', async () => {
    render(Modal);

    const dialog = screen.getByRole('dialog');
    expect(dialog.classList).toContain('translate-y-[-5%]');
    expect(dialog.classList).not.toContain('my-[32px]');
  });

  test('modal with top should not have translate-y', async () => {
    render(Modal, { top: true });

    const dialog = screen.getByRole('dialog');
    expect(dialog.classList).not.toContain('translate-y-[-5%]');
    // should contain margin of size status bar height
    expect(dialog.classList).toContain('my-[32px]');
  });
});

test('focusContainer=true should apply tabindex="-1" and focus the dialog element', async () => {
  render(Modal, { focusContainer: true });

  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAttribute('tabindex', '-1');
  await vi.waitFor(() => expect(dialog).toHaveFocus());
});

test('focusContainer=false should not apply tabindex', async () => {
  render(Modal, { focusContainer: false });

  const dialog = screen.getByRole('dialog');
  expect(dialog).not.toHaveAttribute('tabindex');
});
