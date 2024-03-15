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
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { commandsInfos } from '/@/stores/commands';
import { context } from '/@/stores/context';

import CommandPalette from './CommandPalette.svelte';

const receiveFunctionMock = vi.fn();

const COMMAND_PALETTE_ARIA_LABEL = 'Command palette command input';

const executeCommandMock = vi.fn();
// mock some methods of the window object
beforeAll(() => {
  (window.events as unknown) = {
    receive: receiveFunctionMock,
  };

  // mock missing scrollIntoView method
  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  (window as any).executeCommand = executeCommandMock;
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Command Palette', () => {
  test('Expect that F1 key is displaying the widget', async () => {
    render(CommandPalette);

    // check we have the command palette input field
    const inputBefore = screen.queryByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(inputBefore).not.toBeInTheDocument();

    // now, press the F1 key
    await userEvent.keyboard('{F1}');

    // check it's displayed now
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();
  });

  test('Expect that esc key is hiding the widget', async () => {
    render(CommandPalette, { display: true });

    // check we have the command palette input field
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    // now, press the ESC key
    await userEvent.keyboard('{Escape}');

    // check it's not displayed anymore
    expect(input).not.toBeInTheDocument();
  });

  test('Check keydown ⬇️', async () => {
    const commandTitle1 = 'My command 1';
    const commandTitle2 = 'My command 2';

    commandsInfos.set([
      {
        id: 'my-command-1',
        title: commandTitle1,
      },
      {
        id: 'my-command-2',
        title: commandTitle2,
      },
    ]);

    render(CommandPalette, { display: true });

    // check we have the command palette input field
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    // grab first item
    const firstItem = screen.getByRole('button', { name: commandTitle1 });
    // check the class selected is on this item
    expect(firstItem).toHaveClass('selected');

    // now, press the ⬇️ key
    await userEvent.keyboard('{ArrowDown}');

    // expect we've scrolled
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();

    // check the class selected is no longer on the first item
    expect(firstItem).not.toHaveClass('selected');

    // but on the second one
    const secondItem = screen.getByRole('button', { name: commandTitle2 });
    // check the class selected is on this item
    expect(secondItem).toHaveClass('selected');

    // click on the item
    await userEvent.click(secondItem);

    expect(executeCommandMock).toBeCalledWith('my-command-2');
  });

  test('Check tab key', async () => {
    const commandTitle1 = 'My command 1';
    const commandTitle2 = 'My command 2';

    commandsInfos.set([
      {
        id: 'my-command-1',
        title: commandTitle1,
      },
      {
        id: 'my-command-2',
        title: commandTitle2,
      },
    ]);

    render(CommandPalette, { display: true });

    // check we have the command palette input field
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    // grab first item
    const firstItem = screen.getByRole('button', { name: commandTitle1 });
    // check the class selected is on this item
    expect(firstItem).toHaveClass('selected');

    // now, press the Tab key
    await userEvent.keyboard('{Tab}');

    // expect we've scrolled
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();

    // check the class selected is no longer on the first item
    expect(firstItem).not.toHaveClass('selected');

    // but on the second one
    const secondItem = screen.getByRole('button', { name: commandTitle2 });
    // check the class selected is on this item
    expect(secondItem).toHaveClass('selected');

    // click on the item
    await userEvent.click(secondItem);

    expect(executeCommandMock).toBeCalledWith('my-command-2');
  });

  test('Check keyup ⬆️', async () => {
    const commandTitle1 = 'My command 1';
    const commandTitle2 = 'My command 2';
    const commandTitle3 = 'My command 3';

    commandsInfos.set([
      {
        id: 'my-command-1',
        title: commandTitle1,
      },
      {
        id: 'my-command-2',
        title: commandTitle2,
      },
      {
        id: 'my-command-3',
        title: commandTitle3,
      },
    ]);

    render(CommandPalette, { display: true });

    // check we have the command palette input field
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    // grab first item
    const firstItem = screen.getByRole('button', { name: commandTitle1 });
    // check the class selected is on this item
    expect(firstItem).toHaveClass('selected');

    // now, press the ⬆️ key
    await userEvent.keyboard('{ArrowUp}');

    // expect we've scrolled
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();

    // check the class selected is no longer on the first item
    expect(firstItem).not.toHaveClass('selected');

    // but on the last one (as we were on top)
    const lastItem = screen.getByRole('button', { name: commandTitle3 });
    // check the class selected is on this item
    expect(lastItem).toHaveClass('selected');

    // now, press the ⬆️ key again
    await userEvent.keyboard('{ArrowUp}');

    // but on the second one
    const secondItem = screen.getByRole('button', { name: commandTitle2 });
    // check the class selected is on this item
    expect(secondItem).toHaveClass('selected');

    // click on the item
    await userEvent.click(secondItem);

    expect(executeCommandMock).toBeCalledWith('my-command-2');
  });

  test('Check Enter key', async () => {
    const commandTitle1 = 'My command 1';
    const commandTitle2 = 'My command 2';

    commandsInfos.set([
      {
        id: 'my-command-1',
        title: commandTitle1,
      },
      {
        id: 'my-command-2',
        title: commandTitle2,
      },
    ]);

    render(CommandPalette, { display: true });

    // check we have the command palette input field
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    // grab first item
    const firstItem = screen.getByRole('button', { name: commandTitle1 });
    // check the class selected is on this item
    expect(firstItem).toHaveClass('selected');

    // now, press the Enter key
    await userEvent.keyboard('{Enter}');

    expect(executeCommandMock).toBeCalledWith('my-command-1');
  });

  test('Check filtering', async () => {
    const commandTitle0 = 'Another Command';
    const commandTitle1 = 'My command 1';
    const commandTitle2 = 'My command 2';
    const commandTitle3 = 'command 3';

    commandsInfos.set([
      {
        id: 'my-command-0',
        title: commandTitle0,
      },
      {
        id: 'my-command-1',
        title: commandTitle1,
      },
      {
        id: 'my-command-2',
        title: commandTitle2,
      },
      {
        id: 'my-command-3',
        title: commandTitle3,
      },
    ]);

    render(CommandPalette, { display: true });

    // check we have the command palette input field
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    // Check items are displayed
    const item0 = screen.getByRole('button', { name: commandTitle0 });
    expect(item0).toBeInTheDocument();
    const item1 = screen.getByRole('button', { name: commandTitle1 });
    expect(item1).toBeInTheDocument();
    const item2 = screen.getByRole('button', { name: commandTitle2 });
    expect(item2).toBeInTheDocument();
    const item3 = screen.getByRole('button', { name: commandTitle3 });
    expect(item3).toBeInTheDocument();

    // now enter the text 'My '
    await userEvent.type(input, 'My ');

    // check only command 1 and 2 are displayed
    const searchingItem0 = screen.queryByRole('button', { name: commandTitle0 });
    expect(searchingItem0).not.toBeInTheDocument();
    const searchingItem1 = screen.queryByRole('button', { name: commandTitle1 });
    expect(searchingItem1).toBeInTheDocument();
    const searchingItem2 = screen.queryByRole('button', { name: commandTitle2 });
    expect(searchingItem2).toBeInTheDocument();
    const searchingItem3 = screen.queryByRole('button', { name: commandTitle3 });
    expect(searchingItem3).not.toBeInTheDocument();

    // now, press the Enter key
    await userEvent.keyboard('{Enter}');

    expect(executeCommandMock).toBeCalledWith('my-command-1');
  });

  test('Check enablement', async () => {
    const commandTitle0 = 'Command always disabled';
    const commandTitle1 = 'Command enabled from property';
    const commandTitle2 = 'My dummy command 1';
    const commandTitle3 = 'My dummy command 2';

    commandsInfos.set([
      {
        id: 'my-command-disabled-0',
        title: commandTitle0,
        enablement: 'false',
      },
      {
        id: 'my-command-enabled-1',
        title: commandTitle1,
        enablement: 'myProperty === myValue',
      },
      {
        id: 'my-dummy-command-2',
        title: commandTitle2,
      },
      {
        id: 'my-dummy-command-3',
        title: commandTitle3,
      },
    ]);

    // set the context property
    context.update(ctx => {
      ctx.setValue('myProperty', 'myValue');
      return ctx;
    });

    // wait a little bit for the context to be updated
    await new Promise(resolve => setTimeout(resolve, 100));

    render(CommandPalette, { display: true });

    // check we have the command palette input field
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    // Check some items are hidden
    const itemDisabled = screen.queryByRole('button', { name: commandTitle0 });
    expect(itemDisabled).not.toBeInTheDocument();

    const commandEnabledFromProperty = screen.getByRole('button', { name: commandTitle1 });
    expect(commandEnabledFromProperty).toBeInTheDocument();
    const item2 = screen.getByRole('button', { name: commandTitle2 });
    expect(item2).toBeInTheDocument();
    const item3 = screen.getByRole('button', { name: commandTitle3 });
    expect(item3).toBeInTheDocument();

    // now, press the Enter key
    await userEvent.keyboard('{Enter}');

    expect(executeCommandMock).toBeCalledWith('my-command-enabled-1');
  });
});
