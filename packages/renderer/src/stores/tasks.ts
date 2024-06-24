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

import type { NotificationTask, StatefulTask, Task } from '/@api/task';

/**
 * Defines the store used to define the tasks.
 */
export const tasksInfo: Writable<Task[]> = writable([]);

// refresh the array every second
setInterval(() => {
  tasksInfo.update(tasks => [...tasks]);
}, 1000);

// remove element from the store
export function removeTask(id: string): void {
  tasksInfo.update(tasks => tasks.filter(task => task.id !== id));
}

function updateTask(task: Task): void {
  tasksInfo.update(tasks => {
    tasks = tasks.filter(t => t.id !== task.id);
    tasks.push(task);
    return tasks;
  });
}

// remove element from the store that are completed
export function clearNotifications(): void {
  tasksInfo.update(tasks => tasks.filter(task => isStatefulTask(task) && task.state !== 'completed'));
}

let taskId = 0;

/**
 * create a new task
 * @deprecated renderer should not create tasks
 * @param name the name of the task
 */
export function createTask(name: string): StatefulTask {
  taskId++;
  const task: StatefulTask = {
    id: `ui-${taskId}`,
    name,
    started: new Date().getTime(),
    state: 'running',
    status: 'in-progress',
  };
  tasksInfo.update(tasks => [...tasks, task]);
  return task;
}

window.events?.receive('task-created', (task: unknown) => {
  tasksInfo.update(tasks => [...tasks, task as Task]);
});
window.events?.receive('task-updated', (task: unknown) => {
  updateTask(task as Task);
});
window.events?.receive('task-removed', (task: unknown) => {
  removeTask((task as Task).id);
});

export function isStatefulTask(task: Task): task is StatefulTask {
  return 'state' in task;
}

export function isNotificationTask(task: Task): task is NotificationTask {
  return 'description' in task;
}
