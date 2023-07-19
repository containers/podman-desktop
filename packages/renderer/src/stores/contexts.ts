/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { EventStore } from './event-store';
import { ContextUI } from '../lib/context/context';

const windowEvents = ['extension-stopped', 'extensions-started', 'extension-started'];
const windowListeners = ['extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}
export const contexts: Writable<ContextUI[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listContexts = async (): Promise<ContextUI[]> => {
  // retrieve all contexts saved on the server side
  const serverContexts = await window.listContexts();
  // as we cannot send an instance from main to renderer, we create a clone with the contextUI type so its functions can be invoked
  const adaptedContexts: ContextUI[] = [];
  serverContexts.forEach(ctx => {
    let parentCtx: ContextUI | null = null;
    if (ctx.parent) {
      parentCtx = adaptedContexts.find(adapted => adapted.id === ctx.parent.id);
    }
    const adaptedCtx = ContextUI.adaptContext(ctx, parentCtx);
    adaptedContexts.push(adaptedCtx);
  });
  return adaptedContexts;
};

export const contextsEventStore = new EventStore<ContextUI[]>(
  'contexts',
  contexts,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listContexts,
);
const contextsEventStoreInfo = contextsEventStore.setup();

export const fetchContexts = async () => {
  await contextsEventStoreInfo.fetch();
};

window.events?.receive('context-value-updated', async value => {
  contexts.update(contexts => {
    const context = contexts.find(ctx => ctx.extension === value.extension);
    if (context) {
      context.setValue(value.key, value.value);
    }
    return contexts;
  });
});

window.events?.receive('context-key-removed', async value => {
  contexts.update(contexts => {
    const context = contexts.find(ctx => ctx.extension === value.extension);
    if (context) {
      context.removeValue(value.key);
    }
    return contexts;
  });
});

window.events?.receive('context-value-updated', async value => {
  contexts.update(contexts => {
    const context = contexts.find(ctx => ctx.extension === value.extension);
    const parent = contexts.find(p => p.id === value.pid);
    if (context && parent) {
      context.updateParent(parent);
    }
    return contexts;
  });
});
