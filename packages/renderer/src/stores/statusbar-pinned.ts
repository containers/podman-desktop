/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { PinOption } from '@desktop-framework/api/status-bar';
import { STATUS_BAR_PIN_CONSTANTS } from '@desktop-framework/api/status-bar';
import { type Writable, writable } from 'svelte/store';

import { EventStore } from './event-store';

const windowEvents = [STATUS_BAR_PIN_CONSTANTS.PIN_OPTIONS_UPDATE];
const windowListeners = ['system-ready'];

async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const statusBarPinned: Writable<Array<PinOption>> = writable([]);

// use helper here as window methods are initialized after the store in tests
const getStatusBarPinOptions = (): Promise<Array<PinOption>> => {
  return window.getStatusBarPinOptions();
};

const eventStore = new EventStore<Array<PinOption>>(
  'status bar pinned',
  statusBarPinned,
  checkForUpdate,
  windowEvents,
  windowListeners,
  getStatusBarPinOptions,
);
eventStore.setup();
