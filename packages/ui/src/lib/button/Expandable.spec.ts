/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { createRawSnippet, type Snippet } from 'svelte';
import { afterEach, expect, test, vi } from 'vitest';

import Expandable from './Expandable.svelte';

vi.mock(import('svelte/transition'), () => ({
  slide: (): { delay: number; duration: number } => ({
    delay: 0,
    duration: 0,
  }),
  fade: (): { delay: number; duration: number } => ({
    delay: 0,
    duration: 0,
  }),
}));

const aTitle: Snippet<[]> = createRawSnippet(() => {
  return {
    render: (): string => '<div>Title</div>',
  };
});

const someContent: Snippet<[]> = createRawSnippet(() => {
  return {
    render: (): string => '<div>Content</div>',
  };
});

afterEach(() => {
  vi.resetAllMocks();
});

function renderIt(expanded: boolean, initialized?: boolean, onclick?: (expanded: boolean) => void): void {
  render(Expandable, { title: aTitle, children: someContent, expanded, initialized: initialized ?? true, onclick });
}

test('Check title and content are visible by default', async () => {
  renderIt(true);

  const title = screen.getByText('Title');
  expect(title).toBeVisible();
  expect(title.parentElement?.parentElement).toHaveAttribute('aria-expanded', 'true');
  expect(title.parentElement?.parentElement?.parentElement).toHaveClass('gap-2');

  expect(screen.getByText('Content')).toBeInTheDocument();
});

test('Check only content is hidden when closed', async () => {
  renderIt(false);

  const title = screen.getByText('Title');
  expect(title).toBeVisible();
  expect(title.parentElement?.parentElement).toHaveAttribute('aria-expanded', 'false');

  expect(screen.queryByText('Content')).not.toBeInTheDocument();
});

test('Check content is hidden when not initialized', async () => {
  renderIt(true, false);

  const title = screen.getByText('Title');
  expect(title).toBeVisible();
  expect(screen.queryByText('Content')).not.toBeInTheDocument();
});

test('Check clicking toggles the content', async () => {
  renderIt(true);

  const title = screen.getByText('Title');
  expect(title).toBeVisible();
  expect(title.parentElement?.parentElement).toHaveAttribute('aria-expanded', 'true');

  expect(screen.getByText('Content')).toBeInTheDocument();

  await fireEvent.click(title);
  await waitFor(() => expect(screen.queryByText('Content')).not.toBeInTheDocument());
  expect(title.parentElement?.parentElement).toHaveAttribute('aria-expanded', 'false');

  await fireEvent.click(title);
  await waitFor(() => expect(screen.queryByText('Content')).toBeInTheDocument());
  expect(title.parentElement?.parentElement).toHaveAttribute('aria-expanded', 'true');
});

test('Check clicking fires an event', async () => {
  const clickMock = vi.fn();
  renderIt(true, true, clickMock);

  const title = screen.getByText('Title');
  expect(title).toBeVisible();
  expect(screen.getByText('Content')).toBeInTheDocument();

  await fireEvent.click(title);
  await waitFor(() => expect(screen.queryByText('Content')).not.toBeInTheDocument());
  expect(clickMock).toHaveBeenCalledOnce();
  expect(clickMock).toHaveBeenCalledWith(false);

  await fireEvent.click(title);
  await waitFor(() => expect(screen.queryByText('Content')).toBeInTheDocument());
  expect(clickMock).toHaveBeenCalledTimes(2);
  expect(clickMock).toHaveBeenCalledWith(true);
});

test('Check chevron is present', async () => {
  renderIt(false);

  const title = screen.getByText('Title');
  const chevronIcon = title.parentElement?.querySelector('svg');
  expect(chevronIcon).toBeInTheDocument();
});
