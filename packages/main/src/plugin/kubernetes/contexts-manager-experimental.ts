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

import type { Context, KubernetesObject } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';

import type { ContextGeneralState, ResourceName } from '/@api/kubernetes-contexts-states.js';

import { ContextsConnectivityRegistry } from './contexts-connectivity-registry.js';
import { HealthChecker } from './health-checker.js';

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

export class ContextsManagerExperimental {
  // kubeConfigCheck is used by `update` to check if the received kubeconfig has changed
  // its value must not be used except for detecting this change
  // Methods of this class should receive a kubeconfig from `update`
  #kubeConfigCheck = JSON.stringify(new KubeConfig());

  // Registry to store connectivity state of contexts
  #contextsConnectivityRegistry = new ContextsConnectivityRegistry();

  // Registry to store health checkers, to be able to abort them when a new update is called
  #healthCheckers = new Map<string, HealthChecker>();

  async update(kubeconfig: KubeConfig): Promise<void> {
    if (JSON.stringify(kubeconfig) === this.#kubeConfigCheck) {
      // the config did not change since last update, do nothing
      return;
    }

    this.disposeAllHealthChecks();

    this.#kubeConfigCheck = JSON.stringify(kubeconfig);

    for (const kubeContext of kubeconfig.getContexts()) {
      const contextName = kubeContext.name;
      const isolatedConfig = this.getIsolatedKubeConfig(kubeconfig, kubeContext);
      const healthChecker = new HealthChecker(isolatedConfig);
      this.#healthCheckers.set(contextName, healthChecker);
      healthChecker.onReadiness((ready: boolean) => {
        this.#contextsConnectivityRegistry.setChecking(contextName, false);
        this.#contextsConnectivityRegistry.setReachable(contextName, ready);
      });
      this.#contextsConnectivityRegistry.setChecking(contextName, true);
      healthChecker
        .checkReadiness({ timeout: HEALTH_CHECK_TIMEOUT_MS })
        .catch((err: unknown) => console.error(`error checking readiness for context ${contextName}: ${err}`));
    }
  }

  getContextsGeneralState(): Map<string, ContextGeneralState> {
    return new Map<string, ContextGeneralState>();
  }

  getCurrentContextGeneralState(): ContextGeneralState {
    return {
      reachable: false,
      resources: {
        pods: 0,
        deployments: 0,
      },
    };
  }

  registerGetCurrentContextResources(_resourceName: ResourceName): KubernetesObject[] {
    return [];
  }

  unregisterGetCurrentContextResources(_resourceName: ResourceName): KubernetesObject[] {
    return [];
  }

  dispose(): void {
    this.disposeAllHealthChecks();
  }

  async refreshContextState(_contextName: string): Promise<void> {}

  // abortAllHealthChecks aborts all health checks and removes them from registry
  private disposeAllHealthChecks(): void {
    for (const [contextName, healthChecker] of this.#healthCheckers.entries()) {
      healthChecker.dispose();
      this.#healthCheckers.delete(contextName);
    }
  }

  // getIsolatedKubeConfig returns a KubeConfig with only kubeContext, set as current one
  private getIsolatedKubeConfig(kubeconfig: KubeConfig, kubeContext: Context): KubeConfig {
    const result = new KubeConfig();
    result.loadFromOptions({
      contexts: [kubeContext],
      clusters: kubeconfig.clusters.filter(c => c.name === kubeContext.cluster),
      users: kubeconfig.users.filter(u => u.name === kubeContext.user),
      currentContext: kubeContext.name,
    });
    return result;
  }
}
