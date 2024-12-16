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
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// based on https://github.com/microsoft/vscode/blob/3eed9319874b7ca037128962593b6a8630869253/src/vs/platform/contextkey/browser/contextKeyService.ts

import type { IContext } from '../../../../main/src/plugin/api/context-info';

export class ContextUI implements IContext {
  private _value: Record<string, unknown>;

  constructor() {
    this._value = {};
  }

  get value(): Record<string, unknown> {
    return { ...this._value };
  }

  setValue(key: string, value: unknown): boolean {
    if (this._value[key] !== value) {
      this._value[key] = value;
      return true;
    }
    return false;
  }

  removeValue(key: string): boolean {
    if (key in this._value) {
      delete this._value[key];
      return true;
    }
    return false;
  }

  getValue<T>(key: string): T | undefined {
    const contextValue = this._value[key];
    if (contextValue !== undefined) {
      return contextValue as T;
    }
    return this.getDottedKeyValue(key);
  }

  /**
   * A key could represent a complex value like the property of an object
   *
   * E.g command.status - this function retrieves the value of "command" from the context
   * and look for its "status" property value
   *
   * @param key the key
   * @param context the context where to look for the value
   * @returns the value of the complex key or undefined
   */
  getDottedKeyValue<T>(key: string): T | undefined {
    if (!key || key.indexOf('.') === -1) {
      return undefined;
    }
    const bits = key.split('.');
    let contextValue = this.getValue<T>(bits[0]);
    if (contextValue === undefined) {
      return undefined;
    }
    for (let i = 1; i < bits.length; i++) {
      if (contextValue) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        contextValue = contextValue[bits[i]];
      }
    }
    return contextValue;
  }

  collectAllValues(): Record<string, unknown> {
    return this._value;
  }
}
