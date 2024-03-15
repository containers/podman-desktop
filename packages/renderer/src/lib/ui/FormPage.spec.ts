/**********************************************************************
 * Copyright (C) 2023, 2024 Red Hat, Inc.
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
import userEvent from '@testing-library/user-event';
import type { TinroBreadcrumb } from 'tinro';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { currentPage, lastPage } from '../../stores/breadcrumb';
import FormPage from './FormPage.svelte';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

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
  currentPage.set({ name: name, path: '/' } as TinroBreadcrumb);
  render(FormPage, {
    title: 'No Title',
  });

  const nameElement = screen.getByLabelText('name');
  expect(nameElement).toBeInTheDocument();
  expect(nameElement).toHaveTextContent(name);
});

test('Expect backlink is defined', async () => {
  const backName = 'Last page';
  const backPath = '/back';
  lastPage.set({ name: backName, path: backPath } as TinroBreadcrumb);
  render(FormPage, {
    title: 'No Title',
  });

  const backElement = screen.getByLabelText('back');
  expect(backElement).toBeInTheDocument();
  expect(backElement).toHaveTextContent(backName);

  await fireEvent.click(backElement);

  expect(router.goto).toHaveBeenCalledWith('/back');
});

test('Expect close link is defined', async () => {
  const backPath = '/back';
  lastPage.set({ name: 'Back', path: backPath } as TinroBreadcrumb);
  render(FormPage, {
    title: 'No Title',
  });

  const closeElement = screen.getByTitle('Close');
  expect(closeElement).toBeInTheDocument();
  await fireEvent.click(closeElement);

  expect(router.goto).toHaveBeenCalledWith(backPath);
});

test('Expect Escape key works', async () => {
  const backPath = '/back';
  lastPage.set({ name: 'Back', path: backPath } as TinroBreadcrumb);
  render(FormPage, {
    title: 'No Title',
  });

  await userEvent.keyboard('{Escape}');

  expect(router.goto).toHaveBeenCalledWith('/back');
});

test('Expect no progress', async () => {
  currentPage.set({ name: 'My name', path: '/' } as TinroBreadcrumb);
  render(FormPage, {
    title: 'No Title',
    inProgress: false,
  });

  const progress = screen.queryByRole('progressbar');
  expect(progress).toBeNull();
});

test('Expect progress', async () => {
  currentPage.set({ name: 'My name', path: '/' } as TinroBreadcrumb);
  render(FormPage, {
    title: 'No Title',
    inProgress: true,
  });

  const progress = screen.getByRole('progressbar');
  expect(progress).toBeInTheDocument();
});
