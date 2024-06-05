/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { V1Deployment } from '@kubernetes/client-node';

import type { DeploymentUI } from './DeploymentUI';

export class DeploymentUtils {
  getDeploymentUI(deployment: V1Deployment): DeploymentUI {
    // Conditions (retrieving and sorting)
    const conditions = (deployment.status?.conditions ?? []).map(c => {
      return { type: c.type, message: c.message, reason: c.reason };
    });

    // Sort the conditions by type so that they are always in the same order
    conditions.sort((a, b) => a.type.localeCompare(b.type));

    // Status
    let status = 'STOPPED';
    if (deployment.status?.readyReplicas && deployment.status?.readyReplicas > 0) {
      if (deployment.status?.replicas === deployment.status?.readyReplicas) {
        status = 'RUNNING';
      } else {
        status = 'DEGRADED';
      }
    }

    return {
      name: deployment.metadata?.name ?? '',
      status: status,
      namespace: deployment.metadata?.namespace ?? '',
      created: deployment.metadata?.creationTimestamp,
      // number of replicas
      replicas: deployment.status?.replicas ?? 0,
      // ready pods
      ready: deployment.status?.readyReplicas ?? 0,
      selected: false,
      conditions: conditions,
    };
  }
}
