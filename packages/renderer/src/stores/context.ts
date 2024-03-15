/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

import { ContextUI } from '../lib/context/context';

export const context: Writable<ContextUI> = setup();

export function setup(): Writable<ContextUI> {
  const store = writable(new ContextUI());

  window.events?.receive('context-value-updated', (value: unknown) => {
    const typedValue = value as { key: string; value: string };
    store.update(ctx => {
      ctx.setValue(typedValue.key, typedValue.value);
      return ctx;
    });
  });

  window.events?.receive('context-key-removed', (value: unknown) => {
    const typedValue = value as { key: string; value: string };
    store.update(ctx => {
      ctx.removeValue(typedValue.key);
      return ctx;
    });
  });

  window.addEventListener('extensions-already-started', () => {
    // this function can be undefined during tests
    window
      .contextCollectAllValues?.()
      .then(values => {
        const currentContext = Object.entries(values).reduce((result, [key, value]) => {
          result.setValue(key, value);
          return result;
        }, new ContextUI());
        store.set(currentContext);
      })
      .catch((err: unknown) => console.error('error getting current context', err));
  });
  return store;
}
