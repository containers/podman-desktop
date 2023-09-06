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

import '@testing-library/jest-dom/vitest';
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { router } from 'tinro';
import PreferencesConnectionCreationRendering from './PreferencesConnectionCreationRendering.svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { get } from 'svelte/store';
import { createConnectionsInfo } from '/@/stores/create-connections';

type LoggerEventName = 'log' | 'warn' | 'error' | 'finish';

const properties: IConfigurationPropertyRecordedSchema[] = [];
const providerInfo: ProviderInfo = {
  id: 'test',
  internalId: 'test',
  name: 'test',
} as unknown as ProviderInfo;
const propertyScope = 'FOO';

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();
  (window as any).getOsMemory = vi.fn();
  (window as any).getOsCpu = vi.fn();
  (window as any).getOsFreeDiskSize = vi.fn();
  (window as any).getCancellableTokenSource = vi.fn();
  (window as any).auditConnectionParameters = vi.fn();
  (window as any).telemetryTrack = vi.fn();

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
  render(PreferencesConnectionCreationRendering, {
    properties,
    providerInfo,
    propertyScope,
    callback,
    pageIsLoading: false,
  });
  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();
});

function mockCallback(
  callback: (keyLogger: (key: symbol, eventName: LoggerEventName, args: string[]) => void) => Promise<void>,
) {
  return vi
    .fn()
    .mockImplementation(async function (
      _id: string,
      _params: unknown,
      _key: unknown,
      keyLogger: (key: symbol, eventName: LoggerEventName, args: string[]) => void,
    ): Promise<void> {
      // keep reference
      callback(keyLogger);
    });
}

test('Expect Close button redirects to Resources page', async () => {
  const gotoSpy = vi.spyOn(router, 'goto');

  let providedKeyLogger: ((key: symbol, eventName: LoggerEventName, args: string[]) => void) | undefined;

  const callback = mockCallback(async keyLogger => {
    providedKeyLogger = keyLogger;
  });

  // eslint-disable-next-line @typescript-eslint/await-thenable
  render(PreferencesConnectionCreationRendering, {
    properties,
    providerInfo,
    propertyScope,
    callback,
    pageIsLoading: false,
    taskId: 2,
  });

  const closeButton = screen.getByRole('button', { name: 'Close page' });
  expect(closeButton).toBeInTheDocument();

  await fireEvent.click(closeButton);
  expect(gotoSpy).toBeCalledWith('/preferences/resources');
  expect(window.telemetryTrack).toBeCalledWith('createNewProviderConnectionPageUserClosed', {
    providerId: providerInfo.id,
    name: providerInfo.name,
  });
});

test('Expect create connection successfully', async () => {
  let providedKeyLogger: ((key: symbol, eventName: LoggerEventName, args: string[]) => void) | undefined;

  const callback = mockCallback(async keyLogger => {
    providedKeyLogger = keyLogger;
  });

  // eslint-disable-next-line @typescript-eslint/await-thenable
  render(PreferencesConnectionCreationRendering, {
    properties,
    providerInfo,
    propertyScope,
    callback,
    pageIsLoading: false,
    taskId: 2,
  });
  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
  // click on the button
  await fireEvent.click(createButton);

  // do we have a task
  const currentConnectionInfoMap = get(createConnectionsInfo);
  expect(currentConnectionInfoMap).toBeDefined();
  const currentConnectionInfo = currentConnectionInfoMap.values().next().value;
  expect(currentConnectionInfo.creationInProgress).toBeTruthy();
  expect(currentConnectionInfo.creationStarted).toBeTruthy();
  expect(currentConnectionInfo.creationSuccessful).toBeFalsy();

  const showLogsButton = screen.getByRole('button', { name: 'Show Logs' });
  expect(showLogsButton).toBeInTheDocument();

  const cancelButton = screen.getByRole('button', { name: 'Cancel creation' });
  expect(cancelButton).toBeInTheDocument();

  expect(currentConnectionInfo.propertyScope).toBe(propertyScope);
  expect(currentConnectionInfo.providerInfo).toBe(providerInfo);

  expect(callback).toHaveBeenCalled();
  expect(providedKeyLogger).toBeDefined();

  // simulate end of the create operation
  if (providedKeyLogger) {
    providedKeyLogger(currentConnectionInfo.createKey, 'finish', []);
  }

  // expect it is sucessful
  const currentConnectionInfoAfterMap = get(createConnectionsInfo);
  expect(currentConnectionInfoAfterMap).toBeDefined();
  const currentConnectionInfoAfter = currentConnectionInfoAfterMap.get(2);

  expect(currentConnectionInfoAfter?.creationInProgress).toBeFalsy();
  expect(currentConnectionInfoAfter?.creationStarted).toBeTruthy();
  expect(currentConnectionInfoAfter?.creationSuccessful).toBeTruthy();
  const closeButton = screen.getByRole('button', { name: 'Close panel' });
  expect(closeButton).toBeInTheDocument();
});

