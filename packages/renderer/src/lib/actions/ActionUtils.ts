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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSerializable(value: any): boolean {
  switch (typeof value) {
    case 'string':
    case 'number':
    case 'boolean':
    case 'object':
      return true;
    default:
      return false;
  }
}

// Does not support circular properties
export function removeNonSerializableProperties<T>(obj: T): T {
  if (typeof obj !== 'object' || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.reduce((previousValue, currentValue) => {
      if (isSerializable(currentValue)) return [...previousValue, removeNonSerializableProperties(currentValue)];
      return previousValue;
    }, []);
  }

  const result: Partial<T> = {};

  for (const key in obj) {
    if (isSerializable(obj[key])) {
      result[key] = removeNonSerializableProperties(obj[key]);
    }
  }

  return result as T;
}
