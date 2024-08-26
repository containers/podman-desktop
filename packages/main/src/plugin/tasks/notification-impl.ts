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
import type { NotificationType } from '@podman-desktop/api';

import type { NotificationTask } from '/@/plugin/tasks/notifications.js';
import { TaskImpl } from '/@/plugin/tasks/task-impl.js';

export class NotificationImpl extends TaskImpl implements NotificationTask {
  constructor(
    id: string,
    public readonly title: string,
    public readonly body: string,
    public readonly silent: boolean,
    public readonly markdownActions: string | undefined,
    public readonly type: NotificationType,
    public readonly highlight: boolean,
  ) {
    super(id, title);
    this.mState = 'completed';
    this.mStatus = 'success';
  }
}
