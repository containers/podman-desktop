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
import type { ApiSenderType } from './api.js';
import type { ContextInfo } from './api/context-info.js';
import { Context } from './context/context.js';

export class ContextRegistry {
  private contexts: Context[];
  private id: number;

  constructor(private apiSender: ApiSenderType) {
    this.contexts = [];
    this.id = 0;
  }

  registerContext(extension: string): void {
    if (!this.contexts.find(context => context.extension === extension)) {
      this.id++;
      const ctx = new Context(this.id, this.apiSender, undefined, extension);
      this.contexts.push(ctx);
    }
  }

  unregisterContext(extension: string): void {
    const ctx = this.contexts.find(context => context.extension === extension);
    if (ctx) {
      ctx.dispose();
      this.contexts = this.contexts.filter(context => context.extension !== extension);
    }
  }

  getContext(extension: string): Context | undefined {
    return this.contexts.find(context => context.extension === extension);
  }

  listContextInfos(): ContextInfo[] {
    return this.contexts.map(value => {
      return {
        extension: value.extension,
        id: value.id,
        parent: value.parent,
      };
    });
  }

  getContextInfo(extension: string): ContextInfo {
    const context = this.getContext(extension);
    if (!context) {
      throw new Error(`no context found for extension ${extension}`);
    }
    return {
      extension: context.extension,
      id: context.id,
      parent: context.parent,
    };
  }
}
