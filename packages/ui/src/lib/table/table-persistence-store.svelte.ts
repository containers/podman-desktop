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

import { SvelteMap } from 'svelte/reactivity';

import type { TablePersistence } from './table';

export const tablePersistence = $state<{ storage: TablePersistence | undefined }>({ storage: undefined });

/**
 * Module-level map that preserves which table rows are collapsed across
 * component remounts (e.g. when navigating away and back). Keyed by the
 * Table's `kind` prop so each list maintains independent state.
 * Cleared on app restart (in-memory only).
 */
export const collapsedStateMap = new SvelteMap<string, string[]>();
