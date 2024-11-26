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

  #onContextHealthStateChange = new Emitter<ContextHealthState>();
  onContextHealthStateChange: Event<ContextHealthState> = this.#onContextHealthStateChange.event;

  #onContextDelete = new Emitter<string>();
  onContextDelete: Event<string> = this.#onContextDelete.event;

  constructor() {
    this.#healthCheckers = new Map<string, ContextHealthChecker>();
    this.#dispatcher = new ContextsDispatcher();
    this.#dispatcher.onAdd(this.onAdd.bind(this));
    this.#dispatcher.onUpdate(this.onUpdate.bind(this));
    this.#dispatcher.onDelete(this.onDelete.bind(this));
    this.#dispatcher.onDelete((contextName: string) => this.#onContextDelete.fire(contextName));
  }

  async update(kubeconfig: KubeConfig): Promise<void> {
    this.#dispatcher.update(kubeconfig);
  }

  private async onAdd(event: DispatcherEvent): Promise<void> {
    const previous = this.#healthCheckers.get(event.contextName);
    previous?.dispose();
    const newHC = new ContextHealthChecker(event.config);
    newHC.onStateChange(this.onStateChange.bind(this));
    this.#healthCheckers.set(event.contextName, newHC);
    await newHC.start({ timeout: HEALTH_CHECK_TIMEOUT_MS });
  }

  private async onUpdate(event: DispatcherEvent): Promise<void> {
    // we don't try to update the health checker, we recreate it
    return this.onAdd(event);
  }

  private onDelete(contextName: string): void {
    const previous = this.#healthCheckers.get(contextName);
    previous?.dispose();
    this.#healthCheckers.delete(contextName);
  }

  private onStateChange(state: ContextHealthState): void {
    this.#onContextHealthStateChange.fire(state);
  }

  /* getHealthCheckersStates returns the current state of the health checkers */
  getHealthCheckersStates(): Map<string, ContextHealthState> {
    const result = new Map<string, ContextHealthState>();
    for (const [contextName, hc] of this.#healthCheckers.entries()) {
      result.set(contextName, hc.getState());
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
    this.#onContextHealthStateChange.dispose();
    this.#onContextDelete.dispose();
  }

  async refreshContextState(_contextName: string): Promise<void> {}

  // abortAllHealthChecks aborts all health checks and removes them from registry
  private disposeAllHealthChecks(): void {
    for (const [contextName, healthChecker] of this.#healthCheckers.entries()) {
      healthChecker.dispose();
      this.#healthCheckers.delete(contextName);
    }
  }
}
