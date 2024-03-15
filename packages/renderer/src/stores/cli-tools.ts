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

import { type Writable, writable } from 'svelte/store';

import type { CliToolInfo } from '../../../main/src/plugin/api/cli-tool-info';
import { EventStore } from './event-store';

const windowEvents: string[] = ['extensions-started', 'cli-tool-create', 'cli-tool-remove', 'cli-tool-change'];
const windowListeners = ['system-ready', 'extensions-already-started'];

let extensionsStarted = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  // trigger update after all extensions started
  if (eventName === 'extensions-already-started') {
    return (extensionsStarted = true);
  }

  // ignore individual tools created from extension activation methods until
  // all extensions are activated and they can be requested all in one call
  return (
    extensionsStarted &&
    (eventName === 'cli-tool-create' || eventName === 'cli-tool-remove' || eventName === 'cli-tool-change')
  );
}

export const cliToolInfos: Writable<CliToolInfo[]> = writable([]);

const eventStore = new EventStore<CliToolInfo[]>(
  'cli tools',
  cliToolInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  window.getCliToolInfos,
);
eventStore.setup();
