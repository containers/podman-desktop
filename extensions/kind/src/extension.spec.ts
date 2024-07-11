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

import type * as extensionApi from '@podman-desktop/api';
import * as podmanDesktopApi from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { activate, moveImage, refreshKindClustersOnProviderConnectionUpdate } from './extension';
import * as util from './util';

vi.mock('./image-handler', async () => {
  return {
    ImageHandler: vi.fn().mockImplementation(() => {
      return {
        moveImage: vi.fn(),
      };
    }),
  };
});

vi.mock('@podman-desktop/api', async () => {
  return {
    window: {
      withProgress: vi.fn(),
    },
    cli: {
      createCliTool: vi.fn(),
    },
    ProgressLocation: {
      TASK_WIDGET: 'TASK_WIDGET',
    },
    provider: {
      onDidRegisterContainerConnection: vi.fn(),
      onDidUnregisterContainerConnection: vi.fn(),
      onDidUpdateProvider: vi.fn(),
      onDidUpdateContainerConnection: vi.fn(),
      createProvider: vi.fn(),
    },
    containerEngine: {
      listContainers: vi.fn(),
      onEvent: vi.fn(),
    },
    commands: {
      registerCommand: vi.fn(),
    },
    context: {
      setValue: vi.fn(),
    },
    env: {
      isWindows: false,
      isMac: false,
      isLinux: true,
      createTelemetryLogger: vi.fn().mockReturnValue({
        logUsage: vi.fn(),
      } as unknown as extensionApi.TelemetryLogger),
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(podmanDesktopApi.cli.createCliTool).mockReturnValue({
    displayName: 'test',
    dispose: vi.fn(),
  } as unknown as extensionApi.CliTool);

  vi.mocked(podmanDesktopApi.provider.createProvider).mockResolvedValue({
    setKubernetesProviderConnectionFactory: vi.fn(),
  } as unknown as extensionApi.Provider);

  const createProviderMock = vi.fn();
  (podmanDesktopApi.provider as any).createProvider = createProviderMock;
  createProviderMock.mockImplementation(() => ({ setKubernetesProviderConnectionFactory: vi.fn() }));

  vi.mocked(podmanDesktopApi.containerEngine.listContainers).mockResolvedValue([]);
});

test('check we received notifications ', async () => {
  const onDidUpdateContainerConnectionMock = vi.fn();
  (podmanDesktopApi.provider as any).onDidUpdateContainerConnection = onDidUpdateContainerConnectionMock;

  const listContainersMock = vi.fn();
  (podmanDesktopApi.containerEngine as any).listContainers = listContainersMock;
  listContainersMock.mockResolvedValue([]);

  let callbackCalled = false;
  onDidUpdateContainerConnectionMock.mockImplementation((callback: any) => {
    callback();
    callbackCalled = true;
  });

  const fakeProvider = {} as unknown as podmanDesktopApi.Provider;
  refreshKindClustersOnProviderConnectionUpdate(fakeProvider);
  expect(callbackCalled).toBeTruthy();
  expect(listContainersMock).toBeCalledTimes(1);
});

describe('cli tool', () => {
  test('activation should register cli tool when available', async () => {
    vi.spyOn(util, 'getKindBinaryInfo').mockResolvedValue({
      path: 'kind',
      version: '0.0.1',
    });

    await activate(
      vi.mocked<extensionApi.ExtensionContext>({
        storagePath: 'test-storage-path',
        subscriptions: {
          push: vi.fn(),
        },
      } as unknown as extensionApi.ExtensionContext),
    );

    expect(podmanDesktopApi.cli.createCliTool).toHaveBeenCalledWith({
      displayName: 'kind',
      path: 'kind',
      version: '0.0.1',
      name: 'kind',
      images: expect.anything(),
      markdownDescription: expect.any(String),
    });
  });

  test('activation should not register cli tool when does not exist', async () => {
    vi.spyOn(util, 'getKindBinaryInfo').mockRejectedValue(new Error('does not exist'));

    await activate(
      vi.mocked<extensionApi.ExtensionContext>({
        storagePath: 'test-storage-path',
        subscriptions: {
          push: vi.fn(),
        },
      } as unknown as extensionApi.ExtensionContext),
    );

    expect(podmanDesktopApi.cli.createCliTool).not.toHaveBeenCalled();
  });

  test('activation should register cli tool when available in storage path', async () => {
    vi.spyOn(util, 'getKindBinaryInfo').mockRejectedValueOnce(new Error('does not exist')).mockResolvedValue({
      version: '0.0.1',
      path: 'test-storage-path/kind',
    });

    await activate(
      vi.mocked<extensionApi.ExtensionContext>({
        storagePath: 'test-storage-path',
        subscriptions: {
          push: vi.fn(),
        },
      } as unknown as extensionApi.ExtensionContext),
    );

    expect(util.getKindBinaryInfo).toHaveBeenCalledTimes(2);
    expect(podmanDesktopApi.cli.createCliTool).toHaveBeenCalledWith({
      displayName: 'kind',
      path: 'test-storage-path/kind',
      version: '0.0.1',
      name: 'kind',
      images: expect.anything(),
      markdownDescription: expect.any(String),
    });
  });
});

test('Ensuring a progress task is created when calling kind.image.move command', async () => {
  const commandRegistry: { [id: string]: (image: { id: string; image: string; engineId: string }) => Promise<void> } =
    {};

  const registerCommandMock = vi.fn();
  (podmanDesktopApi.commands as any).registerCommand = registerCommandMock;

  registerCommandMock.mockImplementation((command: string, callback: (image: { image: string }) => Promise<void>) => {
    commandRegistry[command] = callback;
  });

  const createProviderMock = vi.fn();
  (podmanDesktopApi.provider as any).createProvider = createProviderMock;
  createProviderMock.mockImplementation(() => ({ setKubernetesProviderConnectionFactory: vi.fn() }));

  const listContainersMock = vi.fn();
  (podmanDesktopApi.containerEngine as any).listContainers = listContainersMock;
  listContainersMock.mockResolvedValue([]);

  const withProgressMock = vi
    .fn()
    .mockImplementation(() => moveImage({ report: vi.fn() }, { id: 'id', image: 'hello:world', engineId: '1' }));
  (podmanDesktopApi.window as any).withProgress = withProgressMock;

  const contextSetValueMock = vi.fn();
  (podmanDesktopApi.context as any).setValue = contextSetValueMock;

  vi.spyOn(util, 'getKindBinaryInfo').mockResolvedValue({
    path: 'kind',
    version: '0.0.1',
  });

  await activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  // ensure the command has been registered
  expect(commandRegistry['kind.image.move']).toBeDefined();

  // simulate a call to the command
  await commandRegistry['kind.image.move']({ id: 'id', image: 'hello:world', engineId: '1' });

  expect(withProgressMock).toHaveBeenCalled();
  expect(contextSetValueMock).toBeCalledTimes(2);
  expect(contextSetValueMock).toHaveBeenNthCalledWith(1, 'imagesPushInProgressToKind', ['id']);
  expect(contextSetValueMock).toHaveBeenNthCalledWith(2, 'imagesPushInProgressToKind', []);
});
