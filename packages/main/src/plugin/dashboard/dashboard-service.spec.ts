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
import { ENHANCED_DASHBOARD_CONFIGURATION_KEY, SYSTEM_OVERVIEW_EXPANDED } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { IPCHandle } from '/@/plugin/api.js';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { DashboardService } from '/@/plugin/dashboard/dashboard-service.js';
import type { ExperimentalConfigurationManager } from '/@/plugin/experimental-configuration-manager.js';
import type { ProviderRegistry } from '/@/plugin/provider-registry.js';
import type { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';

const configurationRegistryMock = {
  registerConfigurations: vi.fn(),
  onDidChangeConfiguration: vi.fn(),
} as unknown as ConfigurationRegistry;

const apiSenderMock = {
  send: vi.fn(),
} as unknown as ApiSenderType;

const experimentalConfigurationManagerMock = {
  isExperimentalConfigurationEnabled: vi.fn(),
} as unknown as ExperimentalConfigurationManager;

const ipcHandleMock = vi.fn() as unknown as IPCHandle;

const getProviderInfosMock = vi.fn();
const providerRegistryMock = {
  addProviderListener: vi.fn(),
  removeProviderListener: vi.fn(),
  getProviderInfos: getProviderInfosMock,
  onDidUpdateContainerConnection: vi.fn(),
  onDidUpdateKubernetesConnection: vi.fn(),
  onDidUpdateVmConnection: vi.fn(),
  onDidRegisterContainerConnection: vi.fn(),
  onDidUnregisterContainerConnection: vi.fn(),
  onDidRegisterKubernetesConnection: vi.fn(),
  onDidUnregisterKubernetesConnection: vi.fn(),
  onDidRegisterVmConnection: vi.fn(),
  onDidUnregisterVmConnection: vi.fn(),
} as unknown as ProviderRegistry;

function createProvider(connectionStatus: string, error?: string): ProviderInfo {
  return {
    internalId: 'id',
    id: 'podman',
    extensionId: 'podman',
    name: 'Podman',
    containerConnections: [
      {
        connectionType: 'container',
        name: 'podman-machine',
        displayName: 'Podman Machine',
        status: connectionStatus,
        error,
        endpoint: { socketPath: '/run/podman/podman.sock' },
        type: 'podman',
      } as unknown as ProviderContainerConnectionInfo,
    ],
    kubernetesConnections: [],
    vmConnections: [],
    status: 'configured',
  } as unknown as ProviderInfo;
}

function triggerProviderChange(): void {
  vi.mocked(providerRegistryMock.addProviderListener).mock.calls[0]?.[0](
    'provider:update-status',
    createProvider('stopped'),
  );
}
const statusBarRegistryMock = {
  setEntry: vi.fn(),
  removeEntry: vi.fn(),
} as unknown as StatusBarRegistry;

let dashboardService: DashboardService;

function setupProviderRegistryMocks(): void {
  const disposable = { dispose: vi.fn() };
  vi.mocked(providerRegistryMock.onDidUpdateContainerConnection).mockReturnValue(disposable);
  vi.mocked(providerRegistryMock.onDidUpdateKubernetesConnection).mockReturnValue(disposable);
  vi.mocked(providerRegistryMock.onDidUpdateVmConnection).mockReturnValue(disposable);
  vi.mocked(providerRegistryMock.onDidRegisterContainerConnection).mockReturnValue(disposable);
  vi.mocked(providerRegistryMock.onDidUnregisterContainerConnection).mockReturnValue(disposable);
  vi.mocked(providerRegistryMock.onDidRegisterKubernetesConnection).mockReturnValue(disposable);
  vi.mocked(providerRegistryMock.onDidUnregisterKubernetesConnection).mockReturnValue(disposable);
  vi.mocked(providerRegistryMock.onDidRegisterVmConnection).mockReturnValue(disposable);
  vi.mocked(providerRegistryMock.onDidUnregisterVmConnection).mockReturnValue(disposable);
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  vi.resetAllMocks();
  getProviderInfosMock.mockReturnValue([]);
  setupProviderRegistryMocks();
  dashboardService = new DashboardService(
    configurationRegistryMock,
    statusBarRegistryMock,
    providerRegistryMock,
    experimentalConfigurationManagerMock,
    apiSenderMock,
    ipcHandleMock,
  );
  dashboardService.init();
});

test('should register IPC handler for dashboard:getSystemOverviewStatus', () => {
  expect(ipcHandleMock).toHaveBeenCalledWith('dashboard:getSystemOverviewStatus', expect.any(Function));
});

test('should register a configuration', () => {
  expect(configurationRegistryMock.registerConfigurations).toBeCalled();
  const configurationNode = vi.mocked(configurationRegistryMock.registerConfigurations).mock.calls[0]?.[0][0];
  expect(configurationNode?.id).toBe('preferences.experimental.enhancedDashboard');
  expect(configurationNode?.title).toBe('Experimental (Enhanced Dashboard)');
  expect(configurationNode?.properties).toBeDefined();
  expect(Object.keys(configurationNode?.properties ?? {}).length).toBe(2);
  expect(configurationNode?.properties?.[ENHANCED_DASHBOARD_CONFIGURATION_KEY]).toBeDefined();
  expect(configurationNode?.properties?.[ENHANCED_DASHBOARD_CONFIGURATION_KEY]?.type).toBe('object');
  expect(configurationNode?.properties?.[ENHANCED_DASHBOARD_CONFIGURATION_KEY]?.description).toBe(
    'Enhanced dashboard with more features and improved user experience',
  );
  expect(configurationNode?.properties?.[SYSTEM_OVERVIEW_EXPANDED]).toBeDefined();
  expect(configurationNode?.properties?.[SYSTEM_OVERVIEW_EXPANDED]?.type).toBe('boolean');
  expect(configurationNode?.properties?.[SYSTEM_OVERVIEW_EXPANDED]?.hidden).toBe(true);
  expect(configurationNode?.properties?.[SYSTEM_OVERVIEW_EXPANDED]?.default).toBe(true);
  expect(
    configurationNode?.properties?.[ENHANCED_DASHBOARD_CONFIGURATION_KEY]?.experimental?.githubDiscussionLink,
  ).toBe('https://github.com/podman-desktop/podman-desktop/discussions/16055');
});

