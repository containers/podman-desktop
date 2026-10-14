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

import type { OnboardingInfo } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, expect, test, vi } from 'vitest';

import { fetchOnboarding, onboardingEventStore, onboardingList } from './onboarding';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('onboarding should be updated in case of an extension is stopped', async () => {
  // initial view
  vi.mocked(window.listOnboarding).mockResolvedValue([
    {
      extension: 'extension',
      title: 'title',
      decription: 'description',
      steps: [],
    } as unknown as OnboardingInfo,
  ]);
  onboardingEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // now ready to fetch volumes
  await fetchOnboarding();

  // now get list
  const onboardingList1 = get(onboardingList);
  expect(onboardingList1.length).toBe(1);
  expect(onboardingList1[0].extension).toEqual('extension');

  // ok now mock the listOnboarding function to return an empty list
  vi.mocked(window.listOnboarding).mockResolvedValue([]);

  // call 'extension-stopped' event
  const extensionStoppedCallback = callbacks.get('extension-stopped');
  assert(extensionStoppedCallback);
  await extensionStoppedCallback();

  // wait a little
  await new Promise(resolve => setTimeout(resolve, 100));

  // check if the onboardings are updated
  const onboardingList2 = get(onboardingList);
  expect(onboardingList2.length).toBe(0);
});

test('onboarding should be updated in case of an extension is started', async () => {
  // mock the listOnboarding function to return an empty list
  vi.mocked(window.listOnboarding).mockResolvedValue([]);

  onboardingEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // now ready to fetch volumes
  await fetchOnboarding();

  // now get list
  const onboardingList1 = get(onboardingList);
  expect(onboardingList1.length).toBe(0);

  // now add a new thing
  vi.mocked(window.listOnboarding).mockResolvedValue([
    {
      extension: 'extension',
      title: 'title',
      decription: 'description',
      steps: [],
    } as unknown as OnboardingInfo,
  ]);

  // call 'extension-started' event
  const extensionStartedCallback = callbacks.get('extension-started');
  assert(extensionStartedCallback);
  await extensionStartedCallback();

  // wait that the onboarding is updated
  await vi.waitFor(() => {
    // check if the onboardings are updated
    const onboardingList2 = get(onboardingList);
    expect(onboardingList2.length).toBe(1);
  });
});
