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

import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { SearchResultProvider } from '@desktop-framework/extension-api';
import { Container } from 'inversify';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { IPCHandle } from '/@/plugin/api.js';
import { Emitter } from '/@/plugin/events/emitter.js';

import {
  type SearchResultProviderRegistration,
  SearchResultProviderRegistry,
} from './search-result-provider-registry.js';

let apiSender: ApiSenderType;
let ipcHandle: IPCHandle;
let registry: SearchResultProviderRegistry;

beforeEach(() => {
  vi.resetAllMocks();
  apiSender = {
    send: vi.fn(),
    receive: vi.fn(),
  };
  ipcHandle = vi.fn();
  const container = new Container();
  container.bind<ApiSenderType>(ApiSenderType).toConstantValue(apiSender);
  container.bind<IPCHandle>(IPCHandle).toConstantValue(ipcHandle);
  container.bind(SearchResultProviderRegistry).toSelf();
  registry = container.get(SearchResultProviderRegistry);
});

function createMockProvider(items: { label: string; command: string }[] = []): SearchResultProvider {
  return {
    provideItems: vi.fn().mockResolvedValue(items),
  };
}

function register(
  provider: SearchResultProvider,
  overrides: Partial<SearchResultProviderRegistration> = {},
): ReturnType<SearchResultProviderRegistry['registerProvider']> {
  return registry.registerProvider(provider, {
    extensionId: 'ext1',
    label: 'Extension 1',
    ...overrides,
  });
}

describe('init', () => {
  test('registers a search handler that delegates valid queries', async () => {
    registry.init();
    const handler = vi.mocked(ipcHandle).mock.calls[0]?.[1];
    assert(handler);
    register(createMockProvider([{ label: 'Result', command: 'ext.open' }]));

    const results = await handler({} as never, 'query');

    expect(results).toEqual([
      {
        providerId: 'ext1-0',
        providerLabel: 'Extension 1',
        label: 'Result',
        command: 'ext.open',
        icon: undefined,
        args: undefined,
      },
    ]);
  });

  test('rejects a non-string query', async () => {
    registry.init();
    const handler = vi.mocked(ipcHandle).mock.calls[0]?.[1];
    assert(handler);

    await expect(handler({} as never, 42)).rejects.toThrowError('Invalid dynamic search query');
  });
});

describe('registerProvider', () => {
  test('disposal removes the provider', async () => {
    const disposable = register(createMockProvider([{ label: 'Result', command: 'ext.open' }]));

    disposable.dispose();

    await expect(registry.search('query')).resolves.toEqual([]);
  });

  test('subscribes to item changes and notifies the renderer', () => {
    const emitter = new Emitter<void>();
    register({
      provideItems: vi.fn().mockResolvedValue([]),
      onDidChangeItems: emitter.event,
    });

    emitter.fire();

    expect(apiSender.send).toHaveBeenCalledWith('navigation-search-provider-items-changed');
  });

  test('disposal removes the item-change subscription and notifies the renderer', () => {
    const emitter = new Emitter<void>();
    const disposable = register({
      provideItems: vi.fn().mockResolvedValue([]),
      onDidChangeItems: emitter.event,
    });

    disposable.dispose();
    expect(apiSender.send).toHaveBeenCalledWith('navigation-search-provider-items-changed');

    vi.mocked(apiSender.send).mockClear();
    emitter.fire();

    expect(apiSender.send).not.toHaveBeenCalled();
  });
});

describe('search', () => {
  test('aggregates results from multiple providers', async () => {
    register(createMockProvider([{ label: 'Pod A', command: 'k8s.open' }]), {
      extensionId: 'k8s',
      label: 'Kubernetes',
    });
    register(createMockProvider([{ label: 'Model X', command: 'ai.open' }]), {
      extensionId: 'ai',
      label: 'AI Lab',
    });

    await expect(registry.search('test')).resolves.toEqual([
      {
        providerId: 'k8s-0',
        providerLabel: 'Kubernetes',
        label: 'Pod A',
        command: 'k8s.open',
        icon: undefined,
        args: undefined,
      },
      {
        providerId: 'ai-1',
        providerLabel: 'AI Lab',
        label: 'Model X',
        command: 'ai.open',
        icon: undefined,
        args: undefined,
      },
    ]);
  });

  test('uses metadata label over extension label', async () => {
    register(createMockProvider([{ label: 'Item', command: 'cmd' }]), {
      metadata: { label: 'Custom Label' },
    });

    const results = await registry.search('Item');

    expect(results).toEqual([expect.objectContaining({ providerLabel: 'Custom Label' })]);
  });

  test('uses item icons and falls back to the extension icon', async () => {
    register(
      {
        provideItems: vi.fn().mockResolvedValue([
          { label: 'Fallback', command: 'cmd' },
          { label: 'Custom', command: 'cmd', icon: 'custom-icon' },
        ]),
      },
      { icon: 'extension-icon' },
    );

    const results = await registry.search('Item');

    expect(results.map(result => result.icon)).toEqual(['extension-icon', 'custom-icon']);
  });

  test('requests and enforces the maximum of 10 results', async () => {
    const provider: SearchResultProvider = {
      provideItems: vi
        .fn()
        .mockResolvedValue(Array.from({ length: 11 }, (_, index) => ({ label: `${index}`, command: 'cmd' }))),
    };
    register(provider);

    const results = await registry.search('test');

    expect(results).toHaveLength(10);
    expect(provider.provideItems).toHaveBeenCalledWith('test', { maxResults: 10 }, expect.anything());
  });

  test('cancels the previous search while its provider request is in flight', async () => {
    const tokens: { isCancellationRequested: boolean }[] = [];
    const resolvers: ((items: { label: string; command: string }[]) => void)[] = [];
    register({
      provideItems: vi.fn().mockImplementation(
        (_query, _options, token) =>
          new Promise(resolve => {
            tokens.push(token);
            resolvers.push(resolve);
          }),
      ),
    });

    const firstSearch = registry.search('first');
    const secondSearch = registry.search('second');
    const firstToken = tokens[0];
    assert(firstToken);
    expect(firstToken.isCancellationRequested).toBe(true);

    resolvers[0]?.([{ label: 'First', command: 'cmd' }]);
    resolvers[1]?.([{ label: 'Second', command: 'cmd' }]);

    await expect(firstSearch).resolves.toEqual([]);
    await expect(secondSearch).resolves.toEqual([expect.objectContaining({ label: 'Second' })]);
  });

  test('isolates provider errors', async () => {
    register({
      provideItems: vi.fn().mockRejectedValue(new Error('Provider failed')),
    });
    register(createMockProvider([{ label: 'Good', command: 'cmd' }]), {
      extensionId: 'good',
      label: 'Good',
    });

    const results = await registry.search('test');

    expect(results).toEqual([expect.objectContaining({ label: 'Good' })]);
  });

  test('discards results when a provider is disposed during an in-flight request', async () => {
    const pendingItems = Promise.withResolvers<{ label: string; command: string }[]>();
    const disposable = register({
      provideItems: vi.fn().mockReturnValue(pendingItems.promise),
    });

    const search = registry.search('test');
    disposable.dispose();
    pendingItems.resolve([{ label: 'Stale item', command: 'cmd' }]);

    await expect(search).resolves.toEqual([]);
  });

  test('passes command arguments through', async () => {
    register({
      provideItems: vi.fn().mockResolvedValue([{ label: 'Item', command: 'cmd', args: ['arg1', 42] }]),
    });

    const results = await registry.search('test');

    expect(results).toEqual([expect.objectContaining({ args: ['arg1', 42] })]);
  });
});
