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
import { describe, expect, test, vi } from 'vitest';

import ControlButton from './ControlButton.svelte';

describe.each([{ platform: 'linux' }, { platform: 'win32' }])('Platform($platform)', ({ platform }) => {
  test('Check name', async () => {
    render(ControlButton, { name: 'Maximize', platform });

    const customButton = screen.getByRole('button', { name: 'Maximize' });
    expect(customButton).toBeInTheDocument();
  });

  test('Check icon', async () => {
    render(ControlButton, { name: 'Minimize', platform });

    // check image is there
    const icon = screen.getByRole('img', { hidden: true, name: '' });
    expect(icon).toBeInTheDocument();
  });

  test('Check action', async () => {
    const action = vi.fn();
    render(ControlButton, { name: 'Close', platform, action });

    // click on the button
    const customButton = screen.getByRole('button', { name: 'Close' });
    await fireEvent.click(customButton);

    // check the action was called
    expect(action).toBeCalled();
  });
});
