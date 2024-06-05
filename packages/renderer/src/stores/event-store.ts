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

import humanizeDuration from 'humanize-duration';
// eslint-disable-next-line import/no-duplicates
import type { ComponentType } from 'svelte';
// eslint-disable-next-line import/no-duplicates
import type { Writable } from 'svelte/store';

import DesktopIcon from '../lib/images/DesktopIcon.svelte';
import { addStore, updateStore } from './event-store-manager';

// 1.5 SECOND for DEBOUNCE and 5s for THROTTLE
const SECOND = 1000;
const DEFAULT_DEBOUNCE_TIMEOUT = 1.5 * SECOND;
const DEFAULT_THROTTLE_TIMEOUT = 5 * SECOND;

interface EventStoreInfoEvent {
  name: string;

  // args of the event
  args: unknown[];

  date: number;
  // if the event was skipped
  skipped: boolean;
  length?: number;

  // update time in ms
  humanDuration?: number;
}

export interface EventStoreInfo {
  name: string;

  iconComponent?: ComponentType;

  // list last 100 events
  bufferEvents: EventStoreInfoEvent[];

  // number of elements in the store
  size: number;

  // clear all
  clearEvents(): void;

  // force a fetch of the data to update the store
  fetch(...args: unknown[]): Promise<void>;
}

// Helper to manage store updated from events

export class EventStore<T> {
  // debounce delay in ms. If set to > 0 , timeout before updating store value
  // if there are always new requests, it will never update the store
  // as we postpone the update until there is no new request
  private debounceTimeoutDelay = 0;

  // debounce always delay in ms. If set to > 0 , update after this delay even if some requests are pending.
  private debounceThrottleTimeoutDelay = 0;

  constructor(
    private name: string,

    // The store to actually update / return the data
    private store: Writable<T>,

    // This is the "check" function that will be called to check if we need to update the store
    // this is good for checking to see if all extensions have started or waiting for a specific event
    // to occur before proceeding
    private checkForUpdate: (eventName: string, args?: unknown[]) => Promise<boolean>,

    // The list of window events and listeners to listen for to trigger an update, for example:
    // Window event: 'extension-started'
    // Window listener: 'extensions-already-started''
    private windowEvents: string[],
    private windowListeners: string[],

    // The main "updater" function that will be called to update the store.
    // For example, you can pass in a custom function such as "grabAllPods"
    // or a function with parameters such as "fetchPodsForNamespace(namespace: string)"
    // or even a simple window call such as "window.listPods()"
    // Whatever is returned from the "updater" function will be set to the writeable store above.
    private updater: (...args: unknown[]) => Promise<T>,

    // Optional icon component to display in the UI
    private iconComponent?: ComponentType,
  ) {
    if (!iconComponent) {
      this.iconComponent = DesktopIcon;
    }
  }

  protected updateEvent(eventStoreInfo: EventStoreInfo, event: EventStoreInfoEvent): void {
    // update the info object
    eventStoreInfo.bufferEvents.push(event);
    if (eventStoreInfo.bufferEvents.length > 100) {
      eventStoreInfo.bufferEvents.shift();
    }
    updateStore(eventStoreInfo);
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
        const customArgs = [];
        if (args) {
          if (Array.isArray(args)) {
            customArgs.push(...args);
          } else {
            customArgs.push(args);
          }
        }
        const result = await this.updater(...customArgs);
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
      this.updateEvent(eventStoreInfo, {
        name: eventName,
        args: args ?? [],
        date: Date.now(),
        skipped: !needUpdate,
        length: numberOfResults,
        humanDuration: updateDuration,
      });
    }
  }

  setupWithDebounce(
    debounceTimeoutDelay = DEFAULT_DEBOUNCE_TIMEOUT,
    debounceThrottleTimeoutDelay = DEFAULT_THROTTLE_TIMEOUT,
  ): EventStoreInfo {
    this.debounceTimeoutDelay = debounceTimeoutDelay;
    this.debounceThrottleTimeoutDelay = debounceThrottleTimeoutDelay;
    return this.setup();
  }

  setup(): EventStoreInfo {
    const bufferEvents: EventStoreInfoEvent[] = [];

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
      fetch: async (...args: unknown[]) => {
        await this.performUpdate(true, eventStoreInfo, 'manual', args);
        updateStore(eventStoreInfo);
      },
    };
    addStore(eventStoreInfo);

    // for debounce
    let timeout: NodeJS.Timeout | undefined;

    // for throttling every 5s if not already done
    let timeoutThrottle: NodeJS.Timeout | undefined;

    const update = async (eventName: string, args?: unknown[]): Promise<void> => {
      const needUpdate = await this.checkForUpdate(eventName, args);

      // method that do the update
      const doUpdate = async (): Promise<void> => {
        await this.performUpdate(needUpdate, eventStoreInfo, eventName, args);
      };

      // no debounce, just do it
      if (this.debounceTimeoutDelay <= 0) {
        await doUpdate();
        return;
      }

      // debounce timeout. If there is a pending action, cancel it and wait longer
      if (timeout) {
        clearTimeout(timeout);

        this.updateEvent(eventStoreInfo, {
          name: `debounce-${eventName}`,
          args: args ?? [],
          date: Date.now(),
          skipped: true,
          length: 0,
          humanDuration: 0,
        });

        timeout = undefined;
      }
      timeout = setTimeout(() => {
        // cancel the throttleTimeout if any
        if (timeoutThrottle) {
          clearTimeout(timeoutThrottle);
          timeoutThrottle = undefined;
        }

        doUpdate()
          .catch((error: unknown) => {
            console.error(`Failed to update ${this.name}`, error);
          })
          .finally(() => {
            timeout = undefined;
          });
      }, this.debounceTimeoutDelay);

      // throttle timeout, ask after 5s to update anyway to have at least UI being refreshed every 5s if there is a lot of events
      // because debounce will defer all the events until the end so it's not so nice from UI side.
      if (!timeoutThrottle && this.debounceThrottleTimeoutDelay > 0) {
        timeoutThrottle = setTimeout(() => {
          doUpdate()
            .catch((error: unknown) => {
              console.error(`Failed to update ${this.name}`, error);
            })
            .finally(() => {
              clearTimeout(timeoutThrottle);
              timeoutThrottle = undefined;
            });
        }, this.debounceThrottleTimeoutDelay);
      }
    };

    this.windowEvents.forEach(eventName => {
      window.events?.receive(eventName, (args?: unknown) => {
        update(eventName, args as unknown[]).catch((error: unknown) => {
          console.error(`Failed to update ${this.name}`, error);
        });
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
