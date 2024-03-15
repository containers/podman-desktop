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
import type { TinroRouteMeta } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { webviews } from '/@/stores/webviews';

import type { WebviewInfo } from '../../../../main/src/plugin/api/webview-info';
import Webviews from './Webviews.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

test('check we have list of webviews in navigation bar', async () => {
  // register webviews to the store
  const webviewTestList: WebviewInfo[] = [
    {
      id: 'webviewId1',
      uuid: 'uuid1',
      viewType: 'podman-desktop',
      sourcePath: '/path/to/source',
      icon: 'icon1',
      name: 'Podman Desktop1',
      html: '<html>newCode1</html>',
      state: { stateData1: 'stateData1' },
    },
    {
      id: 'webviewId2',
      uuid: 'uuid2',
      viewType: 'podman-desktop',
      sourcePath: '/path/to/source',
      icon: 'icon2',
      name: 'Podman Desktop2',
      html: '<html>newCode2</html>',
      state: { stateData1: 'stateData2' },
    },
  ];

  webviews.set(webviewTestList);
  const fakeMeta = { url: '/webviews' } as unknown as TinroRouteMeta;
  render(Webviews, { meta: fakeMeta });

  const links = screen.getAllByRole('link');

  // check we have 2 links
  expect(links).toHaveLength(2);

  // now check detail of each link
  expect(links[0]).toHaveTextContent('Podman Desktop1');
  expect(links[1]).toHaveTextContent('Podman Desktop2');

  // check link href
  expect(links[0]).toHaveAttribute('href', '/webviews/webviewId1');
  expect(links[1]).toHaveAttribute('href', '/webviews/webviewId2');
});
