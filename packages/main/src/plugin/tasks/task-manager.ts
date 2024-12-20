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

import type { NotificationOptions } from '@podman-desktop/api';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { NotificationImpl } from '/@/plugin/tasks/notification-impl.js';
import type { NotificationTask } from '/@/plugin/tasks/notifications.js';
import { TaskImpl } from '/@/plugin/tasks/task-impl.js';
import type { Task, TaskAction, TaskUpdateEvent } from '/@/plugin/tasks/tasks.js';
import { CONFIGURATION_SECTION } from '/@api/configuration/constants.js';
import type { NotificationTaskInfo, TaskInfo } from '/@api/taskInfo.js';
import { ExperimentalTasksSettings } from '/@api/tasks-preferences.js';

import type { ApiSenderType } from '../api.js';
import type { CommandRegistry } from '../command-registry.js';
import type { StatusBarRegistry } from '../statusbar/statusbar-registry.js';

export class TaskManager {
  private taskId = 0;

  private tasks = new Map<string, TaskImpl>();

  constructor(
    private apiSender: ApiSenderType,
    private statusBarRegistry: StatusBarRegistry,
    private commandRegistry: CommandRegistry,
    private configurationRegistry: ConfigurationRegistry,
  ) {}

  public init(): void {
    // The TaskManager is responsible for creating the entry he will be using
    this.setStatusBarEntry(false);

    this.commandRegistry.registerCommand('show-task-manager', () => {
      // get the current value of the configuration flag for the task manager
      const useExperimentalTaskManager = this.configurationRegistry
        .getConfiguration(ExperimentalTasksSettings.SectionName)
        .get<boolean>(ExperimentalTasksSettings.Manager, false);

      const showEventName = useExperimentalTaskManager ? 'toggle-task-manager' : 'toggle-legacy-task-manager';

      this.apiSender.send(showEventName, '');
      this.setStatusBarEntry(false);
    });

    this.configurationRegistry.registerConfigurations([
      {
        id: `${CONFIGURATION_SECTION.EXPERIMENTAL}.tasks`,
        title: 'Tasks',
        type: 'object',
        properties: {
          [`${ExperimentalTasksSettings.SectionName}.${ExperimentalTasksSettings.StatusBar}`]: {
            description: 'Show running tasks in the status bar',
            type: 'boolean',
            default: false,
          },
          [`${ExperimentalTasksSettings.SectionName}.${ExperimentalTasksSettings.Toast}`]: {
            description: 'Display a notification toast when task is created',
            type: 'boolean',
            default: false,
          },
          [`${ExperimentalTasksSettings.SectionName}.${ExperimentalTasksSettings.Manager}`]: {
            description: 'Replace the current task manager widget by the new one',
            type: 'boolean',
            default: false,
          },
        },
      },
    ]);
  }

  private setStatusBarEntry(highlight: boolean): void {
    this.statusBarRegistry.setEntry(
      'tasks',
      false,
      0,
      undefined,
      'Tasks',
      'fa fa-bell',
      true,
      'show-task-manager',
      undefined,
      highlight,
    );
  }

  public createNotificationTask(options: NotificationOptions): NotificationTask {
    this.taskId++;
    const notificationTask = new NotificationImpl(
      `notification-${this.taskId}`,
      options.title ?? `Task ${this.taskId}`,
      options.body ?? '',
      options.silent ?? false,
      options.markdownActions,
      options.type ?? 'info',
      options.highlight ?? false,
    );

    this.registerTask(notificationTask);
    return notificationTask;
  }

  protected registerTask(task: TaskImpl): void {
    this.tasks.set(task.id, task);

    task.onUpdate(this.updateTask.bind(this));

    // notify renderer
    this.apiSender.send('task-created', this.toInfo(task));
    this.setStatusBarEntry(true);
  }

  public createTask(options?: {
    title?: string;
    action?: TaskAction;
    cancellable?: boolean;
    cancellationTokenSourceId?: number;
  }): Task {
    this.taskId++;

    const task = new TaskImpl(`task-${this.taskId}`, options?.title ? options.title : `Task ${this.taskId}`);
    task.action = options?.action;
    task.cancellable = options?.cancellable ?? false;
    if (task.cancellable && !options?.cancellationTokenSourceId) {
      throw new Error('cancellable task requires a cancellationTokenSourceId');
    }
    if (options?.cancellationTokenSourceId && !task.cancellable) {
      throw new Error('cancellationTokenSourceId is only allowed for cancellable tasks');
    }
    if (options?.cancellationTokenSourceId) {
      task.cancellationTokenSourceId = options?.cancellationTokenSourceId;
    }
    this.registerTask(task);
    return task;
  }

  /**
   * Clearing tasks will remove all tasks not in loading state
   */
  public clearTasks(): void {
    Array.from(this.tasks.values()).forEach(task => {
      if (task.state !== 'running') {
        this.removeTask(task);
      }
    });
  }

  /**
   * Given a task id will execute the corresponding action configured
   * @param taskId
   */
  public execute(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`task with id ${taskId} does not exist.`);

    if (!task.action) throw new Error(`task with id ${taskId} (${task.name}) does not have an action.`);
    task.action.execute(task);
  }

  /**
   * Utility method to serialize a Task (extension&main) to a TaskInfo (renderer)
   * @param task
   * @protected
   */
  protected toInfo(task: Task): TaskInfo | NotificationTaskInfo {
    if (this.isNotificationTask(task)) {
      return {
        id: task.id,
        name: task.name,
        started: task.started,
        action: task.action?.name,
        status: 'success',
        markdownActions: task.markdownActions,
        body: task.body ?? '',
        state: 'completed',
        error: undefined,
        cancellable: task.cancellable,
        cancellationTokenSourceId: task.cancellationTokenSourceId,
      };
    }

    return {
      id: task.id,
      name: task.name,
      started: task.started,
      state: task.state,
      status: task.status,
      progress: task.progress,
      error: task.error,
      action: task.action?.name,
      cancellable: task.cancellable,
      cancellationTokenSourceId: task.cancellationTokenSourceId,
    };
  }

  protected isNotificationTask(task: Task): task is NotificationTask {
    return 'title' in task;
  }

  public getTask(taskId: string): Task {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`task with id ${taskId} does not exist.`);
    }
    return task;
  }

  protected removeTask(task: Task): void {
    const taskImpl = this.tasks.get(task.id);
    if (taskImpl) {
      this.tasks.delete(task.id);
      taskImpl.dispose();
    }
    this.apiSender.send('task-removed', this.toInfo(task));
  }

  protected updateTask(event: TaskUpdateEvent): void {
    switch (event.action) {
      case 'update':
        this.apiSender.send('task-updated', this.toInfo(event.task));
        break;
      case 'delete':
        this.removeTask(event.task);
        break;
    }
  }
}
