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

import { expect, test, vi } from 'vitest';

import type { ContextsManagerExperimental } from './contexts-manager-experimental.js';
import { ContextsStatesDispatcher } from './contexts-states-dispatcher.js';

test('ContextsStatesDispatcher should call updateHealthStates when onContextHealthStateChange event is fired', () => {
  const onContextHealthStateChangeMock = vi.fn();
  const onContextPermissionResultMock = vi.fn();
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: onContextHealthStateChangeMock,
    onContextPermissionResult: onContextPermissionResultMock,
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const dispatcher = new ContextsStatesDispatcher(manager);
  const updateHealthStatesSpy = vi.spyOn(dispatcher, 'updateHealthStates');
  const updatePermissionsSpy = vi.spyOn(dispatcher, 'updatePermissions');
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updatePermissionsSpy).not.toHaveBeenCalled();

  onContextHealthStateChangeMock.mockImplementation(f => f());
  dispatcher.init();
  expect(updateHealthStatesSpy).toHaveBeenCalled();
  expect(updatePermissionsSpy).not.toHaveBeenCalled();
});

test('ContextsStatesDispatcher should call updatePermissions when onContextPermissionResult event is fired', () => {
  const onContextHealthStateChangeMock = vi.fn();
  const onContextPermissionResultMock = vi.fn();
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: onContextHealthStateChangeMock,
    onContextPermissionResult: onContextPermissionResultMock,
    onContextDelete: vi.fn(),
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const dispatcher = new ContextsStatesDispatcher(manager);
  const updateHealthStatesSpy = vi.spyOn(dispatcher, 'updateHealthStates');
  const updatePermissionsSpy = vi.spyOn(dispatcher, 'updatePermissions');
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updatePermissionsSpy).not.toHaveBeenCalled();

  onContextPermissionResultMock.mockImplementation(f => f());
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updatePermissionsSpy).toHaveBeenCalled();
});

test('ContextsStatesDispatcher should call updateHealthStates and updatePermissions when onContextDelete event is fired', () => {
  const onContextDeleteMock = vi.fn();
  const manager: ContextsManagerExperimental = {
    onContextHealthStateChange: vi.fn(),
    onContextPermissionResult: vi.fn(),
    onContextDelete: onContextDeleteMock,
    getHealthCheckersStates: vi.fn(),
    getPermissions: vi.fn(),
  } as unknown as ContextsManagerExperimental;
  const dispatcher = new ContextsStatesDispatcher(manager);
  const updateHealthStatesSpy = vi.spyOn(dispatcher, 'updateHealthStates');
  const updatePermissionsSpy = vi.spyOn(dispatcher, 'updatePermissions');
  dispatcher.init();
  expect(updateHealthStatesSpy).not.toHaveBeenCalled();
  expect(updatePermissionsSpy).not.toHaveBeenCalled();

  onContextDeleteMock.mockImplementation(f => f());
  dispatcher.init();
  expect(updateHealthStatesSpy).toHaveBeenCalled();
  expect(updatePermissionsSpy).toHaveBeenCalled();
});
