/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { get } from 'svelte/store';
import type { Mock } from 'vitest';
import { beforeAll, expect, test, vi } from 'vitest';

import type { OnboardingInfo } from '../../../main/src/plugin/api/onboarding';
import { fetchOnboarding, onboardingEventStore, onboardingList } from './onboarding';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listOnboardingMock: Mock<any, Promise<OnboardingInfo[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    listOnboarding: listOnboardingMock,
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

test('onboarding should be updated in case of an extension is stopped', async () => {
  // initial view
  listOnboardingMock.mockResolvedValue([
    {
      extension: 'extension',
      title: 'title',
      decription: 'description',
      steps: [],
    } as unknown as OnboardingInfo,
  ]);
  onboardingEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // now ready to fetch volumes
  await fetchOnboarding();

  // now get list
  const onboardingList1 = get(onboardingList);
  expect(onboardingList1.length).toBe(1);
  expect(onboardingList1[0].extension).toEqual('extension');

  // ok now mock the listOnboarding function to return an empty list
  listOnboardingMock.mockResolvedValue([]);

  // call 'extension-stopped' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  expect(extensionStoppedCallback).toBeDefined();
  await extensionStoppedCallback();

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  // check if the onboardings are updated
  const onboardingList2 = get(onboardingList);
  expect(onboardingList2.length).toBe(0);
});
