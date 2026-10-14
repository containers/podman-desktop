/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { NotificationCard, NotificationCardOptions } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import { Notification } from 'electron';
import { inject, injectable } from 'inversify';

import { Disposable } from '/@/plugin/types/disposable.js';

import { TaskManager } from './task-manager.js';

@injectable()
export class NotificationRegistry {
  private notificationId = 0;
  private notificationQueue: NotificationCard[] = [];

  constructor(
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(TaskManager)
    private taskManager: TaskManager,
  ) {}

  registerExtension(extensionId: string): Disposable {
    return Disposable.create(() => {
      this.unregisterExtension(extensionId);
    });
  }

  addNotification(notificationInfo: NotificationCardOptions): Disposable {
    ++this.notificationId;
    const notification: NotificationCard = {
      ...notificationInfo,
      id: this.notificationId,
    };
    // if there is the same notification already in the queue we remove it and put it at the head of the queue
    this.notificationQueue = this.notificationQueue.filter(
      notification =>
        notification.extensionId !== notificationInfo.extensionId || notification.title !== notificationInfo.title,
    );
    // we add the new notification to the beginning of the queue to display the queue head in the dashboard
    this.notificationQueue.unshift(notification);
    // send event
    this.apiSender.send('notifications-updated');
    // create task
    const notificationTask = this.taskManager.createNotificationTask({
      title: notification.title,
      body: notification.body,
      markdownActions: notification.markdownActions,
      type: notification.type,
    });
    // we show the notification
    const electronNotification = this.showNotification({
      title: notification.title,
      body: notification.body,
      silent: notification.silent,
    });
    // return disposable object
    return Disposable.create(() => {
      notificationTask.dispose();
      electronNotification.dispose();
      this.removeNotificationById(notification.id);
    });
  }

  showNotification(options: containerDesktopAPI.NotificationOptions): Disposable {
    const notification = new Notification({
      title: options.title,
      body: options.body,
      silent: options.silent,
    });
    notification.show();
    return Disposable.create(() => {
      notification.close();
    });
  }

  removeNotificationById(id: number): void {
    this.notificationQueue = this.notificationQueue.filter(notification => notification.id !== id);
    // send event
    this.apiSender.send('notifications-updated');
  }

  removeNotificationsByExtensionAndTitle(extensionId: string, title: string): void {
    this.notificationQueue = this.notificationQueue.filter(
      notification => notification.extensionId !== extensionId || notification.title !== title,
    );
    // send event
    this.apiSender.send('notifications-updated');
  }

  removeAll(): void {
    this.notificationQueue = [];
    // send event
    this.apiSender.send('notifications-updated');
  }

  getNotifications(): NotificationCard[] {
    return this.notificationQueue;
  }

  unregisterExtension(extensionId: string): void {
    this.notificationQueue = this.notificationQueue.filter(notification => notification.extensionId !== extensionId);
    // send event
    this.apiSender.send('notifications-updated');
  }
}
