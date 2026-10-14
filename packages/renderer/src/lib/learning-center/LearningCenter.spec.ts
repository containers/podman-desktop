/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import type { Guide } from '@desktop-framework/api/learning-center';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import LearningCenter from './LearningCenter.svelte';

const guides: Guide[] = [
  {
    id: 'podman-desktop-learning-center-example',
    url: 'https://podman-desktop.io/learning-center/example',
    title: 'My Title',
    description: 'fake description',
    categories: ['Kubernetes'],
    icon: '',
  },
];

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

beforeEach(() => {
  vi.mocked(window.listGuides).mockResolvedValue(guides);
});

afterEach(() => {
  vi.resetAllMocks();
});

test('LearningCenter component shows carousel with guides', async () => {
  render(LearningCenter);

  await vi.waitFor(() => {
    const firstCard = screen.getByText(guides[0].title);
    expect(firstCard).toBeVisible();
  });
});

test('Clicking on LearningCenter title hides carousel with guides', async () => {
  render(LearningCenter);
  await vi.waitFor(() => {
    const firstCard = screen.getByText(guides[0].title);
    expect(firstCard).toBeVisible();
  });

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toBeInTheDocument();
  expect(screen.getByText(guides[0].title)).toBeInTheDocument();
  await fireEvent.click(button);
  await vi.waitFor(async () => {
    expect(screen.queryByText(guides[0].title)).not.toBeInTheDocument();
  });
});

test('Toggling expansion sets configuration', async () => {
  render(LearningCenter);

  expect(window.updateConfigurationValue).not.toHaveBeenCalled();

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toBeInTheDocument();
  await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'true'));

  await fireEvent.click(button);
  expect(window.updateConfigurationValue).toHaveBeenCalledWith('learningCenter.expanded', false);
  await waitFor(() => expect(button).toHaveAttribute('aria-expanded', 'false'));

  await fireEvent.click(button);
  expect(window.updateConfigurationValue).toHaveBeenCalledWith('learningCenter.expanded', true);
  expect(button).toHaveAttribute('aria-expanded', 'true');

  await fireEvent.click(button);
  expect(window.updateConfigurationValue).toHaveBeenCalledWith('learningCenter.expanded', false);
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('Expanded when the config value not set', async () => {
  render(LearningCenter);

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toHaveAttribute('aria-expanded', 'true');
});

test('Collapsed when the config value is set to not expanded', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);
  render(LearningCenter);

  await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('Expanded when the config value is set to expanded', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  render(LearningCenter);

  await waitFor(() => expect(window.getConfigurationValue).toBeCalled());

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toHaveAttribute('aria-expanded', 'true');
});
