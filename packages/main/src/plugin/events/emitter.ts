/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
/* eslint-disable @typescript-eslint/ban-types */
import type { IDisposable } from '../types/disposable.js';

export type DisposableGroup = { push(disposable: IDisposable): void } | { add(disposable: IDisposable): void };

/**
 * Represents a typed event.
 */
export interface Event<T> {
  /**
   *
   * @param listener The listener function will be call when the event happens.
   * @param thisArgs The 'this' which will be used when calling the event listener.
   * @param disposables An array to which a {{IDisposable}} will be added.
   * @return a disposable to remove the listener again.
   */
  (listener: (e: T) => any, thisArgs?: any, disposables?: DisposableGroup): IDisposable;
}

type Callback = (...args: any[]) => any;
class CallbackList implements Iterable<Callback> {
  private _callbacks: Function[] | undefined;
  private _contexts: any[] | undefined;

  get length(): number {
    return this._callbacks?.length ?? 0;
  }

  public add(callback: Function, context: any = undefined, bucket?: IDisposable[]): void {
    if (!this._callbacks) {
      this._callbacks = [];
      this._contexts = [];
    }
    this._callbacks.push(callback);
    this._contexts?.push(context);

    if (Array.isArray(bucket)) {
      bucket.push({ dispose: () => this.remove(callback, context) });
    }
  }

  public remove(callback: Function, context: any = undefined): void {
    if (!this._callbacks) {
      return;
    }

    let foundCallbackWithDifferentContext = false;
    for (let i = 0; i < this._callbacks.length; i++) {
      if (this._callbacks[i] === callback) {
        if (this._contexts?.[i] === context) {
          // callback & context match => remove it
          this._callbacks.splice(i, 1);
          this._contexts?.splice(i, 1);
          return;
        } else {
          foundCallbackWithDifferentContext = true;
        }
      }
    }

    if (foundCallbackWithDifferentContext) {
      throw new Error('When adding a listener with a context, you should remove it with the same context');
    }
  }

  // tslint:disable-next-line:typedef
  public [Symbol.iterator](): IterableIterator<Callback> {
    if (!this._callbacks) {
      return [][Symbol.iterator]();
    }
    const callbacks = this._callbacks.slice(0);
    const contexts = this._contexts?.slice(0);
    // prettier-ignore
    return callbacks
      .map(
        (callback, i) =>
          (...args: any[]) =>
            callback.apply(contexts?.[i], args),

      )[Symbol.iterator]();
  }

  public invoke(...args: any[]): any[] {
    const ret: any[] = [];
    for (const callback of this) {
      try {
        ret.push(callback(...args));
      } catch (e) {
        console.error(e);
      }
    }
    return ret;
  }

  public isEmpty(): boolean {
    return !this._callbacks || this._callbacks.length === 0;
  }

  public dispose(): void {
    this._callbacks = undefined;
    this._contexts = undefined;
  }
}

export interface EmitterOptions {
  onFirstListenerAdd?: Function;
  onLastListenerRemove?: Function;
}

export class Emitter<T = any> {
  private static LEAK_WARNING_THRESHHOLD = 175;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private static _noop = function (): void {};

  private _event: Event<T> | undefined;
  protected _callbacks: CallbackList | undefined;
  private _disposed = false;

  private _leakingStacks: Map<string, number> | undefined;
  private _leakWarnCountdown = 0;

  constructor(private _options?: EmitterOptions) {}

  canPushDisposable(candidate?: DisposableGroup): candidate is { push(disposable: IDisposable): void } {
    return Boolean(candidate && (candidate as { push(): void }).push);
  }
  canAddDisposable(candidate?: DisposableGroup): candidate is { add(disposable: IDisposable): void } {
    return Boolean(candidate && (candidate as { add(): void }).add);
  }

