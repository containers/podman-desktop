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

import { render } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeAll, expect, test, vi } from 'vitest';

import { iconsInfos } from '/@/stores/icons';

import type { IconInfo } from '../../../../main/src/plugin/api/icon-info';
import IconsStyle from './IconsStyle.svelte';

const listIconsMock = vi.fn();

// fake the window object
beforeAll(() => {
  (window as any).listIcons = listIconsMock;
});

test('Check containers button is available and click on it', async () => {
  const file = 'file://my-font.woff';
  const icon: IconInfo = {
    id: 'my-icon-id',
    definition: {
      description: 'This is a description',
      font: {
        fontId: 'my-font-id',
        src: [
          {
            location: 'my-font.woff',
            browserURL: `url('${file}')`,
            format: 'woff2',
          },
        ],
      },
      fontCharacter: '\\E01',
    },
  };

  listIconsMock.mockResolvedValue([icon]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // wait store is populated
  while (get(iconsInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  render(IconsStyle);

  // expect to have the generated style for the icon
  const style = document.querySelector('style');
  expect(style).toBeInTheDocument();
  // should have css type
  expect(style).toHaveAttribute('type', 'text/css');

  // check content
  expect(style).toHaveTextContent(
    `.podman-desktop-icon-my-icon-id:before { content: '\\E01'; font-family: '${icon.definition.font?.fontId}'; } @font-face { src: url('file://my-font.woff') format('woff2'); font-family: 'my-font-id'; font-display: block; }`,
  );
});
