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
import type { Disposable, Event } from '@podman-desktop/api';

import { Emitter } from '../events/emitter.js';

export interface CheckOptions {
  // timeout in ms
  timeout?: number;
}

// HealthChecker checks the readiness of a Kubernetes context
// by requesting the readiness endpoint of its server
export class HealthChecker implements Disposable {
  #health: Health;
  #abortController: AbortController;
  #onReadinessEmit = new Emitter<boolean>();

  onReadiness: Event<boolean> = this.#onReadinessEmit.event;

  // builds an HealthChecker which will check the cluster of the current context of the given kubeConfig
  constructor(kubeConfig: KubeConfig) {
    this.#abortController = new AbortController();
    this.#health = new Health(kubeConfig);
  }

  // start checking the readiness
  public async checkReadiness(opts?: CheckOptions): Promise<void> {
    try {
      const result = await this.#health.readyz({ signal: this.#abortController.signal, timeout: opts?.timeout });
      this.#onReadinessEmit.fire(result);
    } catch (err: unknown) {
      if (err instanceof AbortError) {
        // do nothing
      } else {
        this.#onReadinessEmit.fire(false);
      }
    }
  }

  public dispose(): void {
    this.#onReadinessEmit.dispose();
    this.#abortController.abort();
  }
}