  private getMaxListeners(event: Event<unknown> | undefined): number {
    const { maxListeners } = event as any;
    return typeof maxListeners === 'number' ? maxListeners : 0;
  }

  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event(): Event<T> {
    if (!this._event) {
      this._event = Object.assign(
        (listener: (e: T) => any, thisArgs?: any, disposables?: DisposableGroup) => {
          if (!this._callbacks) {
            this._callbacks = new CallbackList();
          }
          if (this._options?.onFirstListenerAdd && this._callbacks.isEmpty()) {
            this._options.onFirstListenerAdd(this);
          }
          this._callbacks.add(listener, thisArgs);
          const removeMaxListenersCheck = this.checkMaxListeners(this.getMaxListeners(this._event));

          const result: IDisposable = {
            dispose: () => {
              if (removeMaxListenersCheck) {
                removeMaxListenersCheck();
              }
              result.dispose = Emitter._noop;
              if (!this._disposed) {
                this._callbacks?.remove(listener, thisArgs);
                result.dispose = Emitter._noop;
                if (this._options?.onLastListenerRemove && this._callbacks?.isEmpty()) {
                  this._options.onLastListenerRemove(this);
                }
              }
            },
          };
          if (this.canPushDisposable(disposables)) {
            disposables.push(result);
          } else if (this.canAddDisposable(disposables)) {
            disposables.add(result);
          }

          return result;
        },
        {
          maxListeners: Emitter.LEAK_WARNING_THRESHHOLD,
        },
      );
    }
    return this._event;
  }

  protected checkMaxListeners(maxListeners: number): (() => void) | undefined {
    if (maxListeners === 0 || !this._callbacks) {
      return undefined;
    }
    const listenerCount = this._callbacks.length;
    if (listenerCount <= maxListeners) {
      return undefined;
    }

    const popStack = this.pushLeakingStack();

    this._leakWarnCountdown -= 1;
    if (this._leakWarnCountdown <= 0) {
      // only warn on first exceed and then every time the limit
      // is exceeded by 50% again
      this._leakWarnCountdown = maxListeners * 0.5;

      let topStack = '';
      let topCount = 0;
      this._leakingStacks?.forEach((stackCount, stack) => {
        if (!topStack || topCount < stackCount) {
          topStack = stack;
          topCount = stackCount;
        }
      });

      // eslint-disable-next-line max-len
      console.warn(
        `Possible Emitter memory leak detected. ${listenerCount} listeners added. Use event.maxListeners to increase the limit (${maxListeners}). MOST frequent listener (${topCount}):`,
      );
      console.warn(topStack);
    }

    return popStack;
  }

  protected pushLeakingStack(): () => void {
    if (!this._leakingStacks) {
      this._leakingStacks = new Map();
    }
    const stack = new Error().stack?.split('\n').slice(3).join('\n');
    if (stack) {
      const count = this._leakingStacks.get(stack) ?? 0;
      this._leakingStacks.set(stack, count + 1);
      return () => this.popLeakingStack(stack);
    }
    return () => Emitter._noop;
  }

  protected popLeakingStack(stack: string): void {
    if (!this._leakingStacks) {
      return;
    }
    const count = this._leakingStacks.get(stack) ?? 0;
    this._leakingStacks.set(stack, count - 1);
  }

  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event: T): any {
    if (this._callbacks) {
      this._callbacks.invoke(event);
    }
  }

  /**
   * Process each listener one by one.
   * Return `false` to stop iterating over the listeners, `true` to continue.
   */
  async sequence(processor: (listener: (e: T) => any) => Promise<boolean>): Promise<void> {
    if (this._callbacks) {
      for (const listener of this._callbacks) {
        if (!(await processor(listener))) {
          break;
        }
      }
    }
  }

  dispose(): void {
    if (this._leakingStacks) {
      this._leakingStacks.clear();
      this._leakingStacks = undefined;
    }
    if (this._callbacks) {
      this._callbacks.dispose();
      this._callbacks = undefined;
    }
    this._disposed = true;
  }
}
