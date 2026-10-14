/**********************************************************************
 * Copyright (C) 2025-2026 Red Hat, Inc.
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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { securityRestrictionCurrentHandler } from '/@/security-restrictions-handler.js';

import type { CommandRegistry } from './command-registry.js';
import { CommandsInit } from './commands-init.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import type { NavigationManager } from './navigation/navigation-manager.js';
import type { TaskManager } from './tasks/task-manager.js';

const commandRegistryMock = {
  registerCommand: vi.fn(),
  executeCommand: vi.fn(),
} as unknown as CommandRegistry;

const taskManagerMock = {
  createTask: vi.fn(),
  updateTask: vi.fn(),
} as unknown as TaskManager;

const apiSenderMock = {
  send: vi.fn(),
} as unknown as ApiSenderType;

const navigationManagerMock = {
  hasRoute: vi.fn(),
  navigateToRoute: vi.fn(),
} as unknown as NavigationManager;

const containerProviderRegistryMock = {
  registerContainerConnection: vi.fn(),
  isApiAttached: vi.fn(),
  onApiAttached: vi.fn(),
} as unknown as ContainerProviderRegistry;

class TestCommandsInit extends CommandsInit {
  override getCommandRegistry(): CommandRegistry {
    return super.getCommandRegistry();
  }

  override getApiSender(): ApiSenderType {
    return super.getApiSender();
  }

  override getTaskManager(): TaskManager {
    return super.getTaskManager();
  }

  override getContainerProviderRegistry(): ContainerProviderRegistry {
    return super.getContainerProviderRegistry();
  }

  override getNavigationManager(): NavigationManager {
    return super.getNavigationManager();
  }
}

describe('CommandsInit', () => {
  let commandsInit: TestCommandsInit;

  beforeEach(() => {
    vi.resetAllMocks();
    commandsInit = new TestCommandsInit(
      commandRegistryMock as CommandRegistry,
      apiSenderMock as ApiSenderType,
      navigationManagerMock as NavigationManager,
      taskManagerMock as TaskManager,
      containerProviderRegistryMock as ContainerProviderRegistry,
    );
    commandsInit.init();
  });

  test('should register the feedback command', () => {
    expect(commandRegistryMock.registerCommand).toBeCalledWith('feedback', expect.anything());
  });

  test('should register the help command', () => {
    expect(commandRegistryMock.registerCommand).toBeCalledWith('help', expect.anything());
  });

  test('should register the troubleshooting command', () => {
    expect(commandRegistryMock.registerCommand).toBeCalledWith('troubleshooting', expect.anything());
  });

  test('should register the kubernetes-navigation command', () => {
    expect(commandRegistryMock.registerCommand).toBeCalledWith('kubernetes-navigation', expect.anything());
  });

  test('should register the pullImage command', () => {
    expect(commandRegistryMock.registerCommand).toBeCalledWith('pullImage', expect.anything());
  });

  test('should register the openExternal command', () => {
    expect(commandRegistryMock.registerCommand).toBeCalledWith('openExternal', expect.anything());
  });

  describe('openExternal command', () => {
    let openExternalCallback: (arg: { toString: () => string } | undefined) => Promise<void>;

    beforeEach(() => {
      const call = vi.mocked(commandRegistryMock.registerCommand).mock.calls.find(c => c[0] === 'openExternal');
      assert(call);
      openExternalCallback = call[1] as typeof openExternalCallback;
    });

    test('should route through securityRestrictionCurrentHandler', async () => {
      const handlerMock = vi.fn().mockResolvedValue(true);
      securityRestrictionCurrentHandler.handler = handlerMock;

      const uri = { toString: (): string => 'https://example.com' };
      await openExternalCallback(uri);

      expect(handlerMock).toHaveBeenCalledWith('https://example.com');
    });

    test('should not throw when handler is undefined', async () => {
      securityRestrictionCurrentHandler.handler = undefined;

      const uri = { toString: (): string => 'https://example.com' };
      await expect(openExternalCallback(uri)).resolves.toBeUndefined();
    });

    test('should do nothing when arg is falsy', async () => {
      const handlerMock = vi.fn().mockResolvedValue(true);
      securityRestrictionCurrentHandler.handler = handlerMock;

      await openExternalCallback(undefined);

      expect(handlerMock).not.toHaveBeenCalled();
    });

    test('should log and rethrow when handler rejects', async () => {
      const consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
      const cause = new Error('handler failed');
      securityRestrictionCurrentHandler.handler = vi.fn().mockRejectedValue(cause);

      const uri = { toString: (): string => 'https://example.com' };
      await expect(openExternalCallback(uri)).rejects.toThrow('Unable to open external link https://example.com');

      expect(consoleErrorMock).toHaveBeenCalledWith('Unable to open external link https://example.com', cause);
    });
  });
});
