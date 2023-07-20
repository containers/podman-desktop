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

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiSenderType } from '../api.js';
import type { IContext } from '../api/context-info.js';

export class Context implements IContext {
  private _value: Record<string, any>;

  constructor(
    private _id: number,
    private apiSender: ApiSenderType,
    private _parent?: Context,
    private _extension?: string,
  ) {
    this._value = {};
  }

  get id(): number {
    return this._id;
  }

  get parent(): Context | undefined {
    return this._parent;
  }

  get extension(): string | undefined {
    return this._extension;
  }

  get value(): Record<string, any> {
    return { ...this._value };
  }

  setValue(key: string, value: any): boolean {
    if (this._value[key] !== value) {
      this._value[key] = value;
      this.apiSender.send('context-value-updated', {
        extension: this._extension,
        key,
        value,
      });
      return true;
    }
    return false;
  }

  removeValue(key: string): boolean {
    if (key in this._value) {
      delete this._value[key];
      this.apiSender.send('context-key-removed', {
        extension: this._extension,
        key,
      });
      return true;
    }
    return false;
  }

  getValue<T>(key: string): T | undefined {
    const ret = this._value[key];
    if (typeof ret === 'undefined' && this._parent) {
      return this._parent.getValue<T>(key);
    }
    return ret;
  }

  updateParent(parent: Context): void {
    this._parent = parent;
    this.apiSender.send('context-parent-updated', {
      extension: this._extension,
      pid: parent._id,
      pextension: parent._extension,
      pp: parent.parent,
    });
  }

  collectAllValues(): Record<string, any> {
    let result = this._parent ? this._parent.collectAllValues() : {};
    result = { ...result, ...this._value };
    return result;
  }

  dispose(): void {
    this._parent = undefined;
  }
}
