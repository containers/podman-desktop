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

import '@testing-library/jest-dom';
import { beforeAll, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import WelcomePage from './WelcomePage.svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

let routerUnsubscribe: Unsubscriber;
let path: string;

// fake the window.events object
beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();

  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };

  routerUnsubscribe = router.subscribe(rtr => {
    path = rtr.path;
  });
});

afterAll(() => {
  routerUnsubscribe();
});

test('Expect the close button is on the page', async () => {
  await render(WelcomePage, { showWelcome: true });
  const button = screen.getByRole('button', { name: 'Go to Podman Desktop' });
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
});

test('Expect the settings button is on the page', async () => {
  await render(WelcomePage, { showWelcome: true });
  const button = screen.getByRole('button', { name: 'Settings' });
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
});

test('Expect that the close button closes the window', async () => {
  await render(WelcomePage, { showWelcome: true });
  const button = screen.getByRole('button', { name: 'Go to Podman Desktop' });
  await fireEvent.click(button);

  // and the button is gone
  expect(button).not.toBeInTheDocument();
});

test('Expect that the settings button closes the window and opens the settings', async () => {
  await render(WelcomePage, { showWelcome: true });

  const button = screen.getByRole('button', { name: 'Settings' });
  await fireEvent.click(button);

  // and the button is gone
  expect(button).not.toBeInTheDocument();

  // and we're in the preferences
  expect(path).toBe('/preferences');
});
