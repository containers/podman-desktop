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

import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

type TaskState = 'running' | 'completed';
type TaskStatus = 'in-progress' | 'success' | 'failure';

export interface Task {
  id: string;
  name: string;
  started: number;
  state: TaskState;
  status: TaskStatus;
  progress?: number;
  gotoTask?: () => void;
  error?: string;
}

/**
 * Defines the store used to define the tasks.
 */
export const tasksInfo: Writable<Task[]> = writable([]);

// refresh the array every second
setInterval(() => {
  tasksInfo.update(tasks => [...tasks]);
}, 1000);

// remove element from the store
export function removeTask(id: string) {
  tasksInfo.update(tasks => tasks.filter(task => task.id !== id));
}

// remove element from the store that are completed
export function clearCompletedTasks() {
  tasksInfo.update(tasks => tasks.filter(task => task.state !== 'completed'));
}

let taskId = 0;

// create a new task
export function createTask(name: string): Task {
  taskId++;
  const task: Task = {
    id: `${taskId}`,
    name,
    started: new Date().getTime(),
    state: 'running',
    status: 'in-progress',
  };
  tasksInfo.update(tasks => [...tasks, task]);
  return task;
}
