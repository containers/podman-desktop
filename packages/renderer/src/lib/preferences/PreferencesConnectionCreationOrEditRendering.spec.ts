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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { eventCollect } from '/@/lib/preferences/preferences-connection-rendering-task';
import { operationConnectionsInfo } from '/@/stores/operation-connections';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import PreferencesConnectionCreationOrEditRendering from './PreferencesConnectionCreationOrEditRendering.svelte';

type LoggerEventName = 'log' | 'warn' | 'error' | 'finish';

const properties: IConfigurationPropertyRecordedSchema[] = [
  {
    title: 'FactoryProperty',
    parentId: '',
    scope: 'ContainerProviderConnectionFactory',
    id: 'test.factoryProperty',
    type: 'number',
    description: 'test.factoryProperty',
  },
];
const providerInfo: ProviderInfo = {
  id: 'test',
  internalId: 'test',
  name: 'test',
} as unknown as ProviderInfo;
const connectionInfo = {
  name: 'test connection',
} as unknown as ProviderContainerConnectionInfo;
const propertyScope = 'ContainerProviderConnectionFactory';

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

function mockCallback(
  callback: (keyLogger: (key: symbol, eventName: LoggerEventName, args: string[]) => void) => Promise<void>,
) {
  return vi.fn().mockImplementation(async function (
    _id: string,
    _params: unknown,
    _key: unknown,
    keyLogger: (key: symbol, eventName: LoggerEventName, args: string[]) => void,
  ): Promise<void> {
    // keep reference
    callback(keyLogger);
  });
}

beforeEach(() => {
  operationConnectionsInfo.set(new Map());
  vi.resetAllMocks();
});

