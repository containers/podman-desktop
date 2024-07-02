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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import EmptyScreen from './EmptyScreen.svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

test('Expect copy in clipboard', async () => {
  const mock = vi.fn();
  render(EmptyScreen, { icon: '', commandline: 'podman run hello:world', onClick: mock });
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
  await fireEvent.click(button);
  expect(mock).toBeCalledWith('podman run hello:world');
});
