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

import type { IpcMainEvent } from 'electron';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { SimpleContainerInfo } from '../api/container-info.js';
import type { ContainerProviderRegistry } from '../container-registry.js';
import type { ContributionManager } from '../contribution-manager.js';
import { DockerPluginAdapter } from './docker-plugin-adapter.js';

let dockerPluginAdapter: TestDockerPluginAdapter;

vi.mock('electron', () => {
  const mockIpcMain = {
    on: vi.fn().mockReturnThis(),
  };
  return { ipcMain: mockIpcMain };
});

const contributionManager = {} as unknown as ContributionManager;

class TestDockerPluginAdapter extends DockerPluginAdapter {
  async getVmServiceContainer(contributionId: string): Promise<SimpleContainerInfo> {
    return super.getVmServiceContainer(contributionId);
  }
}

const listSimpleContainersMock = vi.fn();
const execInContainerMock = vi.fn();
const containerProviderRegistry = {
  listSimpleContainers: listSimpleContainersMock,
  execInContainer: execInContainerMock,
} as unknown as ContainerProviderRegistry;

beforeAll(async () => {
  dockerPluginAdapter = new TestDockerPluginAdapter(contributionManager, containerProviderRegistry);
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getVmServiceContainer', async () => {
  test('Check getVmServiceContainer being found', async () => {
    const container1 = {
      Labels: {},
    };

    // another app
    const container2 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': 'fooBar',
      },
    };
    const extensionName = 'myExtension';

    // 2 plugins, only one is the VM service container
    const pluginContainer1 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
      },
    };
    // this is the container being used as service container
    const pluginServiceContainer2 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
        'io.podman_desktop.PodmanDesktop.vm-service': 'true',
      },
    };

    listSimpleContainersMock.mockResolvedValueOnce([container1, container2, pluginContainer1, pluginServiceContainer2]);

    const result = await dockerPluginAdapter.getVmServiceContainer('myExtension');
    expect(result).toBeDefined();
    expect(result).toEqual(pluginServiceContainer2);
  });

  test('Check getVmServiceContainer app not found', async () => {
    const container1 = {
      Labels: {},
    };

    // another app
    const container2 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': 'fooBar',
      },
    };
    const extensionName = 'myExtension';

    // 2 plugins, only one is the VM service container
    const pluginContainer1 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
      },
    };
    // this is the container being used as service container
    const pluginServiceContainer2 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
        'io.podman_desktop.PodmanDesktop.vm-service': 'true',
      },
    };

    listSimpleContainersMock.mockResolvedValueOnce([container1, container2, pluginContainer1, pluginServiceContainer2]);

    await expect(dockerPluginAdapter.getVmServiceContainer('anotherApp')).rejects.toThrowError(
      `No container having the label 'io.podman_desktop.PodmanDesktop.extensionName'`,
    );
  });

  test('Check getVmServiceContainer vm service not found', async () => {
    const container1 = {
      Labels: {},
    };

    // another app
    const container2 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': 'fooBar',
      },
    };
    const extensionName = 'myExtension';

    // 2 plugins, only one is the VM service container
    const pluginContainer1 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
      },
    };
    // this is the container being used as service container
    const pluginServiceContainer2 = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
        'io.podman_desktop.PodmanDesktop.vm-service': 'false',
      },
    };

    listSimpleContainersMock.mockResolvedValueOnce([container1, container2, pluginContainer1, pluginServiceContainer2]);

    await expect(dockerPluginAdapter.getVmServiceContainer('myExtension')).rejects.toThrowError(
      `No container having the label 'io.podman_desktop.PodmanDesktop.vm-service' == 'true' found.`,
    );
  });
});

describe('handle exec', async () => {
  test('handle exec inside the VM', async () => {
    const extensionName = 'myExtension';

    // this is the container being used as service container
    const pluginServiceContainer = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
        'io.podman_desktop.PodmanDesktop.vm-service': 'true',
      },
    } as unknown as SimpleContainerInfo;

    const spyGetVmServiceContainer = vi.spyOn(dockerPluginAdapter, 'getVmServiceContainer');
    spyGetVmServiceContainer.mockResolvedValueOnce(pluginServiceContainer);

    // mock execution
    execInContainerMock.mockImplementation(
      async (
        _engineId: string,
        _id: string,
        _command: string[],
        onStdout: (data: Buffer) => void,
        onStderr: (data: Buffer) => void,
      ) => {
        // write hello world as stdout
        onStdout(Buffer.from('hello\n'));
        onStdout(Buffer.from('world\n'));

        // write warning as stderr
        onStderr(Buffer.from('warning: text1\n'));
        onStderr(Buffer.from('warning: text2\n'));
      },
    );

    const result = await dockerPluginAdapter.handleExec(extensionName, 'VM_SERVICE', 'echo', ['hello', 'world']);
    expect(result.code).toEqual(0);

    expect(result.stdout).toEqual('hello\nworld\n');
    expect(result.stderr).toEqual('warning: text1\nwarning: text2\n');
  });

  test('handle exec with error inside the VM', async () => {
    const extensionName = 'myExtension';

    // this is the container being used as service container
    const pluginServiceContainer = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
        'io.podman_desktop.PodmanDesktop.vm-service': 'true',
      },
    } as unknown as SimpleContainerInfo;

    const spyGetVmServiceContainer = vi.spyOn(dockerPluginAdapter, 'getVmServiceContainer');
    spyGetVmServiceContainer.mockResolvedValueOnce(pluginServiceContainer);

    // mock execution
    execInContainerMock.mockImplementation(
      async (
        _engineId: string,
        _id: string,
        _command: string[],
        _onStdout: (data: Buffer) => void,
        _onStderr: (data: Buffer) => void,
      ) => {
        throw new Error('This is a test error');
      },
    );

    const result = await dockerPluginAdapter.handleExec(extensionName, 'VM_SERVICE', 'echo', ['hello', 'world']);
    expect(result.code).toEqual(1);

    expect(result.stdout).toEqual('');
    expect(result.signal).toEqual('Error: This is a test error');
  });
});

