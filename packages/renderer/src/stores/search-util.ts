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

// Search if a given query is present in the leaves of a given object
export function findMatchInLeaves(object: unknown, query: string): boolean {
  if (typeof object === 'string') {
    return object.toLowerCase().includes(query.toLowerCase());
  } else if (Array.isArray(object)) {
    return object.some(element => findMatchInLeaves(element, query));
  } else if (typeof object === 'object') {
    // we will search only in the leaf of the object
    return aggregateLeaves(object).some(leaf => findMatchInLeaves(leaf, query));
  } else {
    return false;
  }
}

// Aggregate all leaves of a given object
function aggregateLeaves(object: unknown): string[] {
  if (!object) {
    return [];
  } else if (typeof object === 'string') {
    return [object];
  } else if (Array.isArray(object)) {
    return object.flatMap(element => aggregateLeaves(element));
  } else if (typeof object === 'object') {
    return Object.values(object).flatMap(value => aggregateLeaves(value));
  } else {
    return [];
  }
}