test('Expect cancelling the creation, trigger the cancellation token', async () => {
  let providedKeyLogger: ((key: symbol, eventName: LoggerEventName, args: string[]) => void) | undefined;

  const callback = mockCallback(async keyLogger => {
    // keep reference
    providedKeyLogger = keyLogger;
  });

  render(PreferencesConnectionCreationRendering, {
    properties,
    providerInfo,
    propertyScope,
    callback,
    pageIsLoading: false,
    taskId: 2,
  });
  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
  // click on the button
  await fireEvent.click(createButton);

  // do we have a task
  const currentConnectionInfoMap = get(createConnectionsInfo);

  expect(currentConnectionInfoMap).toBeDefined();
  const currentConnectionInfo = currentConnectionInfoMap.values().next().value;

  expect(currentConnectionInfo).toBeDefined();
  expect(currentConnectionInfo.creationInProgress).toBeTruthy();
  expect(currentConnectionInfo.creationStarted).toBeTruthy();
  expect(currentConnectionInfo.creationSuccessful).toBeFalsy();

  const showLogsButton = screen.getByRole('button', { name: 'Show Logs' });
  expect(showLogsButton).toBeInTheDocument();

  const cancelButton = screen.getByRole('button', { name: 'Cancel creation' });
  expect(cancelButton).toBeInTheDocument();

  expect(currentConnectionInfo.propertyScope).toBe(propertyScope);
  expect(currentConnectionInfo.providerInfo).toBe(providerInfo);

  expect(callback).toHaveBeenCalled();
  expect(providedKeyLogger).toBeDefined();

  const cancelTokenMock = vi.fn().mockImplementation(() => {});
  (window as any).cancelToken = cancelTokenMock;
  await fireEvent.click(cancelButton);

  // simulate end of the create operation
  if (providedKeyLogger) {
    providedKeyLogger(currentConnectionInfo.createKey, 'finish', []);
  }

  expect(window.telemetryTrack).toBeCalledWith('createNewProviderConnectionRequestUserCanceled', {
    providerId: providerInfo.id,
    name: providerInfo.name,
  });
  // expect it is sucessful
  expect(cancelTokenMock).toBeCalled;
});

test('Expect Close button and main image to not be visible if hidden using properties', async () => {
  let providedKeyLogger: ((key: symbol, eventName: LoggerEventName, args: string[]) => void) | undefined;

  const callback = mockCallback(async keyLogger => {
    providedKeyLogger = keyLogger;
  });

  // eslint-disable-next-line @typescript-eslint/await-thenable
  render(PreferencesConnectionCreationRendering, {
    properties,
    providerInfo,
    propertyScope,
    callback,
    pageIsLoading: false,
    taskId: 2,
    hideCloseButton: true,
    hideProviderImage: true,
  });

  const closeButton = screen.queryByRole('button', { name: 'Close page' });
  expect(closeButton).not.toBeInTheDocument();
  const mainImage = screen.queryByLabelText('main image');
  expect(mainImage).not.toBeInTheDocument();
});
