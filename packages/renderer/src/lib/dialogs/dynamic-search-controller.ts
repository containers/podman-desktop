/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { IDisposable, SearchResultItemInfo } from '@desktop-framework/api';

const SEARCH_DEBOUNCE_MS = 200;

export interface DynamicSearchControllerOptions {
  search(query: string): Promise<SearchResultItemInfo[]>;
  subscribe(listener: () => void): IDisposable;
  onResults(query: string, results: SearchResultItemInfo[]): void;
  onError(error: unknown): void;
}

export class DynamicSearchController {
  #searchDebounceTimer: number | undefined;
  #requestId = 0;
  #active = false;
  #query = '';
  #subscription: IDisposable | undefined;

  constructor(private readonly options: DynamicSearchControllerOptions) {}

  start(): void {
    this.#subscription = this.options.subscribe(() => {
      this.refresh();
    });
  }

  update(active: boolean, query: string): void {
    const normalizedQuery = query.trim();
    if (active === this.#active && normalizedQuery === this.#query) {
      return;
    }

    this.#active = active;
    this.#query = normalizedQuery;
    this.#cancelPendingSearch();

    if (this.#active && this.#query) {
      this.#scheduleSearch();
    }
  }

  refresh(): void {
    if (!this.#active || !this.#query) {
      return;
    }

    this.#cancelPendingSearch();
    this.#scheduleSearch();
  }

  dispose(): void {
    this.#cancelPendingSearch();
    this.#subscription?.dispose();
    this.#subscription = undefined;
  }

  #cancelPendingSearch(): void {
    if (this.#searchDebounceTimer !== undefined) {
      window.clearTimeout(this.#searchDebounceTimer);
      this.#searchDebounceTimer = undefined;
    }
    this.#requestId++;
  }

  #scheduleSearch(): void {
    const requestId = this.#requestId;
    const query = this.#query;
    this.#searchDebounceTimer = window.setTimeout(() => {
      this.#searchDebounceTimer = undefined;
      this.#search(query, requestId).catch((error: unknown): void => {
        this.options.onError(error);
      });
    }, SEARCH_DEBOUNCE_MS);
  }

  async #search(query: string, requestId: number): Promise<void> {
    try {
      const results = await this.options.search(query);
      if (this.#isCurrent(query, requestId)) {
        this.options.onResults(query, results);
      }
    } catch (error: unknown) {
      if (this.#isCurrent(query, requestId)) {
        this.options.onResults(query, []);
        this.options.onError(error);
      }
    }
  }

  #isCurrent(query: string, requestId: number): boolean {
    return requestId === this.#requestId && this.#active && query === this.#query;
  }
}
