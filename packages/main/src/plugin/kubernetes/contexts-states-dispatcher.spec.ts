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

import type { ContextPermission, IDisposable } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { expect, test, vi } from 'vitest';

import type { ContextHealthState } from './context-health-checker.js';
import type { ContextPermissionResult } from './context-permissions-checker.js';
import type { DispatcherEvent } from './contexts-dispatcher.js';
import type { ContextsManagerExperimental } from './contexts-manager-experimental.js';
import { ContextsStatesDispatcher } from './contexts-states-dispatcher.js';
import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';

test('ContextsStatesDispatcher should call updateHealthStates when onContextHealthStateChange event is fired', () => {
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: vi.fn(),
    onOfflineChange: vi.fn(),
    onContextPermissionResult: vi.fn(),
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
    onResourceCountUpdated: vi.fn(),
    onResourceUpdated: vi.fn(),
    isContextOffline: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  const updateHealthStatesSpy = vi.spyOn(dispatcher, 'updateHealthStates');
  const updatePermissionsSpy = vi.spyOn(dispatcher, 'updatePermissions');
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updatePermissionsSpy).not.toHaveBeenCalled();

  vi.mocked(manager.onContextHealthStateChange).mockImplementation(f => f({} as ContextHealthState) as IDisposable);
  vi.mocked(manager.getHealthCheckersStates).mockReturnValue(new Map<string, ContextHealthState>());
  dispatcher.init();
  expect(updateHealthStatesSpy).toHaveBeenCalled();
  expect(updatePermissionsSpy).not.toHaveBeenCalled();
});

test('ContextsStatesDispatcher should call updateHealthStates, updateResourcesCount and updateActiveResourcesCount when onOfflineChange event is fired', () => {
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: vi.fn(),
    onOfflineChange: vi.fn(),
    onContextPermissionResult: vi.fn(),
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
    onResourceCountUpdated: vi.fn(),
    onResourceUpdated: vi.fn(),
    isContextOffline: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  const updateHealthStatesSpy = vi.spyOn(dispatcher, 'updateHealthStates');
  const updateResourcesCountSpy = vi.spyOn(dispatcher, 'updateResourcesCount');
  const updateActiveResourcesCountSpy = vi.spyOn(dispatcher, 'updateActiveResourcesCount');
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updateResourcesCountSpy).not.toHaveBeenCalled();
  expect(updateActiveResourcesCountSpy).not.toHaveBeenCalled();

  vi.mocked(manager.onOfflineChange).mockImplementation(f => f() as IDisposable);
  vi.mocked(manager.getHealthCheckersStates).mockReturnValue(new Map<string, ContextHealthState>());
  dispatcher.init();
  expect(updateHealthStatesSpy).toHaveBeenCalled();
  expect(updateResourcesCountSpy).toHaveBeenCalled();
  expect(updateActiveResourcesCountSpy).toHaveBeenCalled();
});

test('ContextsStatesDispatcher should call updatePermissions when onContextPermissionResult event is fired', () => {
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: vi.fn(),
    onOfflineChange: vi.fn(),
    onContextPermissionResult: vi.fn(),
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
    onResourceCountUpdated: vi.fn(),
    onResourceUpdated: vi.fn(),
    isContextOffline: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  vi.mocked(manager.getPermissions).mockReturnValue([]);
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  const updateHealthStatesSpy = vi.spyOn(dispatcher, 'updateHealthStates');
  const updatePermissionsSpy = vi.spyOn(dispatcher, 'updatePermissions');
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updatePermissionsSpy).not.toHaveBeenCalled();

  vi.mocked(manager.onContextPermissionResult).mockImplementation(f => f({} as ContextPermissionResult) as IDisposable);
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updatePermissionsSpy).toHaveBeenCalled();
});

test('ContextsStatesDispatcher should call updateHealthStates and updatePermissions when onContextDelete event is fired', () => {
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: vi.fn(),
    onOfflineChange: vi.fn(),
    onContextPermissionResult: vi.fn(),
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
    onResourceCountUpdated: vi.fn(),
    onResourceUpdated: vi.fn(),
    isContextOffline: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  vi.mocked(manager.getPermissions).mockReturnValue([]);
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  const updateHealthStatesSpy = vi.spyOn(dispatcher, 'updateHealthStates');
  const updatePermissionsSpy = vi.spyOn(dispatcher, 'updatePermissions');
  vi.mocked(manager.getHealthCheckersStates).mockReturnValue(new Map<string, ContextHealthState>());
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updatePermissionsSpy).not.toHaveBeenCalled();

  vi.mocked(manager.onContextDelete).mockImplementation(f => f({} as DispatcherEvent) as IDisposable);
  dispatcher.init();
  expect(updateHealthStatesSpy).toHaveBeenCalled();
  expect(updatePermissionsSpy).toHaveBeenCalled();
});

