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

import { render, waitFor } from '@testing-library/svelte';
import { tick } from 'svelte';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import App from './App.svelte';
import { navigationRegistry } from './stores/navigation/navigation-registry';

const mocks = vi.hoisted(() => ({
  DashboardPage: vi.fn(),
  RunImage: vi.fn(),
  ImagesList: vi.fn(),
  SubmenuNavigation: vi.fn(),
}));

vi.mock('./lib/dashboard/DashboardPage.svelte', () => ({
  default: mocks.DashboardPage,
}));
vi.mock('./lib/image/RunImage.svelte', () => ({
  default: mocks.RunImage,
}));
vi.mock('./lib/image/ImagesList.svelte', () => ({
  default: mocks.ImagesList,
}));

vi.mock('./lib/ui/TitleBar.svelte', () => ({
  default: vi.fn(),
}));
vi.mock('./lib/welcome/WelcomePage.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('./lib/context/ContextKey.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('./lib/appearance/Appearance.svelte', () => ({
  default: vi.fn(),
}));

vi.mock('./SubmenuNavigation.svelte', () => ({
  default: mocks.SubmenuNavigation,
}));

const dispatchEventMock = vi.fn();
const messages = new Map<string, (args: any) => void>();

beforeEach(() => {
  vi.resetAllMocks();
  router.goto('/');
  (window.events as unknown) = {
    receive: vi.fn().mockImplementation((channel, func) => {
      messages.set(channel, func);
    }),
  };
  (window as any).dispatchEvent = dispatchEventMock;
});

test('test /image/run/* route', async () => {
  render(App);
  expect(mocks.RunImage).not.toHaveBeenCalled();
  expect(mocks.DashboardPage).toHaveBeenCalled();
  router.goto('/image/run/basic');
  await tick();
  expect(mocks.RunImage).toHaveBeenCalled();
});

test('test /images/:id/:engineId route', async () => {
  render(App);
  expect(mocks.ImagesList).not.toHaveBeenCalled();
  expect(mocks.DashboardPage).toHaveBeenCalled();
  router.goto('/images/an-image/an-engine');
  await tick();
  expect(mocks.ImagesList).toHaveBeenCalled();
});

test('receive context menu visible event from main', async () => {
  render(App);
  // send 'context-menu:visible' event
  messages.get('context-menu:visible')?.(true);

  // wait for dispatch method to be called
  waitFor(() => expect(dispatchEventMock).toHaveBeenCalledWith(expect.any(Event)));

  const eventSent = vi.mocked(dispatchEventMock).mock.calls[0][0];
  expect((eventSent as Event).type).toBe('tooltip-hide');
});

test('receive context menu not visible event from main', async () => {
  render(App);

  messages.get('context-menu:visible')?.(false);

  //  wait for dispatch method to be called
  waitFor(() => expect(dispatchEventMock).toHaveBeenCalledWith(expect.any(Event)));

  const eventSent = vi.mocked(dispatchEventMock).mock.calls[0][0];
  expect((eventSent as Event).type).toBe('tooltip-show');
});

test('opens submenu when a `submenu` menu is opened', async () => {
  navigationRegistry.set([
    {
      name: 'An entry with submenu',
      icon: {},
      link: '/tosubmenu',
      tooltip: 'With submenu',
      type: 'submenu',
      get counter() {
        return 0;
      },
    },
  ]);
  render(App);
  expect(mocks.SubmenuNavigation).not.toHaveBeenCalled();
  router.goto('/tosubmenu');
  await tick();
  expect(mocks.SubmenuNavigation).toHaveBeenCalled();
});
