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

import type { Informer, KubernetesObject } from '@kubernetes/client-node';

import type {
  CheckingState,
  ContextGeneralState,
  ResourceName,
  SecondaryResourceName,
} from '/@api/kubernetes-contexts-states.js';
import { NO_CURRENT_CONTEXT_ERROR, secondaryResources } from '/@api/kubernetes-contexts-states.js';

import type { ApiSenderType } from '../api.js';
import { dispatchTimeout } from './contexts-constants.js';

// ContextInternalState stores informers for a kube context
export type ContextInternalState = Map<ResourceName, Informer<KubernetesObject>>;

// ContextState stores information for the user about a kube context: is the cluster reachable, the number
// of instances of different resources
export interface ContextState {
  checking: CheckingState;
  error?: string;
  reachable: boolean;
  resources: ContextStateResources;
}

export type ContextStateResources = {
  [resourceName in ResourceName]: KubernetesObject[];
};

type ResourcesDispatchOptions = {
  [resourceName in ResourceName]?: boolean;
};

export const dispatchAllResources: ResourcesDispatchOptions = {
  pods: true,
  deployments: true,
  services: true,
  nodes: true,
  persistentvolumeclaims: true,
  ingresses: true,
  routes: true,
  configmaps: true,
  secrets: true,
  // add new resources here when adding new informers
};

interface DispatchOptions {
  // do we send information about contexts connectivity checking?
  checkingState: boolean;
  // do we send general context for all contexts?
  contextsGeneralState: boolean;
  // do we send general context for current context?
  currentContextGeneralState: boolean;
  // current context name
  currentContext: string;
  // do we send resources data for each resource kind? default false for all resources
  resources: ResourcesDispatchOptions;
}

// Options when calling setStateAndDispatch
interface SetStateAndDispatchOptions {
  // true to send checking-state update event, false by default
  checkingState?: boolean;
  // true to send general-state update event, false by default
  sendGeneral?: boolean;
  // current context name
  currentContext: string;
  // resources for which to send a resource-specific update event
  resources?: ResourcesDispatchOptions;
  // the caller can modify the `previous` state in this function, which will be called before the state is dispatched
  update: (previous: ContextState) => void;
}

export function isSecondaryResourceName(value: string): value is SecondaryResourceName {
  return secondaryResources.includes(value as SecondaryResourceName);
}

/**
 * ContextsStates is responsible for sending through apiSender or retrieve the state of the different Kubernetes contexts.
 *
 * The caller can use:
 * - `setStateAndDispatch` to update the state of a specific context and dispatch it,
 * - `dispatch` to dispatch the current state of a specific context.
 *
 * Different events are sent, depending on the options passed to these methods:
 * - `kubernetes-contexts-checking-state-update`: A map containing a CheckingState value for each Kubernetes context
 * - `kubernetes-contexts-general-state-update`: A map containing a ContextGeneralState (checking state, connectivity error, is the context reachable, number of primary resources - pods and deployments)
 *   for each Kubernetes context
 * - `kubernetes-current-context-general-state-update`: the ContextGeneralState for the current context only
 * - `kubernetes-current-context-${resname}-update` (resname in pods, deployments, services, routes, etc): the details of the Kubernetes resources of a specific kind for the current context only
 *
 * Methods are available to get these information synchronously:
 * - `getContextsCheckingState`: data in event `kubernetes-contexts-checking-state-update`
 * - `getContextsGeneralState`: data in event `kubernetes-contexts-general-state-update`
 * - `getCurrentContextGeneralState`: data in event `kubernetes-current-context-general-state-update`
 * - `getContextResources`: data in event `kubernetes-current-context-${resname}-update`
 */
export class ContextsStatesRegistry {
  private state = new Map<string, ContextState>();

  private dispatchContextsGeneralStateTimer: NodeJS.Timeout | undefined;
  private dispatchCurrentContextGeneralStateTimer: NodeJS.Timeout | undefined;
  private dispatchCurrentContextResourceTimers = new Map<string, NodeJS.Timeout | undefined>();

  private disposed = false;

  constructor(private readonly apiSender: ApiSenderType) {}

  getContextsGeneralState(): Map<string, ContextGeneralState> {
    const result = new Map<string, ContextGeneralState>();
    this.state.forEach((val, key) => {
      result.set(key, {
        ...val,
        resources: {
          pods: val.reachable ? val.resources.pods.length : 0,
          deployments: val.reachable ? val.resources.deployments.length : 0,
        },
      });
    });
    return result;
  }

  getContextsCheckingState(): Map<string, CheckingState> {
    const result = new Map<string, CheckingState>();
    this.state.forEach((val, key) => {
      result.set(key, val.checking);
    });
    return result;
  }

