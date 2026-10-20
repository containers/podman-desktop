/*
 * Copyright (C) 2026 Red Hat, Inc.
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
 */

declare module '@podman-desktop/api' {
  export class Disposable {
    constructor(func: () => void);
    /**
     * Creates a new Disposable calling the provided function
     * on dispose.
     * @param callOnDispose Function that disposes something.
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    constructor(callOnDispose: Function);

    /**
     * Dispose this object.
     */
    dispose(): void;

    static create(func: () => void): Disposable;

    /**
     * Combine many disposable-likes into one. Use this method
     * when having objects with a dispose function which are not
     * instances of Disposable.
     *
     * @param disposableLikes Objects that have at least a `dispose`-function member.
     * @return Returns a new disposable which, upon dispose, will
     * dispose all provided disposables.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static from(...disposableLikes: { dispose: () => any }[]): Disposable;
  }

  /**
   * Interface to subscribe specific events.
   *
   * @example
   * This is an example for an hypothetic function `onDidValueChange` implementing
   * the `Event` interface.
   *
   * ```typescript
   * import * as api from '@podman-desktop/api';
   *
   * class MyValueManager {
   *   private value: boolean | undefined = undefined;
   *
   *   private onChange(e: boolean) {
   *     this.value = e;
   *     console.log(this.value);
   *   }
   *
   *   public init(subscriptions: api.Disposable[]) {
   *     onDidValueChange(this.onChange, this, subscriptions);
   *   }
   * }
   *
   * export async function activate(extensionContext: api.ExtensionContext): Promise<void> {
   *   const myValueManager = new MyValueManager();
   *   myValueManager.init(extensionContext.subscriptions);
   * }
   * ```
   */
  export interface Event<T> {
    /**
     * @param listener The listener function will be called when the event happens.
     * @param thisArgs The `this`-argument which will be used when calling the event listener.
     * @param disposables An array to which the resulting {@link Disposable} will be added.
     * @return A disposable which unsubscribes the event listener.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
  }

  /**
   * A class to create and manage an {@link Event} for clients to subscribe to.
   * The emitter can only send one kind of event.
   *
   * Use this class to send events inside extension or provide API to the other
   * extensions.
   */
  export class EventEmitter<T> {
    /**
     * For the public to allow to subscribe to events from this Emitter
     */
    event: Event<T>;
    /**
     * To fire an event to the subscribers
     * @param data The event to send to the registered listeners
     */
    fire(data: T): void;
    /**
     * Dispose by removing registered listeners
     */
    dispose(): void;
  }
}
