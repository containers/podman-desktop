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

import type { Disposable, Event } from '@podman-desktop/api';

import type { TaskState, TaskStatus } from '/@api/taskInfo.js';

export interface TaskAction {
  name: string;
  execute: (task: Task) => void;
}

export interface TaskUpdateEvent {
  action: 'update' | 'delete';
  task: Task;
}

export interface Task extends Disposable {
  readonly id: string;
  name: string;
  readonly started: number;
  state: TaskState;
  status: TaskStatus;
  error?: string;
  progress?: number;
  action?: TaskAction;
  readonly onUpdate: Event<TaskUpdateEvent>;
}
