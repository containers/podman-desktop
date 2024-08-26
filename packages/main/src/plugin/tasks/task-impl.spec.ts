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

import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TaskImpl } from '/@/plugin/tasks/task-impl.js';
import type { TaskUpdateEvent } from '/@/plugin/tasks/tasks.js';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('update field should send an update event', () => {
  test('name', () => {
    const onUpdateListenerMock = vi.fn<(e: TaskUpdateEvent) => void>();
    const task = new TaskImpl('test-id', 'Test name');
    task.onUpdate(onUpdateListenerMock);

    task.name = 'new name';
    expect(onUpdateListenerMock).toHaveBeenCalledWith({
      action: 'update',
      task: expect.objectContaining({
        name: 'new name',
      }),
    });
  });

  test('action', () => {
    const onUpdateListenerMock = vi.fn<(e: TaskUpdateEvent) => void>();
    const task = new TaskImpl('test-id', 'Test name');
    task.onUpdate(onUpdateListenerMock);

    task.action = {
      name: 'Test action',
      execute: vi.fn(),
    };
    expect(onUpdateListenerMock).toHaveBeenCalledWith({
      action: 'update',
      task: expect.objectContaining({
        action: expect.objectContaining({
          name: 'Test action',
          execute: expect.any(Function),
        }),
      }),
    });
  });

  test('state', () => {
    const onUpdateListenerMock = vi.fn<(e: TaskUpdateEvent) => void>();
    const task = new TaskImpl('test-id', 'Test name');
    task.onUpdate(onUpdateListenerMock);

    task.status = 'failure';
    expect(onUpdateListenerMock).toHaveBeenCalledWith({
      action: 'update',
      task: expect.objectContaining({
        state: 'completed',
        status: 'failure',
      }),
    });
  });

  test('error', () => {
    const onUpdateListenerMock = vi.fn<(e: TaskUpdateEvent) => void>();
    const task = new TaskImpl('test-id', 'Test name');
    task.onUpdate(onUpdateListenerMock);

    task.error = 'random error';
    expect(onUpdateListenerMock).toHaveBeenCalledWith({
      action: 'update',
      task: expect.objectContaining({
        error: 'random error',
        state: 'completed',
        status: 'failure',
      }),
    });
  });

  test('progress', () => {
    const onUpdateListenerMock = vi.fn<(e: TaskUpdateEvent) => void>();
    const task = new TaskImpl('test-id', 'Test name');
    task.onUpdate(onUpdateListenerMock);

    task.progress = 50;
    expect(onUpdateListenerMock).toHaveBeenCalledWith({
      action: 'update',
      task: expect.objectContaining({
        progress: 50,
      }),
    });
  });
});

test('dispose should send a delete TaskUpdateEvent', () => {
  const onUpdateListenerMock = vi.fn<(e: TaskUpdateEvent) => void>();
  const task = new TaskImpl('test-id', 'Test name');
  task.onUpdate(onUpdateListenerMock);

  task.dispose();
  expect(onUpdateListenerMock).toHaveBeenCalledWith({
    action: 'delete',
    task: expect.anything(),
  });
});
