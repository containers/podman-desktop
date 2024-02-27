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
import { beforeAll, test, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import ColorsStyle from './ColorsStyle.svelte';
import { colorsInfos } from '/@/stores/colors';
import type { ColorInfo } from '../../../../main/src/plugin/api/color-info';

const listColorsMock = vi.fn();

// fake the window object
beforeAll(() => {
  (window as any).listColors = listColorsMock;
});

test('Check colors are added in the css style', async () => {
  const color: ColorInfo = {
    id: 'my-custom-color',
    value: '#123456',
    cssVar: '--pd-my-custom-color',
  };

  // sets the colors
  colorsInfos.set([color]);

  render(ColorsStyle);

  // expect to have the generated style for the colors
  const style = document.querySelector('style');
  expect(style).toBeInTheDocument();
  // should have css type
  expect(style).toHaveAttribute('type', 'text/css');

  // check the id
  expect(style).toHaveAttribute('id', 'podman-desktop-colors-styles');

  // check content
  expect(style).toHaveTextContent(':root { --pd-my-custom-color: #123456; }');
});
