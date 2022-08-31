/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import { writable } from 'svelte/store';

export async function fetchConfigurationProperties() {
  const result = await window.getConfigurationProperties();
  const properties = [];
  for (const key in result) {
    properties.push(result[key]);
  }
  configurationProperties.set(properties);
}

export const configurationProperties = writable([]);

window.addEventListener('extension-started', () => {
  fetchConfigurationProperties();
});
window.addEventListener('extension-stopped', () => {
  fetchConfigurationProperties();
});
window.addEventListener('system-ready', () => {
  fetchConfigurationProperties();
});
