/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { KubeContext } from '@desktop-framework/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { kubernetesContextsPermissions } from '/@/stores/kubernetes-context-permission';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';

import { listenResourcePermitted } from './resource-permission';

const mockContext1: KubeContext = {
  name: 'context-name',
  cluster: 'cluster-name',
  user: 'user-name',
  clusterInfo: {
    name: 'cluster-name',
    server: 'https://server-name',
  },
};

const mockContext2: KubeContext = {
  name: 'context-name2',
  cluster: 'cluster-name2',
  user: 'user-name2',
  clusterInfo: {
    name: 'cluster-name2',
    server: 'https://server-name2',
  },
  currentContext: true,
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('listenResourcePermitted', () => {
  test('resource should be permitted', async () => {
    const callbackMock = vi.fn();
    vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(true);

    kubernetesContexts.set([mockContext1, mockContext2]);
    kubernetesContextsPermissions.set([{ contextName: 'context-name2', resourceName: 'deployments', permitted: true }]);

    await listenResourcePermitted('deployments', callbackMock);
    expect(callbackMock).toBeCalledWith(true);
  });

  test('resource should be not permitted', async () => {
    const callbackMock = vi.fn();
    vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(true);

    kubernetesContexts.set([mockContext1, mockContext2]);
    kubernetesContextsPermissions.set([
      { contextName: 'context-name2', resourceName: 'deployments', permitted: false },
    ]);

    await listenResourcePermitted('deployments', callbackMock);
    expect(callbackMock).toBeCalledWith(false);
  });

  test('shopuld be permitted if kubernetes experimental is not enabled', async () => {
    const callbackMock = vi.fn();
    vi.mocked(window.isExperimentalConfigurationEnabled).mockResolvedValue(false);

    kubernetesContexts.set([mockContext1, mockContext2]);
    kubernetesContextsPermissions.set([
      { contextName: 'context-name2', resourceName: 'deployments', permitted: false },
    ]);

    await listenResourcePermitted('deployments', callbackMock);
    expect(callbackMock).toBeCalledWith(true);
  });
});
