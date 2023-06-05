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

import { expect, test, vi } from 'vitest';
import Loader from './Loader.svelte';
import { render } from '@testing-library/svelte';
import { router } from 'tinro';

// first, patch window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

Object.defineProperty(global, 'window', {
  value: {
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

beforeAll(() => {
  vi.clearAllMocks();
});

test('Loader should redirect to the installation page when receiving the event', async () => {
  const dummyExtensionId = 'my.customExtensionId';

  // rendering the component
  render(Loader, { props: {} });

  // send the install-extension:from-id event
  const callbackInstallExtension = callbacks.get('install-extension:from-id');
  // send 'install-extension:from-id' event
  expect(callbackInstallExtension).toBeDefined();
  await callbackInstallExtension(dummyExtensionId);

  // check that we didn't redirect to the installation page as system is not yet ready
  expect(router.goto).not.toHaveBeenCalled();

  // send the system-ready event
  const callback = callbacks.get('system-ready');
  // send 'system-ready' event
  expect(callback).toBeDefined();
  await callback();

  // check that we have been redirected
  expect(router.goto).toHaveBeenCalledWith(`/preferences/extensions/install-from-id/${dummyExtensionId}`);
});
