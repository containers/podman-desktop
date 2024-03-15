/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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
import type * as extensionApi from '@podman-desktop/api';

import type { TaskManager } from '/@/plugin/task-manager.js';

import { findWindow } from '../util.js';
import { CancellationTokenImpl } from './cancellation-token.js';

export enum ProgressLocation {
  /**
   * Show progress bar under app icon in launcher bar.
   */
  APP_ICON = 1,

  /**
   * Show progress in the task manager widget
   */
  TASK_WIDGET = 2,
}

export class ProgressImpl {
  constructor(private taskManager: TaskManager) {}

  /**
   * Execute a task with progress, based on the provided options and task function.
   * @template R - The type of the result of the task.
   * @param {extensionApi.ProgressOptions} options - The options for the progress.
   * @param {Function} task - The task function to be executed with progress.
   * @returns {Promise<R>} - A promise that resolves to the result of the task.
   */
  withProgress<R>(
    options: extensionApi.ProgressOptions,
    task: (
      progress: extensionApi.Progress<{ message?: string; increment?: number }>,
      token: extensionApi.CancellationToken,
    ) => Promise<R>,
  ): Promise<R> {
    if (options.location === ProgressLocation.APP_ICON) {
      return this.withApplicationIcon(options, task);
    } else {
      return this.withWidget(options, task);
    }
  }

  withApplicationIcon<R>(
    options: extensionApi.ProgressOptions,
    task: (
      progress: extensionApi.Progress<{ message?: string; increment?: number }>,
      token: extensionApi.CancellationToken,
    ) => Promise<R>,
  ): Promise<R> {
    return task(
      {
        report: value => {
          const window = findWindow();
          if (window) {
            window.setProgressBar(value.increment ?? 1 / 100, { mode: 'normal' });
          }
        },
      },
      new CancellationTokenImpl(),
    );
  }

  async withWidget<R>(
    options: extensionApi.ProgressOptions,
    task: (
      progress: extensionApi.Progress<{ message?: string; increment?: number }>,
      token: extensionApi.CancellationToken,
    ) => Promise<R>,
  ): Promise<R> {
    const t = this.taskManager.createTask(options.title);

    return task(
      {
        report: value => {
          if (value.message) {
            t.name = value.message;
          }
          if (value.increment) {
            t.progress = value.increment;
          }
          this.taskManager.updateTask(t);
        },
      },
      new CancellationTokenImpl(),
    )
      .then(value => {
        // Middleware to capture the success of the task
        t.status = 'success';
        t.state = 'completed';
        // We propagate the result to the caller, so he can use the result
        return value;
      })
      .catch((err: unknown) => {
        // Middleware to set to error the task
        t.status = 'failure';
        t.state = 'completed';
        t.error = String(err);
        // We propagate the error to the caller, so it can handle it if needed
        throw err;
      })
      .finally(() => {
        // Ensure the taskManager is updated properly is every case
        this.taskManager.updateTask(t);
      });
  }
}
