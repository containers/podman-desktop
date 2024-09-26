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

export function isSecondaryResourceName(value: string): value is SecondaryResourceName {
  return secondaryResources.includes(value as SecondaryResourceName);
}

export class ContextsStates {
  private state = new Map<string, ContextState>();

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

  async dispose(name: string): Promise<void> {
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
