/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { V1Node } from '@kubernetes/client-node';

import type { NodeUI } from './NodeUI';

export class NodeUtils {
  getNodeUI(node: V1Node): NodeUI {
    const conditions = node.status?.conditions ?? [];

    // Default to 'STOPPED' status, and update to 'RUNNING' or 'DEGRADED' if the 'Ready' condition is present
    let status = 'STOPPED';
    const readyCondition = conditions.find(cond => cond.type === 'Ready');
    if (readyCondition) {
      status = readyCondition.status === 'True' ? 'RUNNING' : 'DEGRADED';
    }

    // Correct Kubernetes terminology is that it is always either "control plane" or "node"
    // however, we will check below for legacy labels that may be present on older clusters.

    // Determine the role of the node
    const roleLabels = node.metadata?.labels ?? {};
    let role: 'control-plane' | 'node' = 'node'; // default to node if no role-specific labels are detected

    // Use the currently suggested role labels to determine the role of the node
    if ('node-role.kubernetes.io/control-plane' in roleLabels || 'node-role.kubernetes.io/master' in roleLabels) {
      role = 'control-plane';
    }

    // kubernetes.io/role is a legacy label that may be present on older clusters, we first check for the label and then determine if it's applicable or not.
    if ('kubernetes.io/role' in roleLabels) {
      const nodeRole = roleLabels['kubernetes.io/role'];
      if (nodeRole === 'master' || nodeRole === 'control-plane') {
        role = 'control-plane';
      } else if (nodeRole === 'node' || nodeRole === 'worker') {
        role = 'node';
      }
    }

    const created = node.metadata?.creationTimestamp;
    const version = node.status?.nodeInfo?.kubeletVersion ?? '';
    const osImage = node.status?.nodeInfo?.osImage ?? '';
    const kernelVersion = node.status?.nodeInfo?.kernelVersion ?? '';
    const containerRuntime = node.status?.nodeInfo?.containerRuntimeVersion ?? '';

    return {
      name: node.metadata?.name ?? '',
      status,
      role,
      created,
      version,
      osImage,
      kernelVersion,
      containerRuntime,
    };
  }
}
