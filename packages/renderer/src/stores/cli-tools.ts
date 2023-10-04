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

import { writable, type Writable } from 'svelte/store';
import { EventStore } from './event-store';
import type { CliToolInfo } from '../../../main/src/plugin/api/cli-tool-info';

const windowEvents = ['extension-started', 'extension-stopped', 'extensions-started', 'cli-tool-create'];
const windowListeners = ['system-ready'];

export async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const cliToolInfos: Writable<CliToolInfo[]> = writable([]);

const eventStore = new EventStore<CliToolInfo[]>(
  'providers',
  cliToolInfos,
  checkForUpdate,
  windowEvents,
  windowListeners,
  fetchCliTools,
);
eventStore.setup();

export async function fetchCliTools(): Promise<CliToolInfo[]> {
  const result = await window.getCliToolInfos();
  cliToolInfos.set(result);
  return result;
}
