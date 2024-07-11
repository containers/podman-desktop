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

import '@testing-library/jest-dom/vitest';

import { fireEvent, getByRole, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import FormPage from './FormPage.svelte';

beforeEach(() => {
  vi.clearAllMocks();
});

test('Expect title is defined', async () => {
  const title = 'My Dummy Title';
  render(FormPage, {
    title,
  });

  const titleElement = screen.getByRole('heading', { level: 1, name: title });
  expect(titleElement).toBeInTheDocument();
  expect(titleElement).toHaveTextContent(title);
});

test('Expect no backlink or close is defined', async () => {
  render(FormPage, {
    title: 'No Title',
    showBreadcrumb: false,
  });

  const backElement = screen.queryByLabelText('back');
  expect(backElement).not.toBeInTheDocument();

  const closeElement = screen.queryByTitle('Close');
  expect(closeElement).toBeInTheDocument();
});

test('Expect name is defined', async () => {
  const name = 'My Dummy Name';
  render(FormPage, {
    title: 'No Title',
    breadcrumbRightPart: name,
  });

  const nameElement = screen.getByLabelText('name');
  expect(nameElement).toBeInTheDocument();
  expect(nameElement).toHaveTextContent(name);
});

test('Expect backlink is defined', async () => {
  const backName = 'Last page';
  const breadcrumbClickMock = vi.fn();

  render(FormPage, {
    breadcrumbLeftPart: 'Last page',
    breadcrumbRightPart: 'hello',
    title: 'No Title',
    onbreadcrumbClick: breadcrumbClickMock,
  });

  const backElement = screen.getByLabelText('back');
  expect(backElement).toBeInTheDocument();
  expect(backElement).toHaveTextContent(backName);

  await fireEvent.click(backElement);

  expect(breadcrumbClickMock).toHaveBeenCalled();
});

test('Expect close link is defined', async () => {
  const closeClickMock = vi.fn();

  render(FormPage, {
    title: 'No Title',
    breadcrumbLeftPart: 'back',
    breadcrumbRightPart: 'hello',
    onclose: closeClickMock,
  });

  const closeElement = getByRole(document.body, 'button', { name: 'Close' });
  expect(closeElement).toBeInTheDocument();
  await fireEvent.click(closeElement);

  expect(closeClickMock).toHaveBeenCalled();
});

test('Expect Escape key works', async () => {
  const closeClickMock = vi.fn();

  render(FormPage, {
    title: 'No Title',
    breadcrumbLeftPart: 'back',
    onclose: closeClickMock,
  });
  await userEvent.keyboard('{Escape}');

  expect(closeClickMock).toHaveBeenCalled();
});

test('Expect no progress', async () => {
  render(FormPage, {
    title: 'No Title',
    inProgress: false,
  });

  const progress = screen.queryByRole('progressbar');
  expect(progress).toBeNull();
});

test('Expect progress', async () => {
  render(FormPage, {
    title: 'No Title',
    inProgress: true,
  });

  const progress = screen.getByRole('progressbar');
  expect(progress).toBeInTheDocument();
});
