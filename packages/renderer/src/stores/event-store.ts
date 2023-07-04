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

// eslint-disable-next-line import/no-duplicates
import type { Writable } from 'svelte/store';
// eslint-disable-next-line import/no-duplicates
import type { ComponentType } from 'svelte';

import { addStore, updateStore } from './event-store-manager';
import humanizeDuration from 'humanize-duration';
import DesktopIcon from '../lib/images/DesktopIcon.svelte';

export interface EventStoreInfo {
  name: string;

  iconComponent?: ComponentType;

  // list last 100 events
  bufferEvents: {
    name: string;

    // args of the event
    args: unknown[];

    date: number;
    // if the event was skipped
    skipped: boolean;
    length?: number;

    // update time in ms
    humanDuration?: number;
  }[];

  // number of elements in the store
  size: number;

  // clear all
  clearEvents(): void;

  // force a fetch of the data to update the store
  fetch(): Promise<void>;
}

// Helper to manage store updated from events

export class EventStore<T> {
  constructor(
    private name: string,
    private store: Writable<T>,
    private checkForUpdate: (eventName: string, args?: unknown[]) => Promise<boolean>,
    private windowEvents: string[],
    private windowListeners: string[],
    private updater: () => Promise<T>,
    private iconComponent?: ComponentType,
  ) {
    if (!iconComponent) {
      this.iconComponent = DesktopIcon;
    }
  }

  protected async performUpdate(
    needUpdate: boolean,
    eventStoreInfo: EventStoreInfo,
    eventName: string,
    args?: unknown[],
  ): Promise<void> {
    // not intialized yet
    if (!this.updater) {
      return;
    }

    let numberOfResults;
    let updateDuration;
    try {
      if (needUpdate) {
        const before = performance.now();
        const result = await this.updater();
        const after = performance.now();
        numberOfResults = Array.isArray(result) ? result.length : 0;
        updateDuration = humanizeDuration(after - before, { units: ['s', 'ms'], round: true, largest: 1 });
        // update the store
        if (Array.isArray(result)) {
          eventStoreInfo.size = (result as Array<unknown>).length;
        }
        this.store.set(result);
      }
    } finally {
      // update the info object
      eventStoreInfo.bufferEvents.push({
        name: eventName,
        args: args,
        date: Date.now(),
        skipped: !needUpdate,
        length: numberOfResults,
        humanDuration: updateDuration,
      });
      if (eventStoreInfo.bufferEvents.length > 100) {
        eventStoreInfo.bufferEvents.shift();
      }
      updateStore(eventStoreInfo);
    }
  }

  setup(): EventStoreInfo {
    const bufferEvents = [];

    // register the store in the global list
    const eventStoreInfo: EventStoreInfo = {
      name: this.name,
      bufferEvents,
      iconComponent: this.iconComponent,
      size: 0,
      clearEvents: () => {
        bufferEvents.length = 0;
        updateStore(eventStoreInfo);
      },
      fetch: async () => {
        await this.performUpdate(true, eventStoreInfo, 'manual');
        updateStore(eventStoreInfo);
      },
    };
    addStore(eventStoreInfo);

    const update = async (eventName: string, args?: unknown[]) => {
      const needUpdate = await this.checkForUpdate(eventName, args);
      await this.performUpdate(needUpdate, eventStoreInfo, eventName, args);
    };
    this.windowEvents.forEach(eventName => {
      window.events?.receive(eventName, async (args?: unknown[]) => {
        await update(eventName, args);
      });
    });

    this.windowListeners.forEach(eventName => {
      window.addEventListener(eventName, () => {
        update(eventName).catch((error: unknown) => {
          console.error(`Failed to update ${this.name}`, error);
        });
      });
    });
    return eventStoreInfo;
  }
}
