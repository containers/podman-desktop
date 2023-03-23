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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import PreferencesConnectionCreationRendering from './PreferencesConnectionCreationRendering.svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { get } from 'svelte/store';
import { createConnectionsInfo } from '/@/stores/create-connections';

const properties: IConfigurationPropertyRecordedSchema[] = [];
const providerInfo: ProviderInfo = {
  id: 'test',
} as unknown as ProviderInfo;
const propertyScope = 'FOO';

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();

  Object.defineProperty(window, 'matchMedia', {
    value: () => {
      return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
      };
    },
  });
});

test('Expect that the create button is available', async () => {
  const callback = vi.fn();
  await render(PreferencesConnectionCreationRendering, { properties, providerInfo, propertyScope, callback });
  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();
});

test('Expect create connection successfully', async () => {
  let providedKeyLogger;

  const callback = vi.fn();
  callback.mockImplementation(async function (
    _id: string,
    _params: unknown,
    _key: unknown,
    keyLogger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: unknown[]) => void,
  ): Promise<void> {
    // keep reference
    providedKeyLogger = keyLogger;
  });

  await render(PreferencesConnectionCreationRendering, { properties, providerInfo, propertyScope, callback });
  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
  // click on the button
  await fireEvent.click(createButton);

  // do we have a task
  const currentConnectionInfo = get(createConnectionsInfo);

  expect(currentConnectionInfo).toBeDefined();
  expect(currentConnectionInfo.creationInProgress).toBeTruthy();
  expect(currentConnectionInfo.creationStarted).toBeTruthy();
  expect(currentConnectionInfo.creationSuccessful).toBeFalsy();

  expect(currentConnectionInfo.propertyScope).toBe(propertyScope);
  expect(currentConnectionInfo.providerInfo).toBe(providerInfo);

  expect(callback).toHaveBeenCalled();
  expect(providedKeyLogger).toBeDefined();

  // simulate end of the create operation
  providedKeyLogger(currentConnectionInfo.createKey, 'finish', []);

  // expect it is sucessful
  const currentConnectionInfoAfter = get(createConnectionsInfo);
  expect(currentConnectionInfoAfter.creationInProgress).toBeFalsy();
  expect(currentConnectionInfoAfter.creationStarted).toBeTruthy();
  expect(currentConnectionInfoAfter.creationSuccessful).toBeTruthy();
});
