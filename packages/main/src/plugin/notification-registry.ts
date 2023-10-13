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
/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Notification, NotificationInfo } from './api/notification.js';
import type { ApiSenderType } from './api.js';
import { Disposable } from './types/disposable.js';

export class NotificationRegistry {
  private notificationId = 0;
  private notificationQueue: Notification[] = [];

  constructor(private apiSender: ApiSenderType) {}

  registerExtension(extensionId: string): Disposable {
    return Disposable.create(() => {
      this.unregisterExtension(extensionId);
    });
  }

  addNotification(notificationInfo: NotificationInfo): void {
    ++this.notificationId;
    const notification: Notification = {
      ...notificationInfo,
      id: this.notificationId,
    };
    // we add the new notification to the beginning of the queue to display the queue head in the dashboard
    this.notificationQueue.unshift(notification);
    // send event
    this.apiSender.send('notifications-updated');
  }

  removeNotificationById(id: number): void {
    this.notificationQueue = this.notificationQueue.filter(notification => notification.id !== id);
    // send event
    this.apiSender.send('notifications-updated');
  }

  removeNotificationsByExtensionAndTitle(extensionId: string, title: string): void {
    this.notificationQueue = this.notificationQueue.filter(
      notification => notification.extensionId !== extensionId && notification.title !== title,
    );
    // send event
    this.apiSender.send('notifications-updated');
  }

  removeAll(): void {
    this.notificationQueue = [];
    // send event
    this.apiSender.send('notifications-updated');
  }

  getNotifications(): Notification[] {
    return this.notificationQueue;
  }

  unregisterExtension(extensionId: string): void {
    this.notificationQueue = this.notificationQueue.filter(notification => notification.extensionId !== extensionId);
    // send event
    this.apiSender.send('notifications-updated');
  }
}
