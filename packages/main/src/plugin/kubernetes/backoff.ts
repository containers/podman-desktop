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

export interface BackoffOptions {
  value: number;
  multiplier: number;
  max: number;
  jitter?: number;
}

export class Backoff {
  #value: number;
  readonly #initial: number;
  readonly #multiplier: number;
  readonly #max: number;
  readonly #jitter: number;

  constructor(options: BackoffOptions) {
    this.#initial = options.value;
    this.#value = options.value;
    this.#multiplier = options.multiplier;
    this.#max = options.max;
    this.#jitter = options.jitter ?? 0;
    this.#value += this.getJitter();
  }
  get(): number {
    const current = this.#value;
    if (this.#value < this.#max) {
      this.#value *= this.#multiplier;
      this.#value += this.getJitter();
    }
    return current;
  }
  reset(): void {
    this.#value = this.#initial + this.getJitter();
  }

  private getJitter(): number {
    // eslint-disable-next-line sonarjs/pseudo-random
    return Math.floor(this.#jitter * Math.random());
  }
}
