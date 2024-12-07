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
import { derived, writable } from 'svelte/store';

import { type NotificationTaskInfo, TASK_STATUSES, type TaskInfo, type TaskStatus } from '/@api/taskInfo';

import type { TaskImpl } from '../../../main/src/plugin/tasks/task-impl';
import { findMatchInLeaves } from './search-util';

/**
 * When tasks are displayed into a table, the selected property is used
 * to flag the task as being selectable.
 */
export interface TaskInfoUI extends TaskInfo {
  selected?: boolean;
}

/**
 * Defines the store used to define the tasks.
 */
export const tasksInfo: Writable<TaskInfoUI[]> = writable([]);

// is: prefixes for all the task status
export const IS_TASK_STATUSES: string[] = TASK_STATUSES.map(status => `is:${status}`);

export const searchPattern = writable('');

// get the TaskStatus value from the search pattern
export function getMatchingStatusFromSearchPattern(patternQuery: string): TaskStatus | undefined {
  const matchingFilters = patternQuery.split(' ').filter(pattern => IS_TASK_STATUSES.includes(pattern));

  if (matchingFilters.length < 1) {
    return undefined;
  }
  // take the first match
  const matchingFilter = matchingFilters[0];

  // remove the is: prefix
  const searchPattern = matchingFilter.substring(3);

  if (TASK_STATUSES.includes(searchPattern as TaskStatus)) {
    return searchPattern as TaskStatus;
  }

  return undefined;
}

export const filtered = derived([searchPattern, tasksInfo], ([$searchPattern, $tasksInfo]) => {
  const matchingStatus = getMatchingStatusFromSearchPattern($searchPattern);
  return $tasksInfo
    .filter(taskInfo =>
      findMatchInLeaves(
        taskInfo,
        $searchPattern
          .split(' ')
          .filter(pattern => !pattern.startsWith('is:'))
          .join(' ')
          .toLowerCase(),
      ),
    )
    .filter(task => (matchingStatus ? task.status === matchingStatus : true));
});

// remove element from the store
export async function removeTask(taskId: string): Promise<void> {
  return window.clearTask(taskId);
}

function updateTask(task: TaskInfo): void {
  tasksInfo.update(tasks => {
    tasks = tasks.filter(t => t.id !== task.id);
    tasks.push(task);
    return tasks;
  });
}

// remove element from the store that are completed
export async function clearNotifications(): Promise<void> {
  return window.clearTasks();
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
