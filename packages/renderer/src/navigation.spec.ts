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

import { test, expect, vi } from 'vitest';
import { NavigationPage } from '../../main/src/plugin/navigation/navigation-page';
import { handleNavigation } from './navigation';
import { router } from 'tinro';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

test('Test navigationHandle to a specific container', () => {
  handleNavigation(NavigationPage.CONTAINER, { id: '123' });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/containers/123/');
});

test('Test navigationHandle to a specific webview', () => {
  handleNavigation(NavigationPage.WEBVIEW, { id: '123' });

  expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/webviews/123');
});
