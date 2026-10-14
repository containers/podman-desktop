/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import { NavigationPage } from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContainerInfoUI } from '/@/lib/container/ContainerInfoUI';
import { commandsInfos } from '/@/stores/commands';
import { containersInfos } from '/@/stores/containers';
import { context } from '/@/stores/context';
import { navigationRegistry, type NavigationRegistryEntry } from '/@/stores/navigation/navigation-registry';
import { navigationSearchEntries } from '/@/stores/navigation-search-entries';

import CommandPalette from './CommandPalette.svelte';

const COMMAND_PALETTE_ARIA_LABEL = 'Command palette command input';

vi.mock(import('tinro'));

const mockContainerInfo = {
  id: 'test-container-id',
  name: 'test-container',
  names: ['/test-container'],
} as unknown as ContainerInfoUI;

beforeAll(() => {
  vi.mocked(window.executeCommand).mockResolvedValue(undefined);
  vi.mocked(window.openExternal).mockResolvedValue(undefined);
  vi.mocked(window.getOsPlatform).mockResolvedValue('linux');
  vi.mocked(window.getDocumentationItems).mockResolvedValue([]);

  containersInfos.set([mockContainerInfo]);
  // mock missing scrollIntoView method
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

beforeEach(() => {
  vi.clearAllMocks();
  navigationSearchEntries.set([]);
  vi.mocked(window.telemetryTrack).mockResolvedValue(undefined);
  vi.mocked(window.getCommandPaletteSearchOptions).mockResolvedValue([
    { category: 'category 1', text: 'Category 1 text', placeholder: 'Enter category 1 item' },
    { category: 'category 2', text: 'Category 2 text', placeholder: 'Enter category 2 item' },
    { category: 'category 3', text: 'Category 3 text', placeholder: 'Enter category 3 item' },
    { category: 'category 4', text: 'Category 4 text', placeholder: 'Enter category 4 item' },
  ]);
});

describe('Command Palette', () => {
  test('Expect that F1 key is displaying the widget', async () => {
    render(CommandPalette);

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

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

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

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

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    // Wait for component to initialize and items to be rendered
    await screen.findByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });

    // Switch to Commands (category 2 in this test case) mode to ensure we're testing command navigation specifically
    const commandsButton = screen.getByRole('button', { name: /Category 2/ });
    await userEvent.click(commandsButton);

    // Wait for items to appear
    await screen.findByRole('button', { name: commandTitle1 });
    await screen.findByRole('button', { name: commandTitle2 });

    // grab first item
    const firstItem = screen.getByRole('button', { name: commandTitle1 });
    // check the class selected is on this item
    expect(firstItem).toHaveClass('selected');

    // Focus the input to ensure keydown events are handled
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    await userEvent.click(input);

    // now, press the ⬇️ key using fireEvent
    await fireEvent.keyDown(window, { key: 'ArrowDown' });

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

    expect(vi.mocked(window.executeCommand)).toHaveBeenCalledWith('my-command-2');
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

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    // Wait for component to initialize and items to be rendered
    const input = await screen.findByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });

    // Switch to Commands (category 2 in this test case) mode to ensure we're testing command navigation specifically
    const commandsButton = screen.getByRole('button', { name: /Category 2/ });
    await userEvent.click(commandsButton);

    // Wait for all items to appear
    await screen.findByRole('button', { name: commandTitle1 });
    await screen.findByRole('button', { name: commandTitle2 });
    await screen.findByRole('button', { name: commandTitle3 });

    // grab first item
    const firstItem = screen.getByRole('button', { name: commandTitle1 });
    // check the class selected is on this item
    expect(firstItem).toHaveClass('selected');

    // Focus the input to ensure keydown events are handled
    await userEvent.click(input);

    // now, press the ⬆️ key using fireEvent
    await fireEvent.keyDown(window, { key: 'ArrowUp' });

    // expect we've scrolled
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();

    // check the class selected is no longer on the first item
    expect(firstItem).not.toHaveClass('selected');

    // but on the last one (as we were on top)
    const lastItem = screen.getByRole('button', { name: commandTitle3 });
    // check the class selected is on this item
    expect(lastItem).toHaveClass('selected');

    // now, press the ⬆️ key again using fireEvent
    await fireEvent.keyDown(window, { key: 'ArrowUp' });

    // but on the second one
    const secondItem = screen.getByRole('button', { name: commandTitle2 });
    // check the class selected is on this item
    expect(secondItem).toHaveClass('selected');

    // click on the item
    await userEvent.click(secondItem);

    expect(vi.mocked(window.executeCommand)).toHaveBeenCalledWith('my-command-2');
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

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    // Wait for component to initialize and items to be rendered
    const input = await screen.findByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });

    // Switch to Commands (category 2 in this test case) mode to ensure we're testing command navigation specifically
    const commandsButton = screen.getByRole('button', { name: /Category 2/ });
    await userEvent.click(commandsButton);

    // Wait for items to appear
    await screen.findByRole('button', { name: commandTitle1 });

    // grab first item
    const firstItem = screen.getByRole('button', { name: commandTitle1 });
    // check the class selected is on this item
    expect(firstItem).toHaveClass('selected');

    // Focus the input to ensure keydown events are handled
    await userEvent.click(input);

    // now, press the Enter key using fireEvent
    await fireEvent.keyDown(window, { key: 'Enter' });

    expect(vi.mocked(window.executeCommand)).toHaveBeenCalledWith('my-command-1');
  });

  test('Check filtering', async () => {
    const commandId0 = 'my-command-0';
    const commandTitle0 = 'Another Command';
    const commandId1 = 'my-command-1';
    const commandTitle1 = 'My command 1';
    const commandId2 = 'my-command-2';
    const commandTitle2 = 'My command 2';
    const commandId3 = 'my-command-3';
    const commandTitle3 = 'command 3';

    commandsInfos.set([
      {
        id: commandId0,
        title: commandTitle0,
      },
      {
        id: commandId1,
        title: commandTitle1,
      },
      {
        id: commandId2,
        title: commandTitle2,
      },
      {
        id: commandId3,
        title: commandTitle3,
      },
    ]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    // check we have the command palette input field
    const filterInput = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(filterInput).toBeInTheDocument();

    // Check items are displayed
    const item0 = screen.getByRole('listitem', { name: commandId0 });
    expect(item0).toBeInTheDocument();
    const item1 = screen.getByRole('listitem', { name: commandId1 });
    expect(item1).toBeInTheDocument();
    const item2 = screen.getByRole('listitem', { name: commandId2 });
    expect(item2).toBeInTheDocument();
    const item3 = screen.getByRole('listitem', { name: commandId3 });
    expect(item3).toBeInTheDocument();

    // now enter the text 'My '
    await userEvent.type(filterInput, 'My ');

    // check only command 1 and 2 are displayed
    const searchingItem0 = screen.queryByRole('listitem', { name: commandId0 });
    expect(searchingItem0).not.toBeInTheDocument();
    await vi.waitFor(() => expect(screen.getByRole('listitem', { name: commandId1 })).toBeInTheDocument());
    await vi.waitFor(() => expect(screen.getByRole('listitem', { name: commandId2 })).toBeInTheDocument());
    const searchingItem3 = screen.queryByRole('listitem', { name: commandId3 });
    expect(searchingItem3).not.toBeInTheDocument();

    // Focus the input to ensure keydown events are handled
    await userEvent.click(filterInput);

    // now, press the Enter key using fireEvent
    await fireEvent.keyDown(window, { key: 'Enter' });

    expect(vi.mocked(window.executeCommand)).toHaveBeenCalledWith('my-command-1');
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

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    // check we have the command palette input field
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    // Switch to Commands (category 2 in this test case) mode to ensure we're testing command navigation specifically
    const commandsButton = screen.getByRole('button', { name: /Category 2/ });
    await userEvent.click(commandsButton);

    // Wait for items to appear
    await screen.findByRole('button', { name: commandTitle1 });

    // Check some items are hidden
    const itemDisabled = screen.queryByRole('button', { name: commandTitle0 });
    expect(itemDisabled).not.toBeInTheDocument();

    const commandEnabledFromProperty = screen.getByRole('button', { name: commandTitle1 });
    expect(commandEnabledFromProperty).toBeInTheDocument();
    const item2 = screen.getByRole('button', { name: commandTitle2 });
    expect(item2).toBeInTheDocument();
    const item3 = screen.getByRole('button', { name: commandTitle3 });
    expect(item3).toBeInTheDocument();

    // Focus the input to ensure keydown events are handled
    const enablementInput = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    await userEvent.click(enablementInput);

    // now, press the Enter key using fireEvent
    await fireEvent.keyDown(window, { key: 'Enter' });

    expect(vi.mocked(window.executeCommand)).toHaveBeenCalledWith('my-command-enabled-1');
  });

  // Test data for shortcut and tab combinations
  const shortcutTabTestCases = [
    {
      description: 'Ctrl+Shift+P',
      shortcut: '{Control>}{Shift>}p{/Shift}{/Control}',
      expectedTabText: 'Ctrl+Shift+P Category 1 text',
      shouldOpen: false,
    },
    {
      description: 'F1 key',
      shortcut: '{F1}',
      expectedTabText: 'F1 > Category 2 text',
      shouldOpen: true,
    },
    {
      description: '> key',
      shortcut: '>',
      expectedTabText: 'F1 > Category 2 text',
      shouldOpen: false,
    },
    {
      description: 'Ctrl+K',
      shortcut: '{Control>}k{/Control}',
      expectedTabText: 'Ctrl+K Category 3 text',
      shouldOpen: false,
    },
    {
      description: 'Ctrl+F',
      shortcut: '{Control>}f{/Control}',
      expectedTabText: 'Ctrl+F Category 4 text',
      shouldOpen: false,
    },
  ];

  test.each(shortcutTabTestCases)(
    'Expect that $description selects $expectedTabText tab',
    async ({ shortcut, expectedTabText }) => {
      render(CommandPalette, { display: true });

      await waitFor(() => {
        expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
      });

      // press the shortcut
      await userEvent.keyboard(shortcut);

      // check command palette is now displayed
      const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
      expect(input).toBeInTheDocument();

      const expectedTab = screen.getByRole('button', { name: expectedTabText });
      expect(expectedTab).toHaveClass('text-[var(--pd-button-tab-text-selected)]');
      expect(expectedTab).toHaveClass('border-[var(--pd-button-tab-border-selected)]');

      const allTab = screen.getByRole('button', { name: 'Ctrl+Shift+P Category 1 text' });
      const commandsTab = screen.getByRole('button', { name: 'F1 > Category 2 text' });
      const docsTab = screen.getByRole('button', { name: 'Ctrl+K Category 3 text' });
      const gotoTab = screen.getByRole('button', { name: 'Ctrl+F Category 4 text' });

      [allTab, commandsTab, docsTab, gotoTab].forEach(button => {
        if (button !== expectedTab) {
          expect(button).not.toHaveClass('text-[var(--pd-button-tab-text-selected)]');
          expect(button).not.toHaveClass('border-[var(--pd-button-tab-border-selected)]');
        }
      });
    },
  );

  test.each(shortcutTabTestCases)(
    'Check that $description key can open the command palette: $shouldOpen',
    async ({ shortcut, shouldOpen }) => {
      render(CommandPalette);

      await waitFor(() => {
        expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
      });
      // check command palette is not displayed initially
      const inputBefore = screen.queryByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
      expect(inputBefore).not.toBeInTheDocument();

      await userEvent.keyboard(shortcut);
      if (shouldOpen) {
        expect(screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL })).toBeInTheDocument();
      } else {
        expect(screen.queryByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL })).not.toBeInTheDocument();
      }
    },
  );

  test('Expect that clicking tabs switches between them correctly', async () => {
    // Set up some commands so tab switching logic gets triggered
    commandsInfos.set([
      {
        id: 'test-command-1',
        title: 'Test Command 1',
      },
      {
        id: 'test-command-2',
        title: 'Test Command 2',
      },
    ]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    // check command palette is displayed
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    await screen.findByRole('button', { name: 'Test Command 1' });

    const allTab = screen.getByRole('button', { name: 'Ctrl+Shift+P Category 1 text' });
    const commandsTab = screen.getByRole('button', { name: 'F1 > Category 2 text' });
    const docsTab = screen.getByRole('button', { name: 'Ctrl+K Category 3 text' });
    const gotoTab = screen.getByRole('button', { name: 'Ctrl+F Category 4 text' });

    // initially "All" tab should be selected (index 0)
    expect(allTab).toHaveClass('text-[var(--pd-button-tab-text-selected)]');

    // click Commands tab
    await userEvent.click(commandsTab);
    await tick();
    expect(commandsTab).toHaveClass('text-[var(--pd-button-tab-text-selected)]');
    expect(allTab).not.toHaveClass('text-[var(--pd-button-tab-text-selected)]');

    // click Documentation tab
    await userEvent.click(docsTab);
    await tick();
    expect(docsTab).toHaveClass('text-[var(--pd-button-tab-text-selected)]');
    expect(commandsTab).not.toHaveClass('text-[var(--pd-button-tab-text-selected)]');

    // click Go to tab
    await userEvent.click(gotoTab);
    await tick();
    expect(gotoTab).toHaveClass('text-[var(--pd-button-tab-text-selected)]');
    expect(docsTab).not.toHaveClass('text-[var(--pd-button-tab-text-selected)]');

    // click back to All tab
    await userEvent.click(allTab);
    await tick();
    expect(allTab).toHaveClass('text-[var(--pd-button-tab-text-selected)]');
    expect(gotoTab).not.toHaveClass('text-[var(--pd-button-tab-text-selected)]');
  });

  test('Expect that tab selection state is maintained correctly', async () => {
    // Set up some commands
    commandsInfos.set([
      {
        id: 'test-command-1',
        title: 'Test Command 1',
      },
    ]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    // check command palette is displayed
    const input = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    expect(input).toBeInTheDocument();

    const allTab = screen.getByRole('button', { name: 'Ctrl+Shift+P Category 1 text' });
    const commandsTab = screen.getByRole('button', { name: 'F1 > Category 2 text' });
    const docsTab = screen.getByRole('button', { name: 'Ctrl+K Category 3 text' });
    const gotoTab = screen.getByRole('button', { name: 'Ctrl+F Category 4 text' });

    // Test that only one tab is selected at a time
    expect(allTab).toHaveClass('text-[var(--pd-button-tab-text-selected)]');
    expect(commandsTab).not.toHaveClass('text-[var(--pd-button-tab-text-selected)]');
    expect(docsTab).not.toHaveClass('text-[var(--pd-button-tab-text-selected)]');
    expect(gotoTab).not.toHaveClass('text-[var(--pd-button-tab-text-selected)]');

    // Test that border styling is also correct
    expect(allTab).toHaveClass('border-[var(--pd-button-tab-border-selected)]');
    expect(commandsTab).not.toHaveClass('border-[var(--pd-button-tab-border-selected)]');
    expect(docsTab).not.toHaveClass('border-[var(--pd-button-tab-border-selected)]');
    expect(gotoTab).not.toHaveClass('border-[var(--pd-button-tab-border-selected)]');

    // Test that placeholder text is correct for each tab
    expect(input).toHaveAttribute('placeholder', 'Enter category 1 item');

    // Click Commands tab and verify placeholder changes
    await userEvent.click(commandsTab);

    await vi.waitFor(() => expect(input).toHaveAttribute('placeholder', 'Enter category 2 item'));

    // Click Documentation tab and verify placeholder changes
    await userEvent.click(docsTab);
    await vi.waitFor(() => expect(input).toHaveAttribute('placeholder', 'Enter category 3 item'));

    // Click Go to tab and verify placeholder changes
    await userEvent.click(gotoTab);
    await vi.waitFor(() => expect(input).toHaveAttribute('placeholder', 'Enter category 4 item'));

    // Click All tab and verify placeholder changes back
    await userEvent.click(allTab);
    await vi.waitFor(() => expect(input).toHaveAttribute('placeholder', 'Enter category 1 item'));
  });

  test('Expect GoTo items are extracted from navigation registry destinations', async () => {
    const mockEntries: NavigationRegistryEntry[] = [
      {
        name: 'Containers',
        icon: {},
        link: '/containers',
        tooltip: 'Containers',
        type: 'entry',
        counter: 1,
        destinations: [
          {
            page: NavigationPage.CONTAINER_SUMMARY,
            parameters: { id: 'abc123' },
            icon: {},
            name: 'Container: web-app',
          },
          {
            page: NavigationPage.CONTAINERS,
            icon: {},
            name: 'Containers (1)',
          },
        ],
      },
      {
        name: 'Extensions',
        icon: {},
        link: '/extensions',
        tooltip: 'Extensions',
        type: 'group',
        counter: 0,
        destinations: [
          {
            page: NavigationPage.WEBVIEW,
            parameters: { id: 'my-webview' },
            icon: {},
            name: 'Extensions: AI Lab',
          },
        ],
        items: [
          {
            name: 'AI Lab',
            icon: {},
            link: '/webviews/my-webview',
            tooltip: 'AI Lab',
            type: 'entry',
            counter: 0,
            destinations: [
              {
                page: NavigationPage.WEBVIEW,
                parameters: { id: 'nested-webview' },
                icon: {},
                name: 'Extensions: Nested',
              },
            ],
          },
        ],
      },
    ];

    navigationRegistry.set(mockEntries);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    // Switch to the GoTo tab (category 4)
    const gotoTab = screen.getByRole('button', { name: /Category 4/ });
    await userEvent.click(gotoTab);

    // Should see all destinations including nested ones
    await waitFor(() => {
      expect(screen.getByRole('listitem', { name: 'Container: web-app' })).toBeInTheDocument();
    });
    expect(screen.getByRole('listitem', { name: 'Containers (1)' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Extensions: AI Lab' })).toBeInTheDocument();
    expect(screen.getByRole('listitem', { name: 'Extensions: Nested' })).toBeInTheDocument();
  });

  test('Extension route items should appear in Go to tab', async () => {
    navigationSearchEntries.set([
      { routeId: 'ext.dashboard', label: 'Extension Dashboard' },
      { routeId: 'ext.models', label: 'Extension Models', icon: 'models.png' },
    ]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    const gotoTab = screen.getByRole('button', { name: /Category 4/ });
    await userEvent.click(gotoTab);

    await waitFor(() => {
      expect(screen.getByRole('listitem', { name: 'Extension Dashboard' })).toBeInTheDocument();
    });
    expect(screen.getByRole('listitem', { name: 'Extension Models' })).toBeInTheDocument();
  });

  test('Extension route items should appear in All tab', async () => {
    navigationSearchEntries.set([{ routeId: 'ext.dashboard', label: 'Extension Dashboard' }]);
    commandsInfos.set([{ id: 'my-cmd', title: 'My Command' }]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByRole('listitem', { name: 'Extension Dashboard' })).toBeInTheDocument();
    });
    expect(screen.getByRole('listitem', { name: 'my-cmd' })).toBeInTheDocument();
  });

  test('Extension route items should be filtered by search input', async () => {
    navigationSearchEntries.set([
      { routeId: 'ext.dashboard', label: 'Extension Dashboard' },
      { routeId: 'ext.models', label: 'Extension Models' },
    ]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    const gotoTab = screen.getByRole('button', { name: /Category 4/ });
    await userEvent.click(gotoTab);

    await waitFor(() => {
      expect(screen.getByRole('listitem', { name: 'Extension Dashboard' })).toBeInTheDocument();
    });

    const filterInput = screen.getByRole('textbox', { name: COMMAND_PALETTE_ARIA_LABEL });
    await userEvent.type(filterInput, 'Models');

    await waitFor(() => {
      expect(screen.queryByRole('listitem', { name: 'Extension Dashboard' })).not.toBeInTheDocument();
    });
    expect(screen.getByRole('listitem', { name: 'Extension Models' })).toBeInTheDocument();
  });

  test('Clicking extension route item should call navigateToRoute', async () => {
    navigationSearchEntries.set([{ routeId: 'ext.dashboard', label: 'Extension Dashboard' }]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    const gotoTab = screen.getByRole('button', { name: /Category 4/ });
    await userEvent.click(gotoTab);

    const item = await screen.findByRole('button', { name: 'Extension Dashboard' });
    await userEvent.click(item);

    expect(vi.mocked(window.navigateToRoute)).toHaveBeenCalledWith('ext.dashboard');
  });

  test('Extension route item with light/dark icon should render both themed variants', async () => {
    const darkIcon = 'data:image/png;base64,dark';
    const lightIcon = 'data:image/png;base64,light';
    navigationSearchEntries.set([
      { routeId: 'ext.themed', label: 'Themed Route', icon: { light: lightIcon, dark: darkIcon } },
    ]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    const gotoTab = screen.getByRole('button', { name: /Category 4/ });
    await userEvent.click(gotoTab);

    const listItem = await screen.findByRole('listitem', { name: 'Themed Route' });
    const icons = listItem.querySelectorAll('img');
    expect(icons).toHaveLength(2);
    expect(icons[0]).toHaveAttribute('src', lightIcon);
    expect(icons[1]).toHaveAttribute('src', darkIcon);
  });

  test('Extension route item without icon should use fallback FontAwesome icon', async () => {
    navigationSearchEntries.set([{ routeId: 'ext.no-icon', label: 'No Icon Route' }]);

    render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    const gotoTab = screen.getByRole('button', { name: /Category 4/ });
    await userEvent.click(gotoTab);

    const listItem = await screen.findByRole('listitem', { name: 'No Icon Route' });
    expect(listItem).toBeInTheDocument();
    const imgIcon = listItem.querySelector('img');
    expect(imgIcon).not.toBeInTheDocument();
    const svgIcon = listItem.querySelector('svg');
    expect(svgIcon).toBeInTheDocument();
  });

  test('Expect hidden navigation entries are excluded from GoTo items', async () => {
    const mockEntries: NavigationRegistryEntry[] = [
      {
        name: 'Visible',
        icon: {},
        link: '/visible',
        tooltip: 'Visible',
        type: 'entry',
        counter: 0,
        destinations: [
          {
            page: NavigationPage.CONTAINERS,
            icon: {},
            name: 'Visible destination',
          },
        ],
      },
      {
        name: 'Hidden parent',
        icon: {},
        link: '/hidden-parent',
        tooltip: 'Hidden parent',
        type: 'group',
        hidden: true,
        counter: 0,
        destinations: [
          {
            page: NavigationPage.PODMAN_PODS,
            icon: {},
            name: 'Hidden parent destination',
          },
        ],
        items: [
          {
            name: 'Hidden child',
            icon: {},
            link: '/hidden-child',
            tooltip: 'Hidden child',
            type: 'entry',
            counter: 0,
            destinations: [
              {
                page: NavigationPage.PODMAN_POD_SUMMARY,
                parameters: { name: 'pod-a', engineId: 'podman' },
                icon: {},
                name: 'Hidden child destination',
              },
            ],
          },
        ],
      },
    ];

    navigationRegistry.set(mockEntries);

    const { getByRole, queryByRole } = render(CommandPalette, { display: true });

    await waitFor(() => {
      expect(window.getCommandPaletteSearchOptions).toHaveBeenCalled();
    });

    const gotoTab = getByRole('button', { name: 'Ctrl+F Category 4 text' });
    await userEvent.click(gotoTab);

    await waitFor(() => {
      expect(getByRole('listitem', { name: 'Visible destination' })).toBeInTheDocument();
    });
    expect(queryByRole('listitem', { name: 'Hidden parent destination' })).not.toBeInTheDocument();
    expect(queryByRole('listitem', { name: 'Hidden child destination' })).not.toBeInTheDocument();
  });
});
