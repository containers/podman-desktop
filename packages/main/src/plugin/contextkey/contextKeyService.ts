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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type { Event } from '../events/emitter.js';
import { Emitter } from '../events/emitter.js';
import { DisposableStore } from '../types/disposable.js';
import type {
  IContextKeyChangeEvent,
  IContextKey,
  ContextKeyExpression,
  IContextKeyServiceTarget,
  IContext,
  IReadableSet,
  ContextKeyValue,
} from './contextKey.js';

const KEYBINDING_CONTEXT_ATTR = 'data-keybinding-context';

export interface IContextKeyService {
  dispose(): void;

  onDidChangeContext: Event<IContextKeyChangeEvent>;

  createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T>;
  contextMatchesRules(rules: ContextKeyExpression | undefined): boolean;
  getContextKeyValue<T>(key: string): T | undefined;

  getContext(target: IContextKeyServiceTarget | null): IContext;

  updateParent(parentContextKeyService: IContextKeyService): void;
}

class ContextKey<T extends ContextKeyValue> implements IContextKey<T> {
  private _service: AbstractContextKeyService;
  private _key: string;
  private _defaultValue: T | undefined;

  constructor(service: AbstractContextKeyService, key: string, defaultValue: T | undefined) {
    this._service = service;
    this._key = key;
    this._defaultValue = defaultValue;
    this.reset();
  }

  public set(value: T): void {
    this._service.setContext(this._key, value);
  }

  public reset(): void {
    if (typeof this._defaultValue === 'undefined') {
      this._service.removeContext(this._key);
    } else {
      this._service.setContext(this._key, this._defaultValue);
    }
  }

  public get(): T | undefined {
    return this._service.getContextKeyValue<T>(this._key);
  }
}

export class Context implements IContext {
  protected _parent: Context | null;
  protected _value: Record<string, any>;
  protected _id: number;

  constructor(id: number, parent: Context | null) {
    this._id = id;
    this._parent = parent;
    this._value = Object.create(null);
    this._value['_contextId'] = id;
  }

  public get value(): Record<string, any> {
    return { ...this._value };
  }

  public setValue(key: string, value: any): boolean {
    if (this._value[key] !== value) {
      this._value[key] = value;
      return true;
    }
    return false;
  }

  public removeValue(key: string): boolean {
    if (key in this._value) {
      delete this._value[key];
      return true;
    }
    return false;
  }

  public getValue<T>(key: string): T | undefined {
    const ret = this._value[key];
    if (typeof ret === 'undefined' && this._parent) {
      return this._parent.getValue<T>(key);
    }
    return ret;
  }

  public updateParent(parent: Context): void {
    this._parent = parent;
  }

  public collectAllValues(): Record<string, any> {
    let result = this._parent ? this._parent.collectAllValues() : Object.create(null);
    result = { ...result, ...this._value };
    delete result['_contextId'];
    return result;
  }

  dispose(): void {
    this._parent = null;
  }
}

class NullContext extends Context {
  static readonly INSTANCE = new NullContext();

  constructor() {
    super(-1, null);
  }

  public override setValue(key: string, value: any): boolean {
    return false;
  }

  public override removeValue(key: string): boolean {
    return false;
  }

  public override getValue<T>(key: string): T | undefined {
    return undefined;
  }

  override collectAllValues(): { [key: string]: any } {
    return Object.create(null);
  }
}

class SimpleContextKeyChangeEvent implements IContextKeyChangeEvent {
  constructor(readonly key: string) {}
  affectsSome(keys: IReadableSet<string>): boolean {
    return keys.has(this.key);
  }
  allKeysContainedIn(keys: IReadableSet<string>): boolean {
    return this.affectsSome(keys);
  }
}

