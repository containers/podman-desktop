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

import type { KubeConfig, KubernetesObject } from '@kubernetes/client-node';

import type { ContextGeneralState, ResourceName } from '/@api/kubernetes-contexts-states.js';

import type { Event } from '../events/emitter.js';
import { Emitter } from '../events/emitter.js';
import type { ContextHealthState } from './context-health-checker.js';
import { ContextHealthChecker } from './context-health-checker.js';
import type { ContextPermissionResult, ContextResourcePermission } from './context-permissions-checker.js';
import { ContextPermissionsChecker } from './context-permissions-checker.js';
import type { DispatcherEvent } from './contexts-dispatcher.js';
import { ContextsDispatcher } from './contexts-dispatcher.js';

const HEALTH_CHECK_TIMEOUT_MS = 5_000;

/**
 * ContextsManagerExperimental receives new KubeConfig updates
 * and manages health checkers for each context of the KubeConfig.
 *
 * ContextsManagerExperimental fire events when a context is deleted, and to forward the states of the health checkers.
 *
 * ContextsManagerExperimental exposes the current state of the health checkers.
 */
export class ContextsManagerExperimental {
  #dispatcher: ContextsDispatcher;
  #healthCheckers: Map<string, ContextHealthChecker>;
  #permissionsCheckers: Map<string, ContextPermissionsChecker>;

  #onContextHealthStateChange = new Emitter<ContextHealthState>();
  onContextHealthStateChange: Event<ContextHealthState> = this.#onContextHealthStateChange.event;

  #onContextPermissionResult = new Emitter<ContextPermissionResult>();
  onContextPermissionResult: Event<ContextPermissionResult> = this.#onContextPermissionResult.event;

  #onContextDelete = new Emitter<DispatcherEvent>();
  onContextDelete: Event<DispatcherEvent> = this.#onContextDelete.event;

  constructor() {
    this.#healthCheckers = new Map<string, ContextHealthChecker>();
    this.#permissionsCheckers = new Map<string, ContextPermissionsChecker>();
    this.#dispatcher = new ContextsDispatcher();
    this.#dispatcher.onAdd(this.onAdd.bind(this));
    this.#dispatcher.onUpdate(this.onUpdate.bind(this));
    this.#dispatcher.onDelete(this.onDelete.bind(this));
    this.#dispatcher.onDelete((state: DispatcherEvent) => this.#onContextDelete.fire(state));
  }

  async update(kubeconfig: KubeConfig): Promise<void> {
    this.#dispatcher.update(kubeconfig);
  }

  private async onAdd(event: DispatcherEvent): Promise<void> {
    // register and start health checker
    const previousHC = this.#healthCheckers.get(event.contextName);
    previousHC?.dispose();
    const newHC = new ContextHealthChecker(event.config);
    newHC.onStateChange(this.onStateChange.bind(this));
    this.#healthCheckers.set(event.contextName, newHC);

    newHC.onReachable(async () => {
      // register and start permissions checker
      const previousPC = this.#permissionsCheckers.get(event.contextName);
      previousPC?.dispose();

      const namespace = event.config.getContextObject(event.config.getCurrentContext())?.namespace ?? 'default';
      const newPC = new ContextPermissionsChecker(event.config, {
        attrs: {
          namespace,
          group: '*',
          resource: '*',
          verb: 'watch',
        },
        resources: ['pods', 'deployments'],
        onDenyRequests: [
          {
            attrs: {
              namespace,
              verb: 'watch',
              resource: 'pods',
            },
            resources: ['pods'],
          },
          {
            attrs: {
              namespace,
              verb: 'watch',
              group: 'apps',
              resource: 'deployments',
            },
            resources: ['deployments'],
          },
        ],
      });
      newPC.onPermissionResult(this.onPermissionResult.bind(this));
      await newPC.start();
      this.#permissionsCheckers.set(event.contextName, newPC);
    });

    await newHC.start({ timeout: HEALTH_CHECK_TIMEOUT_MS });
  }

  private async onUpdate(event: DispatcherEvent): Promise<void> {
    // we don't try to update the checkers, we recreate them
    return this.onAdd(event);
  }

  private onDelete(state: DispatcherEvent): void {
    const previousHC = this.#healthCheckers.get(state.contextName);
    previousHC?.dispose();
    this.#healthCheckers.delete(state.contextName);
    const previousPC = this.#permissionsCheckers.get(state.contextName);
    previousPC?.dispose();
    this.#permissionsCheckers.delete(state.contextName);
  }

  private onStateChange(state: ContextHealthState): void {
    this.#onContextHealthStateChange.fire(state);
  }

  private onPermissionResult(event: ContextPermissionResult): void {
    this.#onContextPermissionResult.fire(event);
  }

  /* getHealthCheckersStates returns the current state of the health checkers */
  getHealthCheckersStates(): Map<string, ContextHealthState> {
    const result = new Map<string, ContextHealthState>();
    for (const [contextName, hc] of this.#healthCheckers.entries()) {
      result.set(contextName, hc.getState());
    }
    return result;
  }

  /* getPermissions returns the current permissions */
  getPermissions(): Map</* contextName */ string, Map</* resource */ string, ContextResourcePermission>> {
    const result = new Map<string, Map<string, ContextResourcePermission>>();
    for (const [contextName, pc] of this.#permissionsCheckers.entries()) {
      result.set(contextName, pc.getPermissions());
    }
    return result;
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

  /* dispose all disposable resources created by the instance */
  dispose(): void {
    this.disposeAllHealthChecks();
    this.disposeAllPermissionsCheckers();
    this.#onContextHealthStateChange.dispose();
    this.#onContextDelete.dispose();
  }

  async refreshContextState(_contextName: string): Promise<void> {}

  // disposeAllHealthChecks disposes all health checks and removes them from registry
  private disposeAllHealthChecks(): void {
    for (const [contextName, healthChecker] of this.#healthCheckers.entries()) {
      healthChecker.dispose();
      this.#healthCheckers.delete(contextName);
    }
  }

  // disposeAllPermissionsCheckers disposes all permissions checkers and removes them from registry
  private disposeAllPermissionsCheckers(): void {
    for (const [contextName, permissionChecker] of this.#permissionsCheckers.entries()) {
      permissionChecker.dispose();
      this.#permissionsCheckers.delete(contextName);
    }
  }
}
