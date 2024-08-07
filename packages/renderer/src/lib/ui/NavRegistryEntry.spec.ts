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

import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { render, screen } from '@testing-library/svelte';
import type { TinroRouteMeta } from 'tinro';
import { beforeAll, expect, test, vi } from 'vitest';

import type { NavigationRegistryEntry } from '/@/stores/navigation/navigation-registry';

import NavRegistryEntry from './NavRegistryEntry.svelte';

beforeAll(() => {
  // Mock the animate function
  HTMLElement.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
  });
});

test('Expect entry is rendered', async () => {
  const entry: NavigationRegistryEntry = {
    name: 'Item1',
    hidden: false,
    icon: {
      faIcon: { definition: faPuzzlePiece, size: 'lg' },
    },
    tooltip: 'Item tooltip',
    link: '/mylink',
    counter: 0,
    type: 'entry',
  };
  const meta = { url: '/test' } as TinroRouteMeta;
  render(NavRegistryEntry, { entry, meta });

  const content = screen.queryByLabelText('Item1');
  expect(content).toBeInTheDocument();
});

test('Expect hidden entry is not rendered', async () => {
  const entry: NavigationRegistryEntry = {
    name: 'Item1',
    hidden: true,
    icon: {
      faIcon: { definition: faPuzzlePiece, size: 'lg' },
    },
    tooltip: 'Item tooltip',
    link: '/mylink',
    counter: 0,
    type: 'entry',
  };
  const meta = { url: '/test' } as TinroRouteMeta;
  render(NavRegistryEntry, { entry, meta });

  const content = screen.queryByLabelText('Item1');
  expect(content).not.toBeInTheDocument();
});
