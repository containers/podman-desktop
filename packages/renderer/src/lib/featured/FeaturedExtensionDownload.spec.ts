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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import type { FeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';
import FeaturedExtensionDownload from './FeaturedExtensionDownload.svelte';

const extensionInstallFromImageMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).extensionInstallFromImage = extensionInstallFromImageMock;
  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect that the install button is hidden if extension is not installable', async () => {
  const featuredExtension: FeaturedExtension = {
    builtin: true,
    id: 'foo.bar',
    displayName: 'FooBar',
    description: 'This is FooBar description',
    icon: 'data:image/png;base64,foobar',
    categories: [],
    fetchable: false,
    installed: false,
  };

  render(FeaturedExtensionDownload, { extension: featuredExtension });

  // expect to have the button if installable
  const installButton = screen.queryByRole('button', { name: 'Install foo.bar Extension' });
  // expect the button is not there
  expect(installButton).not.toBeInTheDocument();
});

test('Expect that we can see the button and click on the install', async () => {
  let featuredExtension: FeaturedExtension = {
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

  const renderResult = render(FeaturedExtensionDownload, { extension: featuredExtension });

  // expect to have the button if installable
  const installButton = screen.getByRole('button', { name: 'Install foo.bar Extension' });
  // expect the button to be there
  expect(installButton).toBeInTheDocument();

  // mock the install function
  extensionInstallFromImageMock.mockImplementation(async () => {
    featuredExtension.installed = true;
    featuredExtension.fetchable = false;
    featuredExtension = { ...featuredExtension };
    renderResult.rerender({ extension: featuredExtension });
  });

  // click on the button
  await fireEvent.click(installButton);

  // install should have been called
  expect(extensionInstallFromImageMock).toHaveBeenCalled();

  // now, expect the button to be gone
  // expect the button to be there
  const installButtonAfterClick = screen.queryByRole('button', { name: 'Install foo.bar Extension' });
  // expect the button is not there
  expect(installButtonAfterClick).not.toBeInTheDocument();
});
