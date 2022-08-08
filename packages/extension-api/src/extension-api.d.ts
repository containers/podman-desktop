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

    /**
     * An absolute file path in which the extension can store state.
     * The directory might not exist on disk and creation is
     * up to the extension.
     */
    readonly storagePath: string;
  }

  export type ProviderStatus =
    | 'not-installed'
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
    initialize?(initContext: LifecycleContext): Promise<void>;
    start(startContext: LifecycleContext): Promise<void>;
    stop(stopContext: LifecycleContext): Promise<void>;
    status(): ProviderStatus;
  }

  export interface ProviderProxySettings {
    httpProxy: string;
    httpsProxy: string;
    noProxy: string;
  }

  export interface ProviderDetectionCheck {
    name: string;
    details?: string;
    status: boolean;
  }

  export interface ProviderOptions {
    id: string;
    name: string;
    status: ProviderStatus;
    version?: string;
    images?: ProviderImages;
    links?: ProviderLinks[];
    detectionChecks?: ProviderDetectionCheck[];
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
    initialize(): Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create(params: { [key: string]: any }): Promise<void>;
  }

  export interface Link {
    title: string;
    url: string;
  }
  export type CheckResultLink = Link;

  export interface CheckResult {
    successful: boolean;
    description?: string;
    docLinks?: CheckResultLink[];
  }

  export interface InstallCheck {
    title: string;
    execute(): Promise<CheckResult>;
  }

  export interface ProviderInstallation {
    preflightChecks?(): InstallCheck[];
    // ask to install the provider
    install(logger: Logger): Promise<void>;
  }

  export interface ProviderUpdate {
    version: string;
    // ask to update the provider
    update(logger: Logger): Promise<void>;
  }

  export type ProviderLinks = Link;

  export interface ProviderImages {
    icon?: string | { light: string; dark: string };
    logo?: string | { light: string; dark: string };
  }

  export interface Provider {
    setContainerProviderConnectionFactory(
      containerProviderConnectionFactory: ContainerProviderConnectionFactory,
    ): Disposable;
    registerContainerProviderConnection(connection: ContainerProviderConnection): Disposable;
    registerKubernetesProviderConnection(connection: KubernetesProviderConnection): Disposable;
    registerLifecycle(lifecycle: ProviderLifecycle): Disposable;
    // Sets the proxy that has been defined in the provider
    registerProxy(proxySettings: ProxySettings): Disposable;
    // Podman Desktop has updated the settings, propagates the changes to the provider.
    onDidUpdateProxy: Event<ProxySettings>;

    // register installation flow
    registerInstallation(installation: ProviderInstallation): Disposable;

    // register update flow
    registerUpdate(update: ProviderUpdate): Disposable;

    dispose(): void;
    readonly name: string;
    readonly id: string;
    readonly status: ProviderStatus;
    updateStatus(status: ProviderStatus): void;
    onDidUpdateStatus: Event<ProviderStatus>;

    // version may not be defined
    readonly version: string | undefined;
    updateVersion(version: string): void;
    onDidUpdateVersion: Event<string>;

    readonly images: ProviderImages;

    readonly links: ProviderLinks[];

    // detection checks for the provider
    readonly detectionChecks: ProviderDetectionCheck[];

    // update the detection checks for the provider
    // it may happen after an update or an installation
    updateDetectionChecks(detectionChecks: ProviderDetectionCheck[]): void;

    // notify that detection checks have changed
    onDidUpdateDetectionChecks: Event<ProviderDetectionCheck[]>;
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
    export const onDidUpdateRegistry: Event<Registry>;
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

  /**
   * Defines a generalized way of reporting progress updates.
   */
  export interface Progress<T> {
    /**
     * Report a progress update.
     * @param value A progress item, like a message and/or an
     * report on how much work finished
     */
    report(value: T): void;
  }

  /**
   * A location in the editor at which progress information can be shown. It depends on the
   * location how progress is visually represented.
   */
  export enum ProgressLocation {
    /**
     * Show progress bar under app icon in launcher bar.
     */
    APP_ICON = 1,
  }

  /**
   * Value-object describing where and how progress should show.
   */
  export interface ProgressOptions {
    /**
     * The location at which progress should show.
     */
    location: ProgressLocation;

    /**
     * A human-readable string which will be used to describe the
     * operation.
     */
    title?: string;

    /**
     * Controls if a cancel button should show to allow the user to
     * cancel the long running operation.  Note that currently only
     * `ProgressLocation.Notification` is supporting to show a cancel
     * button.
     */
    cancellable?: boolean;
  }

  /**
   * A cancellation token is passed to an asynchronous or long running
   * operation to request cancellation.
   */
  export interface CancellationToken {
    /**
     * Is `true` when the token has been cancelled, `false` otherwise.
     */
    isCancellationRequested: boolean;

    /**
     * An {@link Event} which fires upon cancellation.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onCancellationRequested: Event<any>;
  }

  export interface NotificationOptions {
    /**
     * A title for the notification, which will be shown at the top of the notification window when it is shown.
     */
    title?: string;
    /**
     * The body text of the notification, which will be displayed below the title.
     */
    body?: string;
    /**
     * Whether or not to emit an OS notification noise when showing the notification.
     */
    silent?: boolean;
  }

  /**
   * Aligned to the left side.
   */
  export const StatusBarAlignLeft = 'LEFT';
  /**
   * Aligned to the right side.
   */
  export const StatusBarAlignRight = 'RIGHT';
  /**
   * Represents the alignment of status bar items.
   */
  export type StatusBarAlignment = typeof StatusBarAlignLeft | typeof StatusBarAlignRight;

  /**
   * Default priority for the status bar items.
   */
  export const StatusBarItemDefaultPriority = 0;

  /**
   * A status bar item is a status bar contribution that can
   * show text and icons and run a command on click.
   */
  export interface StatusBarItem {
    /**
     * The alignment of this item.
     */
    readonly alignment: StatusBarAlignment;
    /**
     * The priority of this item. Higher value means the item should be shown more to the left
     * or more to the right.
     */
    readonly priority: number;
    /**
     * The text to show for the entry.
     */
    text?: string;
    /**
     * The tooltip text when you hover over this entry.
     */
    tooltip?: string;
    /**
     * Icon class that is used to display the particular icon from the Font Awesome icon set.
     * Icon class should be in format e.g. 'fa fa-toggle-on'. It is possible to provide an icons
     * for state which can be enabled or disabled.
     */
    iconClass?: string | { active: string; inactive: string };
    /**
     * Marks an item as disabled. When property is set to true, then icon will be changed to inactive
     * and there won't be possible to execute a command if it is provided in the following configuration.
     */
    enabled: boolean;
    /**
     * The identifier of a command to run on click.
     */
    command?: string;
    /**
     * Arguments that the command handler should be invoked with.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    commandArgs?: any[];
    /**
     * Shows the entry in the status bar.
     */
    show(): void;
    /**
     * Hides the entry in the status bar.
     */
    hide(): void;
  }

  export namespace window {
    /**
     * Show an information message. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage(message: string, ...items: string[]): Promise<string | undefined>;

    /**
     * Show a warning message. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage(message: string, ...items: string[]): Promise<string | undefined>;

    /**
     * Show a error message. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A thenable that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage(message: string, ...items: string[]): Promise<string | undefined>;

    export function withProgress<R>(
      options: ProgressOptions,
      task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Promise<R>,
    ): Promise<R>;

    /**
     * Show OS desktop notification
     * @param options
     */
    export function showNotification(options: NotificationOptions): Disposable;

    /**
     * Creates a status bar {@link StatusBarItem} item.
     *
     * @param alignment The alignment of the item.
     * @param priority The priority of the item. Higher values mean more to the left or more to the right.
     * @return A new status bar item.
     */
    export function createStatusBarItem(alignment?: StatusBarAlignment, priority?: number): StatusBarItem;
  }
}
