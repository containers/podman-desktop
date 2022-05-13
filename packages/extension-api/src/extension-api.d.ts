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

    type?: 'normal' | 'separator' | 'submenu' | 'checkbox' | 'radio';
    label?: string;

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

  /**
   * Event to subscribe
   */
  export interface Event<T> {
    /**
     * @param listener The listener function will be called when the event happens.
     * @param thisArgs The `this`-argument which will be used when calling the event listener.
     * @param disposables An array to which a {@link Disposable} will be added.
     * @return A disposable which unsubscribes the event listener.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (listener: (e: T) => any, thisArgs?: any, disposables?: Disposable[]): Disposable;
  }

  export interface ExtensionContext {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly subscriptions: { dispose(): any }[];
  }

  export type ProviderStatus =
    | 'installed'
    | 'configured'
    | 'ready'
    | 'started'
    | 'stopped'
    | 'starting'
    | 'stopping'
    | 'error'
    | 'unknown';

  export interface ProviderLifecycle {
    start(startContext: LifecycleContext): Promise<void>;
    stop(startContext: LifecycleContext): Promise<void>;
    status(): ProviderStatus;
  }

  export interface ProviderOptions {
    id: string;
    name: string;
    status: ProviderStatus;
  }

  export type ProviderConnectionStatus = 'started' | 'stopped' | 'starting' | 'stopping' | 'unknown';

  export interface Logger {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    log(...data: any[]): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error(...data: any[]): void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn(...data: any[]): void;
  }

  export interface LifecycleContext {
    log: Logger;
  }

  export interface ProviderConnectionLifecycle {
    start?(startContext: LifecycleContext): Promise<void>;
    stop?(stopContext: LifecycleContext): Promise<void>;
    delete?(): Promise<void>;
  }

  export interface ContainerProviderConnectionEndpoint {
    socketPath: string;
  }

  export interface ContainerProviderConnection {
    name: string;
    type: 'docker' | 'podman';
    endpoint: ContainerProviderConnectionEndpoint;
    lifecycle?: ProviderConnectionLifecycle;
    status(): ProviderConnectionStatus;
  }

  export interface KubernetesProviderConnectionEndpoint {
    apiURL: string;
  }
  export interface KubernetesProviderConnection {
    name: string;
    endpoint: KubernetesProviderConnectionEndpoint;
    lifecycle?: ProviderConnectionLifecycle;
    status(): ProviderConnectionStatus;
  }

  // create programmatically a ContainerProviderConnection
  export interface ContainerProviderConnectionFactory {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create(params: { [key: string]: any }): Promise<void>;
  }

  export interface Provider {
    setContainerProviderConnectionFactory(
      containerProviderConnectionFactory: ContainerProviderConnectionFactory,
    ): Disposable;
    registerContainerProviderConnection(connection: ContainerProviderConnection): Disposable;
    registerKubernetesProviderConnection(connection: KubernetesProviderConnection): Disposable;
    registerLifecycle(lifecycle: ProviderLifecycle): Disposable;
    dispose(): void;
    readonly name: string;
    readonly id: string;
    readonly status: ProviderStatus;
  }

  export namespace commands {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function executeCommand<T = unknown>(command: string, ...rest: any[]): PromiseLike<T>;
  }

  export namespace provider {
    export function createProvider(provider: ProviderOptions): Provider;
  }

  export interface Registry extends RegistryCreateOptions {
    source: string;
  }

  export interface RegistryCreateOptions {
    serverUrl: string;
    username: string;
    secret: string;
  }

  export interface RegistryProvider {
    readonly name: string;
    create(registryCreateOptions: RegistryCreateOptions): Registry;
  }

  /**
   * Handle registries from different sources
   */
  export namespace registry {
    export function registerRegistryProvider(registryProvider: RegistryProvider): Disposable;

    // expose a registry from a source
    export function registerRegistry(registry: Registry): Disposable;
    // remove registry from a source
    export function unregisterRegistry(registry: Registry): void;

    export const onDidRegisterRegistry: Event<Registry>;
    export const onDidUnregisterRegistry: Event<Registry>;
  }

  export namespace tray {
    /**
     *
     * @param providerId the same as the id on Provider provided by createProvider() method, need to place menu item properly
     * @param item
     */
    export function registerMenuItem(providerId: string, item: MenuItem): Disposable;
  }

  export namespace configuration {
    export function getConfiguration(section?: string, scope?: ConfigurationScope): Configuration;

    /**
     * An event that is emitted when the {@link Configuration configuration} changed.
     */
    // export const onDidChangeConfiguration: Event<ConfigurationChangeEvent>;
  }

  /**
   * The configuration scope
   */
  export type ConfigurationScope = string | ContainerProviderConnection | KubernetesProviderConnection;

  export interface Configuration {
    /**
     * Return a value from this configuration.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @return The value `section` denotes or `undefined`.
     */
    get<T>(section: string): T | undefined;

    /**
     * Return a value from this configuration.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @param defaultValue A value should be returned when no value could be found, is `undefined`.
     * @return The value `section` denotes or the default.
     */
    get<T>(section: string, defaultValue: T): T;

    /**
     * Check if this configuration has a certain value.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @return `true` if the section doesn't resolve to `undefined`.
     */
    has(section: string): boolean;

    /**
     * Update a configuration value. The updated configuration values are persisted.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update(section: string, value: any): PromiseLike<void>;

    /**
     * Readable dictionary that backs this configuration.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly [key: string]: any;
  }

  /**
   * An event describing the change in Configuration
   */
  export interface ConfigurationChangeEvent {
    /**
     * Checks if the given section has changed.
     * If scope is provided, checks if the section has changed for resources under the given scope.
     *
     * @param section Configuration name, supports _dotted_ names.
     * @param scope A scope in which to check.
     * @return `true` if the given section has changed.
     */
    affectsConfiguration(section: string, scope?: ConfigurationScope): boolean;
  }
}
