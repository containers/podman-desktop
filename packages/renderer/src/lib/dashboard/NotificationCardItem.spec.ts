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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import type { NotificationCard } from '/@api/notification';

import NotificationCardItem from './NotificationCardItem.svelte';

const removeNotificationMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'removeNotification', { value: removeNotificationMock });
});

test('Expect notification card to show notification title, description and close button', async () => {
  const notification: NotificationCard = {
    id: 1,
    extensionId: 'extension',
    title: 'title',
    body: 'description',
    type: 'info',
  };
  render(NotificationCardItem, {
    notification,
  });

  const titleDiv = screen.getByLabelText('Notification title');
  const descriptionDiv = screen.getByLabelText('Notification description');
  expect(titleDiv).toBeInTheDocument();
  expect(descriptionDiv).toBeInTheDocument();
  expect(titleDiv.textContent).toEqual('title');
  expect(descriptionDiv.textContent).toContain('description');

  const deleteButton = screen.getByRole('button', { name: 'Delete notification 1' });
  expect(deleteButton).toBeInTheDocument();

  await fireEvent.click(deleteButton);

  expect(removeNotificationMock).toBeCalled();
});
