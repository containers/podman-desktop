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

import type {
  ProviderContainerConnectionInfo,
  ProviderKubernetesConnectionInfo,
  ProviderVmConnectionInfo,
} from '@desktop-framework/api';
import type { ProviderConnectionStatus } from '@desktop-framework/extension-api';
import { describe, expect, test } from 'vitest';

import { getConnectionDisplayName, getSystemOverviewStatus, SYSTEM_OVERVIEW_STATUS } from './system-overview.svelte';

describe('getSystemOverviewStatus', () => {
  test.each([
    { status: 'started', expected: 'healthy' },
    { status: 'stopped', expected: 'stable' },
    { status: 'unknown', expected: 'stable' },
    { status: 'starting', expected: 'progressing' },
    { status: 'stopping', expected: 'progressing' },
  ])('should return $expected for $status', ({ status, expected }) => {
    expect(getSystemOverviewStatus(status as ProviderConnectionStatus)).toEqual(
      SYSTEM_OVERVIEW_STATUS[expected as keyof typeof SYSTEM_OVERVIEW_STATUS],
    );
  });

  test('should return stable for unrecognized status', () => {
    expect(getSystemOverviewStatus('configured' as ProviderConnectionStatus)).toEqual(SYSTEM_OVERVIEW_STATUS.stable);
  });

  test.each(['started', 'stopped', 'starting', 'stopping', 'unknown'])(
    'should return critical when error is present regardless of %s status',
    status => {
      expect(getSystemOverviewStatus(status as ProviderConnectionStatus, 'Connection refused')).toEqual(
        SYSTEM_OVERVIEW_STATUS.critical,
      );
    },
  );
});

describe('getConnectionDisplayName', () => {
  test('should return displayName for container connection when set', () => {
    const connection = {
      connectionType: 'container',
      name: 'podman-machine',
      displayName: 'Podman Machine',
    } as ProviderContainerConnectionInfo;
    expect(getConnectionDisplayName(connection)).toBe('Podman Machine');
  });

  test('should return name for container connection when displayName is undefined', () => {
    const connection = {
      connectionType: 'container',
      name: 'podman-machine',
    } as ProviderContainerConnectionInfo;
    expect(getConnectionDisplayName(connection)).toBe('podman-machine');
  });

  test('should return name for kubernetes connection', () => {
    const connection = {
      connectionType: 'kubernetes',
      name: 'minikube',
    } as ProviderKubernetesConnectionInfo;
    expect(getConnectionDisplayName(connection)).toBe('minikube');
  });

  test('should return name for vm connection', () => {
    const connection = {
      connectionType: 'vm',
      name: 'my-vm',
    } as ProviderVmConnectionInfo;
    expect(getConnectionDisplayName(connection)).toBe('my-vm');
  });
});
