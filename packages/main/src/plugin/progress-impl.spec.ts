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

/* eslint-disable @typescript-eslint/no-empty-function */

import { beforeEach, expect, test, vi } from 'vitest';
import type { ApiSenderType } from './api.js';
import { ProgressImpl, ProgressLocation } from './progress-impl.js';
import { TaskManager } from './task-manager.js';
import { CancellationTokenRegistry } from './cancellation-token-registry.js';

const apiSenderSendMock = vi.fn();
const createCancellationTokenSourceMock = vi.fn();
const getCancellationTokenSourceMock = vi.fn();
const hasCancellationTokenSourceMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

const cancellationTokenRegistryMock = {
  createCancellationTokenSource: createCancellationTokenSourceMock,
  getCancellationTokenSource: getCancellationTokenSourceMock,
  hasCancellationTokenSource: hasCancellationTokenSourceMock,
} as unknown as CancellationTokenRegistry;

test('Should create a task and report update', async () => {
  const apiSender = {
    send: apiSenderSendMock,
  } as unknown as ApiSenderType;
  const progress = new ProgressImpl(new TaskManager(apiSender), cancellationTokenRegistryMock);
  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async () => 0);
  expect(apiSenderSendMock).toBeCalledTimes(2);
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(1, 'task-created', expect.anything());
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(2, 'task-updated', expect.objectContaining({ state: 'completed' }));
});

test('Should create a task and report 2 updates', async () => {
  const apiSender = {
    send: apiSenderSendMock,
  } as unknown as ApiSenderType;
  const progress = new ProgressImpl(new TaskManager(apiSender), cancellationTokenRegistryMock);
  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async progress => {
    progress.report({ increment: 50 });
  });
  expect(apiSenderSendMock).toBeCalledTimes(3);
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(1, 'task-created', expect.anything());
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(3, 'task-updated', expect.anything());
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(3, 'task-updated', expect.objectContaining({ state: 'completed' }));
});


test('Should create a task and propagate the exception', async () => {
  const createTaskMock = vi.fn();
  const updateTaskMock = vi.fn();
  const taskManager = {
    createTask: createTaskMock,
    updateTask: updateTaskMock,
  } as unknown as TaskManager;

  createTaskMock.mockImplementation(() => ({}));

  const progress = new ProgressImpl(taskManager, cancellationTokenRegistryMock);

  try {
    await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async () => {
      throw new Error('dummy error');
    });
    // Should NEVER be here.
    expect(true).toBe(false);
  } catch (e: unknown) {
    expect((e as Error).message).toBe('dummy error');
  }

  expect(updateTaskMock).toHaveBeenCalledTimes(1);
  expect(updateTaskMock).toHaveBeenCalledWith({
    state: 'completed',
    status: 'failure',
  });
});

test('Should create a task and propagate the result', async () => {
  const createTaskMock = vi.fn();
  const updateTaskMock = vi.fn();
  const taskManager = {
    createTask: createTaskMock,
    updateTask: updateTaskMock,
  } as unknown as TaskManager;

  createTaskMock.mockImplementation(() => ({}));

  const progress = new ProgressImpl(taskManager, cancellationTokenRegistryMock);

  const result: string = await progress.withProgress<string>(
    { location: ProgressLocation.TASK_WIDGET, title: 'My task' },
    async () => {
      return 'dummy result';
    },
  );
  expect(result).toBe('dummy result');

  expect(updateTaskMock).toHaveBeenCalledTimes(1);
  expect(updateTaskMock).toHaveBeenCalledWith({
    state: 'completed',
    status: 'success',
  });
});


test('The task should not be cancelable', async () => {
  const apiSender = {
    send: apiSenderSendMock,
  } as unknown as ApiSenderType;

  const progress = new ProgressImpl(
    new TaskManager(apiSender),
    cancellationTokenRegistryMock as unknown as CancellationTokenRegistry,
  );

  await progress.withProgress(
    { location: ProgressLocation.TASK_WIDGET, title: 'My task', cancellable: false },
    async (_progress, cancellationToken) => {
      // Since cancellable is false
      expect(cancellationToken).toBeUndefined();
    },
  );
});

test('The task should be cancelled', async () => {
  const apiSender = {
    send: apiSenderSendMock,
  } as unknown as ApiSenderType;

  // Create a cancellationRegistry
  const cancellationTokenRegistry = new CancellationTokenRegistry();

  let callbackId: number | undefined = undefined;
  // Capture the callbackId created.
  createCancellationTokenSourceMock.mockImplementation(() => {
    callbackId = cancellationTokenRegistry.createCancellationTokenSource();
    return callbackId;
  });

  // Mimic full behavior
  getCancellationTokenSourceMock.mockImplementation(id => cancellationTokenRegistry.getCancellationTokenSource(id));
  hasCancellationTokenSourceMock.mockImplementation(id => cancellationTokenRegistry.hasCancellationTokenSource(id));

  // Create ProgressImpl
  const progress = new ProgressImpl(
    new TaskManager(apiSender),
    cancellationTokenRegistryMock as unknown as CancellationTokenRegistry,
  );

  // This task will cancel itself (not realistic, the cancel should be done externally)
  // E.g. the external frontend should use `await window.cancelToken(tokenId)`
  await progress.withProgress(
    { location: ProgressLocation.TASK_WIDGET, title: 'My task', cancellable: true },
    async (_progress, cancellationToken) => {
      // Since cancellable is true
      expect(cancellationToken).toBeDefined();

      let onCancellationRequestedCalled = false;
      cancellationToken?.onCancellationRequested(() => {
        onCancellationRequestedCalled = true;
      });

      expect(callbackId).toBeDefined();
      cancellationTokenRegistry.getCancellationTokenSource(callbackId as number)?.cancel();
      expect(onCancellationRequestedCalled).toBe(true);
    },
  );
});
