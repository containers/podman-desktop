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

import '@testing-library/jest-dom';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import LoadingIcon from './LoadingIcon.svelte';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';

test('Expect default size', async () => {
  const icon = faPlayCircle;
  const loadingWidthClass = 'w-10';
  const loadingHeightClass = 'h-10';
  const positionTopClass = '';
  const positionLeftClass = '';
  const loading = true;
  const iconSize = '';
  render(LoadingIcon, {
    icon,
    iconSize,
    loadingHeightClass,
    loadingWidthClass,
    positionTopClass,
    positionLeftClass,
    loading,
  });
  const loadingIcon = screen.getByRole('img', { hidden: true, name: '' });
  expect(loadingIcon).toBeInTheDocument();

  // check the font-size attribute of the loading icon is not set
  expect(loadingIcon).toHaveAttribute('style', expect.not.stringContaining('font-size'));
});

test('Expect specified size', async () => {
  const icon = faPlayCircle;
  const loadingWidthClass = 'w-10';
  const loadingHeightClass = 'h-10';
  const positionTopClass = '';
  const positionLeftClass = '';
  const loading = true;
  const iconSize = '20';
  render(LoadingIcon, {
    icon,
    iconSize,
    loadingHeightClass,
    loadingWidthClass,
    positionTopClass,
    positionLeftClass,
    loading,
  });
  const loadingIcon = screen.getByRole('img', { hidden: true, name: '' });
  expect(loadingIcon).toBeInTheDocument();

  // check the font-size attribute of the loading icon is set to 20
  expect(loadingIcon).toHaveAttribute('style', expect.stringContaining('font-size:20;'));
});
