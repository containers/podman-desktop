/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { IDisposable, SearchResultItemInfo } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type {
  SearchResultItem,
  SearchResultProvider,
  SearchResultProviderMetadata,
} from '@desktop-framework/extension-api';
import { inject, injectable } from 'inversify';

import { IPCHandle } from '/@/plugin/api.js';
import { CancellationTokenSource } from '/@/plugin/cancellation-token.js';
import { Disposable } from '/@/plugin/types/disposable.js';

interface SearchResultProviderEntry {
  label: string;
  extensionIcon?: SearchResultItem['icon'];
  provider: SearchResultProvider;
}

export interface SearchResultProviderRegistration {
  extensionId: string;
  label: string;
  icon?: SearchResultItem['icon'];
  metadata?: SearchResultProviderMetadata;
}

const MAX_SEARCH_RESULTS = 10;

@injectable()
export class SearchResultProviderRegistry {
  #providers = new Map<string, SearchResultProviderEntry>();
  #currentTokenSource: CancellationTokenSource | undefined;
  #nextId = 0;

  @inject(ApiSenderType)
  private apiSender!: ApiSenderType;

  @inject(IPCHandle)
  private ipcHandle!: IPCHandle;

  init(): void {
    this.ipcHandle('navigation:searchDynamicProviders', async (_listener, query: string) => {
      if (typeof query !== 'string') {
        throw new TypeError('Invalid dynamic search query');
      }
      return this.search(query);
    });
  }

  registerProvider(provider: SearchResultProvider, registration: SearchResultProviderRegistration): Disposable {
    const id = `${registration.extensionId}-${this.#nextId++}`;
    const label = registration.metadata?.label ?? registration.label;

    let changeDisposable: IDisposable | undefined;
    if (provider.onDidChangeItems) {
      changeDisposable = provider.onDidChangeItems(() => {
        this.apiSender.send('navigation-search-provider-items-changed');
      });
    }

    this.#providers.set(id, { label, extensionIcon: registration.icon, provider });

    return Disposable.create(() => {
      const deleted = this.#providers.delete(id);
      changeDisposable?.dispose();
      if (deleted) {
        this.apiSender.send('navigation-search-provider-items-changed');
      }
    });
  }

  async search(query: string): Promise<SearchResultItemInfo[]> {
    if (this.#currentTokenSource) {
      this.#currentTokenSource.cancel();
      this.#currentTokenSource.dispose();
    }
    this.#currentTokenSource = new CancellationTokenSource();
    const token = this.#currentTokenSource.token;

    const promises = Array.from(this.#providers.entries()).map(async ([providerId, entry]) => {
      try {
        const items = await entry.provider.provideItems(query, { maxResults: MAX_SEARCH_RESULTS }, token);
        if (token.isCancellationRequested || this.#providers.get(providerId) !== entry) return [];
        return (items ?? []).slice(0, MAX_SEARCH_RESULTS).map(item => ({
          providerId,
          label: item.label,
          icon: item.icon ?? entry.extensionIcon,
          command: item.command,
          args: item.args,
          providerLabel: entry.label,
        }));
      } catch (err: unknown) {
        if (!token.isCancellationRequested) {
          console.error(`[search-result-provider] Error from provider ${providerId}:`, err);
        }
        return [];
      }
    });

    const allResults = await Promise.all(promises);
    if (token.isCancellationRequested) {
      return [];
    }

    return allResults.flat();
  }
}
