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

import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import { NavigationPage } from '/@api/navigation-page';

import { handleNavigation } from './navigation';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

test('Test navigationHandle to a specific container', () => {
  handleNavigation({ page: NavigationPage.CONTAINER, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/');
});

test('Test navigationHandle to a specific webview', () => {
  handleNavigation({ page: NavigationPage.WEBVIEW, parameters: { id: '123' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/webviews/123');
});

test('Test navigationHandle to resources page', () => {
  handleNavigation({ page: NavigationPage.RESOURCES });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/resources');
});

test('Test navigationHandle to a specific edit page', () => {
  handleNavigation({ page: NavigationPage.EDIT_CONTAINER_CONNECTION, parameters: { provider: '123', name: 'test' } });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/container-connection/edit/123/test');
});