describe('system overview status', () => {
  test('should send healthy status when container connection is started', () => {
    getProviderInfosMock.mockReturnValue([createProvider('started')]);
    triggerProviderChange();

    expect(apiSenderMock.send).toHaveBeenCalledWith('dashboard:system-overview-status', {
      status: 'healthy',
      text: 'All systems operational',
    });
  });

  test('should send status when configuration changes', async () => {
    vi.mocked(experimentalConfigurationManagerMock.isExperimentalConfigurationEnabled).mockReturnValue(true);
    const configCallback = vi.mocked(configurationRegistryMock.onDidChangeConfiguration).mock.calls[0]?.[0];
    await configCallback?.({ key: ENHANCED_DASHBOARD_CONFIGURATION_KEY, value: true, scope: 'DEFAULT' });

    expect(apiSenderMock.send).toHaveBeenCalledWith('enhanced-dashboard-enabled', true);
    expect(apiSenderMock.send).toHaveBeenCalledWith('dashboard:system-overview-status', {
      status: 'stable',
      text: 'Some systems are stopped',
    });
  });

  test('should send status when provider-change is received', () => {
    triggerProviderChange();

    expect(apiSenderMock.send).toHaveBeenCalledWith('dashboard:system-overview-status', {
      status: 'stable',
      text: 'Some systems are stopped',
    });
  });
});

describe('startup grace period', () => {
  test('should send progressing status for errored connections during grace period', () => {
    getProviderInfosMock.mockReturnValue([createProvider('stopped', 'connection failed')]);
    triggerProviderChange();

    expect(apiSenderMock.send).toHaveBeenCalledWith('dashboard:system-overview-status', {
      status: 'progressing',
      text: 'Initializing...',
    });
  });

  test('should send critical status for errored connections after grace period expires', () => {
    getProviderInfosMock.mockReturnValue([createProvider('stopped', 'connection failed')]);
    vi.advanceTimersByTime(8_000);

    expect(apiSenderMock.send).toHaveBeenCalledWith('dashboard:system-overview-status', {
      status: 'critical',
      text: 'Error detected',
    });
  });

  test('should send healthy status if connection resolves before grace period ends', () => {
    const provider = createProvider('stopped', 'connection failed');
    getProviderInfosMock.mockReturnValue([provider]);
    triggerProviderChange();

    expect(apiSenderMock.send).toHaveBeenCalledWith('dashboard:system-overview-status', {
      status: 'progressing',
      text: 'Initializing...',
    });

    provider.containerConnections[0]!.status = 'started';
    (provider.containerConnections[0] as unknown as Record<string, unknown>)['error'] = undefined;
    vi.mocked(apiSenderMock.send).mockClear();
    triggerProviderChange();

    expect(apiSenderMock.send).toHaveBeenCalledWith('dashboard:system-overview-status', {
      status: 'healthy',
      text: 'All systems operational',
    });
  });
});

describe('getStatus', () => {
  test('should return current system overview status', () => {
    getProviderInfosMock.mockReturnValue([createProvider('started')]);

    const status = dashboardService.getStatus();

    expect(status).toEqual({
      status: 'healthy',
      text: 'All systems operational',
    });
  });

  test('should apply grace period override for critical status', () => {
    getProviderInfosMock.mockReturnValue([createProvider('stopped', 'connection failed')]);

    const status = dashboardService.getStatus();

    expect(status).toEqual({
      status: 'progressing',
      text: 'Initializing...',
    });
  });

  test('should return critical after grace period expires', () => {
    getProviderInfosMock.mockReturnValue([createProvider('stopped', 'connection failed')]);
    vi.advanceTimersByTime(8_000);
    vi.mocked(apiSenderMock.send).mockClear();

    const status = dashboardService.getStatus();

    expect(status).toEqual({
      status: 'critical',
      text: 'Error detected',
    });
  });
});

describe('dispose', () => {
  test('should clean up all disposables', () => {
    dashboardService.dispose();

    expect(providerRegistryMock.removeProviderListener).toHaveBeenCalled();
  });
});

describe('connection event listeners', () => {
  test('should register connection event listeners on init', () => {
    expect(providerRegistryMock.onDidUpdateContainerConnection).toHaveBeenCalled();
    expect(providerRegistryMock.onDidUpdateKubernetesConnection).toHaveBeenCalled();
    expect(providerRegistryMock.onDidUpdateVmConnection).toHaveBeenCalled();
    expect(providerRegistryMock.onDidRegisterContainerConnection).toHaveBeenCalled();
    expect(providerRegistryMock.onDidUnregisterContainerConnection).toHaveBeenCalled();
    expect(providerRegistryMock.onDidRegisterKubernetesConnection).toHaveBeenCalled();
    expect(providerRegistryMock.onDidUnregisterKubernetesConnection).toHaveBeenCalled();
    expect(providerRegistryMock.onDidRegisterVmConnection).toHaveBeenCalled();
    expect(providerRegistryMock.onDidUnregisterVmConnection).toHaveBeenCalled();
  });
});
