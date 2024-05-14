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

type NotificationType = 'info' | 'warn' | 'error';

export interface NotificationInfo {
  // title displayed on the top of the notification card
  title: string;
  // description displayed just below the title, it should explain what the notification is about
  body?: string;
  // displayed below the description, centered in the notification card. It may contains actions (like commands/buttons and links)
  markdownActions?: string;
}

export interface NotificationCardOptions extends NotificationInfo {
  extensionId: string;
  type: NotificationType;
  // the notification will be added to the dashboard queue
  highlight?: boolean;
  // whether or not to emit an OS notification noise when showing the notification.
  silent?: boolean;
}

export interface NotificationCard extends NotificationCardOptions {
  id: number;
}
