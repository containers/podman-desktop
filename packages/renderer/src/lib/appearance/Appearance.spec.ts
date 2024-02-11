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

/* eslint-disable no-null/no-null */
import '@testing-library/jest-dom/vitest';
import { test, vi, expect, beforeEach } from 'vitest';
import { render, type RenderResult } from '@testing-library/svelte';
import Appearance from './Appearance.svelte';
import { AppearanceSettings } from '../../../../main/src/plugin/appearance-settings';

const getConfigurationValueMock = vi.fn();
const addEventListenerMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).getConfigurationValue = getConfigurationValueMock;
  (window as any).matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: addEventListenerMock,
    removeEventListener: vi.fn(),
  });
});

function getRootElement(container: HTMLElement): HTMLElement {
  // get root html element
  let rootElement: HTMLElement | null = container;
  while (rootElement?.parentElement) {
    rootElement = container.parentElement;
  }
  return rootElement as HTMLElement;
}

function getRootElementClassesValue(container: HTMLElement): string | undefined {
  return getRootElement(container).classList.value;
}

async function awaitRender(): Promise<RenderResult<Appearance>> {
  const result = render(Appearance);
  // wait end of asynchrounous onMount
  // wait 200ms
  await new Promise(resolve => setTimeout(resolve, 200));

  return result;
}

// temporary as only dark mode is supported as rendering for now
// it should return empty later
test('Expect dark mode using system when OS is set to light', async () => {
  (window as any).matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);

  const { container } = await awaitRender();

  const val = getRootElementClassesValue(container);

  // expect to have class being "dark" as for now we force dark mode in system mode
  expect(val).toBe('dark');
});

test('Expect dark mode using system when OS is set to dark', async () => {
  (window as any).matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);

  const { container } = await awaitRender();
  // expect to have class being "dark" as OS is using dark
  expect(getRootElementClassesValue(container)).toBe('dark');
});

test('Expect light mode using light configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);

  const { container } = await awaitRender();

  // expect to have class being ""  as we should be in light mode
  expect(getRootElementClassesValue(container)).toBe('');

  // expect to have color-scheme: light
  expect(getRootElement(container)).toHaveStyle('color-scheme: light');
});

test('Expect dark mode using dark configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.DarkEnumValue);

  const { container } = await awaitRender();

  // expect to have class being "dark" as we should be in light mode
  expect(getRootElementClassesValue(container)).toBe('dark');

  // expect to have color-scheme: dark
  expect(getRootElement(container)).toHaveStyle('color-scheme: dark');
});

test('Expect event being changed when changing the default appearance on the operating system', async () => {
  const spyDispatchEvent = vi.spyOn(window, 'dispatchEvent');

  let userCallback: () => void = () => {};
  addEventListenerMock.mockImplementation((event: string, callback: () => void) => {
    if (event === 'change') {
      userCallback = callback;
    }
  });

  await awaitRender();

  // check no dispatched event for now
  expect(spyDispatchEvent).not.toHaveBeenCalled();

  // call the callback on matchMedia
  userCallback();

  // check dispatched event
  expect(spyDispatchEvent).toHaveBeenCalled();

  // get details of the event
  const event = spyDispatchEvent.mock.calls[0][0];
  expect(event.type).toBe('appearance-changed');
});
