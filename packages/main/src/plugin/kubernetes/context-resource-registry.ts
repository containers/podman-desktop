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

// ContextResourceRegistry stores objects of type T for contexts and resources
export class ContextResourceRegistry<T> {
  #registry: Map<string, Map<string, T>> = new Map();

  set(context: string, resource: string, object: T): void {
    if (!this.#registry.get(context)) {
      this.#registry.set(context, new Map());
    }
    this.#registry.get(context)?.set(resource, object);
  }

  get(context: string, resource: string): T | undefined {
    return this.#registry.get(context)?.get(resource);
  }

  getAll(): T[] {
    const result: T[] = [];
    for (const contexts of this.#registry.values()) {
      result.push(...contexts.values());
    }
    return result;
  }

  getForResource(resourceName: string): { context: string; item: T }[] {
    const result: { context: string; item: T }[] = [];
    for (const [context, contextResources] of this.#registry.entries()) {
      const item = contextResources.get(resourceName);
      if (item) {
        result.push({ context, item });
      }
    }
    return result;
  }
}
