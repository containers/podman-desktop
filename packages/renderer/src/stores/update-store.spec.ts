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

import { waitFor } from '@testing-library/dom';
import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { setup, updateAvailable } from './update-store';

const messages = new Map<string, any>();
const receiveMock = vi.fn();
const podmanDesktopUpdateAvailableMock = vi.fn();

beforeEach(() => {
  (window as any).podmanDesktopUpdateAvailable = podmanDesktopUpdateAvailableMock.mockResolvedValue(false);
  (window.events as unknown) = {
    receive: receiveMock.mockImplementation((channel: string, func: any) => {
      messages.set(channel, func);
    }),
  };
});

test('updateAvailable starts as podmanDesktopUpdateAvailable value or false if undefined', async () => {
  setup();
  await waitFor(() => expect(receiveMock).toBeCalled());

  expect(get(updateAvailable)).toBeFalsy();

  // now we call the listener
  const message = messages.get('app-update-available');

  expect(message).toBeDefined();

  message(true);

  expect(get(updateAvailable)).toBeTruthy();

  message(false);

  expect(get(updateAvailable)).toBeFalsy();
});

test('updateAvailable starts as true', async () => {
  podmanDesktopUpdateAvailableMock.mockResolvedValue(true);
  setup();
  await waitFor(() => expect(receiveMock).toBeCalled());
});
