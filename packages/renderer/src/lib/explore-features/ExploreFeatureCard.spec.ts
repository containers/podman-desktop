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

import type { ExploreFeature } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import ExploreFeatureCard from './ExploreFeatureCard.svelte';

vi.mock(import('tinro'));

const featureMock: ExploreFeature = {
  id: 'feature1',
  title: 'Feature 1',
  description: 'This is feature 1',
  buttonIcon: 'icon',
  buttonTitle: 'Button 1',
  buttonLink: '/some/link',
  tutorialLink: '',
  learnMore: '/learn/more/link',
  img: '/img/',
};

const closeFeature = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
});

test('expect feature card to have all Feature properties', async () => {
  const { rerender } = render(ExploreFeatureCard, { feature: featureMock, closeFeature: closeFeature });

  expect(screen.getByText(featureMock.title)).toBeInTheDocument();
  expect(screen.getByText(featureMock.description)).toBeInTheDocument();

  const image = screen.getByAltText('feature1');
  expect(image).toBeInTheDocument();
  expect(image).toHaveRole('img');

  const learnMoreLink = screen.queryByRole('link', { name: 'Learn more' });
  expect(learnMoreLink).toBeInTheDocument();

  const primaryButton = screen.queryByRole('button', { name: featureMock.buttonTitle });
  expect(primaryButton).toBeInTheDocument();

  let tutorialButton = screen.queryByRole('button', { name: 'Watch Tutorial' });
  expect(tutorialButton).not.toBeInTheDocument();

  await rerender({ feature: { ...featureMock, tutorialLink: '/link/to/tutorial' }, closeFeature: closeFeature });

  tutorialButton = screen.queryByRole('button', { name: 'Watch Tutorial' });
  expect(tutorialButton).toBeInTheDocument();
});

test('Click on close card', async () => {
  render(ExploreFeatureCard, { feature: featureMock, closeFeature: closeFeature });

  const closeButton = screen.getByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();

  await fireEvent.click(closeButton);

  expect(closeFeature).toHaveBeenCalledWith('feature1');
  expect(window.closeFeatureCard).toHaveBeenCalledWith('feature1');
  expect(vi.mocked(window.telemetryTrack)).toHaveBeenCalledWith('dashboard.exploreFeatureDismissed', {
    feature: 'feature1',
  });
});

test('Click on learn more link', async () => {
  render(ExploreFeatureCard, { feature: featureMock, closeFeature: closeFeature });

  const learnMoreLink = screen.getByRole('link', { name: 'Learn more' });
  expect(learnMoreLink).toBeInTheDocument();

  await fireEvent.click(learnMoreLink);

  expect(window.openExternal).toHaveBeenCalledWith(featureMock.learnMore);
});

test('Click on primary button', async () => {
  render(ExploreFeatureCard, { feature: featureMock, closeFeature: closeFeature });

  const primaryButton = screen.getByRole('button', { name: featureMock.buttonTitle });
  expect(primaryButton).toBeInTheDocument();

  await fireEvent.click(primaryButton);

  expect(vi.mocked(window.telemetryTrack)).toHaveBeenCalledWith('dashboard.exploreFeatureClicked', {
    feature: 'Feature 1',
  });
  expect(router.goto).toHaveBeenCalledWith(featureMock.buttonLink);
});

test('Click on tutorial button', async () => {
  render(ExploreFeatureCard, {
    feature: { ...featureMock, tutorialLink: '/link/to/tutorial' },
    closeFeature: closeFeature,
  });

  const tutorialButton = screen.getByRole('button', { name: 'Watch Tutorial' });
  expect(tutorialButton).toBeInTheDocument();

  await fireEvent.click(tutorialButton);

  expect(window.openExternal).toHaveBeenCalledWith('/link/to/tutorial');
});
