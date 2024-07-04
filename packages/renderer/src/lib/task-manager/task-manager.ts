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

import humanizeDuration from 'humanize-duration';

import { isStatefulTask } from '/@/stores/tasks';
import type { NotificationTask, StatefulTask, Task } from '/@api/task';

export interface StatefulTaskUI extends StatefulTask {
  age: string;
  progress?: number;
}

export class TaskManager {
  toTaskUi(task: Task): StatefulTaskUI | NotificationTask {
    if (isStatefulTask(task)) {
      const taskUI: StatefulTaskUI = {
        id: task.id,
        name: task.name,
        started: task.started,
        state: task.state,
        status: task.status,
        age: `${humanizeDuration(new Date().getTime() - task.started, { round: true, largest: 1 })} ago`,
        action: task.action,
        error: task.error,
      };

      if (task.status === 'in-progress') {
        taskUI.progress = task.progress;
      }
      return taskUI;
    }

    return task as NotificationTask;
  }
}