describe.each([
  {
    action: 'creation',
    label: 'Create',
    closeTelemetryEvent: 'createNewProviderConnectionPageUserClosed',
    cancelTelemetryEvent: 'createNewProviderConnectionRequestUserCanceled',
    connectionInfo: undefined,
    taskId: 2,
    create: true,
  },
  {
    action: 'update',
    label: 'Update',
    closeTelemetryEvent: 'updateProviderConnectionPageUserClosed',
    cancelTelemetryEvent: 'updateProviderConnectionRequestUserCanceled',
    connectionInfo: connectionInfo,
    taskId: 3,
    create: false,
  },
])('$label', ({ action, label, closeTelemetryEvent, cancelTelemetryEvent, connectionInfo, taskId, create }) => {
  test(`Expect that the ${action} button is available`, async () => {
    const callback = vi.fn();
    render(PreferencesConnectionCreationOrEditRendering, {
      properties,
      providerInfo,
      connectionInfo,
      propertyScope,
      callback,
      pageIsLoading: false,
    });
    const createButton = screen.getByRole('button', { name: `${label}` });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeEnabled();
  });

  test('Expect Close button redirects to Resources page', async () => {
    const gotoSpy = vi.spyOn(router, 'goto');

    const callback = mockCallback(async () => {});

    // eslint-disable-next-line @typescript-eslint/await-thenable
    render(PreferencesConnectionCreationOrEditRendering, {
      properties,
      providerInfo,
      connectionInfo,
      propertyScope,
      callback,
      pageIsLoading: false,
      taskId,
    });

    const closeButton = screen.getByRole('button', { name: 'Close page' });
    expect(closeButton).toBeInTheDocument();

    await fireEvent.click(closeButton);
    expect(gotoSpy).toBeCalledWith('/preferences/resources');
    expect(window.telemetryTrack).toBeCalledWith(`${closeTelemetryEvent}`, {
      providerId: providerInfo.id,
      name: providerInfo.name,
    });
  });

  test(`Expect ${action} connection successfully`, async () => {
    let providedKeyLogger: ((key: symbol, eventName: LoggerEventName, args: string[]) => void) | undefined;

    const callback = mockCallback(async keyLogger => {
      providedKeyLogger = keyLogger;
    });

    // eslint-disable-next-line @typescript-eslint/await-thenable
    render(PreferencesConnectionCreationOrEditRendering, {
      properties,
      providerInfo,
      connectionInfo,
      propertyScope,
      callback,
      pageIsLoading: false,
      taskId,
    });
    await vi.waitUntil(() => screen.queryByRole('textbox', { name: 'test.factoryProperty' }));
    const createButton = screen.getByRole('button', { name: `${label}` });
    expect(createButton).toBeInTheDocument();
    // click on the button
    await fireEvent.click(createButton);

    // do we have a task
    const currentConnectionInfoMap = get(operationConnectionsInfo);
    expect(currentConnectionInfoMap).toBeDefined();
    const currentConnectionInfo = currentConnectionInfoMap.get(taskId);
    expect(currentConnectionInfo).toBeDefined();
    if (currentConnectionInfo) {
      expect(currentConnectionInfo.operationInProgress).toBeTruthy();
      expect(currentConnectionInfo.operationStarted).toBeTruthy();
      expect(currentConnectionInfo.operationSuccessful).toBeFalsy();

      const showLogsButton = screen.getByRole('button', { name: 'Show Logs' });
      expect(showLogsButton).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: `Cancel ${action}` });
      expect(cancelButton).toBeInTheDocument();

      expect(currentConnectionInfo.propertyScope).toStrictEqual(propertyScope);
      expect(currentConnectionInfo.providerInfo).toStrictEqual(providerInfo);

      expect(callback).toHaveBeenCalled();
      expect(callback).toBeCalledWith(
        'test',
        create ? { 'test.factoryProperty': '0' } : {},
        expect.anything(),
        eventCollect,
        undefined,
        taskId,
      );
      expect(providedKeyLogger).toBeDefined();

      // simulate end of the create operation
      if (providedKeyLogger) {
        providedKeyLogger(currentConnectionInfo.operationKey, 'finish', []);
      }

      // expect it is successful
      const currentConnectionInfoAfterMap = get(operationConnectionsInfo);
      expect(currentConnectionInfoAfterMap).toBeDefined();
      const currentConnectionInfoAfter = currentConnectionInfoAfterMap.get(taskId);

      expect(currentConnectionInfoAfter?.operationInProgress).toBeFalsy();
      expect(currentConnectionInfoAfter?.operationStarted).toBeTruthy();
      expect(currentConnectionInfoAfter?.operationSuccessful).toBeTruthy();
      const closeButton = screen.getByRole('button', { name: 'Close panel' });
      expect(closeButton).toBeInTheDocument();
    }
  });

  test(`Expect cancelling the ${action}, trigger the cancellation token`, async () => {
    let providedKeyLogger: ((key: symbol, eventName: LoggerEventName, args: string[]) => void) | undefined;

    const callback = mockCallback(async keyLogger => {
      // keep reference
      providedKeyLogger = keyLogger;
    });
    (window as any).getCancellableTokenSource.mockReturnValue(Date.now());
    render(PreferencesConnectionCreationOrEditRendering, {
      properties,
      providerInfo,
      connectionInfo,
      propertyScope,
      callback,
      pageIsLoading: false,
      taskId,
    });
    const createButton = screen.getByRole('button', { name: `${label}` });
    expect(createButton).toBeInTheDocument();
    // click on the button
    await fireEvent.click(createButton);

    // do we have a task
    const currentConnectionInfoMap = get(operationConnectionsInfo);

    expect(currentConnectionInfoMap).toBeDefined();
    const currentConnectionInfo = currentConnectionInfoMap.values().next().value;

    expect(currentConnectionInfo).toBeDefined();
    expect(currentConnectionInfo?.operationInProgress).toBeTruthy();
    expect(currentConnectionInfo?.operationStarted).toBeTruthy();
    expect(currentConnectionInfo?.operationSuccessful).toBeFalsy();

    const showLogsButton = screen.getByRole('button', { name: 'Show Logs' });
    expect(showLogsButton).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: `Cancel ${action}` });
    expect(cancelButton).toBeInTheDocument();

    expect(currentConnectionInfo?.propertyScope).toStrictEqual(propertyScope);
    expect(currentConnectionInfo?.providerInfo).toStrictEqual(providerInfo);

    expect(callback).toHaveBeenCalled();
    expect(providedKeyLogger).toBeDefined();

    const cancelTokenMock = vi.fn().mockImplementation(() => {});
    (window as any).cancelToken = cancelTokenMock;
    await fireEvent.click(cancelButton);

    // simulate end of the create operation
    if (providedKeyLogger && currentConnectionInfo?.operationKey) {
      providedKeyLogger(currentConnectionInfo.operationKey, 'finish', []);
    }

    expect(window.telemetryTrack).toBeCalledWith(`${cancelTelemetryEvent}`, {
      providerId: providerInfo.id,
      name: providerInfo.name,
    });
    // expect it is sucessful
    vi.waitFor(() => expect(cancelTokenMock).toBeCalled(), { timeout: 3000 });
  });

  test('Expect Close button and main image to not be visible if hidden using properties', async () => {
    const callback = mockCallback(async () => {});

    // eslint-disable-next-line @typescript-eslint/await-thenable
    render(PreferencesConnectionCreationOrEditRendering, {
      properties,
      providerInfo,
      connectionInfo,
      propertyScope,
      callback,
      pageIsLoading: false,
      taskId,
      hideCloseButton: true,
    });

    const closeButton = screen.queryByRole('button', { name: 'Close page' });
    expect(closeButton).not.toBeInTheDocument();
    const mainImage = screen.queryByLabelText('main image');
    expect(mainImage).not.toBeInTheDocument();
  });

  test('Expect Terminal Component to be acessible after error being thrown', async () => {
    const callback = vi.fn();
    callback.mockRejectedValue(new Error('error'));

    // eslint-disable-next-line @typescript-eslint/await-thenable
    render(PreferencesConnectionCreationOrEditRendering, {
      properties,
      providerInfo,
      connectionInfo,
      propertyScope,
      callback,
      pageIsLoading: false,
      taskId,
    });
    await vi.waitUntil(() => screen.queryByRole('textbox', { name: 'test.factoryProperty' }));
    const createButton = screen.getByRole('button', { name: `${label}` });
    expect(createButton).toBeInTheDocument();
    await fireEvent.click(createButton);
    const showLogsButton = screen.getByRole('button', { name: 'Show Logs' });
    expect(showLogsButton).toBeInTheDocument();
  });

  test(`Expect ${label} button to be disabled if itemsAudit returns errors or enabled otherwise`, async () => {
    const callback = vi.fn();
    let auditSpy = vi.spyOn(window as any, 'auditConnectionParameters');
    if (!connectionInfo) {
      auditSpy = vi.spyOn(window as any, 'auditConnectionParameters').mockImplementationOnce(() => ({ records: [] }));
    }
    auditSpy = auditSpy
      .mockImplementationOnce(() => ({
        records: [
          {
            type: 'error',
            record: 'error message',
          },
        ],
      }))
      .mockImplementationOnce(() => ({
        records: [
          {
            type: 'info',
            record: 'info message',
          },
        ],
      }));
    // eslint-disable-next-line @typescript-eslint/await-thenable
    render(PreferencesConnectionCreationOrEditRendering, {
      properties: [
        {
          title: 'FactoryProperty',
          parentId: '',
          scope: 'ContainerProviderConnectionFactory',
          id: 'test.factoryProperty',
          type: 'number',
          description: 'test.factoryProperty',
        },
      ],
      providerInfo,
      connectionInfo,
      propertyScope,
      callback,
      pageIsLoading: false,
      taskId,
    });
    await vi.waitUntil(() => screen.queryByRole('textbox', { name: 'test.factoryProperty' }));
    const inputElement = screen.queryByRole('textbox', { name: 'test.factoryProperty' });
    expect(inputElement).toBeDefined();
    await fireEvent.input(inputElement!, { target: { value: '1' } });
    await vi.waitFor(() => expect(vi.mocked(window as any).auditConnectionParameters).toBeCalled());
    const createButton = screen.getByRole('button', { name: `${label}` });
    expect(createButton).toBeInTheDocument();
    await vi.waitFor(() => expect(createButton).toBeDisabled());

    await fireEvent.input(inputElement as Element, { target: { value: '2' } });
    await vi.waitFor(() => expect(vi.mocked(window as any).auditConnectionParameters).toBeCalledTimes(2));
    await vi.waitFor(() => expect(createButton).toBeEnabled());
  });
});

