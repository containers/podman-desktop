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
import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import { notificationQueue } from '/@/stores/notifications';

import type { NotificationCard } from '../../../../main/src/plugin/api/notification';
import NotificationsBox from './NotificationsBox.svelte';

test('Expect notifications box to be hidden if there are no notifications in the queue', async () => {
  notificationQueue.set([]);
  render(NotificationsBox);

  const noNotificationsDiv = screen.queryByLabelText('Notifications');
  expect(noNotificationsDiv).not.toBeInTheDocument();
});

test('Expect to show only the first three elements from the notifications queue', async () => {
  const notification1: NotificationCard = {
    id: 1,
    extensionId: 'extension',
    title: '1',
    body: '1',
    type: 'info',
    highlight: true,
  };
  const notification2: NotificationCard = {
    id: 2,
    extensionId: 'extension',
    title: '2',
    body: '2',
    type: 'info',
    highlight: true,
  };
  const notification3: NotificationCard = {
    id: 3,
    extensionId: 'extension',
    title: '3',
    body: '3',
    type: 'info',
    highlight: true,
  };
  const notification4: NotificationCard = {
    id: 4,
    extensionId: 'extension',
    title: '4',
    body: '4',
    type: 'info',
    highlight: true,
  };
  notificationQueue.set([notification1, notification2, notification3, notification4]);
  render(NotificationsBox);

  const titleDivs = screen.getAllByLabelText('Notification title');
  expect(titleDivs.length).toBe(3);
  expect(titleDivs[0].textContent).toEqual('1');
  expect(titleDivs[1].textContent).toEqual('2');
  expect(titleDivs[2].textContent).toEqual('3');
});

test('Expect to show only the notification highlighted', async () => {
  const notification1: NotificationCard = {
    id: 1,
    extensionId: 'extension',
    title: '1',
    body: '1',
    type: 'info',
  };
  const notification2: NotificationCard = {
    id: 2,
    extensionId: 'extension',
    title: '2',
    body: '2',
    type: 'info',
    highlight: true,
  };
  const notification3: NotificationCard = {
    id: 3,
    extensionId: 'extension',
    title: '3',
    body: '3',
    type: 'info',
  };
  const notification4: NotificationCard = {
    id: 4,
    extensionId: 'extension',
    title: '4',
    body: '4',
    type: 'info',
    highlight: true,
  };
  notificationQueue.set([notification1, notification2, notification3, notification4]);
  render(NotificationsBox);

  const titleDivs = screen.getAllByLabelText('Notification title');
  expect(titleDivs.length).toBe(2);
  expect(titleDivs[0].textContent).toEqual('2');
  expect(titleDivs[1].textContent).toEqual('4');
});
