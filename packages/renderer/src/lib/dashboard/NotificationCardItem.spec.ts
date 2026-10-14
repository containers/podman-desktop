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

import type { NotificationCard } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

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
  expect(deleteButton).toHaveAttribute('title', 'Delete notification');

  await fireEvent.click(deleteButton);

  expect(removeNotificationMock).toBeCalled();
});

test('Test info notification style and icon', () => {
  const notification: NotificationCard = {
    id: 1,
    extensionId: 'extension',
    title: 'Info notification title',
    body: 'Info notification description',
    type: 'info',
  };
  const { getByTitle } = render(NotificationCardItem, {
    notification,
  });
  const icon = getByTitle('Notification icon', { exact: false });
  // check icon color
  expect(icon).toHaveClass('text-[var(--pd-state-info)]');
  // check icon shape
  expect(icon).toHaveClass('fa-info-circle');
  // check icon title
  expect(icon.title).toBe('Notification icon - info');
  // check top border
  expect(screen.getByRole('region', { name: 'id: 1' })).toHaveClass('border-[var(--pd-state-info)]');
});

test('Test warning notification style and icon', () => {
  const notification: NotificationCard = {
    id: 1,
    extensionId: 'extension',
    title: 'Warning notification title',
    body: 'Warning notification description',
    type: 'warn',
  };
  const { getByTitle } = render(NotificationCardItem, {
    notification,
  });
  const icon = getByTitle('Notification icon', { exact: false });
  // check icon color
  expect(icon).toHaveClass('text-[var(--pd-state-warning)]');
  // check icon shape
  expect(icon).toHaveClass('fa-exclamation-triangle');
  // check icon title
  expect(icon.title).toBe('Notification icon - warn');
  // check top border
  expect(screen.getByRole('region', { name: 'id: 1' })).toHaveClass('border-[var(--pd-state-warning)]');
});

test('Test error notification style and icon', () => {
  const notification: NotificationCard = {
    id: 1,
    extensionId: 'extension',
    title: 'Error notification title',
    body: 'Error notification description',
    type: 'error',
  };
  const { getByTitle } = render(NotificationCardItem, {
    notification,
  });
  const icon = getByTitle('Notification icon', { exact: false });
  // check icon color
  expect(icon).toHaveClass('text-[var(--pd-state-error)]');
  // check icon shape
  expect(icon).toHaveClass('fa-circle-exclamation');
  // check icon title
  expect(icon.title).toBe('Notification icon - error');
  // check top border
  expect(screen.getByRole('region', { name: 'id: 1' })).toHaveClass('border-[var(--pd-state-error)]');
});

test('Test notification with custom icon, default color', () => {
  const notification: NotificationCard = {
    id: 1,
    extensionId: 'extension',
    title: 'Info notification title',
    body: 'Info notification description',
    type: 'info',
    icon: 'fas fa-refresh',
  };
  const { getByTitle } = render(NotificationCardItem, {
    notification,
  });
  const icon = getByTitle('Notification icon', { exact: false });
  // check that custom icon is used instead of the default
  expect(icon).toHaveClass('fa-refresh');
  // check that default color is used
  expect(icon).toHaveClass('text-[var(--pd-state-info)]');
  // check top border
  expect(screen.getByRole('region', { name: 'id: 1' })).toHaveClass('border-[var(--pd-state-info)]');
});
test('Test notification with custom icon, custom color', () => {
  const notification: NotificationCard = {
    id: 1,
    extensionId: 'extension',
    title: 'Error notification title',
    body: 'Error notification description',
    type: 'error',
    icon: 'fas fa-refresh',
    iconColor: 'text-red-600',
  };
  const { getByTitle } = render(NotificationCardItem, {
    notification,
  });
  const icon = getByTitle('Notification icon', { exact: false });
  // check that custom icon is used instead of the default
  expect(icon).toHaveClass('fa-refresh');
  // check that custom color is applied instead of the default
  expect(icon).toHaveClass('text-red-600');
  // check top border
  expect(screen.getByRole('region', { name: 'id: 1' })).toHaveClass('border-[var(--pd-state-error)]');
});
