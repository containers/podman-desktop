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
import type { ApiSenderType } from './api';
import { ProgressImpl, ProgressLocation } from './progress-impl';
import { TaskManager } from './task-manager';

const apiSenderSendMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should create a task and report update', async () => {
  const apiSender = {
    send: apiSenderSendMock,
  } as unknown as ApiSenderType;
  const progress = new ProgressImpl(new TaskManager(apiSender));
  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async () => 0);
  expect(apiSenderSendMock).toBeCalledTimes(2);
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(1, 'task-created', expect.anything());
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(2, 'task-updated', expect.objectContaining({ state: 'completed' }));
});

test('Should create a task and report 2 updates', async () => {
  const apiSender = {
    send: apiSenderSendMock,
  } as unknown as ApiSenderType;
  const progress = new ProgressImpl(new TaskManager(apiSender));
  await progress.withProgress({ location: ProgressLocation.TASK_WIDGET, title: 'My task' }, async progress => {
    progress.report({ increment: 50 });
  });
  expect(apiSenderSendMock).toBeCalledTimes(3);
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(1, 'task-created', expect.anything());
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(3, 'task-updated', expect.anything());
  expect(apiSenderSendMock).toHaveBeenNthCalledWith(3, 'task-updated', expect.objectContaining({ state: 'completed' }));
});