describe('handle execWithOptions', async () => {
  test('handle execWithOptions inside the VM', async () => {
    const extensionName = 'myExtension';

    // this is the container being used as service container
    const pluginServiceContainer = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
        'io.podman_desktop.PodmanDesktop.vm-service': 'true',
      },
    } as unknown as SimpleContainerInfo;

    const spyGetVmServiceContainer = vi.spyOn(dockerPluginAdapter, 'getVmServiceContainer');
    spyGetVmServiceContainer.mockResolvedValueOnce(pluginServiceContainer);

    // mock execution
    execInContainerMock.mockImplementation(
      async (
        _engineId: string,
        _id: string,
        _command: string[],
        onStdout: (data: Buffer) => void,
        onStderr: (data: Buffer) => void,
      ) => {
        // write hello world as stdout
        onStdout(Buffer.from('hello'));
        onStdout(Buffer.from('world\n'));

        // write warning as stderr
        onStderr(Buffer.from('warning: text1\n'));
        onStderr(Buffer.from('warning: text2\n'));
      },
    );

    const replyMock = vi.fn();
    const ipcMainEventMock = {
      reply: replyMock,
    } as unknown as IpcMainEvent;

    const callbackId = 123;

    await dockerPluginAdapter.handleExecWithOptions(
      ipcMainEventMock,
      extensionName,
      'VM_SERVICE',
      'echo',
      callbackId,
      {},
      ['hello', 'world'],
    );

    // check event reply

    expect(replyMock).toHaveBeenNthCalledWith(
      1,
      'docker-plugin-adapter:execWithOptions-callback-stdout',
      callbackId,
      Buffer.from('hello'),
    );
    expect(replyMock).toHaveBeenNthCalledWith(
      2,
      'docker-plugin-adapter:execWithOptions-callback-stdout',
      callbackId,
      Buffer.from('world\n'),
    );

    expect(replyMock).toHaveBeenNthCalledWith(
      3,
      'docker-plugin-adapter:execWithOptions-callback-stderr',
      callbackId,
      Buffer.from('warning: text1\n'),
    );
    expect(replyMock).toHaveBeenNthCalledWith(
      4,
      'docker-plugin-adapter:execWithOptions-callback-stderr',
      callbackId,
      Buffer.from('warning: text2\n'),
    );

    expect(replyMock).toHaveBeenNthCalledWith(5, 'docker-plugin-adapter:execWithOptions-callback-close', callbackId, 0);
  });

  test('handle execWithOptions inside the VM with error', async () => {
    const error = new Error('custom error');
    const extensionName = 'myExtension';

    // this is the container being used as service container
    const pluginServiceContainer = {
      Labels: {
        'io.podman_desktop.PodmanDesktop.extensionName': extensionName,
        'io.podman_desktop.PodmanDesktop.vm-service': 'true',
      },
    } as unknown as SimpleContainerInfo;

    const spyGetVmServiceContainer = vi.spyOn(dockerPluginAdapter, 'getVmServiceContainer');
    spyGetVmServiceContainer.mockResolvedValueOnce(pluginServiceContainer);

    // mock execution
    execInContainerMock.mockImplementation(() => {
      throw error;
    });

    const replyMock = vi.fn();
    const ipcMainEventMock = {
      reply: replyMock,
    } as unknown as IpcMainEvent;

    const callbackId = 123;

    await dockerPluginAdapter.handleExecWithOptions(
      ipcMainEventMock,
      extensionName,
      'VM_SERVICE',
      'echo',
      callbackId,
      {},
      ['hello', 'world'],
    );

    // check event reply with error and close
    expect(replyMock).toHaveBeenNthCalledWith(
      1,
      'docker-plugin-adapter:execWithOptions-callback-error',
      callbackId,
      error,
    );
    expect(replyMock).toHaveBeenNthCalledWith(2, 'docker-plugin-adapter:execWithOptions-callback-close', callbackId, 1);
  });
});
