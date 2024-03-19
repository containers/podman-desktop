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
import { expect, test } from 'vitest';

import Tooltip from './Tooltip.svelte';

const tip = 'test';

test('Expect basic styling', async () => {
  render(Tooltip, { tip });

  const element = screen.getByLabelText('tooltip');
  expect(element).toBeInTheDocument();
  expect(element).toHaveClass('text-white');
});

function createTest(props: Record<string, boolean>, locationName: string, expectedStyle = locationName) {
  test(`Expect property ${locationName} to add ${expectedStyle} class to parent element`, () => {
    render(Tooltip, { tip, ...props });
    const element = screen.getByLabelText('tooltip');
    expect(element).toBeInTheDocument();
    expect(element.parentElement).toHaveClass(expectedStyle);
  });
}

createTest({ left: true }, 'left');
createTest({ right: true }, 'right');
createTest({ bottom: true }, 'bottom');
createTest({ top: true }, 'top');
createTest({ topLeft: true }, 'topLeft', 'top-left');
createTest({ topRight: true }, 'topRight', 'top-right');
createTest({ bottomLeft: true }, 'bottomLeft', 'bottom-left');
createTest({ bottomRight: true }, 'bottomRight', 'bottom-right');
