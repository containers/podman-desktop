/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type * as containerDesktopAPI from '@desktop-framework/extension-api';

import type { CancellationTokenRegistry } from '/@/plugin/cancellation-token-registry.js';
import type { LoggerWithEnd } from '/@/plugin/index.js';
import type { TaskManager } from '/@/plugin/tasks/task-manager.js';

interface TaskConnectionUtilsParams {
  getLogHandler(channel: string, loggerId: string): LoggerWithEnd;
  cancellationTokenRegistry: CancellationTokenRegistry;
  taskManager: TaskManager;
}

export interface TaskOptions {
  loggerId: string;
  tokenId?: number;
  title: string;
  navigateToTask: () => Promise<void>;
  execute: (logger: LoggerWithEnd, token?: containerDesktopAPI.CancellationToken) => Promise<void>;
  executeErrorMsg: (err: unknown) => string;
}

export class TaskConnectionUtils {
  constructor(protected dependencies: TaskConnectionUtilsParams) {}

  public async withTask(options: TaskOptions): Promise<void> {
    const logger = this.dependencies.getLogHandler('provider-registry:taskConnection-onData', options.loggerId);
    let token;
    if (options.tokenId) {
      const tokenSource = this.dependencies.cancellationTokenRegistry.getCancellationTokenSource(options.tokenId);
      token = tokenSource?.token;
    }

    const task = this.dependencies.taskManager.createTask({
      title: options.title,
      action: {
        name: 'Open task',
        execute: () => {
          options.navigateToTask().catch((err: unknown) => console.error(err));
        },
      },
    });

    try {
      await options.execute(logger, token);
      task.status = 'success';
    } catch (err: unknown) {
      task.error = options.executeErrorMsg(err);
      logger.error(err);
      throw err;
    } finally {
      logger.onEnd();
    }
  }
}
