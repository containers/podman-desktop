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

import { Health } from '@kubernetes/client-node';
import type { Disposable } from '@podman-desktop/api';

import type { Event } from '../events/emitter.js';
import { Emitter } from '../events/emitter.js';
import type { KubeConfigSingleContext } from './kubeconfig-single-context.js';

export interface ContextHealthState {
  kubeConfig: KubeConfigSingleContext;
  contextName: string;
  checking: boolean;
  reachable: boolean;
}

export interface ContextHealthCheckOptions {
  // timeout in ms
  timeout?: number;
}

// HealthChecker checks the readiness of a Kubernetes context
// by requesting the readiness endpoint of its server
export class ContextHealthChecker implements Disposable {
  #health: Health;
  #abortController: AbortController;

  #onStateChange = new Emitter<ContextHealthState>();
  onStateChange: Event<ContextHealthState> = this.#onStateChange.event;

  #onReachable = new Emitter<ContextHealthState>();
  onReachable: Event<ContextHealthState> = this.#onReachable.event;

  #contextName: string;
  #kubeConfig: KubeConfigSingleContext;

  #currentState: ContextHealthState;

  // builds an HealthChecker which will check the cluster of the current context of the given kubeConfig
  constructor(kubeConfig: KubeConfigSingleContext) {
    this.#kubeConfig = kubeConfig;
    this.#abortController = new AbortController();
    this.#health = new Health(kubeConfig.getKubeConfig());
    this.#contextName = kubeConfig.getKubeConfig().currentContext;
    this.#currentState = {
      kubeConfig: this.#kubeConfig,
      contextName: this.#contextName,
      checking: false,
      reachable: false,
    };
    this.onStateChange((e: ContextHealthState) => {
      if (e.reachable) {
        this.#onReachable.fire(e);
      }
    });
  }

  // start checking the readiness
  public async start(opts?: ContextHealthCheckOptions): Promise<void> {
    this.#currentState = {
      kubeConfig: this.#kubeConfig,
      contextName: this.#contextName,
      checking: true,
      reachable: false,
    };
    this.#onStateChange.fire(this.#currentState);
    try {
      const result = await this.#health.readyz({ signal: this.#abortController.signal, timeout: opts?.timeout });
      this.#currentState = {
        kubeConfig: this.#kubeConfig,
        contextName: this.#contextName,
        checking: false,
        reachable: result,
      };
      this.#onStateChange.fire(this.#currentState);
    } catch (err: unknown) {
      if (!this.isAbortError(err)) {
        this.#currentState = {
          kubeConfig: this.#kubeConfig,
          contextName: this.#contextName,
          checking: false,
          reachable: false,
        };
        this.#onStateChange.fire(this.#currentState);
      }
    }
  }

  public dispose(): void {
    this.#onStateChange.dispose();
    this.#onReachable.dispose();
    this.#abortController.abort();
  }

  public getState(): ContextHealthState {
    return this.#currentState;
  }

  private isAbortError(err: unknown): boolean {
    return err instanceof Error && err.name === 'AbortError';
  }
}
