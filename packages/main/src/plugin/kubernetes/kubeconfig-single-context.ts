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

import type { Context } from '@kubernetes/client-node';
import { KubeConfig } from '@kubernetes/client-node';

/**
 * KubeConfigSingleContext represents a KubeConfig with a single Context
 * and its related information (user, cluster)
 * which is set as the current context for the KubeConfig
 */
export class KubeConfigSingleContext {
  #value: KubeConfig;
  #representation: string;

  constructor(kubeconfig: KubeConfig, kubeContext: Context) {
    this.#value = new KubeConfig();
    this.#value.loadFromOptions({
      contexts: [kubeContext],
      clusters: kubeconfig.clusters.filter(c => c.name === kubeContext.cluster),
      users: kubeconfig.users.filter(u => u.name === kubeContext.user),
      currentContext: kubeContext.name,
    });
    this.#representation = JSON.stringify(this.#value);
  }

  get(): KubeConfig {
    return this.#value;
  }

  equals(other: KubeConfigSingleContext | undefined): boolean {
    if (!other) {
      return false;
    }
    return other.#representation === this.#representation;
  }
}
