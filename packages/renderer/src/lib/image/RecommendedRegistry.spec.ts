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

import { render, screen } from '@testing-library/svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { recommendedRegistries } from '/@/stores/recommendedRegistries';

import RecommendedRegistry from './RecommendedRegistry.svelte';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).getConfigurationValue = vi.fn().mockResolvedValue(undefined);
  (window as any).matchMedia = vi.fn().mockReturnValue({
    addListener: vi.fn(),
  });

  Object.defineProperty(window, 'matchMedia', {
    value: () => {
      return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
      };
    },
  });
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('Expect to suggest an extension in case of matching error', async () => {
  // add registries as recommended
  recommendedRegistries.set([
    {
      id: 'my.registry.com',
      name: 'Hello',
      errors: ['Image does not exists'],
      extensionId: 'myExtension.id',
      isInstalled: false,
      extensionDetails: {
        id: 'myExtension.id',
        fetchable: true,
        displayName: 'My Custom Extension',
        fetchLink: 'myCustomLinkToDownloadExtension',
        fetchVersion: '1.0.0',
      },
    },
  ]);

  render(RecommendedRegistry, {
    imageName: 'my.registry.com/image-to-pull',
    imageError: 'There is a problem, Image does not exists',
  });

  // check to see the proposal to install the extension
  const proposal = screen.getByRole('button', { name: 'Install myExtension.id Extension' });
  expect(proposal).toBeInTheDocument();
  expect(proposal).toBeEnabled();
});

test('Expect to not suggest an extension in case of different error', async () => {
  // add registries as recommended
  recommendedRegistries.set([
    {
      id: 'my.registry.com',
      name: 'Hello',
      errors: ['Image does not exists'],
      extensionId: 'myExtension.id',
      isInstalled: false,
      extensionDetails: {
        id: 'myExtension.id',
        fetchable: true,
        displayName: 'My Custom Extension',
        fetchLink: 'myCustomLinkToDownloadExtension',
        fetchVersion: '1.0.0',
      },
    },
  ]);

  render(RecommendedRegistry, { imageName: 'my.registry.com/image-to-pull', imageError: 'unknown error' });

  // check to see that the proposal to install the extension is not there
  const proposal = screen.queryByRole('button', { name: 'Install myExtension.id Extension' });
  expect(proposal).not.toBeInTheDocument();
});