test(`Expect create with unchecked and checked checkboxes`, async () => {
  const taskId = 4;
  const callback = mockCallback(async () => {});

  const booleanProperties: IConfigurationPropertyRecordedSchema[] = [
    {
      title: 'unchecked checkbox',
      parentId: '',
      scope: 'ContainerProviderConnectionFactory',
      id: 'test.unchecked',
      type: 'boolean',
      description: 'should be unchecked / false',
    },
    {
      title: 'checked checkbox',
      parentId: '',
      scope: 'ContainerProviderConnectionFactory',
      id: 'test.checked',
      type: 'boolean',
      default: true,
      description: 'should be checked / true',
    },
    {
      title: 'FactoryProperty',
      parentId: '',
      scope: 'ContainerProviderConnectionFactory',
      id: 'test.factoryProperty',
      type: 'number',
      description: 'test.factoryProperty',
    },
  ];

  // eslint-disable-next-line @typescript-eslint/await-thenable
  render(PreferencesConnectionCreationOrEditRendering, {
    properties: booleanProperties,
    providerInfo,
    connectionInfo: undefined,
    propertyScope,
    callback,
    pageIsLoading: false,
    taskId,
  });
  await vi.waitUntil(() => screen.queryByRole('textbox', { name: 'test.factoryProperty' }));
  await vi.waitUntil(() => screen.getByRole('checkbox', { name: 'should be unchecked / false' }));
  await vi.waitUntil(() => screen.getByRole('checkbox', { name: 'should be checked / true' }));

  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
  // click on the button
  await fireEvent.click(createButton);

  expect(callback).toBeCalledWith(
    'test',
    { 'test.factoryProperty': '0', 'test.checked': true, 'test.unchecked': false },
    expect.anything(),
    eventCollect,
    undefined,
    taskId,
  );
});

