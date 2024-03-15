/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import { extensionInfos } from '/@/stores/extensions';

import type { CatalogExtension } from '../../../../main/src/plugin/extensions-catalog/extensions-catalog-api';
import PreferencesInstallExtensionFromId from './PreferencesInstallExtensionFromId.svelte';

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

test('Expect that the EmptyScreen is displayed if extension is not found', async () => {
  const extensionId = 'my.extension';

  render(PreferencesInstallExtensionFromId, { extensionId });

  // expect to have the empty screen
  const heading = screen.getByRole('heading', { name: 'Extension not found' });
  // expect the heading to be there
  expect(heading).toBeInTheDocument();
});

test('Expect that the install button is there and can click on it to install', async () => {
  const extensionId = 'my.extension';

  // mock the catalog
  const catalogExtensions: CatalogExtension[] = [
    {
      id: 'my.extension',
      extensionName: 'FOOName',
      displayName: 'foo.bar Extension',
      publisherName: 'Foo',
      versions: [
        {
          version: '1.0.0',
          preview: false,
          ociUri: 'oci://foo/bar:1.0.0',
          files: [],
        },
      ],
    },
  ];
  catalogExtensionInfos.set(catalogExtensions);

  render(PreferencesInstallExtensionFromId, { extensionId });

  // expect to have the button if installable
  const installButton = screen.getByRole('button', { name: 'Install...' });
  // expect the button to be there
  expect(installButton).toBeInTheDocument();

  // mock the install function
  extensionInstallFromImageMock.mockImplementation(async () => {
    // need to update extensions being installed
    extensionInfos.set([
      {
        id: 'my.extension',
        description: 'foo.bar Extension',
        displayName: 'foo.bar Extension',
        publisher: 'Foo',
        name: 'FOOName',
        removable: true,
        version: '1.0.0',
        state: 'installed',
        readme: 'readme',
        path: 'foo-path',
      },
    ]);
  });

  // click on the button
  await fireEvent.click(installButton);

  // install should have been called
  expect(extensionInstallFromImageMock).toHaveBeenCalled();

  // now, expect the button to be gone
  const installButtonAfterClick = screen.queryByRole('button', { name: 'Install...' });
  expect(installButtonAfterClick).not.toBeInTheDocument();

  // wait for the install to be done
  await new Promise(r => setTimeout(r, 300));

  // and expect to have 'installed' label
  const installedLabel = screen.getByText('INSTALLED');
  expect(installedLabel).toBeInTheDocument();
});

test('Expect that the installed label is there if extension is already installed', async () => {
  const extensionId = 'my.extension';

  // mock the catalog
  const catalogExtensions: CatalogExtension[] = [
    {
      id: 'my.extension',
      extensionName: 'FOOName',
      displayName: 'foo.bar Extension',
      publisherName: 'Foo',
      versions: [
        {
          version: '1.0.0',
          preview: false,
          ociUri: 'oci://foo/bar:1.0.0',
          files: [],
        },
      ],
    },
  ];
  catalogExtensionInfos.set(catalogExtensions);

  // mock extension being installed
  extensionInfos.set([
    {
      id: 'my.extension',
      description: 'foo.bar Extension',
      displayName: 'foo.bar Extension',
      publisher: 'Foo',
      name: 'FOOName',
      removable: true,
      version: '1.0.0',
      state: 'installed',
      readme: 'readme',
      path: 'foo-path',
    },
  ]);

  render(PreferencesInstallExtensionFromId, { extensionId });

  // now, expect the button to be gone
  const installButtonAfterClick = screen.queryByRole('button', { name: 'Install...' });
  expect(installButtonAfterClick).not.toBeInTheDocument();

  // and expect to have 'installed' label
  const installedLabel = screen.getByText('INSTALLED');
  expect(installedLabel).toBeInTheDocument();
});