test('ContextsStatesDispatcher should call updateResource and updateActiveResourcesCount when onResourceUpdated event is fired', () => {
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: vi.fn(),
    onOfflineChange: vi.fn(),
    onContextPermissionResult: vi.fn(),
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
    onResourceCountUpdated: vi.fn(),
    onResourceUpdated: vi.fn(),
    isContextOffline: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  vi.mocked(manager.getPermissions).mockReturnValue([]);
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  const updateResourceSpy = vi.spyOn(dispatcher, 'updateResource');
  const updateActiveResourcesCountSpy = vi.spyOn(dispatcher, 'updateActiveResourcesCount');
  vi.mocked(manager.getHealthCheckersStates).mockReturnValue(new Map<string, ContextHealthState>());
  dispatcher.init();
  expect(updateResourceSpy).not.toHaveBeenCalled();
  expect(updateActiveResourcesCountSpy).not.toHaveBeenCalled();

  vi.mocked(manager.onResourceUpdated).mockImplementation(
    f => f({} as { contextName: string; resourceName: string }) as IDisposable,
  );
  dispatcher.init();
  expect(updateResourceSpy).toHaveBeenCalled();
  expect(updateActiveResourcesCountSpy).toHaveBeenCalled();
});

test('getContextsHealths should return the values of the map returned by manager.getHealthCheckersStates without kubeConfig', () => {
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: vi.fn(),
    onOfflineChange: vi.fn(),
    onContextPermissionResult: vi.fn(),
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
    isContextOffline: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  const context1State = {
    contextName: 'context1',
    checking: true,
    reachable: false,
  };
  const context2State = {
    contextName: 'context2',
    checking: false,
    reachable: true,
  };
  const context3State = {
    contextName: 'context3',
    checking: false,
    reachable: false,
    errorMessage: 'an error',
  };
  const value = new Map<string, ContextHealthState>([
    ['context1', { ...context1State, kubeConfig: {} as unknown as KubeConfigSingleContext }],
    ['context2', { ...context2State, kubeConfig: {} as unknown as KubeConfigSingleContext }],
    ['context3', { ...context3State, kubeConfig: {} as unknown as KubeConfigSingleContext }],
  ]);
  vi.mocked(manager.getHealthCheckersStates).mockReturnValue(value);
  const result = dispatcher.getContextsHealths();
  expect(result).toEqual([context1State, context2State, context3State]);
});

test('updateHealthStates should call apiSender.send with kubernetes-contexts-healths', () => {
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: vi.fn(),
    onContextPermissionResult: vi.fn(),
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  vi.spyOn(dispatcher, 'getContextsHealths').mockReturnValue([]);
  dispatcher.updateHealthStates();
  expect(apiSender.send).toHaveBeenCalledWith('kubernetes-contexts-healths');
});

test('getContextsPermissions should return the values as an array', () => {
  const manager: ContextsManagerExperimental = {
    getPermissions: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  const value: ContextPermission[] = [
    {
      contextName: 'context1',
      resourceName: 'resource1',
      permitted: true,
      reason: 'ok',
    },
    {
      contextName: 'context1',
      resourceName: 'resource2',
      permitted: false,
      reason: 'nok',
    },
    {
      contextName: 'context2',
      resourceName: 'resource1',
      permitted: false,
      reason: 'nok',
    },
    {
      contextName: 'context2',
      resourceName: 'resource2',
      permitted: true,
      reason: 'ok',
    },
  ];
  vi.mocked(manager.getPermissions).mockReturnValue(value);
  const result = dispatcher.getContextsPermissions();
  expect(result).toEqual(value);
});

test('updatePermissions should call apiSender.send with kubernetes-contexts-permissions', () => {
  const manager: ContextsManagerExperimental = {} as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  dispatcher.updatePermissions();
  expect(vi.mocked(apiSender.send)).toHaveBeenCalledWith('kubernetes-contexts-permissions');
});

test('updateResourcesCount should call apiSender.send with kubernetes-resources-count', () => {
  const manager: ContextsManagerExperimental = {} as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  dispatcher.updateResourcesCount();
  expect(vi.mocked(apiSender.send)).toHaveBeenCalledWith('kubernetes-resources-count');
});

test('updateResource should call apiSender.send with kubernetes-`resource-name`', () => {
  const manager: ContextsManagerExperimental = {} as ContextsManagerExperimental;
  const apiSender: ApiSenderType = {
    send: vi.fn(),
  } as unknown as ApiSenderType;
  const dispatcher = new ContextsStatesDispatcher(manager, apiSender);
  dispatcher.updateResource('resource1');
  expect(vi.mocked(apiSender.send)).toHaveBeenCalledWith('kubernetes-update-resource1');
});
