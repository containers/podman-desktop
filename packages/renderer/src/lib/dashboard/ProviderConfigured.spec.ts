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

import { beforeAll, test, vi } from 'vitest';

import ProviderConfigured from '/@/lib/dashboard/ProviderConfigured.svelte';

import { verifyStatus } from './ProviderStatusTestHelper.spec';

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeAll(() => {
  (window as any).ResizeObserver = ResizeObserver;
  (window as any).startProvider = vi.fn();

  // mock that autostart is configured as true
  (window.getConfigurationValue as unknown) = (_key: string) => {
    return true;
  };

  // fake the window.events object
  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect configured provider shows update button', async () => {
  verifyStatus(ProviderConfigured, 'configured', false);
});

test('Expect configured provider does not show update button if version same', async () => {
  verifyStatus(ProviderConfigured, 'configured', true);
});
