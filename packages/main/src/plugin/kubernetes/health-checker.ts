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

import type { KubeConfig } from '@kubernetes/client-node';
import { AbortError, Health } from '@kubernetes/client-node';

export interface CheckOptions {
  // timeout in ms
  timeout?: number;
}

type ReadinessCallback = (ready: boolean) => void;

// HealthChecker checks the readiness of a Kubernetes context
// by requesting the readiness endpoint of its server
export class HealthChecker {
  #kubeConfig: KubeConfig;
  #abortController: AbortController;
  #onReadinessCallback: ReadinessCallback = (_ready: boolean) => {};

  // builds an HealthChecker which will check the cluster of the current context of the given kubeConfig
  constructor(kubeConfig: KubeConfig) {
    this.#kubeConfig = kubeConfig;
    this.#abortController = new AbortController();
  }

  // start checking the readiness
  public async checkReadiness(opts?: CheckOptions): Promise<void> {
    const health = new Health(this.#kubeConfig);
    try {
      const result = await health.readyz({ signal: this.#abortController.signal, timeout: opts?.timeout });
      this.#onReadinessCallback(result);
    } catch (err: unknown) {
      if (err instanceof AbortError) {
        // do nothing
      } else {
        this.#onReadinessCallback(false);
      }
    }
  }

  public abort(): void {
    this.#abortController.abort();
  }

  // onReadiness sets the function to call when the checkReadiness has received a response
  // If called several times, the previous callback is overwritten
  public onReadiness(callback: ReadinessCallback): void {
    this.#onReadinessCallback = callback;
  }
}
