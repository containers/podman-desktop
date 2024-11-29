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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import Badge from './Badge.svelte';

// mock window.getConfigurationValue
const getConfigurationValueMock = vi.fn();
const getImageMock = vi.fn();

vi.mock('/@/lib/appearance/appearance-util', () => {
  return {
    AppearanceUtil: class {
      getImage = getImageMock;
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(window, 'getConfigurationValue', { value: getConfigurationValueMock });
});

test('Should display badge', async () => {
  getImageMock.mockReturnValue('bg-gray-500');
  render(Badge, { label: 'customLabel' });

  // expect to see label inside the label
  const label = screen.getByText('customLabel');
  expect(label).toBeInTheDocument();

  // check color being the default one
  await new Promise(r => setTimeout(r, 100));

  // check color being there in the style
  expect(label).toHaveClass('bg-gray-500');
});

test('Should display badge with rgb color', async () => {
  getImageMock.mockReturnValue('#ff0000');
  render(Badge, { label: 'customLabel', color: '#ff0000' });

  // expect to see label inside the label
  const label = screen.getByText('customLabel');
  expect(label).toBeInTheDocument();

  // wait for some time
  await new Promise(r => setTimeout(r, 100));

  // check color being there in the style
  expect(label).toHaveStyle('background-color: rgb(255, 0, 0)');
});

test('Should display badge with light color', async () => {
  getImageMock.mockReturnValue('#ff0000');
  render(Badge, { label: 'customLabel', color: { light: '#ff0000', dark: '#00ff00' } });

  // expect to see label inside the label
  const label = screen.getByText('customLabel');
  expect(label).toBeInTheDocument();

  // wait for some time
  await new Promise(r => setTimeout(r, 100));

  // check color being there in the style
  expect(label).toHaveStyle('background-color: rgb(255, 0, 0)');
});

test('Should display badge with dark color', async () => {
  getImageMock.mockReturnValue('#00FF00');
  render(Badge, { label: 'customLabel', color: { light: '#FF0000', dark: '#00FF00' } });

  // expect to see label inside the label
  const label = screen.getByText('customLabel');
  expect(label).toBeInTheDocument();

  // wait for some time
  await new Promise(r => setTimeout(r, 100));

  // check color being there in the style
  expect(label).toHaveStyle('background-color: rgb(0, 255, 0)');
});

test('Should display badge with custom class', async () => {
  render(Badge, { label: 'customLabel', class: 'text-right' });

  // expect to see label inside the label
  const label = screen.getByText('customLabel');
  expect(label).toBeInTheDocument();

  await vi.waitFor(() => expect(label).toHaveClass('text-right'));
});
