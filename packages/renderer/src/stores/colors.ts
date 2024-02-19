/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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
import type { ColorInfo } from '../../../main/src/plugin/api/color-info';
import { EventStore } from '/@/stores/event-store';
import { AppearanceUtil } from '/@/lib/appearance/appearance-util';

const windowEvents = ['color-updated', 'extension-stopped', 'extensions-started'];
const windowListeners = ['appearance-changed', 'extensions-already-started', 'system-ready'];

export const colorsInfos: Writable<ColorInfo[]> = writable([]);

const appearanceUtil: AppearanceUtil = new AppearanceUtil();

// use helper here as window methods are initialized after the store in tests
const listColors = async (): Promise<ColorInfo[]> => {
  const themeName = await appearanceUtil.getTheme();
  return window.listColors(themeName);
};

export const colorsEventStore = new EventStore<ColorInfo[]>(
  'colors',
  colorsInfos,
  // should initialize when app is initializing
  () => Promise.resolve(true),
  windowEvents,
  windowListeners,
  listColors,
);
colorsEventStore.setup();
