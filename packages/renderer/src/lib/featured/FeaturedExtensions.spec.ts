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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeAll, expect, test, vi } from 'vitest';

import { featuredExtensionInfos } from '/@/stores/featuredExtensions';

import type { FeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';
import FeaturedExtensions from './FeaturedExtensions.svelte';

const getFeaturedExtensionsMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).getFeaturedExtensions = getFeaturedExtensionsMock;
  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect that featured extensions are displayed', async () => {
  const featuredExtension1: FeaturedExtension = {
    builtin: true,
    id: 'foo.bar',
    displayName: 'FooBar',
    description: 'This is FooBar description',
    icon: 'data:image/png;base64,foobar',
    categories: [],
    fetchable: true,
    fetchLink: 'oci-hello/world',
    fetchVersion: '1.2.3',
    installed: false,
  };

  const featuredExtension2: FeaturedExtension = {
    builtin: true,
    id: 'foo.baz',
    displayName: 'FooBaz',
    description: 'Foobaz description',
    icon: 'data:image/png;base64,foobaz',
    categories: [],
    fetchable: false,
    installed: true,
  };

  const featuredExtension3: FeaturedExtension = {
    builtin: true,
    id: 'foo.bar',
    displayName: 'Bar',
    description: 'FooBar not fetchable description',
    icon: 'data:image/png;base64,bar',
    categories: [],
    fetchable: false,
    installed: false,
  };

  getFeaturedExtensionsMock.mockResolvedValue([featuredExtension1, featuredExtension2, featuredExtension3]);

  // ask to update the featured Extensions store
  window.dispatchEvent(new CustomEvent('system-ready'));

  // wait store are populated
  while (get(featuredExtensionInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  render(FeaturedExtensions);

  // get by title
  const firstExtension = screen.getByTitle('This is FooBar description');
  expect(firstExtension).toBeInTheDocument();

  const imageExt1 = screen.getByRole('img', { name: 'FooBar logo' });
  // expect the image to be there
  expect(imageExt1).toBeInTheDocument();
  // expect image source is correct
  expect(imageExt1).toHaveAttribute('src', 'data:image/png;base64,foobar');

  // Not installed so it should have a button to install
  const installButton = screen.getByRole('button', { name: 'Install foo.bar Extension' });
  // expect the button to be there
  expect(installButton).toBeInTheDocument();

  // get by title
  const secondExtension = screen.getByTitle('Foobaz description');
  expect(secondExtension).toBeInTheDocument();
  // contains the text installed
  expect(secondExtension).toHaveTextContent(/.*installed/);

  const imageExt2 = screen.getByRole('img', { name: 'FooBaz logo' });
  // expect the image to be there
  expect(imageExt2).toBeInTheDocument();
  // expect image source is correct
  expect(imageExt2).toHaveAttribute('src', 'data:image/png;base64,foobaz');

  // get by title
  const thirdExtension = screen.getByTitle('FooBar not fetchable description');
  expect(thirdExtension).toBeInTheDocument();
  // contains the text installed
  expect(thirdExtension).toHaveTextContent(/.*N\/A/);

  const imageExt3 = screen.getByRole('img', { name: 'Bar logo' });
  // expect the image to be there
  expect(imageExt3).toBeInTheDocument();
  // expect image source is correct
  expect(imageExt3).toHaveAttribute('src', 'data:image/png;base64,bar');
});
