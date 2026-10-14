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

import type { IDisposable } from '@desktop-framework/api';
import {
  ENHANCED_DASHBOARD_CONFIGURATION_KEY,
  HEALTH_MONITOR_STATUS,
  ProviderConnectionInfo,
  ProviderInfo,
  SYSTEM_OVERVIEW_EXPANDED,
  SystemOverviewStatus,
  SystemOverviewStatusInfo,
} from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { inject, injectable, postConstruct, preDestroy } from 'inversify';

import { IPCHandle } from '/@/plugin/api.js';
import { ExperimentalConfigurationManager } from '/@/plugin/experimental-configuration-manager.js';
import { ProviderRegistry } from '/@/plugin/provider-registry.js';
import { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';
import { Disposable } from '/@/plugin/types/disposable.js';

const STARTUP_GRACE_PERIOD_DURATION = 8_000;

@injectable()
export class DashboardService implements IDisposable {
  private disposables: IDisposable[] = [];
  private isEnhancedDashboardEnabled = false;
  private startupGracePeriod = true;
  private timeout: NodeJS.Timeout | undefined = undefined;

  constructor(
    @inject(IConfigurationRegistry) private configurationRegistry: IConfigurationRegistry,
    @inject(StatusBarRegistry) private statusBarRegistry: StatusBarRegistry,
    @inject(ProviderRegistry) private providerRegistry: ProviderRegistry,
    @inject(ExperimentalConfigurationManager)
    private experimentalConfigurationManager: ExperimentalConfigurationManager,
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(IPCHandle)
    private readonly ipcHandle: IPCHandle,
  ) {}

  @preDestroy()
  dispose(): void {
    this.disposables.forEach(disposable => disposable.dispose());
    this.disposables = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = undefined;
  }

  @postConstruct()
  init(): void {
    this.ipcHandle('dashboard:getSystemOverviewStatus', async (): Promise<SystemOverviewStatusInfo> => {
      return this.getStatus();
    });

    const dashboardConfiguration: IConfigurationNode = {
      id: 'preferences.experimental.enhancedDashboard',
      title: 'Experimental (Enhanced Dashboard)',
      type: 'object',
      properties: {
        [ENHANCED_DASHBOARD_CONFIGURATION_KEY]: {
          description: 'Enhanced dashboard with more features and improved user experience',
          type: 'object',
          default: false,
          experimental: {
            githubDiscussionLink: 'https://github.com/podman-desktop/podman-desktop/discussions/16055',
          },
        },
        [SYSTEM_OVERVIEW_EXPANDED]: {
          type: 'boolean',
          description: 'Expand the system overview section on the dashboard',
          hidden: true,
          default: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([dashboardConfiguration]);

    this.configurationRegistry.onDidChangeConfiguration(async e => {
      if (e.key === ENHANCED_DASHBOARD_CONFIGURATION_KEY) {
        this.isEnhancedDashboardEnabled = this.experimentalConfigurationManager.isExperimentalConfigurationEnabled(
          ENHANCED_DASHBOARD_CONFIGURATION_KEY,
        );
        this.apiSender.send('enhanced-dashboard-enabled', this.isEnhancedDashboardEnabled);

        this.updateSystemOverviewStatus();
      }
    });

    // Check if enhanced dashboard is enabled during initialization
    this.isEnhancedDashboardEnabled = this.experimentalConfigurationManager.isExperimentalConfigurationEnabled(
      ENHANCED_DASHBOARD_CONFIGURATION_KEY,
    );

    const providerListener = (): void => {
      this.updateSystemOverviewStatus();
    };
    this.providerRegistry.addProviderListener(providerListener);
    this.disposables.push(new Disposable(() => this.providerRegistry.removeProviderListener(providerListener)));

    this.disposables.push(
      this.providerRegistry.onDidUpdateContainerConnection(() => this.updateSystemOverviewStatus()),
    );
    this.disposables.push(
      this.providerRegistry.onDidUpdateKubernetesConnection(() => this.updateSystemOverviewStatus()),
    );
    this.disposables.push(this.providerRegistry.onDidUpdateVmConnection(() => this.updateSystemOverviewStatus()));

    this.disposables.push(
      this.providerRegistry.onDidRegisterContainerConnection(() => this.updateSystemOverviewStatus()),
    );
    this.disposables.push(
      this.providerRegistry.onDidUnregisterContainerConnection(() => this.updateSystemOverviewStatus()),
    );
    this.disposables.push(
      this.providerRegistry.onDidRegisterKubernetesConnection(() => this.updateSystemOverviewStatus()),
    );
    this.disposables.push(
      this.providerRegistry.onDidUnregisterKubernetesConnection(() => this.updateSystemOverviewStatus()),
    );
    this.disposables.push(this.providerRegistry.onDidRegisterVmConnection(() => this.updateSystemOverviewStatus()));
    this.disposables.push(this.providerRegistry.onDidUnregisterVmConnection(() => this.updateSystemOverviewStatus()));

    this.timeout = setTimeout(() => {
      this.timeout = undefined;
      this.startupGracePeriod = false;
      this.updateSystemOverviewStatus();
    }, STARTUP_GRACE_PERIOD_DURATION);
  }

  getStatus(): SystemOverviewStatusInfo {
    const statusInfo = this.getSystemOverviewStatus();
    if (this.startupGracePeriod && statusInfo.status === HEALTH_MONITOR_STATUS.CRITICAL) {
      statusInfo.status = HEALTH_MONITOR_STATUS.PROGRESSING;
      statusInfo.text = 'Initializing...';
    }
    return statusInfo;
  }

  private getSystemOverviewStatus(): SystemOverviewStatusInfo {
    const providers: ProviderInfo[] = this.providerRegistry.getProviderInfos();

    const allConnections: ProviderConnectionInfo[] = providers.flatMap(provider => [
      ...provider.containerConnections,
      ...provider.kubernetesConnections,
      ...provider.vmConnections,
    ]);

    if (allConnections.length === 0) {
      const isConfiguringOrStarting = providers.some(
        p => p.status === 'configuring' || p.status === 'starting' || p.status === 'stopping',
      );

      const status: SystemOverviewStatus = isConfiguringOrStarting
        ? HEALTH_MONITOR_STATUS.PROGRESSING
        : HEALTH_MONITOR_STATUS.STABLE;
      return {
        status,
        text: this.getStatusText(status, allConnections, providers),
      };
    }

    const hasCritical = allConnections.some(c => !!c.error);
    const hasProgressing = allConnections.some(c => c.status === 'starting' || c.status === 'stopping');
    const hasContainerStarted = providers.some(p => p.containerConnections.some(c => c.status === 'started'));

    let worstStatus: SystemOverviewStatus;
    if (hasCritical) {
      worstStatus = HEALTH_MONITOR_STATUS.CRITICAL;
    } else if (hasProgressing) {
      worstStatus = HEALTH_MONITOR_STATUS.PROGRESSING;
    } else if (hasContainerStarted) {
      worstStatus = HEALTH_MONITOR_STATUS.HEALTHY;
    } else {
      worstStatus = HEALTH_MONITOR_STATUS.STABLE;
    }

    return {
      status: worstStatus,
      text: this.getStatusText(worstStatus, allConnections, providers),
    };
  }

  private getStatusText(
    status: SystemOverviewStatus,
    allConnections: ProviderConnectionInfo[],
    providers: ProviderInfo[],
  ): string {
    const errorConnections = allConnections.filter(connection => !!connection.error).length;
    const errorProviders = providers.filter(provider => provider.status === 'error').length;

    switch (status) {
      case HEALTH_MONITOR_STATUS.HEALTHY:
        return 'All systems operational';
      case HEALTH_MONITOR_STATUS.STABLE:
        return 'Some systems are stopped';
      case HEALTH_MONITOR_STATUS.PROGRESSING:
        if (allConnections.filter(connection => connection.status === 'starting').length) {
          return 'Starting up...';
        } else {
          return 'Stopping...';
        }
      case HEALTH_MONITOR_STATUS.CRITICAL:
        if (errorConnections > 1 || errorProviders > 1 || (errorConnections === 1 && errorProviders === 1)) {
          return 'Multiple errors detected';
        } else {
          return 'Error detected';
        }
      default:
        return 'Unknown';
    }
  }

  private updateSystemOverviewStatus(): void {
    const statusInfo = this.getStatus();
    this.apiSender.send('dashboard:system-overview-status', statusInfo);

    // Update statusbar (only for critical/progressing states)
    this.updateSystemOverviewStatusBar(statusInfo);
  }

  private updateSystemOverviewStatusBar(statusInfo: SystemOverviewStatusInfo): void {
    if (statusInfo.status === HEALTH_MONITOR_STATUS.CRITICAL && this.isEnhancedDashboardEnabled) {
      const errorText = 'System issues detected';
      this.statusBarRegistry.setEntry(
        'system-overview-status',
        true, // alignLeft
        0, // priority
        statusInfo.text ?? errorText, // text
        errorText, // tooltip
        'fas fa-triangle-exclamation', // icon
        true, // enabled
        'navigateToResources', // command to navigate to resources page
      );
    } else {
      // Remove statusbar entry for healthy/stable states
      this.statusBarRegistry.removeEntry('system-overview-status');
    }
  }
}