function findContextAttr(domNode: IContextKeyServiceTarget | null): number {
  while (domNode) {
    if (domNode.hasAttribute(KEYBINDING_CONTEXT_ATTR)) {
      const attr = domNode.getAttribute(KEYBINDING_CONTEXT_ATTR);
      if (attr) {
        return parseInt(attr, 10);
      }
      return NaN;
    }
    domNode = domNode.parentElement;
  }
  return 0;
}

export abstract class AbstractContextKeyService implements IContextKeyService {
  declare _serviceBrand: undefined;

  protected _isDisposed: boolean;
  protected _myContextId: number;

  protected _onDidChangeContext = new Emitter<IContextKeyChangeEvent>();
  readonly onDidChangeContext = this._onDidChangeContext.event;

  constructor(myContextId: number) {
    this._isDisposed = false;
    this._myContextId = myContextId;
  }

  public get contextId(): number {
    return this._myContextId;
  }

  abstract dispose(): void;

  public createKey<T extends ContextKeyValue>(key: string, defaultValue: T | undefined): IContextKey<T> {
    if (this._isDisposed) {
      throw new Error('AbstractContextKeyService has been disposed');
    }
    return new ContextKey(this, key, defaultValue);
  }

  public contextMatchesRules(rules: ContextKeyExpression | undefined): boolean {
    if (this._isDisposed) {
      throw new Error('AbstractContextKeyService has been disposed');
    }
    const context = this.getContextValuesContainer(this._myContextId);
    return rules ? rules.evaluate(context) : true;
  }

  public getContextKeyValue<T>(key: string): T | undefined {
    if (this._isDisposed) {
      return undefined;
    }
    return this.getContextValuesContainer(this._myContextId).getValue<T>(key);
  }

  public setContext(key: string, value: any): void {
    if (this._isDisposed) {
      return;
    }
    const myContext = this.getContextValuesContainer(this._myContextId);
    if (!myContext) {
      return;
    }
    if (myContext.setValue(key, value)) {
      this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key));
    }
  }

  public removeContext(key: string): void {
    if (this._isDisposed) {
      return;
    }
    if (this.getContextValuesContainer(this._myContextId).removeValue(key)) {
      this._onDidChangeContext.fire(new SimpleContextKeyChangeEvent(key));
    }
  }

  public getContext(target: IContextKeyServiceTarget | null): IContext {
    if (this._isDisposed) {
      return NullContext.INSTANCE;
    }
    return this.getContextValuesContainer(findContextAttr(target));
  }

  public abstract getContextValuesContainer(contextId: number): Context;
  public abstract createChildContext(parentContextId?: number): number;
  public abstract disposeContext(contextId: number): void;
  public abstract updateParent(parentContextKeyService?: IContextKeyService): void;
}

export class ContextKeyService extends AbstractContextKeyService implements IContextKeyService {
  private _lastContextId: number;
  private readonly _contexts = new Map<number, Context>();

  private readonly _toDispose = new DisposableStore();

  constructor() {
    super(0);
    this._lastContextId = 0;

    const myContext = new Context(this._myContextId, null);
    this._contexts.set(this._myContextId, myContext);
    this._toDispose.add(myContext);
  }

  public dispose(): void {
    this._onDidChangeContext.dispose();
    this._isDisposed = true;
    this._toDispose.dispose();
  }

  public getContextValuesContainer(contextId: number): Context {
    if (this._isDisposed) {
      return NullContext.INSTANCE;
    }
    return this._contexts.get(contextId) || NullContext.INSTANCE;
  }

  public createChildContext(parentContextId: number = this._myContextId): number {
    if (this._isDisposed) {
      throw new Error('ContextKeyService has been disposed');
    }
    const id = ++this._lastContextId;
    this._contexts.set(id, new Context(id, this.getContextValuesContainer(parentContextId)));
    return id;
  }

  public disposeContext(contextId: number): void {
    if (!this._isDisposed) {
      this._contexts.delete(contextId);
    }
  }

  public updateParent(_parentContextKeyService: IContextKeyService): void {
    throw new Error('Cannot update parent of root ContextKeyService');
  }
}
