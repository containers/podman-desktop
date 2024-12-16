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

/* eslint-disable no-null/no-null */
import '@testing-library/jest-dom/vitest';

import { render, type RenderResult } from '@testing-library/svelte';
import type { Component, ComponentProps } from 'svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { configurationProperties } from '/@/stores/configurationProperties';

import { AppearanceSettings } from '../../../../main/src/plugin/appearance-settings';
import Appearance from './Appearance.svelte';

const getConfigurationValueMock = vi.fn();
const addEventListenerMock = vi.fn();
const matchMediaMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', { value: getConfigurationValueMock });
  Object.defineProperty(window, 'matchMedia', { value: matchMediaMock });
  Object.defineProperty(window, 'setNativeTheme', { value: vi.fn() });
});

beforeEach(() => {
  vi.resetAllMocks();
  matchMediaMock.mockReturnValue({
    matches: false,
    addEventListener: addEventListenerMock,
    removeEventListener: vi.fn(),
  });
});

function getRootElement(container: HTMLElement): HTMLElement {
  // get root html element
  let rootElement: HTMLElement | null = container;
  let loop = 0;
  while (rootElement?.parentElement && loop < 10) {
    rootElement = container.parentElement;
    loop++;
  }
  return rootElement as HTMLElement;
}

function getRootElementClassesValue(container: HTMLElement): string | undefined {
  return getRootElement(container).classList.value;
}

async function awaitRender(): Promise<RenderResult<Component<ComponentProps<Appearance>>>> {
  const result = render<Component<ComponentProps<Appearance>>>(Appearance);
  // wait end of asynchrounous onMount
  // wait 200ms
  await new Promise(resolve => setTimeout(resolve, 200));

  return result;
}

test('Expect light mode using system when OS is set to light', async () => {
  matchMediaMock.mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);
  configurationProperties.set([]);

  const { baseElement } = await awaitRender();
  // expect to have no (dark) class as OS is using light
  await vi.waitFor(() => expect(getRootElementClassesValue(baseElement)).toBe(''));
});

test('Expect dark mode using system when OS is set to dark', async () => {
  matchMediaMock.mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.SystemEnumValue);
  configurationProperties.set([]);

  const { baseElement } = await awaitRender();
  // expect to have class being "dark" as OS is using dark
  await vi.waitFor(() => expect(getRootElementClassesValue(baseElement)).toBe('dark'));
});

test('Expect light mode using light configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.LightEnumValue);
  configurationProperties.set([]);

  const { baseElement } = await awaitRender();

  // expect to have class being ""  as we should be in light mode
  expect(getRootElementClassesValue(baseElement)).toBe('');

  // expect to have color-scheme: light
  expect(getRootElement(baseElement)).toHaveStyle('color-scheme: light');
});

test('Expect dark mode using dark configuration', async () => {
  getConfigurationValueMock.mockResolvedValue(AppearanceSettings.DarkEnumValue);
  configurationProperties.set([]);

  const { baseElement } = await awaitRender();

  // expect to have class being "dark" as we should be in dark mode
  expect(getRootElementClassesValue(baseElement)).toBe('dark');

  // expect to have color-scheme: dark
  expect(getRootElement(baseElement)).toHaveStyle('color-scheme: dark');
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
