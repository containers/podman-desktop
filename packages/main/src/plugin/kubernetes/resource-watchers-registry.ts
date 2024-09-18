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

export class ResourceWatchersRegistry {
  // Map resourceName to number of watchers
  private watchingResources = new Map<string, number>();

  subscribe(resourceName: string): void {
    let count = this.watchingResources.get(resourceName);
    if (count === undefined) {
      this.watchingResources.set(resourceName, 0);
      count = 0;
    }
    this.watchingResources.set(resourceName, count + 1);
  }

  unsubscribe(resourceName: string): void {
    const count = this.watchingResources.get(resourceName);
    if (count === undefined) {
      throw new Error(`unsubscribe before subscribe on resource ${resourceName}`);
    }
    this.watchingResources.set(resourceName, count - 1);
  }

  hasSubscribers(resourceName: string): boolean {
    const count = this.watchingResources.get(resourceName);
    return !!count;
  }
}
