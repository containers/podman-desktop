/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import learningCenter from '../../../../main/src/plugin/learning-center/guides.json';
import LearningCenter from './LearningCenter.svelte';

vi.mock('../ui/animations', () => ({
  fadeSlide: () => ({
    delay: 0,
    duration: 0,
  }),
}));

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

const updateConfigurationValueMock = vi.fn();
const getConfigurationValueMock = vi.fn();
const listGuidesMock = vi.fn().mockReturnValue(learningCenter.guides);

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', {
    value: getConfigurationValueMock,
  });
  Object.defineProperty(window, 'listGuides', {
    value: listGuidesMock,
  });
  Object.defineProperty(window, 'updateConfigurationValue', {
    value: updateConfigurationValueMock,
  });
  global.ResizeObserver = ResizeObserver;
});

beforeEach(() => {
  listGuidesMock.mockReturnValue(learningCenter.guides);
});

afterEach(() => {
  vi.resetAllMocks();
});

test('LearningCenter component shows carousel with guides', async () => {
  render(LearningCenter);

  await vi.waitFor(() => {
    const firstCard = screen.getByText(learningCenter.guides[0].title);
    expect(firstCard).toBeVisible();
  });
});

test('Clicking on LearningCenter title hides carousel with guides', async () => {
  render(LearningCenter);
  await vi.waitFor(() => {
    const firstCard = screen.getByText(learningCenter.guides[0].title);
    expect(firstCard).toBeVisible();
  });

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toBeInTheDocument();
  expect(screen.queryByText(learningCenter.guides[0].title)).toBeInTheDocument();
  await fireEvent.click(button);
  await vi.waitFor(async () => {
    expect(screen.queryByText(learningCenter.guides[0].title)).not.toBeInTheDocument();
  });
});

test('Toggling expansion sets configuration', async () => {
  render(LearningCenter);

  // wait for onMount
  await tick();

  expect(updateConfigurationValueMock).not.toHaveBeenCalled();

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toBeInTheDocument();
  expect(button).toHaveAttribute('aria-expanded', 'true');

  await fireEvent.click(button);
  expect(updateConfigurationValueMock).toHaveBeenCalledWith('learningCenter.expanded', false);
  expect(button).toHaveAttribute('aria-expanded', 'false');

  await fireEvent.click(button);
  expect(updateConfigurationValueMock).toHaveBeenCalledWith('learningCenter.expanded', true);
  expect(button).toHaveAttribute('aria-expanded', 'true');

  await fireEvent.click(button);
  expect(updateConfigurationValueMock).toHaveBeenCalledWith('learningCenter.expanded', false);
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('Expanded when the config value not set', async () => {
  render(LearningCenter);

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toHaveAttribute('aria-expanded', 'true');
});

test('Collapsed when the config value is set to not expanded', async () => {
  getConfigurationValueMock.mockResolvedValue(false);
  render(LearningCenter);

  await waitFor(() => expect(getConfigurationValueMock).toBeCalled());

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('Expanded when the config value is set to expanded', async () => {
  getConfigurationValueMock.mockResolvedValue(true);
  render(LearningCenter);

  await waitFor(() => expect(getConfigurationValueMock).toBeCalled());

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toHaveAttribute('aria-expanded', 'true');
});
