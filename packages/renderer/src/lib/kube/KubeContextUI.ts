/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import type { Cluster, Context } from '@kubernetes/client-node';
import { kubernetesIconBase64 } from './KubeIcon';

export interface KubeContextClusterUI {
  name: string;
  server: string;
  skipTLSVerify?: boolean;
  tlsServerName?: string;
}

export interface KubeConnectionInfo {
  online: boolean; // Checks if the cluster is online via checkConnection
}

export interface KubeContextUI {
  name: string;
  cluster: string;
  user: string;
  clusterInfo?: KubeContextClusterUI;
  icon?: string;
  // error to display in case of deletion (or other operation) error
  error?: string;
}

// Function that takes in the clusters and contexts and returns the KubeContextUI
// for the UI to use.
// If the cluster is not found, the clusterInfo will be undefined.
export function getKubeUIContexts(contexts: Context[], clusters: Cluster[]): KubeContextUI[] {
  const kubeContexts: KubeContextUI[] = [];

  // Go through each context
  contexts.forEach(context => {
    // Try and find the cluster
    const cluster = clusters.find(c => c.name === context.cluster);

    // If the cluster is not found, just return undefined for clusterInfo
    // as sometimes in the context we have information, but nothing about
    // the cluster.
    kubeContexts.push({
      name: context.name,
      cluster: context.cluster,
      user: context.user,
      icon: kubernetesIconBase64,
      clusterInfo: cluster
        ? {
            name: cluster.name,
            server: cluster.server,
            skipTLSVerify: cluster.skipTLSVerify,
            tlsServerName: cluster.tlsServerName,
          }
        : undefined,
    });
  });
  return kubeContexts;
}

export function setKubeUIContextError(contexts: Context[], contextName: string, error: Error): Context[] {
  return contexts.map(ctx => {
    if (ctx.name === contextName) {
      return { ...ctx, error: String(error) };
    } else {
      return ctx;
    }
  });
}

export function clearKubeUIContextErrors(contexts: Context[]): Context[] {
  return contexts.map(ctx => ({ ...ctx, error: undefined }));
}
