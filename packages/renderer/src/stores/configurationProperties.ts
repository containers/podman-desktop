/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import type {
  IConfigurationChangeEvent,
  IConfigurationPropertyRecordedSchema,
} from '../../../main/src/plugin/configuration-registry';
import { EventStore } from './event-store';

const windowEvents = ['extensions-started', 'extension-started', 'extension-stopped', 'configuration-changed'];
const windowListeners = ['system-ready', 'extensions-already-started'];

export async function checkForUpdate(): Promise<boolean> {
  return true;
}

export const configurationProperties: Writable<IConfigurationPropertyRecordedSchema[]> = writable([]);

const eventStore = new EventStore<IConfigurationPropertyRecordedSchema[]>(
  'config',
  configurationProperties,
  checkForUpdate,
  windowEvents,
  windowListeners,
  fetchConfigurationProperties,
);
eventStore.setup();

export async function fetchConfigurationProperties(): Promise<IConfigurationPropertyRecordedSchema[]> {
  const result: Record<string, IConfigurationPropertyRecordedSchema> = await window.getConfigurationProperties();
  const properties: IConfigurationPropertyRecordedSchema[] = [];
  for (const key in result) {
    properties.push(result[key]);
  }
  return properties;
}

class ConfigurationChange extends EventTarget {}
export const onDidChangeConfiguration = new ConfigurationChange();

class ConfigurationChangeEvent extends CustomEvent<IConfigurationChangeEvent> {
  constructor(detail: IConfigurationChangeEvent) {
    // use the key of the configuration as event name
    super(detail.key, { detail });
  }
}

export function setupConfigurationChange() {
  // be notified when a specific property is being changed
  window.events?.receive('onDidChangeConfiguration', (data: unknown) => {
    onDidChangeConfiguration.dispatchEvent(new ConfigurationChangeEvent(data as IConfigurationChangeEvent));
  });
}

setupConfigurationChange();
