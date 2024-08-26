/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import type { NotificationTaskInfo, TaskInfo } from '/@api/taskInfo';

import type { TaskImpl } from '../../../main/src/plugin/tasks/task-impl';

/**
 * Defines the store used to define the tasks.
 */
export const tasksInfo: Writable<TaskInfo[]> = writable([]);

// refresh the array every second
setInterval(() => {
  tasksInfo.update(tasks => [...tasks]);
}, 1000);

// remove element from the store
export function removeTask(taskId: string): void {
  window.clearTask(taskId);
}

function updateTask(task: TaskInfo): void {
  tasksInfo.update(tasks => {
    tasks = tasks.filter(t => t.id !== task.id);
    tasks.push(task);
    return tasks;
  });
}

// remove element from the store that are completed
export function clearNotifications(): void {
  window.clearTasks();
}

window.events?.receive('task-created', (task: unknown) => {
  tasksInfo.update(tasks => [...tasks, task as TaskInfo]);
});
window.events?.receive('task-updated', (task: unknown) => {
  updateTask(task as TaskInfo);
});
window.events?.receive('task-removed', (task: unknown) => {
  tasksInfo.update(tasks => tasks.filter(mTask => mTask.id !== (task as TaskImpl).id));
});

export function isNotificationTask(task: TaskInfo): task is NotificationTaskInfo {
  return 'body' in task;
}
