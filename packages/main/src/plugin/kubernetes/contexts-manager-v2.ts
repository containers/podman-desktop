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

export class ContextsManagerV2 {
  async update(_kubeconfig: KubeConfig): Promise<void> {}

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

  dispose(): void {}

  async refreshContextState(_contextName: string): Promise<void> {}
}
