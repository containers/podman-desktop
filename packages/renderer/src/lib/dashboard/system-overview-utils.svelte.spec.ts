/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { eventCollect, registerConnectionCallback } from '/@/lib/preferences/preferences-connection-rendering-task';

import {
  getConnectionStatusConfig,
  hasStartLifecycle,
  startConnection,
  STATUS_BG_CLASS,
  STATUS_TEXT_CLASS,
} from './system-overview-utils.svelte';

vi.mock(import('/@/lib/preferences/preferences-connection-rendering-task'));

const baseProvider: ProviderInfo = {
  internalId: 'podman-internal',
  id: 'podman',
  extensionId: 'podman',
  name: 'Podman',
  containerConnections: [],
  kubernetesConnections: [],
  vmConnections: [],
  status: 'configured',
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  detectionChecks: [],
  warnings: [],
  images: {},
  installationSupport: false,
  cleanupSupport: false,
  canStart: false,
  canStop: false,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('STATUS_TEXT_CLASS', () => {
  test('should have entries for all four statuses', () => {
    expect(STATUS_TEXT_CLASS.healthy).toBeDefined();
    expect(STATUS_TEXT_CLASS.stable).toBeDefined();
    expect(STATUS_TEXT_CLASS.progressing).toBeDefined();
    expect(STATUS_TEXT_CLASS.critical).toBeDefined();
  });
});

describe('STATUS_BG_CLASS', () => {
  test('should have entries for all four statuses', () => {
    expect(STATUS_BG_CLASS.healthy).toBeDefined();
    expect(STATUS_BG_CLASS.stable).toBeDefined();
    expect(STATUS_BG_CLASS.progressing).toBeDefined();
    expect(STATUS_BG_CLASS.critical).toBeDefined();
  });
});

describe('hasStartLifecycle', () => {
  test('should return true when canStart is true', () => {
    expect(hasStartLifecycle({ ...baseProvider, canStart: true })).toBe(true);
  });

  test('should return false when canStart is false', () => {
    expect(hasStartLifecycle({ ...baseProvider, canStart: false })).toBe(false);
  });
});

describe('getConnectionStatusConfig', () => {
  test('should return Start for stopped with start lifecycle', () => {
    const config = getConnectionStatusConfig('stopped', { ...baseProvider, canStart: true });
    expect(config).toStrictEqual({
      label: 'Stopped',
      buttonText: 'Start Podman',
      buttonType: 'primary',
    });
  });

  test('should return Start for configured with start lifecycle', () => {
    const config = getConnectionStatusConfig('configured', { ...baseProvider, canStart: true });
    expect(config).toMatchObject({
      buttonText: 'Start Podman',
      buttonType: 'primary',
    });
  });

  test('should return View (secondary) for stopped without start lifecycle', () => {
    const config = getConnectionStatusConfig('stopped', { ...baseProvider, canStart: false });
    expect(config).toStrictEqual({
      label: 'Stopped',
      buttonText: 'View',
      buttonType: 'secondary',
    });
  });

  test('should return View (secondary) for started', () => {
    const config = getConnectionStatusConfig('started', baseProvider);
    expect(config).toStrictEqual({
      label: 'Running',
      buttonText: 'View',
      buttonType: 'secondary',
    });
  });

  test('should return View (secondary) for starting', () => {
    const config = getConnectionStatusConfig('starting', baseProvider);
    expect(config).toStrictEqual({
      label: 'Starting',
      buttonText: 'View',
      buttonType: 'secondary',
    });
  });

  test('should return View (secondary) for stopping', () => {
    const config = getConnectionStatusConfig('stopping', baseProvider);
    expect(config).toStrictEqual({
      label: 'Stopping',
      buttonText: 'View',
      buttonType: 'secondary',
    });
  });

  test('should return See Details in Resources for unknown', () => {
    const config = getConnectionStatusConfig('unknown', baseProvider);
    expect(config).toStrictEqual({
      label: 'Unknown',
      buttonText: 'See Details in Resources',
      buttonType: 'danger',
    });
  });

  test('should return Retry with danger type when error is present and start lifecycle exists', () => {
    const config = getConnectionStatusConfig('starting', { ...baseProvider, canStart: true }, 'Connection refused');
    expect(config).toStrictEqual({
      label: 'Error',
      buttonText: 'Retry Podman',
      buttonType: 'danger',
    });
  });

  test('should return Error label when error is present regardless of status', () => {
    const config = getConnectionStatusConfig('stopped', { ...baseProvider, canStart: true }, 'Something went wrong');
    expect(config).toStrictEqual({
      label: 'Error',
      buttonText: 'Retry Podman',
      buttonType: 'danger',
    });
  });

  test('should return Set up for not-installed', () => {
    const config = getConnectionStatusConfig('not-installed', baseProvider);
    expect(config).toMatchObject({
      buttonText: 'Set up Podman',
      buttonType: 'primary',
    });
  });

  test('should return Set up for installed', () => {
    const config = getConnectionStatusConfig('installed', baseProvider);
    expect(config).toMatchObject({
      buttonText: 'Set up Podman',
      buttonType: 'primary',
    });
  });

  test('should return View (secondary) for configured without start lifecycle', () => {
    const config = getConnectionStatusConfig('configured', baseProvider);
    expect(config).toMatchObject({
      buttonText: 'View',
      buttonType: 'secondary',
    });
  });

  test('should return consistent buttonType for View regardless of connection status', () => {
    const startedConfig = getConnectionStatusConfig('started', baseProvider);
    const stoppedNoStartConfig = getConnectionStatusConfig('stopped', { ...baseProvider, canStart: false });

    expect(startedConfig?.buttonText).toBe('View');
    expect(stoppedNoStartConfig?.buttonText).toBe('View');
    expect(startedConfig?.buttonType).toBe(stoppedNoStartConfig?.buttonType);
  });
});

describe('startConnection', () => {
  test('should register callback and call startProviderConnectionLifecycle', async () => {
    const mockKey = Symbol('test-key');
    vi.mocked(registerConnectionCallback).mockReturnValue(mockKey);
    vi.mocked(window.startProviderConnectionLifecycle).mockResolvedValue(undefined);

    const connection: ProviderContainerConnectionInfo = {
      connectionType: 'container',
      name: 'podman-machine',
      displayName: 'Podman Machine',
      status: 'stopped',
      endpoint: { socketPath: '/run/podman/podman.sock' },
      type: 'podman',
      canStart: false,
      canStop: false,
      canEdit: false,
      canDelete: false,
    };

    const result = await startConnection('podman-internal', connection);

    expect(registerConnectionCallback).toHaveBeenCalledOnce();
    expect(window.startProviderConnectionLifecycle).toHaveBeenCalledWith(
      'podman-internal',
      connection,
      mockKey,
      eventCollect,
    );
    expect(result).toBe(mockKey);
  });
});
