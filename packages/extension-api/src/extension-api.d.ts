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

declare module '@tmpwip/extension-api' {

    /**
	 * Represents a reference to a command. Provides a title which
	 * will be used to represent a command in the UI and, optionally,
	 * an array of arguments which will be passed to the command handler
	 * function when invoked.
	 */
	export interface Command {
		title: string;
		command: string;
		tooltip?: string;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		arguments?: any[];
	}

  export interface MenuItem {

    /**
     * Unique within a single menu. Should be same as commandId for handler
     */
    id: string;

    type?: ('normal' | 'separator' | 'submenu' | 'checkbox' | 'radio');
    label?: string;
    sublabel?: string;
    icon?: string;
    /**
     * If false, the menu item will be greyed out and unclickable.
     */
    enabled?: boolean;
    /**
    * If false, the menu item will be entirely hidden.
    */
    visible?: boolean;
    /**
     * Should only be specified for `checkbox` or `radio` type menu items.
     */
    checked?: boolean;
  }

    export class Disposable {

        constructor(func: () => void);
        /**
         * Creates a new Disposable calling the provided function
         * on dispose.
         * @param callOnDispose Function that disposes something.
         */
         // eslint-disable-next-line @typescript-eslint/ban-types
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

    export interface ExtensionContext {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		readonly subscriptions: { dispose(): any }[];
    }

    export interface ContainerProviderLifecycle {
        provideName(): string;
        start(): Promise<void>;
        stop(): Promise<void>;
        status(): string;
        handleLifecycleChange(callback: (event: string) => void): Promise<void>
    }

    export interface ContainerProvider {
        provideName(): string;
        provideConnection(): PromiseLike<string>;
    }

    export namespace commands {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        export function registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        export function executeCommand<T = unknown>(command: string, ...rest: any[]): PromiseLike<T>;
    }

    export namespace container {
        export function registerContainerProvider(provider: ContainerProvider): PromiseLike<Disposable>;
        export function registerContainerProviderLifecycle(providerLifecycle: ContainerProviderLifecycle): PromiseLike<Disposable>;
    }

    export namespace tray {
      /**
       *
       * @param providerName the same as of ContainerProviderLifecycle.provideName() value, need to place menu item properly
       * @param item
       */
      export function registerMenuItem(providerName: string, item: MenuItem): Disposable;
    }


}
