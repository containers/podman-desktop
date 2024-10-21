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

import { Client } from 'ssh2';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { MachineInfo } from './extension';
import { ProviderConnectionShellAccessImpl } from './podman-machine-stream';

const onMock = vi.fn();
const connectMock = vi.fn();
const emitMock = vi.fn();
const writeStreamMock = vi.fn();

vi.mock('@podman-desktop/api', async () => {
  return {
    EventEmitter: vi.fn(),
  };
});

const streamMock = new (require('node:events').EventEmitter)();

streamMock.write = writeStreamMock;

// Mock ssh2 Client
vi.mock('ssh2', () => {
  return {
    Client: vi.fn().mockImplementation(() => ({
      on: onMock,
      connect: connectMock,
      shell: vi.fn(callback => {
        callback(null, streamMock);
      }),
      emit: emitMock,
    })),
  };
});

class TestProviderConnectionShellAccessImpl extends ProviderConnectionShellAccessImpl {
  isConnected(): boolean {
    return super.isConnected();
  }
}

describe('Test SSH Client', () => {
  let client: Client;

  beforeEach(() => {
    client = new Client();
  });

  test('should register the ready event', () => {
    const onReady = vi.fn();

    // Adds callback for 'ready'
    client.on('ready', onReady);

    expect(onMock).toHaveBeenCalledWith('ready', onReady);
  });

  test('should register the error event', () => {
    const onError = vi.fn();

    // Adds callback for 'error'
    client.on('error', onError);

    expect(onMock).toHaveBeenCalledWith('error', onError);
  });

  test('should emit ready event', () => {
    const onReady = vi.fn();

    // Adds callback for 'ready'
    client.on('ready', onReady);

    emitMock.mockImplementation((eventName, ...args) => {
      if (eventName === 'ready') {
        onReady(...args);
      }
    });

    // Emmits event 'ready'
    client.emit('ready');

    expect(onReady).toHaveBeenCalled();
  });

  test('should emit error event', () => {
    const onError = vi.fn();

    // Adds callback for 'error'
    client.on('error', onError);

    emitMock.mockImplementation((eventName, ...args) => {
      if (eventName === 'error') {
        onError(...args);
      }
    });

    // Emmits event 'error'
    client.emit('error');

    expect(onError).toHaveBeenCalled();
  });
});

describe('Test SSH Stream', () => {
  let providerConnectionShellAccess: TestProviderConnectionShellAccessImpl;
  let client: Client;

  beforeEach(() => {
    vi.clearAllMocks();

    client = new Client();
    const machineInfo: MachineInfo = {
      port: 12345,
      remoteUsername: 'user',
      identityPath: 'path/to/privateKey',
    } as unknown as MachineInfo;

    providerConnectionShellAccess = new TestProviderConnectionShellAccessImpl(machineInfo);
  });

  test('should handle ready event, start shell and get some data', async () => {
    const onReady = vi.fn();
    const onStreamData = vi.fn();

    // Adds callback for 'ready'
    client.on('ready', onReady);

    emitMock.mockImplementation((eventName, ...args) => {
      if (eventName === 'ready') {
        onReady(...args);
      }
    });

    // Emit event 'ready'
    client.emit('ready');

    // Adds callback for 'data'
    streamMock.on('data', onStreamData);
    streamMock.emit('data', 'some_data');

    expect(onStreamData).toHaveBeenCalledWith('some_data');
  });

  test('should handle ready event and end shell', async () => {
    const onReady = vi.fn();
    const onStreamEnd = vi.fn();

    // Adds callback for 'ready'
    client.on('ready', onReady);

    emitMock.mockImplementation((eventName, ...args) => {
      if (eventName === 'ready') {
        onReady(...args);
      }
    });

    // Emit event 'ready'
    client.emit('ready');

    // Adds callback for 'close'
    streamMock.on('close', onStreamEnd);
    streamMock.emit('close');

    expect(onStreamEnd).toHaveBeenCalled();
  });
});
