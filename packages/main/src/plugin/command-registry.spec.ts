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

import { beforeEach, describe, expect, expectTypeOf, test, vi } from 'vitest';

import type { InputQuickPickRegistry } from '/@/plugin/input-quickpick/input-quickpick-registry.js';

import type { ApiSenderType } from './api.js';
import { CommandRegistry } from './command-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';

const inputQuickPickRegistry = {
  showQuickPick: vi.fn(),
} as unknown as InputQuickPickRegistry;

let commandRegistry: CommandRegistry;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeEach(() => {
  commandRegistry = new CommandRegistry(
    {
      send: vi.fn(),
    } as unknown as ApiSenderType,
    {
      track: vi.fn(),
    } as unknown as Telemetry,
    inputQuickPickRegistry,
  );
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should dispose commands from an extension', async () => {
  const myCommandId = 'my-extension.command1';
  const title = 'My dummy Command';

  const disposable = commandRegistry.registerCommandsFromExtension('my-extension', [
    {
      command: myCommandId,
      title,
    },
  ]);

  // grab all commands
  const commandPaletteCommands = commandRegistry.getCommandPaletteCommands();
  expect(commandPaletteCommands).toBeDefined();
  expectTypeOf(commandPaletteCommands).toBeArray();
  expect(commandPaletteCommands.length).toBe(1);

  // check we have our command
  const myCommand = commandPaletteCommands.find(command => command.id === myCommandId);
  expect(myCommand).toBeDefined();
  expect(myCommand?.title).toBe(title);

  // now dispose
  disposable.dispose();

  // and checks commands are gone
  const commandPaletteCommandsAfter = commandRegistry.getCommandPaletteCommands();
  expect(commandPaletteCommandsAfter).toBeDefined();
  expectTypeOf(commandPaletteCommandsAfter).toBeArray();
  expect(commandPaletteCommandsAfter.length).toBe(0);
});

test('Should dispose global commands ', async () => {
  const myCommandId1 = 'my-global.command1';
  const title1 = 'My dummy Command';

  const disposable1 = commandRegistry.registerCommandPalette({
    command: myCommandId1,
    title: title1,
  });

  const myOtherCommandId = 'my-other.command';
  const otherTitle = 'My other Command';

  const disposable2 = commandRegistry.registerCommandPalette({
    command: myOtherCommandId,
    title: otherTitle,
  });

  // grab all commands
  const commandPaletteCommands = commandRegistry.getCommandPaletteCommands();
  expect(commandPaletteCommands).toBeDefined();
  expectTypeOf(commandPaletteCommands).toBeArray();
  expect(commandPaletteCommands.length).toBe(2);

  // check we have our command
  const myCommand = commandPaletteCommands.find(command => command.id === myCommandId1);
  expect(myCommand).toBeDefined();
  expect(myCommand?.title).toBe(title1);

  const myOtherCommand = commandPaletteCommands.find(command => command.id === myOtherCommandId);
  expect(myOtherCommand).toBeDefined();
  expect(myOtherCommand?.title).toBe(otherTitle);

  // now dispose second registration
  disposable2.dispose();

  // and checks commands are partially gone
  const commandPaletteCommandsAfter = commandRegistry.getCommandPaletteCommands();
  expect(commandPaletteCommandsAfter).toBeDefined();
  expectTypeOf(commandPaletteCommandsAfter).toBeArray();
  expect(commandPaletteCommandsAfter.length).toBe(1);

  // now clear also the first registration
  disposable1.dispose();

  // check all is gone
  const commandPaletteCommandsAfter2 = commandRegistry.getCommandPaletteCommands();
  expect(commandPaletteCommandsAfter2).toBeDefined();
  expectTypeOf(commandPaletteCommandsAfter2).toBeArray();
  expect(commandPaletteCommandsAfter2.length).toBe(0);
});

test('Should include category in the title', async () => {
  const myCommandId1 = 'my-extension.command1';
  const title1 = 'My dummy Command 1';

  const myCommandId2 = 'my-extension.command2';
  const title2 = 'My dummy Command 2';

  const category = 'My Category';

  commandRegistry.registerCommandsFromExtension('my-extension', [
    {
      command: myCommandId1,
      title: title1,
      category,
    },
    {
      command: myCommandId2,
      title: title2,
      category,
    },
  ]);

  // grab all commands
  const commandPaletteCommands = commandRegistry.getCommandPaletteCommands();
  expect(commandPaletteCommands).toBeDefined();
  expectTypeOf(commandPaletteCommands).toBeArray();
  expect(commandPaletteCommands.length).toBe(2);

  // check we have our command
  const myCommand = commandPaletteCommands.find(command => command.id === myCommandId1);
  expect(myCommand).toBeDefined();

  // should have category + title
  expect(myCommand?.title).toBe(`${category}: ${title1}`);
});

describe('showCommandPalette', () => {
  test('calling showCommandPalette should call showQuickPick', () => {
    vi.mocked(inputQuickPickRegistry.showQuickPick).mockResolvedValue(undefined);

    commandRegistry.showCommandPalette();

    expect(inputQuickPickRegistry.showQuickPick).toHaveBeenCalledWith([], {
      canPickMany: false,
      placeHolder: 'Select a command',
      title: 'Command palette',
    });
  });

  test('picking value from showQuickPick should execute corresponding command', async () => {
    const callbackMock = vi.fn();
    commandRegistry.registerCommand('hello-world', callbackMock);

    vi.mocked(inputQuickPickRegistry.showQuickPick).mockResolvedValue('hello-world');

    commandRegistry.showCommandPalette();

    expect(inputQuickPickRegistry.showQuickPick).toHaveBeenCalledWith(['hello-world'], {
      canPickMany: false,
      placeHolder: 'Select a command',
      title: 'Command palette',
    });

    await vi.waitFor(() => {
      expect(callbackMock).toHaveBeenCalled();
    });
  });
});