  getCurrentContextGeneralState(current: string): ContextGeneralState {
    if (current) {
      const state = this.state.get(current);
      if (state) {
        return {
          ...state,
          resources: {
            pods: state.reachable ? state.resources.pods.length : 0,
            deployments: state.reachable ? state.resources.deployments.length : 0,
          },
        };
      }
    }
    return {
      reachable: false,
      error: NO_CURRENT_CONTEXT_ERROR,
      resources: { pods: 0, deployments: 0 },
    };
  }

  getContextResources(current: string, resourceName: ResourceName): KubernetesObject[] {
    if (current) {
      const state = this.state.get(current);
      if (!state?.reachable) {
        return [];
      }
      if (state) {
        return state.resources[resourceName];
      }
    }
    return [];
  }

  isReachable(contextName: string): boolean {
    return this.state.get(contextName)?.reachable ?? false;
  }

  setStateAndDispatch(name: string, options: SetStateAndDispatchOptions): void {
    this.safeSetState(name, options.update);
    this.dispatch({
      checkingState: options.checkingState ?? false,
      contextsGeneralState: options.sendGeneral ?? false,
      currentContextGeneralState: options.sendGeneral ?? false,
      currentContext: options.currentContext,
      resources: options.resources ?? {},
    });
  }

  safeSetState(name: string, update: (previous: ContextState) => void): void {
    if (!this.state.has(name)) {
      this.state.set(name, {
        checking: { state: 'waiting' },
        error: undefined,
        reachable: false,
        resources: {
          pods: [],
          deployments: [],
          nodes: [],
          persistentvolumeclaims: [],
          services: [],
          ingresses: [],
          routes: [],
          configmaps: [],
          secrets: [],
          // add new resources here when adding new informers
        },
      });
    }
    const val = this.state.get(name);
    if (!val) {
      throw new Error('value not correctly set in map');
    }
    update(val);
  }

  // dispatch using apiSender different information about the Kubernetes contexts
  dispatch(options: DispatchOptions): void {
    if (options.checkingState) {
      this.dispatchCheckingState(this.getContextsCheckingState());
    }
    if (options.contextsGeneralState) {
      this.dispatchGeneralState(this.getContextsGeneralState());
    }
    if (options.currentContextGeneralState) {
      this.dispatchCurrentContextGeneralState(this.getCurrentContextGeneralState(options.currentContext));
    }
    Object.keys(options.resources).forEach(res => {
      const resname = res as ResourceName;
      if (options.resources[resname]) {
        this.dispatchCurrentContextResource(resname, this.getContextResources(options.currentContext, resname));
      }
    });
  }

  public dispatchCheckingState(val: Map<string, CheckingState>): void {
    this.apiSender.send(`kubernetes-contexts-checking-state-update`, val);
  }

  public dispatchGeneralState(val: Map<string, ContextGeneralState>): void {
    this.dispatchContextsGeneralStateTimer = this.dispatchDebounce(
      `kubernetes-contexts-general-state-update`,
      val,
      this.dispatchContextsGeneralStateTimer,
      dispatchTimeout,
    );
  }

  public dispatchCurrentContextGeneralState(val: ContextGeneralState): void {
    this.dispatchCurrentContextGeneralStateTimer = this.dispatchDebounce(
      `kubernetes-current-context-general-state-update`,
      val,
      this.dispatchCurrentContextGeneralStateTimer,
      dispatchTimeout,
    );
  }

  public dispatchCurrentContextResource(resname: ResourceName, val: KubernetesObject[]): void {
    this.dispatchCurrentContextResourceTimers.set(
      resname,
      this.dispatchDebounce(
        `kubernetes-current-context-${resname}-update`,
        val,
        this.dispatchCurrentContextResourceTimers.get(resname),
        dispatchTimeout,
      ),
    );
  }

  private dispatchDebounce(
    eventName: string,
    value: Map<string, ContextGeneralState> | ContextGeneralState | KubernetesObject[] | Map<string, boolean>,
    timer: NodeJS.Timeout | undefined,
    timeout: number,
  ): NodeJS.Timeout | undefined {
    clearTimeout(timer);
    if (this.disposed) {
      return undefined;
    }
    return setTimeout(() => {
      this.apiSender.send(eventName, value);
    }, timeout);
  }

  dispose(): void {
    this.disposed = true;
    clearTimeout(this.dispatchContextsGeneralStateTimer);
    clearTimeout(this.dispatchCurrentContextGeneralStateTimer);
    for (const timer of this.dispatchCurrentContextResourceTimers.values()) {
      clearTimeout(timer);
    }
  }

  async deleteContextState(name: string): Promise<void> {
    this.state.delete(name);
  }

  async disposeSecondaryStates(contextName: string): Promise<void> {
    const states = this.state.get(contextName);
    if (states) {
      for (const resourceName of secondaryResources) {
        states.resources[resourceName] = [];
      }
    }
  }
}
