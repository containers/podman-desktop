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
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { DynamicSearchController } from './dynamic-search-controller';

const RESULT: SearchResultItemInfo = {
  providerId: 'provider-1',
  providerLabel: 'Provider',
  label: 'Result',
  command: 'provider.open',
};

describe('DynamicSearchController', () => {
  let search: ReturnType<typeof vi.fn<(query: string) => Promise<SearchResultItemInfo[]>>>;
  let listener: (() => void) | undefined;
  let subscription: IDisposable;
  let onResults: ReturnType<typeof vi.fn<(query: string, results: SearchResultItemInfo[]) => void>>;
  let onError: ReturnType<typeof vi.fn<(error: unknown) => void>>;
  let controller: DynamicSearchController;

  beforeEach(() => {
    vi.useFakeTimers();
    search = vi.fn<(query: string) => Promise<SearchResultItemInfo[]>>().mockResolvedValue([RESULT]);
    subscription = { dispose: vi.fn() };
    onResults = vi.fn<(query: string, results: SearchResultItemInfo[]) => void>();
    onError = vi.fn<(error: unknown) => void>();
    controller = new DynamicSearchController({
      search,
      subscribe: (callback): IDisposable => {
        listener = callback;
        return subscription;
      },
      onResults,
      onError,
    });
    controller.start();
  });

  afterEach(() => {
    controller.dispose();
    vi.useRealTimers();
  });

  test('debounces searches and publishes their results', async () => {
    controller.update(true, 'first');
    controller.update(true, 'second');

    await vi.advanceTimersByTimeAsync(199);
    expect(search).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(search).toHaveBeenCalledExactlyOnceWith('second');
    expect(onResults).toHaveBeenCalledWith('second', [RESULT]);
  });

  test('cancels a queued search when it becomes inactive', async () => {
    controller.update(true, 'query');
    controller.update(false, 'query');

    await vi.advanceTimersByTimeAsync(200);

    expect(search).not.toHaveBeenCalled();
  });

  test('coalesces provider change events', async () => {
    controller.update(true, 'query');
    await vi.advanceTimersByTimeAsync(200);
    search.mockClear();

    listener?.();
    listener?.();
    listener?.();
    await vi.advanceTimersByTimeAsync(200);

    expect(search).toHaveBeenCalledExactlyOnceWith('query');
  });

  test('ignores stale responses', async () => {
    const firstResponse = Promise.withResolvers<SearchResultItemInfo[]>();
    search.mockReturnValueOnce(firstResponse.promise).mockResolvedValueOnce([RESULT]);

    controller.update(true, 'first');
    await vi.advanceTimersByTimeAsync(200);
    controller.update(true, 'second');
    await vi.advanceTimersByTimeAsync(200);
    firstResponse.resolve([{ ...RESULT, label: 'Stale' }]);
    await Promise.resolve();

    expect(onResults).toHaveBeenCalledExactlyOnceWith('second', [RESULT]);
  });

  test('clears current results and reports search failures', async () => {
    const error = new Error('Search failed');
    search.mockRejectedValue(error);

    controller.update(true, 'query');
    await vi.advanceTimersByTimeAsync(200);

    expect(onResults).toHaveBeenCalledWith('query', []);
    expect(onError).toHaveBeenCalledWith(error);
  });

  test('disposes its event subscription', () => {
    controller.dispose();

    expect(subscription.dispose).toHaveBeenCalledOnce();
  });
});