test(`Expect create with unchecked and checked checkboxes having multiple scopes`, async () => {
  const taskId = 4;
  const callback = mockCallback(async () => {});

  const booleanProperties: IConfigurationPropertyRecordedSchema[] = [
    {
      title: 'unchecked checkbox',
      parentId: '',
      scope: ['ContainerProviderConnectionFactory', 'DEFAULT'],
      id: 'test.unchecked',
      type: 'boolean',
      description: 'should be unchecked / false',
    },
    {
      title: 'checked checkbox',
      parentId: '',
      scope: ['ContainerProviderConnectionFactory', 'DEFAULT'],
      id: 'test.checked',
      type: 'boolean',
      default: true,
      description: 'should be checked / true',
    },
    {
      title: 'FactoryProperty',
      parentId: '',
      scope: ['ContainerProviderConnectionFactory', 'DEFAULT'],
      id: 'test.factoryProperty',
      type: 'number',
      description: 'test.factoryProperty',
    },
  ];

  // mock getConfigurationValue to return true if property is 'test.checked'
  (window as any).getConfigurationValue = vi.fn().mockImplementation((property: string) => {
    return property === 'test.checked';
  });

  render(PreferencesConnectionCreationOrEditRendering, {
    properties: booleanProperties,
    providerInfo,
    connectionInfo: undefined,
    propertyScope,
    callback,
    pageIsLoading: false,
    taskId,
  });
  await vi.waitUntil(() => screen.queryByRole('textbox', { name: 'test.factoryProperty' }));
  await vi.waitUntil(() => screen.getByRole('checkbox', { name: 'should be unchecked / false' }));
  await vi.waitUntil(() => screen.getByRole('checkbox', { name: 'should be checked / true' }));

  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
  // click on the button
  await fireEvent.click(createButton);

  // check if getConfigurationValue was called with the correct parameters
  expect(window.getConfigurationValue).toBeCalledWith('test.checked', 'DEFAULT');
  expect(window.getConfigurationValue).toBeCalledWith('test.unchecked', 'DEFAULT');
  expect(window.getConfigurationValue).toBeCalledWith('test.factoryProperty', 'DEFAULT');

  expect(callback).toBeCalledWith(
    'test',
    { 'test.factoryProperty': '0', 'test.checked': true, 'test.unchecked': false },
    expect.anything(),
    eventCollect,
    undefined,
    taskId,
  );
});
