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
import { get, type Unsubscriber } from 'svelte/store';
import { router } from 'tinro';
import { featuredExtensionInfos } from '/@/stores/featuredExtensions';
import type { FeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';

let routerUnsubscribe: Unsubscriber;
let path: string;

const getFeaturedExtensionsMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();
  (window as any).getPodmanDesktopVersion = vi.fn();
  (window as any).telemetryConfigure = vi.fn();
  (window as any).getFeaturedExtensions = getFeaturedExtensionsMock;
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

test('Expect that telemetry UI is hidden when telemetry has already been prompted', async () => {
  await render(WelcomePage, { showWelcome: true, showTelemetry: false });
  let checkbox;
  try {
    checkbox = screen.getByRole('checkbox', { name: 'Enable telemetry' });
  } catch {
    // ignore errors
  }
  expect(checkbox).toBe(undefined);
});

test('Expect that telemetry UI is visible when necessary', async () => {
  await render(WelcomePage, { showWelcome: true, showTelemetry: true });
  const checkbox = screen.getByRole('checkbox', { name: 'Enable telemetry' });
  expect(checkbox).toBeInTheDocument();
});

test('Expect that featured extensions are displayed', async () => {
  const featuredExtension1: FeaturedExtension = {
    builtin: true,
    id: 'foo.bar',
    displayName: 'FooBar',
    description: 'Foobar description',
    icon: 'data:image/png;base64,foobar',
    categories: [],
    fetchable: true,
    fetchLink: 'oci-hello/world',
    fetchVersion: '1.2.3',
    installed: true,
  };

  const featuredExtension2: FeaturedExtension = {
    builtin: true,
    id: 'foo.baz',
    displayName: 'FooBaz',
    description: 'Foobaz description',
    icon: 'data:image/png;base64,foobaz',
    categories: [],
    fetchable: false,
    installed: false,
  };

  getFeaturedExtensionsMock.mockResolvedValue([featuredExtension1, featuredExtension2]);

  // ask to update the featured Extensions store
  window.dispatchEvent(new CustomEvent('system-ready'));

  // wait store are populated
  while (get(featuredExtensionInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await render(WelcomePage, { showWelcome: true });
  const imageExt1 = screen.getByRole('img', { name: 'FooBar logo' });
  // expect the image to be there
  expect(imageExt1).toBeInTheDocument();
  // expect image source is correct
  expect(imageExt1).toHaveAttribute('src', 'data:image/png;base64,foobar');

  const imageExt2 = screen.getByRole('img', { name: 'FooBaz logo' });
  // expect the image to be there
  expect(imageExt2).toBeInTheDocument();
  // expect image source is correct
  expect(imageExt2).toHaveAttribute('src', 'data:image/png;base64,foobaz');
});
