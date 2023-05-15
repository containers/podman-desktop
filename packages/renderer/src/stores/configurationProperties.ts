/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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
import type { IConfigurationPropertyRecordedSchema } from '../../../main/src/plugin/configuration-registry';

export async function fetchConfigurationProperties() {
  const result: Record<string, IConfigurationPropertyRecordedSchema> = await window.getConfigurationProperties();
  const properties: IConfigurationPropertyRecordedSchema[] = [];
  for (const key in result) {
    properties.push(result[key]);
  }
  configurationProperties.set(properties);
}

export const configurationProperties: Writable<IConfigurationPropertyRecordedSchema[]> = writable([]);

window.events?.receive('extensions-started', async () => {
  await fetchConfigurationProperties();
});
window.events?.receive('extension-started', async () => {
  await fetchConfigurationProperties();
});
window.events?.receive('extension-stopped', async () => {
  await fetchConfigurationProperties();
});
window.addEventListener('system-ready', async () => {
  await fetchConfigurationProperties();
});
