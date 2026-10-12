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

import { describe, expect, test } from 'vitest';

import { DoNothingMode, ProviderInitializationContexts } from './ProviderInitUtils';

describe('ProviderInitializationContexts', () => {
  test('creates a context with DoNothingMode for a provider', () => {
    const contexts = new ProviderInitializationContexts();

    expect(contexts.get('provider-1')).toEqual({ mode: DoNothingMode });
  });

  test('returns the same mutable context for repeated lookups of a provider', () => {
    const contexts = new ProviderInitializationContexts();

    const context = contexts.get('provider-1');
    context.error = 'initialization failed';

    expect(contexts.get('provider-1')).toBe(context);
    expect(contexts.get('provider-1').error).toBe('initialization failed');
  });

  test('keeps contexts for different providers independent', () => {
    const contexts = new ProviderInitializationContexts();

    const firstContext = contexts.get('provider-1');
    const secondContext = contexts.get('provider-2');
    firstContext.error = 'initialization failed';

    expect(firstContext).not.toBe(secondContext);
    expect(secondContext).toEqual({ mode: DoNothingMode });
  });

  test('keeps contexts isolated between cache instances', () => {
    const firstContexts = new ProviderInitializationContexts();
    const secondContexts = new ProviderInitializationContexts();

    expect(firstContexts.get('provider-1')).not.toBe(secondContexts.get('provider-1'));
  });
});
