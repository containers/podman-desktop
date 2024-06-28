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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import learningCenter from '../../../../main/src/plugin/learning-center/guides.json';
import LearningCenter from './LearningCenter.svelte';

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeEach(() => {
  (window as any).ResizeObserver = ResizeObserver;
  (window as any).listGuides = vi.fn().mockReturnValue(learningCenter.guides);
  // Mock the animate function
  HTMLElement.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

test('LearningCenter component shows carousel with guides', async () => {
  render(LearningCenter);

  vi.waitFor(() => {
    const firstCard = screen.getByText(learningCenter.guides[0].title);
    expect(firstCard).toBeVisible();
  });
});

test('Clicking on LearningCenter title hides carousel with guides', async () => {
  render(LearningCenter);
  vi.waitFor(() => {
    const firstCard = screen.getByText(learningCenter.guides[0].title);
    expect(firstCard).toBeVisible();
  });

  const button = screen.getByRole('button', { name: 'Learning Center' });
  expect(button).toBeInTheDocument();
  await fireEvent.click(button);
  vi.waitFor(() => {
    const firstCard = screen.queryByText(learningCenter.guides[0].title);
    expect(firstCard).not.toBeInTheDocument();
  });
});
