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
import { afterEach, beforeEach, expect, suite, test, vi } from 'vitest';

import GuideCard from './GuideCard.svelte';

suite('Guide card', () => {
  beforeEach(() => {
    (window as any).openExternal = vi.fn();
    (window as any).telemetryTrack = vi.fn();
    render(GuideCard, {
      guide: { id: 'id', url: 'url', title: 'title', description: 'description', categories: [], icon: 'icon' },
      width: 300,
      height: 300,
    });
    afterEach(() => {
      vi.resetAllMocks();
    });
  });

  test('shows title', async () => {
    const cardTitle = screen.getByText('title');
    expect(cardTitle).toBeVisible();
  });

  test('shows description', async () => {
    const cardDescription = screen.getByText('description');
    screen.debug(cardDescription);
    expect(cardDescription).toBeVisible();
  });

  test('shows button', async () => {
    const cardButton = screen.getByRole('button', { name: 'Get started' });
    expect(cardButton).toBeVisible();
  });

  test('opens guide and sends telemetry', async () => {
    const cardButton = screen.getByRole('button', { name: 'Get started' });
    await fireEvent.click(cardButton);
    expect(vi.mocked(window.openExternal)).toHaveBeenCalledWith('url');
    expect(vi.mocked(window.telemetryTrack)).toHaveBeenCalledWith('openLearningCenterGuide', {
      guideId: 'id',
    });
  });
});
