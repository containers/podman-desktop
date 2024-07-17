/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

/**
 * The Podman Desktop API provides a way to interact with Podman Desktop.
 *
 * This file `extension-api.d.ts` is automatically generated from typedoc comments
 * in the source code and provided [on our website](https://podman-desktop.io/api).
 *
 * For more information, see the main
 * [Podman Desktop developing extensions documentation](https://podman-desktop.io/docs/extensions/developing).
 *
 * @example
 * ```typescript
 * import * as api from '@podman-desktop/api';
 *
 * console.log(api.version);
 * ```
 *
 * @module @podman-desktop/api
 **/

declare module '@podman-desktop/api' {
  /**
   * The version of Podman Desktop.
   */
  export const version: string;

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

    submenu?: MenuItem[];
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
     * @param event The event to send to the registered listeners
     */
    fire(data: T): void;
    /**
     * Dispose by removing registered listeners
     */
    dispose(): void;
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

    /**
     * The uri of the directory containing the extension.
     */
    readonly extensionUri: Uri;

    /**
     * A storage utility for secrets. Secrets are persisted across reloads.
     */
    readonly secrets: SecretStorage;
  }

  /**
   * Represents an extension.
   *
   * To get an instance of an `Extension` use {@link extensions.getExtension getExtension}.
   */
  export interface Extension<T> {
    /**
     * The canonical extension identifier in the form of: `publisher.name`.
     */
    readonly id: string;

    /**
     * The uri of the directory containing the extension.
     */
    readonly extensionUri: Uri;

    /**
     * The absolute file path of the directory containing this extension. Shorthand
     * notation for {@link Extension.extensionUri Extension.extensionUri.fsPath} (independent of the uri scheme).
     */
    readonly extensionPath: string;

    /**
     * The parsed contents of the extension's package.json.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly packageJSON: any;

    /**
     * The public API exported by this extension (return value of `activate`).
     * It is an invalid action to access this field before this extension has been activated.
     */
    readonly exports: T;
  }

  /**
   * Namespace for dealing with installed extensions. Extensions are represented
   * by an {@link Extension}-interface which enables reflection on them.
   *
   * Extension writers can provide APIs to other extensions by returning their API public
   * surface from the `activate`-call.
   *
   * When depending on the API of another extension add an `extensionDependencies`-entry
   * to `package.json`, and use the {@link extensions.getExtension getExtension}-function
   * and the {@link Extension.exports exports}-property, like below:
   *
   * ```typescript
   * const podmanExtension = extensions.getExtension('podman-desktop.podman');
   * const podmanExtensionAPI = podmanExtension.exports;
   *
   * podmanExtensionAPI....
   * ```
   */
  export namespace extensions {
    /**
     * Get an extension by its full identifier in the form of: `publisher.name`.
     *
     * @param extensionId An extension identifier.
     * @returns An extension or `undefined`.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function getExtension<T = any>(extensionId: string): Extension<T> | undefined;

    /**
     * All extensions currently known to the system.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export const all: readonly Extension<any>[];

    /**
     * An event which fires when `extensions.all` changes. This can happen when extensions are
     * installed, uninstalled, enabled or disabled.
     */
    export const onDidChange: Event<void>;
  }

  /**
   * A provider result represents the values a provider, like the {@linkcode ImageCheckerProvider},
   * may return. For once this is the actual result type `T`, like `ImageChecks`, or a Promise that resolves
   * to that type `T`. In addition, `null` and `undefined` can be returned - either directly or from a
   * Promise.
   *
   * The snippets below are all valid implementations of the {@linkcode ImageCheckerProvider}:
   *
   * ```ts
   * let a: ImageCheckerProvider = {
   *  check(image: ImageInfo, token?: CancellationToken): ProviderResult<ImageChecks> {
   *    return new ImageChecks();
   *  }
   *
   * let b: ImageCheckerProvider = {
   *  async check(image: ImageInfo, token?: CancellationToken): ProviderResult<ImageChecks> {
   * 		return new ImageChecks();
   * 	}
   * }
   *
   * let c: ImageCheckerProvider = {
   *  check(image: ImageInfo, token?: CancellationToken): ProviderResult<ImageChecks> {
   * 		return; // undefined
   * 	}
   * }
   * ```
   */
  export type ProviderResult<T> = T | undefined | Promise<T | undefined>;

  export type ProviderStatus =
    | 'not-installed'
    | 'installed'
    | 'configuring'
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

  // For displaying essential information to the user
  // "name" of the warning / title and a "details" field for more information
  export interface ProviderInformation {
    name: string;
    details?: string;
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

    // Provide way to add additional warnings to the provider
    warnings?: ProviderInformation[];

    // Provide the message to display when the provider has no connections
    emptyConnectionMarkdownDescription?: string;
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
    start?(startContext: LifecycleContext, logger?: Logger): Promise<void>;
    stop?(stopContext: LifecycleContext, logger?: Logger): Promise<void>;
    delete?(logger?: Logger): Promise<void>;
    edit?(
      editContext: LifecycleContext,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: { [key: string]: any },
      logger?: Logger,
      token?: CancellationToken,
    ): Promise<void>;
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

  export interface PodCreatePortOptions {
    host_ip: string;
    container_port: number;
    host_port: number;
    protocol: string;
    range: number;
  }

  export interface PodCreateOptions {
    /**
     * Name is the name of the pod. If not provided, a name will be generated when the pod is created. Optional.
     */
    name?: string;
    /**
     * PortMappings is a set of ports to map into the infra container.
     * As, by default, containers share their network with the infra container, this will forward the ports to the entire pod.
     * Only available if NetNS is set to Bridge, Slirp, or Pasta.
     */
    portmappings?: PodCreatePortOptions[];
    /**
     * Labels are key-value pairs that are used to add metadata to pods. Optional.
     */
    labels?: { [key: string]: string };
    // Set the provider to use, if not we will try select the first one available (sorted in favor of Podman).
    provider?: ContainerProviderConnection;
    /**
     * Map of networks names to ids the container should join to.
     * You can request additional settings for each network, you can set network aliases,
     *
     * @remarks
     * {@link PodCreateOptions.netns.nsmode} need to be set to `bridge` to join a network
     */
    Networks?: {
      [key: string]: {
        aliases?: string[];
        interface_name?: string;
      };
    };
    /**
     * Network namespace
     */
    netns?: {
      /**
       * NamespaceMode
       * @example
       * `bridge` indicates that the network backend (CNI/netavark) should be used.
       * @example
       * `pasta` indicates that a pasta network stack should be used.
       */
      nsmode: string;
    };
    /**
     * ExitPolicy determines the pod's exit and stop behaviour.
     * @example
     * "continue": the pod continues running. This is the default policy
     * when creating a pod.
     *
     * @example
     * "stop": stop the pod when the last container exits. This is the
     * default behaviour for play kube.
     */
    exit_policy?: string;
  }

  export interface ManifestCreateOptions {
    images: string[];
    name: string;
    amend?: boolean;
    all?: boolean;

    // Provider to use for the manifest creation, if not, we will try to select the first one available (similar to podCreate)
    provider?: ContainerProviderConnection;
  }
  export interface ManifestInspectInfo {
    engineId: string;
    engineName: string;
    manifests: {
      digest: string;
      mediaType: string;
      platform: {
        architecture: string;
        features?: string[];
        os: string;
        variant?: string;
      };
      size: number;
      urls?: string[];
    }[];
    mediaType: string;
    schemaVersion: number;
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

  // common set of options for creating a provider
  export interface ProviderConnectionFactory {
    // Allow to initialize a provider
    initialize?(): Promise<void>;

    // Optional display name when creating the provider. For example 'Podman Machine' or 'Kind Cluster', etc.
    creationDisplayName?: string;

    // Optional button title when creating the provider. Default is 'Create new'.
    creationButtonTitle?: string;
  }

  // create programmatically a ContainerProviderConnection
  export interface ContainerProviderConnectionFactory extends ProviderConnectionFactory {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create(params: { [key: string]: any }, logger?: Logger, token?: CancellationToken): Promise<void>;
  }

  // create a kubernetes provider
  export interface KubernetesProviderConnectionFactory extends ProviderConnectionFactory {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create?(params: { [key: string]: any }, logger?: Logger, token?: CancellationToken): Promise<void>;
  }

  export interface AuditRecord {
    type: 'info' | 'warning' | 'error';
    record: string;
  }

  export interface AuditResult {
    records: AuditRecord[];
  }

  export interface AuditRequestItems {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  export interface Auditor {
    auditItems(items: AuditRequestItems): Promise<AuditResult>;
  }

  export interface Link {
    title: string;
    url: string;
    group?: string;
  }
  export type CheckResultLink = Link;

  export interface CheckResultFixCommand {
    id: string;
    title: string;
  }

  export interface CheckResult {
    successful: boolean;
    description?: string;
    docLinksDescription?: string;
    docLinks?: CheckResultLink[];
    fixCommand?: CheckResultFixCommand;
  }

  export interface InstallCheck {
    title: string;
    execute(): Promise<CheckResult>;
    init?(): Promise<void>;
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

    preflightChecks?(): InstallCheck[];
  }

  /**
   * By providing this interface, when Podman Desktop is starting
   * It'll start the provider through this interface.
   * It can be turned off/on by the user.
   */
  export interface ProviderAutostart {
    start(logger: Logger): Promise<void>;
  }

  /**
   * Allow to clean some resources in case for example
   */
  export interface ProviderCleanup {
    getActions(): Promise<ProviderCleanupAction[]>;
  }

  export interface ProviderCleanupExecuteOptions {
    logger: Logger;
    token?: CancellationToken;
  }

  // describe the action to perform
  // for example, "remove a folder" or 'kill foo process'
  export interface ProviderCleanupAction {
    name: string;
    // execute the action (can be canceled)
    execute(options: ProviderCleanupExecuteOptions): Promise<void>;
  }

  export type ProviderLinks = Link;

  export interface ProviderImages {
    icon?: string | { light: string; dark: string };
    logo?: string | { light: string; dark: string };
  }

  export interface Provider {
    setContainerProviderConnectionFactory(
      containerProviderConnectionFactory: ContainerProviderConnectionFactory,
      connectionAuditor?: Auditor,
    ): Disposable;
    setKubernetesProviderConnectionFactory(
      containerProviderConnectionFactory: KubernetesProviderConnectionFactory,
      connectionAuditor?: Auditor,
    ): Disposable;

    registerContainerProviderConnection(connection: ContainerProviderConnection): Disposable;
    registerKubernetesProviderConnection(connection: KubernetesProviderConnection): Disposable;
    registerLifecycle(lifecycle: ProviderLifecycle): Disposable;

    // register installation flow
    registerInstallation(installation: ProviderInstallation): Disposable;

    // register update flow
    registerUpdate(update: ProviderUpdate): Disposable;

    // register autostart flow
    registerAutostart(autostart: ProviderAutostart): Disposable;

    registerCleanup(cleanup: ProviderCleanup): Disposable;

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

    // update warning information for the provider
    readonly warnings: ProviderInformation[];
    updateWarnings(warnings: ProviderInformation[]): void;

    // notify that detection checks have changed
    onDidUpdateDetectionChecks: Event<ProviderDetectionCheck[]>;
  }

  export namespace commands {
    /**
     * Define a command, to be executed later, either by calling {@link commands.executeCommand} or by referencing its name in the `command` field of a {@link StatusBarItem}.
     *
     * @param command the name of the command. The name must be unique over all extensions. It is recommended to prefix this name with the name of the extension, to avoid conflicts with commands from other extensions.
     * @param callback the command to execute
     * @param thisArg The value of `this` provided for the call to callback
     * @returns A disposable that unregisters this command when being disposed
     * @throws if a command with the same name is already registered.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function registerCommand(command: string, callback: (...args: any[]) => any, thisArg?: any): Disposable;
    /**
     * Execute a command, previously registered with {@link commands.registerCommand}
     *
     * @param command the name used for registering the command
     * @param rest the parameters to pass to the command
     * @param T the type of the value returned by the command
     * @returns the value returned by the command
     * @throws if the command is not registered
     * @throws if the command throws an exception
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function executeCommand<T = unknown>(command: string, ...rest: any[]): PromiseLike<T>;
  }

  export interface ProviderEvent {
    id: string;
    name: string;
    status: ProviderStatus;
  }

  export interface UpdateContainerConnectionEvent {
    providerId: string;
    connection: ContainerProviderConnection;
    status: ProviderConnectionStatus;
  }

  export interface UpdateKubernetesConnectionEvent {
    providerId: string;
    connection: KubernetesProviderConnection;
    status: ProviderConnectionStatus;
  }

  export interface UnregisterContainerConnectionEvent {
    providerId: string;
  }
  export interface UnregisterKubernetesConnectionEvent {
    providerId: string;
  }
  export interface RegisterKubernetesConnectionEvent {
    providerId: string;
  }
  export interface RegisterContainerConnectionEvent {
    providerId: string;
    connection: ContainerProviderConnection;
  }
  export interface ProviderContainerConnection {
    providerId: string;
    connection: ContainerProviderConnection;
  }

  /**
   * the description of a file in an image filesystem layer
   */
  export interface ImageFile {
    path: string;
    type: 'directory' | 'symlink' | 'file';
    // File mode encoded on 4 octal digits
    mode: number;
    uid: number;
    gid: number;
    size: number;
    ctime: Date;
    atime: Date;
    mtime: Date;
  }

  /**
   * the description of a symlink in an image filesystem layer
   */
  export interface ImageFileSymlink extends ImageFile {
    type: 'symlink';
    // path of the target file
    linkPath: string;
  }

  /**
   * a filesystem layer of an image as defined by [spec](https://github.com/opencontainers/image-spec/blob/main/spec.md)
   */
  export interface ImageFilesystemLayer {
    /**
     * unique id of the layer
     */
    id: string;
    /**
     * the command which created the layer
     */
    createdBy?: string;
    /**
     * files indicate the paths of the files added or modified in the layer
     */
    files?: ImageFile[];
    /**
     * whiteouts indicate the paths of the files to be deleted from previous layers.
     */
    whiteouts?: string[];
    /**
     * opaque whiteouts indicate the directories in which the content has to be completely deleted from previous layers.
     */
    opaqueWhiteouts?: string[];
  }

  /**
   * the complete list of filesystem layers
   */
  export interface ImageFilesystemLayers {
    layers: ImageFilesystemLayer[];
  }

  /**
   * Interface to be implemented by image files providers
   */
  export interface ImageFilesCallbacks {
    /**
     *
     * @param image Info about the image
     * @param token a cancellation token the function can use to be informed when the caller asks for the operation to be cancelled
     * @return the complete result of the layers, either synchronously of through a Promise
     */
    getFilesystemLayers(image: ImageInfo, token?: CancellationToken): ProviderResult<ImageFilesystemLayers>;
  }

  /**
   * Provider returned to the extension when calling createImageFilesProvider
   * Provides helper functions for building the response of the `createImageFilesProvider` callback
   */
  export interface ImageFilesProvider extends Disposable {
    /**
     * add a file to the layer
     */
    addFile(layer: ImageFilesystemLayer, opts: { path: string; mode: number; size: number }): ImageFilesProvider;
    /**
     * add a directory to the layer
     */
    addDirectory(layer: ImageFilesystemLayer, opts: { path: string; mode: number }): ImageFilesProvider;
    /**
     * add a symbolic link to the layer
     */
    addSymlink(layer: ImageFilesystemLayer, opts: { path: string; mode: number; linkPath: string }): ImageFilesProvider;
    /**
     * add a file or directory to remove from previous layers
     * @param path
     */
    addWhiteout(layer: ImageFilesystemLayer, path: string): ImageFilesProvider;
    /**
     * add a complete directory to remove from previous layers
     * @param path
     */
    addOpaqueWhiteout(layer: ImageFilesystemLayer, path: string): ImageFilesProvider;
  }

  export interface ImageFilesProviderMetadata {
    readonly label: string;
  }

  export namespace provider {
    export function createProvider(provider: ProviderOptions): Provider;
    export const onDidUpdateProvider: Event<ProviderEvent>;
    export const onDidUpdateContainerConnection: Event<UpdateContainerConnectionEvent>;
    export const onDidUpdateKubernetesConnection: Event<UpdateKubernetesConnectionEvent>;
    export const onDidUnregisterContainerConnection: Event<UnregisterContainerConnectionEvent>;
    export const onDidRegisterContainerConnection: Event<RegisterContainerConnectionEvent>;
    export function getContainerConnections(): ProviderContainerConnection[];
    /**
     * It returns the lifecycle context for the provider connection.
     * If no context is found it throws an error
     *
     * @param providerId the provider id
     * @param containerProviderConnection the connection to retrieve the lifecycle context for
     * @returns the lifecycle context
     * @throws if no provider with the id has been found or there is no context associate to it.
     */
    export function getProviderLifecycleContext(
      providerId: string,
      containerProviderConnection: ContainerProviderConnection,
    ): LifecycleContext;
    /**
     * @beta Register the extension as an Image Files provider.
     *
     * As an image files provider, a provider needs to implement a specific interface, so the core
     * application can call the provider with specific tasks when necessary.
     *
     * @param imageFilesCallbacks an object implementing the `ImageFilesProvider` interface
     * @param metadata optional metadata attached to this provider
     * @return A disposable that unregisters this provider when being disposed
     */
    export function createImageFilesProvider(
      imageFilesCallbacks: ImageFilesCallbacks,
      metadata?: ImageFilesProviderMetadata,
    ): ImageFilesProvider;
  }

  export interface ProxySettings {
    httpProxy: string | undefined;
    httpsProxy: string | undefined;
    noProxy: string | undefined;
  }

  export namespace proxy {
    export function getProxySettings(): ProxySettings | undefined;
    export function setProxy(proxySettings: ProxySettings): Promise<void>;
    // Podman Desktop has updated the settings, propagates the changes to the provider.
    export const onDidUpdateProxy: Event<ProxySettings>;

    // The state of the proxy
    export function isEnabled(): boolean;
    export const onDidStateChange: Event<boolean>;
  }

  // An interface for "Default" registries that include the name, URL as well as an icon
  // This allows an extension to "suggest" a registry to the user that you may
  // login via a username & password.
  export interface RegistrySuggestedProvider {
    name: string;
    url: string;

    // Optional base64 PNG image (for transparency / non vector icons)
    icon?: string;
  }

  export interface Registry extends RegistryCreateOptions {
    source: string;

    // Optional name and icon for the registry when it's being added (used for display within the UI)
    name?: string;
    icon?: string;
  }

  export interface RegistryCreateOptions {
    serverUrl: string;
    username: string;
    secret: string;
    insecure?: boolean;
    alias?: string;
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

    // suggest a registry to be included on the registry settings page
    export function suggestRegistry(registry: RegistrySuggestedProvider): Disposable;

    export const onDidRegisterRegistry: Event<Registry>;
    export const onDidUpdateRegistry: Event<Registry>;
    export const onDidUnregisterRegistry: Event<Registry>;
  }

  export namespace tray {
    /**
     * Creates a menu not related to a Provider
     * @param item the item to add in the tray menu
     */
    export function registerMenuItem(item: MenuItem): Disposable;

    /**
     * Creates a menu in the tray for a given Provider
     * @param providerId the same as the id on Provider provided by createProvider() method, need to place menu item properly
     * @param item
     */
    export function registerProviderMenuItem(providerId: string, item: MenuItem): Disposable;
  }

  export namespace configuration {
    export function getConfiguration(section?: string, scope?: ConfigurationScope): Configuration;

    /**
     * An event that is emitted when the {@link Configuration configuration} changed.
     */
    export const onDidChangeConfiguration: Event<ConfigurationChangeEvent>;
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
    update(section: string, value: any): Promise<void>;

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
     *
     * @deprecated This value is deprecated as it does not render equally on various supported platforms. It will be
     * removed in future versions of Podman Desktop. We strongly encourage to use TASK_WIDGET instead.
     * @see TASK_WIDGET
     */
    APP_ICON = 1,

    /**
     * Show progress in the task manager widget
     */
    TASK_WIDGET = 2,
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

  export class CancellationTokenSource {
    /**
     * The cancellation token of this source.
     */
    token: CancellationToken;

    /**
     * Signal cancellation on the token.
     */
    cancel(): void;

    /**
     * Dispose object and free resources.
     */
    dispose(): void;
  }

  /**
   * Impacts the behavior and appearance of the validation message.
   */
  export enum InputBoxValidationSeverity {
    Info = 1,
    Warning = 2,
    Error = 3,
  }

  /**
   * Object to configure the behavior of the validation message.
   */
  export interface InputBoxValidationMessage {
    /**
     * The validation message to display.
     */
    readonly message: string;

    /**
     * The severity of the validation message.
     * NOTE: When using `InputBoxValidationSeverity.Error`, the user will not be allowed to accept (hit ENTER) the input.
     * `Info` and `Warning` will still allow the InputBox to accept the input.
     */
    readonly severity: InputBoxValidationSeverity;
  }

  /**
   * Options to configure the behavior of the input box UI.
   */
  export interface InputBoxOptions {
    /**
     * An optional string that represents the title of the input box.
     */
    title?: string;

    /**
     * The value to pre-fill in the input box.
     */
    value?: string;

    /**
     * Selection of the pre-filled {@linkcode InputBoxOptions.value value}. Defined as tuple of two number where the
     * first is the inclusive start index and the second the exclusive end index. When `undefined` the whole
     * pre-filled value will be selected, when empty (start equals end) only the cursor will be set,
     * otherwise the defined range will be selected.
     */
    valueSelection?: [number, number];

    /**
     * The text to display underneath the input box.
     */
    prompt?: string;

    /**
     * A description of the field to be show (Markdown format)
     */
    markdownDescription?: string;

    /**
     * An optional string to show as placeholder in the input box to guide the user what to type.
     */
    placeHolder?: string;

    /**
     * Controls if a password input is shown. Password input hides the typed text.
     */
    password?: boolean;

    /**
     * Set to `true` to keep the input box open when focus moves to another part of the editor or to another window.
     * This setting is ignored on iPad and is always false.
     */
    ignoreFocusOut?: boolean;

    /**
     * Set to `true` when value represents a multi line content.
     */
    multiline?: boolean;

    /**
     * An optional function that will be called to validate input and to give a hint
     * to the user.
     *
     * @param value The current value of the input box.
     * @return Either a human-readable string which is presented as an error message or an {@link InputBoxValidationMessage}
     *  which can provide a specific message severity. Return `undefined`, `null`, or the empty string when 'value' is valid.
     */
    validateInput?(
      value: string,
    ):
      | string
      | InputBoxValidationMessage
      | undefined
      | null
      | Promise<string | InputBoxValidationMessage | undefined | null>;
  }

  /**
   * The kind of {@link QuickPickItem quick pick item}.
   */
  export enum QuickPickItemKind {
    /**
     * When a {@link QuickPickItem} has a kind of {@link Separator}, the item is just a visual separator and does not represent a real item.
     * The only property that applies is {@link QuickPickItem.label label }. All other properties on {@link QuickPickItem} will be ignored and have no effect.
     */
    Separator = -1,
    /**
     * The default {@link QuickPickItem.kind} is an item that can be selected in the quick pick.
     */
    Default = 0,
  }

  /**
   * Button for an action in a {@link QuickPick} or {@link InputBox}.
   */
  export interface QuickInputButton {
    /**
     * Icon for the button.
     */
    readonly iconPath: Uri | { light: Uri; dark: Uri };

    /**
     * An optional tooltip.
     */
    readonly tooltip?: string;
  }

  /**
   * Options to configure the behavior of the quick pick UI.
   */
  export interface QuickPickOptions {
    /**
     * An optional string that represents the title of the quick pick.
     */
    title?: string;

    /**
     * An optional flag to include the description when filtering the picks.
     */
    matchOnDescription?: boolean;

    /**
     * An optional flag to include the detail when filtering the picks.
     */
    matchOnDetail?: boolean;

    /**
     * An optional string to show as placeholder in the input box to guide the user what to pick on.
     */
    placeHolder?: string;

    /**
     * Set to `true` to keep the picker open when focus moves to another part of the editor or to another window.
     * This setting is ignored on iPad and is always false.
     */
    ignoreFocusOut?: boolean;

    /**
     * An optional flag to make the picker accept multiple selections, if true the result is an array of picks.
     */
    canPickMany?: boolean;

    /**
     * An optional function that is invoked whenever an item is selected.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDidSelectItem?(item: QuickPickItem | string): any;
  }

  /**
   * Represents an item that can be selected from
   * a list of items.
   */
  export interface QuickPickItem {
    /**
     * A human-readable string which is rendered prominent. Supports rendering of {@link ThemeIcon theme icons} via
     * the `$(<name>)`-syntax.
     */
    label: string;

    /**
     * The kind of QuickPickItem that will determine how this item is rendered in the quick pick. When not specified,
     * the default is {@link QuickPickItemKind.Default}.
     */
    kind?: QuickPickItemKind;

    /**
     * A human-readable string which is rendered less prominent in the same line. Supports rendering of
     * {@link ThemeIcon theme icons} via the `$(<name>)`-syntax.
     *
     * Note: this property is ignored when {@link QuickPickItem.kind kind} is set to {@link QuickPickItemKind.Separator}
     */
    description?: string;

    /**
     * A human-readable string which is rendered less prominent in a separate line. Supports rendering of
     * {@link ThemeIcon theme icons} via the `$(<name>)`-syntax.
     *
     * Note: this property is ignored when {@link QuickPickItem.kind kind} is set to {@link QuickPickItemKind.Separator}
     */
    detail?: string;

    /**
     * Optional flag indicating if this item is picked initially. This is only honored when using
     * the {@link window.showQuickPick showQuickPick()} API. To do the same thing with
     * the {@link window.createQuickPick createQuickPick()} API, simply set the {@link QuickPick.selectedItems}
     * to the items you want picked initially.
     * (*Note:* This is only honored when the picker allows multiple selections.)
     *
     * @see {@link QuickPickOptions.canPickMany}
     *
     * Note: this property is ignored when {@link QuickPickItem.kind kind} is set to {@link QuickPickItemKind.Separator}
     */
    picked?: boolean;

    /**
     * Always show this item.
     *
     * Note: this property is ignored when {@link QuickPickItem.kind kind} is set to {@link QuickPickItemKind.Separator}
     */
    alwaysShow?: boolean;

    /**
     * Optional buttons that will be rendered on this particular item. These buttons will trigger
     * an {@link QuickPickItemButtonEvent} when clicked. Buttons are only rendered when using a quickpick
     * created by the {@link window.createQuickPick createQuickPick()} API. Buttons are not rendered when using
     * the {@link window.showQuickPick showQuickPick()} API.
     *
     * Note: this property is ignored when {@link QuickPickItem.kind kind} is set to {@link QuickPickItemKind.Separator}
     */
    buttons?: readonly QuickInputButton[];
  }

  /**
   * Represents an item that can be selected from
   * a list of items.
   */
  export interface CustomPickSectionItem {
    /**
     * A human-readable string which is rendered prominent.
     */
    title: string;

    /**
     * A human-readable string which is rendered in a separate line.
     */
    content?: string;

    /**
     * A human-readable string which is rendered in a separate line. (Markdown format)
     */
    markDownContent?: string;
  }

  /**
   * Represents an item that can be selected from
   * a list of items.
   */
  export interface CustomPickItem {
    /**
     * A human-readable string which is rendered prominent.
     */
    title: string;
    /**
     * A human-readable string which is rendered less prominent in the same line.
     */
    description?: string;
    /**
     * A human-readable string which is rendered in a separate line. (Markdown format)
     */
    markDownContent: string;
    /**
     * Optional sections that will be rendered in separate lines
     */
    sections?: CustomPickSectionItem[];
    /**
     * Optional flag indicating if this item is selected initially
     */
    selected?: boolean;
  }

  /**
   * A concrete CustomPick to let the user pick an item from a list of items of type T.
   * The items are rendered using a custom UI.
   */
  export interface CustomPick<T extends CustomPickItem> {
    /**
     * An optional human-readable string which is rendered prominent.
     */
    title?: string;
    /**
     * An optional human-readable string which is rendered less prominent in a separate line.
     */
    description?: string;
    /**
     * An optional base64 PNG image
     */
    icon?: string | { light: string; dark: string };
    /**
     * Items to pick from. This can be read and updated by the extension.
     */
    items: T[];
    /**
     * If multiple items can be selected at the same time. Defaults to false.
     */
    canSelectMany: boolean;
    /**
     * If the additional sections of an item should be hidden by default when the dialog opens up.
     * The user can still open them by clicking on the 'show more' button.
     * Defaults to false.
     */
    hideItemSections: boolean;
    /**
     * When a custompick is closed (the sections are hidden) it is possible to set a minimum height so to force different items to have the same height.
     * It must be set using pixels or percentage (e.g 100px or 50%)
     * Use it carefully as it could break the layout.
     */
    minHeight?: string;
    /**
     * An event signaling when the user indicated confirmation of the selected item(s) index(es).
     */
    readonly onDidConfirmSelection: Event<number[]>;
    /**
     * An event signaling when this input UI is hidden.
     */
    readonly onDidHide: Event<void>;
    /**
     * Shows the custom pick.
     */
    show(): void;
    /**
     * Hides the custom pick.
     */
    hide(): void;

    /**
     * Dispose and free associated resources. Call
     * {@link CustomPick.hide}.
     */
    dispose(): void;
  }

  type NotificationType = 'info' | 'warn' | 'error';

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
    /**
     * The type of the notification. Default value: info
     */
    type?: NotificationType;
    /**
     * displayed below the description. It contains actions (like markdown commands/buttons and links)
     */
    markdownActions?: string;
    /**
     * this notification will be highlighted to the user so it draws attention
     */
    highlight?: boolean;
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
     * The identifier of a command, previously registered with {@link commands.registerCommand}, to run on click.
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

    /**
     * Dispose and free associated resources. Call
     * {@link StatusBarItem.hide}.
     */
    dispose(): void;
  }

  /**
   * Resource identifier for a resource
   */
  export class Uri {
    /**
     * Create an URI from a string, e.g. `http://www.example.com/some/path`,
     * `file:///usr/home`, or `scheme:with/path`.
     *
     * *Note* that for a while uris without a `scheme` were accepted. That is not correct
     * as all uris should have a scheme. To avoid breakage of existing code the optional
     * `strict`-argument has been added. We *strongly* advise to use it, e.g. `Uri.parse('my:uri', true)`
     *
     * @see {@link Uri.toString}
     * @param value The string value of an Uri.
     * @param strict Throw an error when `value` is empty or when no `scheme` can be parsed.
     * @return A new Uri instance.
     */
    static parse(value: string, strict?: boolean): Uri;

    /**
     * Create an URI from a file system path. The {@link Uri.scheme scheme}
     * will be `file`.
     */
    static file(path: string): Uri;

    /**
     * Create a new uri which path is the result of joining
     * the path of the base uri with the provided path segments.
     *
     * @param base An uri. Must have a path.
     * @param pathSegments One more more path fragments
     * @returns A new uri which path is joined with the given fragments
     */
    static joinPath(base: Uri, ...pathSegments: string[]): Uri;

    /**
     * Use the `file` and `parse` factory functions to create new `Uri` objects.
     */
    private constructor(scheme: string, authority: string, path: string, query: string, fragment: string);

    /**
     * Scheme is the `http` part of `http://www.example.com/some/path?query#fragment`.
     * The part before the first colon.
     */
    readonly scheme: string;

    /**
     * Authority is the `www.example.com` part of `http://www.example.com/some/path?query#fragment`.
     * The part between the first double slashes and the next slash.
     */
    readonly authority: string;

    /**
     * Path is the `/some/path` part of `http://www.example.com/some/path?query#fragment`.
     */
    readonly path: string;

    /**
     * The string representing the corresponding file system path of this Uri.
     */
    readonly fsPath: string;

    /**
     * Query is the `query` part of `http://www.example.com/some/path?query#fragment`.
     */
    readonly query: string;

    /**
     * Fragment is the `fragment` part of `http://www.example.com/some/path?query#fragment`.
     */
    readonly fragment: string;

    /**
     * Derive a new Uri from this Uri.
     *
     * ```ts
     * const foo = Uri.parse('http://foo');
     * const httpsFoo = foo.with({ scheme: 'https' });
     * // httpsFoo is now 'https://foo'
     * ```
     *
     * @param change An object that describes a change to this Uri. To unset components use `undefined` or
     *  the empty string.
     * @returns A new Uri that reflects the given change. Will return `this` Uri if the change
     *  is not changing anything.
     */
    with(change: {
      /**
       * The new scheme, defaults to this Uri's scheme.
       */
      scheme?: string;
      /**
       * The new authority, defaults to this Uri's authority.
       */
      authority?: string;
      /**
       * The new path, defaults to this Uri's path.
       */
      path?: string;
      /**
       * The new query, defaults to this Uri's query.
       */
      query?: string;
      /**
       * The new fragment, defaults to this Uri's fragment.
       */
      fragment?: string;
    }): Uri;

    toString(): string;
  }

  /**
   * Notifies changes on files or folders.
   */
  export interface FileSystemWatcher extends Disposable {
    readonly onDidCreate: Event<Uri>;
    readonly onDidChange: Event<Uri>;
    readonly onDidDelete: Event<Uri>;
  }

  export namespace fs {
    export function createFileSystemWatcher(path: string): FileSystemWatcher;
  }

  /**
   * Content settings for a webview.
   */
  export interface WebviewOptions {
    /**
     * Root paths from which the webview can load local (filesystem) resources using uris from `asWebviewUri`
     *
     * Default to the root folders of the current workspace plus the extension's install directory.
     *
     * Pass in an empty array to disallow access to any local resources.
     */
    readonly localResourceRoots?: readonly Uri[];
  }

  /**
   * Displays html content, similarly to an iframe.
   */
  export interface Webview {
    /**
     * Content settings for the webview.
     */
    options: WebviewOptions;

    /**
     * HTML contents of the webview.
     *
     * This should be a complete, valid html document. Changing this property causes the webview to be reloaded.
     *
     */
    html: string;

    /**
     * Fired when the webview content posts a message.
     *
     * Webview content can post strings or json serializable objects back to an extension.
     */
    readonly onDidReceiveMessage: Event<unknown>;

    /**
     * Post a message to the webview content.
     */
    postMessage(message: unknown): Promise<boolean>;

    /**
     * Convert a uri for the local file system to one that can be used inside webviews.
     */
    asWebviewUri(localResource: Uri): Uri;

    /**
     * Content security policy source for webview resources.
     *
     */
    readonly cspSource: string;
  }

  /**
   * A panel that contains a webview.
   */
  interface WebviewPanel {
    /**
     * Identifies the type of the webview panel.
     */
    readonly viewType: string;

    /**
     * Title of the panel shown in UI.
     */
    title: string;

    /**
     * Icon for the panel shown in UI.
     */
    iconPath?:
      | Uri
      | {
          /**
           * The icon path for the light theme.
           */
          readonly light: Uri;
          /**
           * The icon path for the dark theme.
           */
          readonly dark: Uri;
        };

    /**
     * {@linkcode Webview} belonging to the panel.
     */
    readonly webview: Webview;

    /**
     * Whether the panel is active (focused by the user).
     */
    readonly active: boolean;

    /**
     * Whether the panel is visible.
     */
    readonly visible: boolean;

    /**
     * Fired when the panel's view state changes.
     */
    readonly onDidChangeViewState: Event<WebviewPanelOnDidChangeViewStateEvent>;

    /**
     * Fired when the panel is disposed.
     *
     * This may be because the user closed the panel or because `.dispose()` was
     * called on it.
     *
     * Trying to use the panel after it has been disposed throws an exception.
     */
    readonly onDidDispose: Event<void>;

    /**
     * Show the webview panel.
     * @param preserveFocus When `true`, the webview will not take focus.
     */
    reveal(preserveFocus?: boolean): void;

    /**
     * Dispose of the webview panel.
     *
     * This closes the panel if it showing and disposes of the resources owned by the webview.
     * Webview panels are also disposed when the user closes the webview panel. Both cases
     * fire the `onDispose` event.
     */
    dispose(): void;
  }

  /**
   * Options to configure the behaviour of a file open dialog.
   */
  export interface OpenDialogOptions {
    /**
     * The resource the dialog shows when opened.
     */
    defaultUri?: Uri;

    /**
     * A human-readable string for the open button.
     */
    openLabel?: string;

    /**
     * Contains which features the dialog should use. The following values are
     * supported:
     */
    selectors?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles'>;

    /**
     * A set of file filters that are used by the dialog.
     */
    filters?: {
      extensions: string[];
      name: string;
    }[];

    /**
     * Dialog title.
     */
    title?: string;
  }

  /**
   * Options to configure the behaviour of a file save dialog.
   */
  export interface SaveDialogOptions {
    /**
     * The resource the dialog shows when opened.
     */
    defaultUri?: Uri;

    /**
     * A human-readable string for the save button.
     */
    saveLabel?: string;

    /**
     * A set of file filters that are used by the dialog.
     */
    filters?: {
      extensions: string[];
      name: string;
    }[];

    /**
     * Dialog title.
     */
    title?: string;
  }

  /**
   * Event fired when a webview panel's view state changes.
   */
  export interface WebviewPanelOnDidChangeViewStateEvent {
    /**
     * Webview panel whose view state changed.
     */
    readonly webviewPanel: WebviewPanel;
  }

  export namespace window {
    /**
     * Show an information message. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A promise that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showInformationMessage(message: string, ...items: string[]): Promise<string | undefined>;

    /**
     * Show a warning message. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A promise that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showWarningMessage(message: string, ...items: string[]): Promise<string | undefined>;

    /**
     * Show a error message. Optionally provide an array of items which will be presented as
     * clickable buttons.
     *
     * @param message The message to show.
     * @param items A set of items that will be rendered as actions in the message.
     * @return A promise that resolves to the selected item or `undefined` when being dismissed.
     */
    export function showErrorMessage(message: string, ...items: string[]): Promise<string | undefined>;

    /**
     * Show progress in Podman Desktop. Progress is shown while running the given callback
     * and while the promise it returned isn't resolved nor rejected. The location at which
     * progress should show (and other details) is defined via the passed {@linkcode ProgressOptions}.
     *
     * @param options the options for the task's details
     * @param task A callback returning a promise. Progress state can be reported with
     * the provided {@link Progress}-object.
     *
     * To report discrete progress, use `increment` to indicate how much work has been completed. Each call with
     * a `increment` value will be summed up and reflected as overall progress until 100% is reached (a value of
     * e.g. `10` accounts for `10%` of work done).
     * Note that currently only `ProgressLocation.Notification` is capable of showing discrete progress.
     *
     * To monitor if the operation has been cancelled by the user, use the provided {@linkcode CancellationToken}.
     * Note that currently only `ProgressLocation.Notification` is supporting to show a cancel button to cancel the
     * long-running operation.
     *
     * @return The promise the task-callback returned.
     *
     * @example
     * Here is a simple example
     * ```ts
     * await window.withProgress({ location: ProgressLocation.TASK_WIDGET, title: `Running task` },
     *   async progress => {
     *     progress.report({message: 'task1' });
     *     await task1();
     *     progress.report({increment: 50, message: 'task2' });
     *     await task2();
     *   },
     * );
     * ```
     * @example
     * The error is propagated if thrown inside the task callback.
     * ```ts
     * try {
     *    await window.withProgress(
     *        { location: ProgressLocation.TASK_WIDGET, title: `Running task` },
     *        async progress => {
     *           throw new Error('error when running a task');
     *        },
     *      );
     *  } catch (error) {
     *     // do something with the error
     *  }
     * ```
     *
     * @example
     * You can return a value from the task callback
     * ```ts
     * const result: number = await window.withProgress<number>(
     *    { location: ProgressLocation.TASK_WIDGET, title: `Running task` },
     *    async progress => {
     *       // compute something
     *       return 55;
     *    },
     * );
     * ```
     */
    export function withProgress<R>(
      options: ProgressOptions,
      task: (progress: Progress<{ message?: string; increment?: number }>, token: CancellationToken) => Promise<R>,
    ): Promise<R>;

    /**
     * Show notification on different area of Podman Desktop based on its options (Dashboard, bell icon list, OS notification)
     * @param options define how the notification must be created.
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

    /**
     * Opens an input box to ask the user for input.
     *
     * The returned value will be `undefined` if the input box was canceled (e.g. pressing ESC). Otherwise the
     * returned value will be the string typed by the user or an empty string if the user did not type
     * anything but dismissed the input box with OK.
     *
     * @param options Configures the behavior of the input box.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to a string the user provided or to `undefined` in case of dismissal.
     */
    export function showInputBox(options?: InputBoxOptions, token?: CancellationToken): Promise<string | undefined>;

    /**
     * Shows a file open dialog to the user which allows to select a file
     * for opening-purposes.
     *
     * @param options Options that control the dialog.
     * @returns A promise that resolves to the selected resources or `undefined`.
     */
    export function showOpenDialog(options?: OpenDialogOptions): Promise<Uri[] | undefined>;

    /**
     * Shows a file save dialog to the user which allows to select a file
     * for saving-purposes.
     *
     * @param options Options that control the dialog.
     * @returns A promise that resolves to the selected resource or `undefined`.
     */
    export function showSaveDialog(options?: SaveDialogOptions): Promise<Uri | undefined>;

    /**
     * Shows a selection list allowing multiple selections.
     *
     * @param items An array of strings, or a promise that resolves to an array of strings.
     * @param options Configures the behavior of the selection list.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to the selected items or `undefined`.
     */
    export function showQuickPick(
      items: readonly string[] | Promise<readonly string[]>,
      options: QuickPickOptions & { canPickMany: true },
      token?: CancellationToken,
    ): Promise<string[] | undefined>;

    /**
     * Shows a selection list.
     *
     * @param items An array of strings, or a promise that resolves to an array of strings.
     * @param options Configures the behavior of the selection list.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to the selection or `undefined`.
     */
    export function showQuickPick(
      items: readonly string[] | Promise<readonly string[]>,
      options?: QuickPickOptions,
      token?: CancellationToken,
    ): Promise<string | undefined>;

    /**
     * Shows a selection list allowing multiple selections.
     *
     * @param items An array of items, or a promise that resolves to an array of items.
     * @param options Configures the behavior of the selection list.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to the selected items or `undefined`.
     */
    export function showQuickPick<T extends QuickPickItem>(
      items: readonly T[] | Promise<readonly T[]>,
      options: QuickPickOptions & { canPickMany: true },
      token?: CancellationToken,
    ): Promise<T[] | undefined>;

    /**
     * Shows a selection list.
     *
     * @param items An array of items, or a promise that resolves to an array of items.
     * @param options Configures the behavior of the selection list.
     * @param token A token that can be used to signal cancellation.
     * @return A promise that resolves to the selected item or `undefined`.
     */
    export function showQuickPick<T extends QuickPickItem>(
      items: readonly T[] | Promise<readonly T[]>,
      options?: QuickPickOptions,
      token?: CancellationToken,
    ): Promise<T | undefined>;

    /**
     * Creates a CustomPick to let the user pick an item from a list of items of type T using a custom UI.
     * @return A new CustomPick
     */
    export function createCustomPick<T extends CustomPickItem>(): CustomPick<T>;

    /**
     * Create and show a new webview panel.
     *
     * @param viewType Identifies the type of the webview panel.
     * @param title Title of the panel.
     * @param options Settings for the new panel.
     *
     * @returns New webview panel.
     */
    export function createWebviewPanel(viewType: string, title: string, options?: WebviewOptions): WebviewPanel;

    export function listWebviews(): Promise<WebviewInfo[]>;
  }

  export namespace kubernetes {
    // Path to the configuration file
    export function getKubeconfig(): Uri;
    export const onDidUpdateKubeconfig: Event<KubeconfigUpdateEvent>;
    export function setKubeconfig(kubeconfig: Uri): Promise<void>;

    /**
     * Create one or several Kubernetes resources on the Kubernetes contenxt.
     *
     * @param context the Kubernetes context to use
     * @param manifests the manifests to create as JSON objects
     */
    export function createResources(context: string, manifests: unknown[]): Promise<void>;

    /**
     * Add a KubernetesGenerator to KubernetesGeneratorRegistry
     * @param selector
     * @param provider the custom provider to add
     */
    export function registerKubernetesGenerator(provider: KubernetesGeneratorProvider): Disposable;
  }
  /**
   * An event describing the update in kubeconfig location
   */
  export interface KubeconfigUpdateEvent {
    readonly type: 'CREATE' | 'UPDATE' | 'DELETE';
    readonly location: Uri;
  }

  export type KubernetesGeneratorSelector = KubernetesGeneratorType | ReadonlyArray<KubernetesGeneratorType>;

  export type KubernetesGeneratorType = 'Compose' | 'Pod' | 'Container';

  /**
   * The result containing a Kubernetes config files
   */
  export interface GenerateKubeResult {
    yaml: string;
  }

  type KubernetesGeneratorArgument = {
    engineId: string;
    containers?: string[];
    pods?: string[];
    compose?: string[];
  };

  /**
   * The KubernetesGeneratorProvider allows an extension to register a custom Kube Generator for a specific
   * KubernetesGeneratorType.
   */
  export interface KubernetesGeneratorProvider {
    name: string;
    types: KubernetesGeneratorSelector;
    generate(kubernetesGeneratorArguments: KubernetesGeneratorArgument[]): Promise<GenerateKubeResult>;
  }

  export interface ImageInfo {
    engineId: string;
    engineName: string;
    Id: string;
    ParentId: string;
    RepoTags: string[] | undefined;
    RepoDigests?: string[];
    Created: number;
    Size: number;
    VirtualSize: number;
    SharedSize: number;
    Labels: { [label: string]: string };
    Containers: number;
    History?: string[];
    Digest: string;

    // isManifest will be returned and set to true if the image is identified to be a manifest list
    isManifest?: boolean;
  }

  export interface ImageInspectInfo {
    engineId: string;
    engineName: string;
    Id: string;
    RepoTags: string[];
    RepoDigests: string[];
    Parent: string;
    Comment: string;
    Created: string;
    Container: string;
    ContainerConfig: {
      Hostname: string;
      Domainname: string;
      User: string;
      AttachStdin: boolean;
      AttachStdout: boolean;
      AttachStderr: boolean;
      ExposedPorts: { [portAndProtocol: string]: unknown };
      Tty: boolean;
      OpenStdin: boolean;
      StdinOnce: boolean;
      Env: string[];
      Cmd: string[];
      ArgsEscaped: boolean;
      Image: string;
      Volumes: { [path: string]: unknown };
      WorkingDir: string;
      Entrypoint?: string | string[];
      OnBuild?: unknown[];
      Labels: { [label: string]: string };
    };
    DockerVersion: string;
    Author: string;
    Config: {
      Hostname: string;
      Domainname: string;
      User: string;
      AttachStdin: boolean;
      AttachStdout: boolean;
      AttachStderr: boolean;
      ExposedPorts: { [portAndProtocol: string]: unknown };
      Tty: boolean;
      OpenStdin: boolean;
      StdinOnce: boolean;
      Env: string[];
      Cmd: string[];
      ArgsEscaped: boolean;
      Image: string;
      Volumes: { [path: string]: unknown };
      WorkingDir: string;
      Entrypoint?: string | string[];
      OnBuild: unknown[];
      Labels: { [label: string]: string };
    };
    Architecture: string;
    Os: string;
    Size: number;
    VirtualSize: number;
    GraphDriver: {
      Name: string;
      Data: {
        DeviceId: string;
        DeviceName: string;
        DeviceSize: string;
      };
    };
    RootFS: {
      Type: string;
      Layers?: string[];
      BaseLayer?: string;
    };
  }

  export interface NetworkContainer {
    Name: string;
    EndpointID: string;
    MacAddress: string;
    IPv4Address: string;
    IPv6Address: string;
  }

  interface IPAM {
    Driver: string;
    Config?: Array<{ [key: string]: string }>;
    Options?: { [key: string]: string };
  }

  export interface NetworkInspectInfo {
    engineId: string;
    engineName: string;
    engineType: 'podman' | 'docker';
    Name: string;
    Id: string;
    Created: string;
    Scope: string;
    Driver: string;
    EnableIPv6: boolean;
    IPAM?: IPAM;
    Internal: boolean;
    Attachable: boolean;
    Ingress: boolean;
    ConfigFrom?: { Network: string };
    ConfigOnly: boolean;
    Containers?: { [id: string]: NetworkContainer };
    Options?: { [key: string]: string };
    Labels?: { [key: string]: string };
  }

  export interface ContainerInfo {
    engineId: string;
    engineName: string;
    engineType: 'podman' | 'docker';
    Id: string;
    Names: string[];
    Image: string;
    ImageID: string;
    Command: string;
    Created: number;
    Ports: Port[];
    Labels: { [label: string]: string };
    State: string;
    Status: string;
    HostConfig: {
      NetworkMode: string;
    };
    NetworkSettings: {
      Networks: { [networkType: string]: NetworkInfo };
    };
    Mounts: Array<{
      Name?: string;
      Type: string;
      Source: string;
      Destination: string;
      Driver?: string;
      Mode: string;
      RW: boolean;
      Propagation: string;
    }>;
  }

  interface Port {
    IP: string;
    PrivatePort: number;
    PublicPort: number;
    Type: string;
  }

  interface NetworkInfo {
    IPAMConfig?: unknown;
    Links?: unknown;
    Aliases?: unknown;
    NetworkID: string;
    EndpointID: string;
    Gateway: string;
    IPAddress: string;
    IPPrefixLen: number;
    IPv6Gateway: string;
    GlobalIPv6Address: string;
    GlobalIPv6PrefixLen: number;
    MacAddress: string;
  }

  interface PodContainerInfo {
    Id: string;
    Names: string;
    Status: string;
  }

  interface PodInfo {
    engineId: string;
    engineName: string;
    kind: 'kubernetes' | 'podman';
    Cgroup: string;
    Containers: PodContainerInfo[];
    Created: string;
    Id: string;
    InfraId: string;
    Labels: { [key: string]: string };
    Name: string;
    Namespace: string;
    Networks: string[];
    Status: string;
  }

  interface AuthConfig {
    username: string;
    password: string;
    serveraddress: string;
    email?: string;
  }

  interface RegistryConfig {
    [registryAddress: string]: {
      username: string;
      password: string;
    };
  }

  interface PortBinding {
    HostIp?: string;
    HostPort?: string;
  }

  interface PortMap {
    [key: string]: PortBinding[];
  }

  interface HostRestartPolicy {
    Name: string;
    MaximumRetryCount?: number;
  }

  type MountType = 'bind' | 'volume' | 'tmpfs';

  type MountConsistency = 'default' | 'consistent' | 'cached' | 'delegated';

  type MountPropagation = 'private' | 'rprivate' | 'shared' | 'rshared' | 'slave' | 'rslave';

  interface MountSettings {
    Target: string;
    Source: string;
    Type: MountType;
    ReadOnly?: boolean;
    Consistency?: MountConsistency;
    Mode?: string;
    BindOptions?: {
      Propagation: MountPropagation;
    };
    VolumeOptions?: {
      NoCopy: boolean;
      Labels: { [label: string]: string };
      DriverConfig: {
        Name: string;
        Options: { [option: string]: string };
      };
    };
    TmpfsOptions?: {
      SizeBytes: number;
      Mode: number;
    };
  }

  type MountConfig = MountSettings[];

  interface DeviceRequest {
    Driver?: string;
    Count?: number;
    DeviceIDs?: string[];
    Capabilities?: string[][];
    Options?: { [key: string]: string };
  }

  interface HostConfig {
    AutoRemove?: boolean;
    Binds?: string[];
    ContainerIDFile?: string;
    LogConfig?: {
      Type: string;
      Config: unknown;
    };
    NetworkMode?: string;
    PortBindings?: unknown;
    RestartPolicy?: HostRestartPolicy;
    VolumeDriver?: string;
    VolumesFrom?: unknown;
    Mounts?: MountConfig;
    CapAdd?: string[];
    CapDrop?: string[];
    Dns?: string[];
    DnsOptions?: unknown[];
    DnsSearch?: string[];
    ExtraHosts?: string[];
    GroupAdd?: string[];
    IpcMode?: string;
    Cgroup?: string;
    Links?: unknown;
    OomScoreAdj?: number;
    PidMode?: string;
    Privileged?: boolean;
    PublishAllPorts?: boolean;
    ReadonlyRootfs?: boolean;
    SecurityOpt?: string[];
    StorageOpt?: { [option: string]: string };
    Tmpfs?: { [dir: string]: string };
    UTSMode?: string;
    UsernsMode?: string;
    ShmSize?: number;
    Sysctls?: { [index: string]: string };
    Runtime?: string;
    ConsoleSize?: number[];
    Isolation?: string;
    MaskedPaths?: string[];
    ReadonlyPaths?: string[];
    CpuShares?: number;
    CgroupParent?: string;
    BlkioWeight?: number;
    BlkioWeightDevice?: unknown;
    BlkioDeviceReadBps?: unknown;
    BlkioDeviceWriteBps?: unknown;
    BlkioDeviceReadIOps?: unknown;
    BlkioDeviceWriteIOps?: unknown;
    CpuPeriod?: number;
    CpuQuota?: number;
    CpusetCpus?: string;
    CpusetMems?: string;
    Devices?: unknown;
    DeviceCgroupRules?: string[];
    DeviceRequests?: DeviceRequest[];
    DiskQuota?: number;
    KernelMemory?: number;
    Memory?: number;
    MemoryReservation?: number;
    MemorySwap?: number;
    MemorySwappiness?: number;
    NanoCpus?: number;
    OomKillDisable?: boolean;
    Init?: boolean;
    PidsLimit?: number;
    Ulimits?: unknown;
    CpuCount?: number;
    CpuPercent?: number;
    CpuRealtimePeriod?: number;
    CpuRealtimeRuntime?: number;
  }

  /**
   * HealthCheckResults describes the results/logs from a healthcheck
   */
  export interface HealthCheckResults {
    /**
     * Status is starting, healthy or unhealthy
     */
    Status: string;
    /**
     * FailingStreak is the number of consecutive failed healthchecks
     */
    FailingStreak: number;
    /**
     * Log describes healthcheck attempts and results
     */
    Log: HealthCheckLog[];
  }

  /**
   * HealthCheckLog describes the results of a single healthcheck
   */
  export interface HealthCheckLog {
    /**
     * Start time as string
     */
    Start: string;
    /**
     * End time as a string
     */
    End: string;
    /**
     * Exitcode is 0 or 1
     */
    ExitCode: number;
    /**
     *  Output is the stdout/stderr from the healthcheck command
     */
    Output: string;
  }

  export interface ContainerInspectInfo {
    engineId: string;
    engineName: string;
    Id: string;
    Created: string;
    Path: string;
    Args: string[];
    State: {
      Status: string;
      Running: boolean;
      Paused: boolean;
      Restarting: boolean;
      OOMKilled: boolean;
      Dead: boolean;
      Pid: number;
      ExitCode: number;
      Error: string;
      StartedAt: string;
      FinishedAt: string;
      Health?: HealthCheckResults;
    };
    Image: string;
    ResolvConfPath: string;
    HostnamePath: string;
    HostsPath: string;
    LogPath: string;
    Name: string;
    RestartCount: number;
    Driver: string;
    Platform: string;
    MountLabel: string;
    ProcessLabel: string;
    AppArmorProfile: string;
    ExecIDs?: string[];
    HostConfig: HostConfig;
    GraphDriver: {
      Name: string;
      Data: {
        DeviceId: string;
        DeviceName: string;
        DeviceSize: string;
      };
    };
    Mounts: Array<{
      Name?: string;
      Source: string;
      Destination: string;
      Mode: string;
      RW: boolean;
      Propagation: string;
    }>;
    Config: {
      Hostname: string;
      Domainname: string;
      User: string;
      AttachStdin: boolean;
      AttachStdout: boolean;
      AttachStderr: boolean;
      ExposedPorts: { [portAndProtocol: string]: unknown };
      Tty: boolean;
      OpenStdin: boolean;
      StdinOnce: boolean;
      Env: string[];
      Cmd: string[];
      Image: string;
      Volumes: { [volume: string]: unknown };
      WorkingDir: string;
      Entrypoint?: string | string[];
      OnBuild?: unknown;
      Labels: { [label: string]: string };
    };
    NetworkSettings: {
      Bridge: string;
      SandboxID: string;
      HairpinMode: boolean;
      LinkLocalIPv6Address: string;
      LinkLocalIPv6PrefixLen: number;
      Ports: {
        [portAndProtocol: string]: Array<{
          HostIp: string;
          HostPort: string;
        }>;
      };
      SandboxKey: string;
      SecondaryIPAddresses?: unknown;
      SecondaryIPv6Addresses?: unknown;
      EndpointID: string;
      Gateway: string;
      GlobalIPv6Address: string;
      GlobalIPv6PrefixLen: number;
      IPAddress: string;
      IPPrefixLen: number;
      IPv6Gateway: string;
      MacAddress: string;
      Networks: {
        [type: string]: {
          IPAMConfig?: unknown;
          Links?: unknown;
          Aliases?: unknown;
          NetworkID: string;
          EndpointID: string;
          Gateway: string;
          IPAddress: string;
          IPPrefixLen: number;
          IPv6Gateway: string;
          GlobalIPv6Address: string;
          GlobalIPv6PrefixLen: number;
          MacAddress: string;
        };
      };
      Node?: {
        ID: string;
        IP: string;
        Addr: string;
        Name: string;
        Cpus: number;
        Memory: number;
        Labels: unknown;
      };
    };
  }

  interface ContainerJSONEvent {
    type: string;
    status: string;
    id: string;
    Type?: string;
  }

  /**
   * Authentication credentials, used when pushing an image to a registry
   */
  interface ContainerAuthInfo {
    username: string;
    password: string;
    serveraddress: string;
    email?: string;
  }

  interface PullEvent {
    stream?: string;
    id?: string;
    status?: string;
    progress?: string;
    progressDetail?: {
      current?: number;
      total?: number;
    };
    error?: string;
    errorDetails?: { message?: string };
  }

  /**
   * Configuration options for defining a healthcheck for a container.
   * To get health check result you can use {@link containerEngine.inspectContainer} and inside the obtained {@link ContainerInspectInfo} you can access the `Status.Health` property containing a {@link HealthCheckResults}.
   */
  interface HealthConfig {
    /**
     * The test to perform.
     *
     * @example
     * // Inherit healthcheck from image
     * Test?: [];
     *
     * @example
     * // Disable healthcheck
     * Test?: ["NONE"];
     *
     * @example
     * // Execute command in host system
     * Test?: ["CMD", "curl", "http://localhost"];
     *
     * @example
     * // Podman will execute the command inside the target container and wait for either a "0" or "failure  exit" code.
     * Test?: ["CMD-SHELL", "curl http://localhost || exit 1"];
     */
    Test?: string[];

    /**
     * The time to wait between checks in nanoseconds. It should be 0 or at least 1000000 (1 ms). 0 means inherit.
     *
     * @example
     * // Set interval to 1 second
     * Interval?: 1000000000;
     */
    Interval?: number;

    /**
     * The time to wait before considering the check to have hung. It should be 0 or at least 1000000 (1 ms). 0 means inherit.
     *
     * @example
     * // Set timeout to 5 seconds
     * Timeout?: 5000000000;
     */
    Timeout?: number;

    /**
     * Start period for the container to initialize before starting health-retries countdown in nanoseconds. It should
     * be 0 or at least 1000000 (1 ms). 0 means inherit.
     *
     * @example
     * // Set start period to 2 seconds
     * StartPeriod?: 2000000000;
     */
    StartPeriod?: number;

    /**
     * The number of consecutive failures needed to consider a container as unhealthy. 0 means inherit.
     *
     * @example
     * // Set retries to 3
     * Retries?: 3;
     */
    Retries?: number;
  }

  interface EndpointIPAMConfig {
    IPv4Address?: string;
    IPv6Address?: string;
    LinkLocalIPs?: string[];
  }

  interface EndpointSettings {
    /**
     * EndpointIPAMConfig represents an endpoint's IPAM configuration.
     */
    IPAMConfig?: EndpointIPAMConfig;

    Links?: string[];

    /**
     * MAC address for the endpoint on this network. The network driver might ignore this parameter.
     */
    MacAddress?: string;

    Aliases?: string[];

    /**
     * Unique ID of the network.
     */
    NetworkID?: string;

    /**
     * Unique ID for the service endpoint in a Sandbox.
     */
    EndpointID?: string;

    /**
     * Gateway address for this network.
     */
    Gateway?: string;

    /**
     * IPv4 address.
     */
    IPAddress?: string;

    /**
     * Mask length of the IPv4 address.
     */
    IPPrefixLen?: number;

    /**
     * IPv6 gateway address.
     */
    IPv6Gateway?: string;

    /**
     * Global IPv6 address.
     */
    GlobalIPv6Address?: string;

    /**
     * Mask length of the global IPv6 address.
     */
    GlobalIPv6PrefixLen?: number;

    /**
     * DriverOpts is a mapping of driver options and values. These options are passed directly to the driver and are driver specific.
     */
    DriverOpts?: { [key: string]: string };

    /**
     * List of all DNS names an endpoint has on a specific network. This list is based on the container name, network
     * aliases, container short ID, and hostname.
     *
     * These DNS names are non-fully qualified but can contain several dots. You can get fully qualified DNS names by
     * appending `.<network-name>`. For instance, if container name is `my.ctr` and the network is named
     * `testnet`, `DNSNames` will contain `my.ctr` and the FQDN will be `my.ctr.testnet`.
     */
    DNSNames?: string[];
  }

  interface NetworkingConfig {
    EndpointsConfig?: { [key: string]: EndpointSettings };
  }

  export interface PodmanContainerCreateOptions {
    command?: string[];
    entrypoint?: string | string[];
    env?: { [key: string]: string };
    pod?: string;
    hostname?: string;
    image?: string;
    name?: string;
    mounts?: Array<{
      Name?: string;
      Type: string;
      Source: string;
      Destination: string;
      Driver?: string;
      Mode: string;
      RW: boolean;
      Propagation: string;
      Options?: string[];
    }>;
  }

  export interface ContainerCreateOptions {
    /**
     * Assign the specified name to the container. Must match the regular expression`/?[a-zA-Z0-9][a-zA-Z0-9_.-]+`. If not speficied, the platform assigns a unique name to the container
     */
    name?: string;

    /**
     *  Default: ""
     *
     * Platform in the format `os[/arch[/variant]]` used for image lookup.
     *
     * When specified, the daemon checks if the requested image is present in the local image cache with the given OS and Architecture, and otherwise returns a `404` status.
     *
     * If the option is not set, the host's native OS and Architecture are used to look up the image in the image cache. However, if no platform is passed and the given image does exist in the local image cache, but its OS or architecture does not match, the container is created with the available image, and a warning is added to the `Warnings` field in the response, for example;
     *
     * ```
     * WARNING: The requested image's platform (linux/arm64/v8) does not
     *          match the detected host platform (linux/amd64) and no
     *          specific platform was requested
     * ```
     */
    platform?: string;

    /**
     * The hostname to use for the container, as a valid RFC 1123 hostname
     */
    Hostname?: string;

    /**
     * The domain name to use for the container.
     */
    Domainname?: string;

    /**
     * The user that commands are run as inside the container
     */
    User?: string;

    /**
     * A list of environment variables to set inside the container in the form `["VAR=value", ...]`. A variable without `=` is removed from the environment, rather than to have an empty value
     */
    Env?: string[];

    /**
     * Environment files to use
     * */
    EnvFiles?: string[];

    /**
     * User-defined key/value metadata
     */
    Labels?: { [label: string]: string };

    /**
     * An object mapping ports to an empty object in the form: `{"<port>/<tcp|udp|sctp>": {}}`
     */
    // eslint-disable-next-line @typescript-eslint/ban-types
    ExposedPorts?: { [port: string]: {} };

    /**
     * Container configuration that depends on the host we are running on
     */
    HostConfig?: HostConfig;

    /**
     * The name (or reference) of the image to use when creating the container
     */
    Image?: string;

    /**
     * Attach standard streams to a TTY, including stdin if it is not closed (default false)
     */
    Tty?: boolean;

    /**
     * Command to run specified as an array of strings
     */
    Cmd?: string[];

    /**
     * The entry point for the container as a string or an array of strings.
     *
     * If the array consists of exactly one empty string (`[""]`) then the entry point is reset to system default (i.e., the entry point used by docker when there is no ENTRYPOINT instruction in the Containerfile).
     */
    Entrypoint?: string | string[];

    /**
     * Whether to attach to `stdin` (default false)
     */
    AttachStdin?: boolean;

    /**
     * Whether to attach to `stdout`(default false)
     */
    AttachStdout?: boolean;

    /**
     * Whether to attach to `stderr` (default false)
     */
    AttachStderr?: boolean;

    /**
     * Whether to open `stdin` (default false)
     */
    OpenStdin?: boolean;

    /**
     * Close `stdin` after one attached client disconnects (deafult false)
     */
    StdinOnce?: boolean;

    /**
     * Run the container in the background
     */
    Detach?: boolean;

    /**
     * Start the container immediately (default true)
     */
    start?: boolean;

    /**
     * A test to perform to check that the container is healthy. See {@link HealthConfig} for usage details
     */
    HealthCheck?: HealthConfig;

    /**
     *  Default: `false`
     *
     * Command is already escaped (Windows only)
     */
    ArgsEscaped?: boolean;

    /**
     * An object mapping mount point paths inside the container to empty objects.
     */
    Volumes?: { [volume: string]: object };

    /**
     * The working directory for commands to run in.
     */
    WorkingDir?: string;

    /**
     * Disable networking for the container.
     */
    NetworkDisabled?: boolean;

    /**
     * MAC address of the container.
     */
    MacAddress?: string;

    /**
     * `ONBUILD` metadata that were defined in the image's `Dockerfile`.
     */
    OnBuild?: string[];

    /**
     * Signal to stop a container as a string or unsigned integer.
     */
    StopSignal?: string;

    /**
     *  Default: `10`
     *
     * Timeout to stop a container in seconds.
     */
    StopTimeout?: number;

    /**
     * Shell for when `RUN`, `CMD`, and `ENTRYPOINT` uses a shell.
     */
    Shell?: string[];

    NetworkConfig?: NetworkingConfig;

    /**
     * Pod where to create the container in
     */
    pod?: string;
  }

  /**
   * Information about the container created by calling the {@link containerEngine.createContainer} method
   */
  export interface ContainerCreateResult {
    /**
     * a string uniquely identifying the created container, which can be used to execute other methods on the container ({@link containerEngine.deleteContainer}, {@link containerEngine.inspectContainer}, {@link containerEngine.startContainer}, {@link containerEngine.stopContainer}, {@link containerEngine.logsContainer})
     */
    id: string;
    /**
     * the engineId where the container is running
     */
    engineId: string;
  }

  export interface WebviewInfo {
    id: string;
    viewType: string;
    title: string;
  }

  export interface PidsStats {
    current?: number;
    limit?: number;
  }

  export interface BlkioStatEntry {
    major: number;
    minor: number;
    op: string;
    value: number;
  }

  export interface BlkioStats {
    io_service_bytes_recursive: BlkioStatEntry[];
    io_serviced_recursive: BlkioStatEntry[];
    io_queue_recursive: BlkioStatEntry[];
    io_service_time_recursive: BlkioStatEntry[];
    io_wait_time_recursive: BlkioStatEntry[];
    io_merged_recursive: BlkioStatEntry[];
    io_time_recursive: BlkioStatEntry[];
    sectors_recursive: BlkioStatEntry[];
  }

  export interface StorageStats {
    read_count_normalized?: number;
    read_size_bytes?: number;
    write_count_normalized?: number;
    write_size_bytes?: number;
  }

  export interface NetworkStats {
    [name: string]: {
      rx_bytes: number;
      rx_dropped: number;
      rx_errors: number;
      rx_packets: number;
      tx_bytes: number;
      tx_dropped: number;
      tx_errors: number;
      tx_packets: number;
      endpoint_id?: string; // not used on linux
      instance_id?: string; // not used on linux
    };
  }

  export interface MemoryStats {
    // Linux Memory Stats
    stats: {
      total_pgmajfault: number;
      cache: number;
      mapped_file: number;
      total_inactive_file: number;
      pgpgout: number;
      rss: number;
      total_mapped_file: number;
      writeback: number;
      unevictable: number;
      pgpgin: number;
      total_unevictable: number;
      pgmajfault: number;
      total_rss: number;
      total_rss_huge: number;
      total_writeback: number;
      total_inactive_anon: number;
      rss_huge: number;
      hierarchical_memory_limit: number;
      total_pgfault: number;
      total_active_file: number;
      active_anon: number;
      total_active_anon: number;
      total_pgpgout: number;
      total_cache: number;
      inactive_anon: number;
      active_file: number;
      pgfault: number;
      inactive_file: number;
      total_pgpgin: number;
    };
    max_usage: number;
    usage: number;
    failcnt: number;
    limit: number;

    // Windows Memory Stats
    commitbytes?: number;
    commitpeakbytes?: number;
    privateworkingset?: number;
  }

  export interface CPUUsage {
    percpu_usage: number[];
    usage_in_usermode: number;
    total_usage: number;
    usage_in_kernelmode: number;
  }

  export interface ThrottlingData {
    periods: number;
    throttled_periods: number;
    throttled_time: number;
  }

  export interface CPUStats {
    cpu_usage: CPUUsage;
    system_cpu_usage: number;
    online_cpus: number;
    throttling_data: ThrottlingData;
  }

  export interface ContainerStatsInfo {
    engineId: string;
    engineName: string;
    read: string;
    preread: string;
    pids_stats?: PidsStats;
    blkio_stats?: BlkioStats;
    num_procs: number;
    storage_stats?: StorageStats;
    networks: NetworkStats;
    memory_stats: MemoryStats;
    cpu_stats: CPUStats;
    precpu_stats: CPUStats;
  }

  export interface BuildImageOptions {
    /**
     * Specifies a Containerfile which contains instructions for building the image
     */
    containerFile?: string;

    /**
     * Specifies the name which is assigned to the resulting image if the build process completes successfully
     */
    tag?: string;

    /**
     * Set the os/arch of the built image (and its base image, when using one) to the provided value instead of using the current operating system and architecture of the host
     */
    platform?: string;

    /**
     * Set the provider to use, if not we will try select the first one available (sorted in favor of Podman)
     */
    provider?: ContainerProviderConnection;

    /**
     * The abort controller for running the build image operation
     */
    abortController?: AbortController;

    /**
     * Extra hosts to add to /etc/hosts
     */
    extrahosts?: string;

    /**
     * A Git repository URI or HTTP/HTTPS context URI. If the URI points to a single text file, the file’s contents are
     * placed into a file called Dockerfile and the image is built from that file. If the URI points to a tarball, the
     * file is downloaded by the daemon and the contents therein used as the context for the build. If the URI points
     * to a tarball and the dockerfile parameter is also specified, there must be a file with the corresponding path
     * inside the tarball.
     */
    remote?: string;

    /**
     * Default: false
     *
     * Suppress verbose build output.
     */
    q?: boolean;

    /**
     *  JSON array of images used for build cache resolution.
     */
    cachefrom?: string;

    /**
     * Attempt to pull the image even if an older image exists locally.
     */
    pull?: string;

    /**
     * Default: true
     *
     * Remove intermediate containers after a successful build.
     */
    rm?: boolean;

    /**
     * Default: false
     *
     * Always remove intermediate containers, even upon failure.
     */
    forcerm?: boolean;

    /**
     * Set memory limit for build.
     */
    memory?: number;

    /**
     * Total memory (memory + swap). Set as -1 to disable swap.
     */
    memswap?: number;

    /**
     * CPU shares (relative weight).
     */
    cpushares?: number;

    /**
     * CPUs in which to allow execution (e.g., 0-3, 0,1).
     */
    cpusetcpus?: number;

    /**
     * The length of a CPU period in microseconds.
     */
    cpuperiod?: number;

    /**
     * Microseconds of CPU time that the container can get in a CPU period.
     */
    cpuquota?: number;

    /**
     * JSON map of string pairs for build-time variables. Users pass these values at build-time. Docker uses the
     * buildargs as the environment context for commands run via the `Dockerfile` RUN instruction, or for variable
     * expansion in other `Dockerfilev` instructions. This is not meant for passing secret values.
     * For example, the build arg `FOO=bar` would become `{"FOO":"bar"}` in JSON. This would result in the query
     * parameter `buildargs={"FOO":"bar"}`. Note that `{"FOO":"bar"}` should be URI component encoded.
     */
    buildargs?: { [key: string]: string };

    /**
     * Size of `/dev/shm` in bytes. The size must be greater than 0. If omitted the system uses 64MB.
     */
    shmsize?: number;

    /**
     * Squash the resulting images layers into a single layer.
     */
    squash?: boolean;

    /**
     * Arbitrary key/value labels to set on the image, as a JSON map of string pairs.
     */
    labels?: { [key: string]: string };

    /**
     * Sets the networking mode for the run commands during build. Supported standard values are: `bridge`,
     * `host`, `none`, and `container:<name|id>`. Any other value is taken as a custom network's name or ID
     * to which this container should connect to.
     */
    networkmode?: string;

    /**
     * Default: ""
     *
     * Target build stage
     */
    target?: string;

    /**
     * Default: ""
     *
     * BuildKit output configuration
     */
    outputs?: string;

    /**
     * Default: false
     *
     * Do not use the cache when building the image.
     */
    nocache?: boolean;
  }

  export interface ListImagesOptions {
    /**
     * The provider we want to list the images. If not provided, will return all container images across all container engines.
     *
     * @defaultValue undefined
     */
    provider?: ContainerProviderConnection;
  }

  export interface NetworkCreateOptions {
    Name: string;
  }

  export interface NetworkCreateResult {
    Id: string;
  }

  /**
   * Resources information about a container engine
   */
  interface ContainerEngineInfo {
    /**
     * unique id identifying the container engine
     */
    engineId: string;
    /**
     * name of the container engine
     */
    engineName: string;
    /**
     * engine type, either 'podman' or 'docker'
     */
    engineType: 'podman' | 'docker';
    /**
     * number of CPUs available for the container engine
     */
    cpus?: number;
    /**
     * Percentage of idle CPUs (for Podman engines only)
     */
    cpuIdle?: number;
    /**
     * Quantity of memory available for the container engine
     */
    memory?: number;
    /**
     * Quantity of memory used by the container engine (for Podman engines only)
     */
    memoryUsed?: number;
    /**
     * Quantity of disk space available for the container engine (for Podman engines only)
     */
    diskSize?: number;
    /**
     * Quantity of disk space used by the container engine (for Podman engines only)
     */
    diskUsed?: number;
  }

  export interface VolumeInfo {
    engineId: string;
    engineName: string;
    CreatedAt: string;
    containersUsage: { id: string; names: string[] }[];
    Name: string;
    Driver: string;
    Mountpoint: string;
    Status?: { [key: string]: string };
    Labels: { [key: string]: string };
    Scope: 'local' | 'global';
    Options?: { [key: string]: string } | null;
    UsageData?: {
      Size: number;
      RefCount: number;
    } | null;
  }
  export interface VolumeListInfo {
    Volumes: VolumeInfo[];
    Warnings: string[];
    engineId: string;
    engineName: string;
  }
  export interface VolumeCreateOptions {
    // name of the volume to create
    Name: string;
    // Set the provider to use, if not we will try select the first one available (sorted in favor of Podman).
    provider?: ContainerProviderConnection;
  }

  export interface VolumeDeleteOptions {
    // Set the provider to use, if not we will try select the first one available (sorted in favor of Podman).
    provider?: ContainerProviderConnection;
  }

  export interface VolumeCreateResponseInfo {
    Name: string;
    Driver: string;
    Mountpoint: string;
    CreatedAt?: string;
    Status?: { [key: string]: string };
    Labels: { [label: string]: string };
    Scope: string;
  }

  export interface ListInfosOptions {
    /**
     * The provider we want to list the infos. If not provided, will return info for all engines.
     *
     * @defaultValue undefined
     */
    provider?: ContainerProviderConnection;
  }

  /**
   *  Module providing operations to execute on all container providers
   */
  export namespace containerEngine {
    /**
     * Returns the list of containers across all container engines, in any state (running or not).
     *
     * @return A promise resolving to an array of containers information. This method returns a subset of the available information for containers. To get the complete description of a specific container, you can use the {@link containerEngine.inspectContainer} method.
     */
    export function listContainers(): Promise<ContainerInfo[]>;

    /**
     * Get the complete low-level information about a specific container.
     *
     * @param engineId the id of the engine managing the container, obtained from the result of {@link containerEngine.listContainers}
     * @param id the id or name of the container on this engine, obtained from the result of {@link containerEngine.listContainers} or as the result of {@link containerEngine.createContainer}
     * @return A promise resolving to a structure containing the container information
     */
    export function inspectContainer(engineId: string, id: string): Promise<ContainerInspectInfo>;

    /**
     * Create a new container on a specific container engine
     *
     * @param engineId the id of the engine on which to create the container, obtained from the result of {@link containerEngine.listContainers}
     * @param containerCreateOptions the details of the container to create
     * @return A promise resolving to the information on the created container
     */
    export function createContainer(
      engineId: string,
      containerCreateOptions: ContainerCreateOptions,
    ): Promise<ContainerCreateResult>;

    /**
     * Start an existing container
     *
     * @param engineId the id of the engine managing the container, obtained from the result of {@link containerEngine.listContainers}
     * @param id the id or name of the container on this engine, obtained from the result of {@link containerEngine.listContainers} or as the result of {@link containerEngine.createContainer}
     */
    export function startContainer(engineId: string, id: string): Promise<void>;

    /**
     * Get the streamed logs of a container
     *
     * @param engineId the id of the engine managing the container, obtained from the result of {@link containerEngine.listContainers}
     * @param id the id of the container on this engine, obtained from the result of {@link containerEngine.listContainers} or as the result of {@link containerEngine.createContainer}
     * @param callback the function called when new logs are emitted or new events happen on the stream. The value of `name` can be either `data` (and `data` contains the logs), or `end` indicating the end of the stream, or `first-message` indicating no data has been emitted yet on the stream.
     */
    export function logsContainer(
      engineId: string,
      id: string,
      callback: (name: string, data: string) => void,
    ): Promise<void>;

    /**
     * Get the streamed stats of a running container.
     *
     * @param engineId the id of the engine managing the container, obtained from the result of {@link containerEngine.listContainers}
     * @param id the id or name of the container on this engine, obtained from the result of {@link containerEngine.listContainers} or as the result of {@link containerEngine.createContainer}
     * @param callback the function called when container stats info are emitted.
     *
     * @return A Promise resolving a {@link Disposable} that unregister the callback when called.
     *
     * @example
     * Here is a usage example
     * ```ts
     * const disposable = await statsContainer('engineId', 'containerId', (stats: ContainerStatsInfo): void => {
     *  console.log('CPU Usage', stats.cpu_stats.cpu_usage.total_usage);
     * });
     *
     * // When no longer needed
     * disposable.dispose();
     * ```
     */
    export function statsContainer(
      engineId: string,
      id: string,
      callback: (stats: ContainerStatsInfo) => void,
    ): Promise<Disposable>;

    /**
     * Stop an existing container
     *
     * @param engineId the id of the engine managing the container, obtained from the result of {@link containerEngine.listContainers}
     * @param id the id of the container on this engine, obtained from the result of {@link containerEngine.listContainers} or as the result of {@link containerEngine.createContainer}
     */
    export function stopContainer(engineId: string, id: string): Promise<void>;

    /**
     * Delete an existing container
     *
     * @param engineId the id of the engine managing the container, obtained from the result of {@link containerEngine.listContainers}
     * @param id the id of the container on this engine, obtained from the result of {@link containerEngine.listContainers} or as the result of {@link containerEngine.createContainer}
     */

    export function deleteContainer(engineId: string, id: string): Promise<void>;
    /**
     * Build a container image
     *
     * @param context the build context directory
     * @param eventCollect a function called when new build logs are emitted or new events happen during the build operation. The value of `eventName` can be either `stream` (and `data` contains the logs), or `finish` indicating the end of the build operation, or `error` in case of build error (and `data` contains the error message)
     * @param options parameters for the build operation
     */
    export function buildImage(
      context: string,
      eventCollect: (eventName: 'stream' | 'error' | 'finish', data: string) => void,
      options?: BuildImageOptions,
    ): Promise<unknown>;

    /**
     * Save on disk a tarball containing the image and its metadata.
     *
     * @param engineId the id of the engine managing the image, obtained from the result of {@link containerEngine.listImages}
     * @param id the id or name of the image on this engine, obtained from the result of {@link containerEngine.listImages}
     * @param filename the file on which to save the container image content
     */
    export function saveImage(engineId: string, id: string, filename: string): Promise<void>;

    /**
     * List the container images. Only images from a final layer (no children) are returned.
     *
     * @param options optional options for listing images
     * @returns A promise resolving to an array of images information. This method returns a subset of the available information for images. To get the complete description of a specific image, you can use the {@link containerEngine.getImageInspect} method.
     *
     * @example
     * // Example 1: List all container images when no specific provider is provided.
     * const images = await listImages();
     * console.log(images);
     *
     * @example
     * // Example 2: List container images for a specific provider.
     * const provider = provider.getContainerConnections().find(connection => connection.connection.status() === 'started');
     * const images = await listImages({ provider: provider.connection });
     * console.log(images);
     */
    export function listImages(options?: ListImagesOptions): Promise<ImageInfo[]>;

    /**
     * Tag an image so that it becomes part of a repository
     *
     * @param engineId the id of the engine managing the image, obtained from the result of {@link containerEngine.listImages}
     * @param imageId the id of the image on this engine, obtained from the result of {@link containerEngine.listImages}
     * @param repo The repository to tag in. For example, `someuser/someimage`
     * @param tag The name of the new tag
     */
    export function tagImage(engineId: string, imageId: string, repo: string, tag?: string): Promise<void>;

    /**
     * Push an image to a registry.
     *
     * If you wish to push an image on to a private registry, that image must already have a tag which references the registry. For example, `registry.example.com/myimage:latest`.
     *
     * @param engineId the id of the engine managing the image, obtained from the result of {@link containerEngine.listImages}
     * @param imageId the id of the image on this engine, obtained from the result of {@link containerEngine.listImages}
     * @param callback the function called when new logs are emitted or new events happen on the stream. The value of `name` can be either `data`(and `data` contains the logs), or `end` indicating the end of the stream, or `first-message` indicating no data has been emitted yet on the stream.
     * @param authInfo Authentication credentials
     */
    export function pushImage(
      engineId: string,
      imageId: string,
      callback: (name: string, data: string) => void,
      authInfo?: ContainerAuthInfo,
    ): Promise<void>;

    /**
     * Pull an image from a registry
     *
     * @param containerProviderConnection the connection to the local engine to use for pulling the image
     * @param imageName the name of the image to pull
     * @param callback the function called when new logs are emitted during the pull operation
     */
    export function pullImage(
      containerProviderConnection: ContainerProviderConnection,
      imageName: string,
      callback: (event: PullEvent) => void,
    ): Promise<void>;

    /**
     * Delete a container image from a local engine
     *
     * @param engineId the id of the engine managing the image, obtained from the result of {@link containerEngine.listImages}
     * @param id the id of the image on this engine, obtained from the result of {@link containerEngine.listImages}
     */
    export function deleteImage(engineId: string, id: string): Promise<void>;

    /**
     * Return low-level information about an image
     *
     * @param engineId the id of the engine managing the image, obtained from the result of {@link containerEngine.listImages}
     * @param id the id of the image on this engine, obtained from the result of {@link containerEngine.listImages}
     * @return A promise resolving to a structure containing the image information
     */
    export function getImageInspect(engineId: string, id: string): Promise<ImageInspectInfo>;

    export function info(engineId: string): Promise<ContainerEngineInfo>;

    /**
     * List the engines information.
     *
     * @param options optional options for listing information
     * @returns A promise resolving to an array of engine information.
     *
     * @example
     * // Example 1: List all engine information when no specific provider is provided.
     * const infos = await listInfos();
     * console.log(infos);
     *
     * @example
     * // Example 2: List information for a specific provider.
     * const provider = provider.getContainerConnections().find(connection => connection.connection.status() === 'started');
     * const info = await listInfos({ provider: provider.connection });
     * console.log(info);
     */
    export function listInfos(options?: ListInfosOptions): Promise<ContainerEngineInfo[]>;
    export const onEvent: Event<ContainerJSONEvent>;

    export function listNetworks(): Promise<NetworkInspectInfo[]>;
    export function createNetwork(
      containerProviderConnection: ContainerProviderConnection,
      networkCreateOptions: NetworkCreateOptions,
    ): Promise<NetworkCreateResult>;

    export function listVolumes(): Promise<VolumeListInfo[]>;
    export function createVolume(options?: VolumeCreateOptions): Promise<VolumeCreateResponseInfo>;
    export function deleteVolume(volumeName: string, options?: VolumeDeleteOptions): Promise<void>;

    export function createPod(podOptions: PodCreateOptions): Promise<{ engineId: string; Id: string }>;
    export function replicatePodmanContainer(
      source: { engineId: string; id: string },
      target: { engineId: string },
      overrideParameters: PodmanContainerCreateOptions,
    ): Promise<{ Id: string; Warnings: string[] }>;
    export function startPod(engineId: string, podId: string): Promise<void>;
    export function listPods(): Promise<PodInfo[]>;
    export function stopPod(engineId: string, podId: string): Promise<void>;
    export function removePod(engineId: string, podId: string): Promise<void>;

    // Manifest related methods
    export function createManifest(options: ManifestCreateOptions): Promise<{ engineId: string; Id: string }>;
    export function inspectManifest(engineId: string, id: string): Promise<ManifestInspectInfo>;
    export function removeManifest(engineId: string, id: string): Promise<void>;
  }

  /**
   * Represents a session of a currently logged in user.
   */
  export interface AuthenticationSession {
    /**
     * The identifier of the authentication session.
     */
    readonly id: string;

    /**
     * The access token.
     */
    readonly accessToken: string;

    /**
     * The account associated with the session.
     */
    readonly account: AuthenticationSessionAccountInformation;

    /**
     * The permissions granted by the session's access token. Available scopes
     * are defined by the [AuthenticationProvider](#AuthenticationProvider).
     */
    readonly scopes: ReadonlyArray<string>;
  }

  /**
   * The information of an account associated with an [AuthenticationSession](#AuthenticationSession).
   */
  export interface AuthenticationSessionAccountInformation {
    /**
     * The unique identifier of the account.
     */
    readonly id: string;

    /**
     * The human-readable name of the account.
     */
    readonly label: string;
  }

  /**
   * Options to be used when getting an [AuthenticationSession](#AuthenticationSession) from an [AuthenticationProvider](#AuthenticationProvider).
   */
  export interface AuthenticationGetSessionOptions {
    /**
     * Whether login should be performed if there is no matching session.
     *
     * If true, a modal dialog will be shown asking the user to sign in. If false, a numbered badge will be shown
     * on the accounts activity bar icon. An entry for the extension will be added under the menu to sign in. This
     * allows quietly prompting the user to sign in.
     *
     * If there is a matching session but the extension has not been granted access to it, setting this to true
     * will also result in an immediate modal dialog, and false will add a numbered badge to the accounts icon.
     *
     * Defaults to false.
     */
    createIfNone?: boolean;

    /**
     * Whether the existing user session preference should be cleared.
     *
     * For authentication providers that support being signed into multiple accounts at once, the user will be
     * prompted to select an account to use when [getSession](#authentication.getSession) is called. This preference
     * is remembered until [getSession](#authentication.getSession) is called with this flag.
     *
     * Defaults to false.
     */
    clearSessionPreference?: boolean;

    /**
     * Whether we should attempt to reauthenticate even if there is already a session available.
     *
     * If true, a modal dialog will be shown asking the user to sign in again. This is mostly used for scenarios
     * where the token needs to be re minted because it has lost some authorization.
     *
     * If there are no existing sessions and forceNewSession is true, it will behave identically to
     * {@link AuthenticationGetSessionOptions.createIfNone createIfNone}.
     *
     * This defaults to false.
     */
    forceNewSession?: boolean | { detail: string };

    /**
     * Whether we should show the indication to sign in in the Accounts menu.
     *
     * If false, the user will be shown a badge on the Accounts menu with an option to sign in for the extension.
     * If true, no indication will be shown.
     *
     * Defaults to false.
     *
     * Note: you cannot use this option with any other options that prompt the user like {@link AuthenticationGetSessionOptions.createIfNone createIfNone}.
     */
    silent?: boolean;
  }

  /**
   * Basic information about an [authenticationProvider](#AuthenticationProvider)
   */
  export interface AuthenticationProviderInformation {
    /**
     * The unique identifier of the authentication provider.
     */
    readonly id: string;

    /**
     * The human-readable name of the authentication provider.
     */
    readonly label: string;
  }

  /**
   * An [event](#Event) which fires when an [AuthenticationSession](#AuthenticationSession) is added, removed, or changed.
   */
  export interface AuthenticationSessionsChangeEvent {
    /**
     * The [authenticationProvider](#AuthenticationProvider) that has had its sessions change.
     */
    readonly provider: AuthenticationProviderInformation;
  }

  /**
   * Options for creating an [AuthenticationProvider](#AuthenticationProvider).
   */
  export interface AuthenticationProviderOptions {
    /**
     * Whether it is possible to be signed into multiple accounts at once with this provider.
     * If not specified, will default to false.
     */
    readonly supportsMultipleAccounts?: boolean;

    readonly images?: ProviderImages;
  }

  /**
   * An [event](#Event) which fires when an [AuthenticationSession](#AuthenticationSession) is added, removed, or changed.
   */
  export interface AuthenticationProviderAuthenticationSessionsChangeEvent {
    /**
     * The [AuthenticationSession](#AuthenticationSession)s of the [AuthenticationProvider](#AuthentiationProvider) that have been added.
     */
    readonly added?: ReadonlyArray<AuthenticationSession>;

    /**
     * The [AuthenticationSession](#AuthenticationSession)s of the [AuthenticationProvider](#AuthentiationProvider) that have been removed.
     */
    readonly removed?: ReadonlyArray<AuthenticationSession>;

    /**
     * The [AuthenticationSession](#AuthenticationSession)s of the [AuthenticationProvider](#AuthentiationProvider) that have been changed.
     * A session changes when its data excluding the id are updated. An example of this is a session refresh that results in a new
     * access token being set for the session.
     */
    readonly changed?: ReadonlyArray<AuthenticationSession>;
  }

  /**
   * A provider for performing authentication to a service.
   */
  export interface AuthenticationProvider {
    /**
     * An [event](#Event) which fires when the array of sessions has changed, or data
     * within a session has changed.
     */
    readonly onDidChangeSessions: Event<AuthenticationProviderAuthenticationSessionsChangeEvent>;

    /**
     * Get a list of sessions.
     * @param scopes An optional list of scopes. If provided, the sessions returned should match
     * these permissions, otherwise all sessions should be returned.
     * @returns A promise that resolves to an array of authentication sessions.
     */
    getSessions(scopes?: string[]): Promise<ReadonlyArray<AuthenticationSession>>;

    /**
     * Prompts a user to login.
     *
     * If login is successful, the onDidChangeSessions event should be fired.
     *
     * If login fails, a rejected promise should be returned.
     *
     * If the provider has specified that it does not support multiple accounts,
     * then this should never be called if there is already an existing session matching these
     * scopes.
     * @param scopes A list of scopes, permissions, that the new session should be created with.
     * @returns A promise that resolves to an authentication session.
     */
    createSession(scopes: string[]): Promise<AuthenticationSession>;

    /**
     * Removes the session corresponding to session id.
     *
     * If the removal is successful, the onDidChangeSessions event should be fired.
     *
     * If a session cannot be removed, the provider should reject with an error message.
     * @param sessionId The id of the session to remove.
     */
    removeSession(sessionId: string): Promise<void>;
  }

  /**
   * Namespace for authentication.
   */
  export namespace authentication {
    /**
     * Get an authentication session matching the desired scopes. Rejects if a provider with providerId is not
     * registered, or if the user does not consent to sharing authentication information with
     * the extension. If there are multiple sessions with the same scopes, the user will be shown a
     * quickpick to select which account they would like to use.
     *
     * Currently, there are only two authentication providers that are contributed from built in extensions
     * to VS Code that implement GitHub and Microsoft authentication: their providerId's are 'github' and 'microsoft'.
     * @param providerId The id of the provider to use
     * @param scopes A list of scopes representing the permissions requested. These are dependent on the authentication provider
     * @param options The [getSessionOptions](#GetSessionOptions) to use
     * @returns A promise that resolves to an authentication session
     */
    export function getSession(
      providerId: string,
      scopes: string[],
      options: AuthenticationGetSessionOptions & { createIfNone: true },
    ): Promise<AuthenticationSession | undefined>;

    /**
     * Get an authentication session matching the desired scopes. Rejects if a provider with providerId is not
     * registered, or if the user does not consent to sharing authentication information with
     * the extension. If there are multiple sessions with the same scopes, the user will be shown a
     * quickpick to select which account they would like to use.
     *
     * Currently, there are only two authentication providers that are contributed from built in extensions
     * to VS Code that implement GitHub and Microsoft authentication: their providerId's are 'github' and 'microsoft'.
     * @param providerId The id of the provider to use
     * @param scopes A list of scopes representing the permissions requested. These are dependent on the authentication provider
     * @param options The [getSessionOptions](#GetSessionOptions) to use
     * @returns A promise that resolves to an authentication session if available, or undefined if there are no sessions
     */
    export function getSession(
      providerId: string,
      scopes: string[],
      options?: AuthenticationGetSessionOptions,
    ): Promise<AuthenticationSession | undefined>;

    /**
     * An [event](#Event) which fires when the authentication sessions of an authentication provider have
     * been added, removed, or changed.
     */
    export const onDidChangeSessions: Event<AuthenticationSessionsChangeEvent>;

    /**
     * Register an authentication provider.
     *
     * There can only be one provider per id and an error is being thrown when an id
     * has already been used by another provider. Ids are case-sensitive.
     *
     * @param id The unique identifier of the provider.
     * @param label The human-readable name of the provider.
     * @param provider The authentication provider provider.
     * @params options Additional options for the provider.
     * @return A [disposable](#Disposable) that unregisters this provider when being disposed.
     */
    export function registerAuthenticationProvider(
      id: string,
      label: string,
      provider: AuthenticationProvider,
      options?: AuthenticationProviderOptions,
    ): Disposable;
  }

  /**
   * Namespace describing the environment Podman Desktop runs in.
   */
  export namespace env {
    /**
     * Flag indicating whether we are running on macOS (Mac OS X) operating system.
     *
     * If the value of this flag is true, it means the current system is macOS.
     * If the value is false, it means the current system is not macOS.
     */
    export const isMac: boolean;

    /**
     * Flag indicating whether we are running on the Windows operating system.
     *
     * If the value of this flag is true, it means the current system is Windows.
     * If the value is false, it means the current system is not Windows.
     */
    export const isWindows: boolean;

    /**
     * Flag indicating whether we are running on a Linux operating system.
     *
     * If the value of this flag is true, it means the current system is Linux.
     * If the value is false, it means the current system is not Linux.
     */
    export const isLinux: boolean;

    /**
     * Indicates whether the users has telemetry enabled.
     * Can be observed to determine if the extension should send telemetry.
     */
    export const isTelemetryEnabled: boolean;

    /**
     * An {@link Event} which fires when the user enabled or disables telemetry.
     * `true` if the user has enabled telemetry or `false` if the user has disabled telemetry.
     */
    export const onDidChangeTelemetryEnabled: Event<boolean>;

    /**
     * Opens a link externally using the default application. Depending on the
     *
     * @param target The uri that should be opened.
     * @returns A promise indicating if open was successful.
     */
    export function openExternal(uri: Uri): Promise<boolean>;

    /**
     * Creates a new {@link TelemetryLogger telemetry logger}.
     *
     * @param sender The telemetry sender that is used by the telemetry logger.
     * @param options Options for the telemetry logger.
     * @returns A new telemetry logger
     */
    export function createTelemetryLogger(sender?: TelemetrySender, options?: TelemetryLoggerOptions): TelemetryLogger;

    /**
     * The system clipboard.
     */
    export const clipboard: Clipboard;
  }

  /**
   * Options for running a command.
   */
  export interface RunOptions {
    /**
     * Environment variables to set for the command.
     */
    env?: { [key: string]: string };

    /**
     * A cancellation token used to request cancellation.
     */
    token?: CancellationToken;

    /**
     * A logger used to track execution events.
     */
    logger?: Logger;

    /**
     * custom directory
     */
    cwd?: string;

    /**
     * admin privileges required
     */
    isAdmin?: boolean;

    /**
     * The encoding to use. Default utf8
     */
    encoding?: BufferEncoding;
  }

  /**
   * Represents the result of running a command.
   */
  export interface RunResult {
    /**
     * The command that was executed.
     */
    command: string;

    /**
     * The standard output (stdout) content of the command.
     */
    stdout: string;

    /**
     * The standard error (stderr) content of the command.
     */
    stderr: string;
  }

  /**
   * Represents an error that occurred during the execution of a command.
   */
  export interface RunError extends Error {
    /**
     * The error message.
     */
    message: string;

    /**
     * The exit code of the command.
     */
    exitCode: number;

    /**
     * The command that was executed.
     */
    command: string;

    /**
     * The standard output (stdout) content of the command.
     */
    stdout: string;

    /**
     * The standard error (stderr) content of the command.
     */
    stderr: string;

    /**
     * Indicates whether the execution was cancelled.
     */
    cancelled: boolean;

    /**
     * Indicates whether the process was forcefully killed.
     */
    killed: boolean;
  }

  /**
   * Namespace for environment-related utilities.
   */
  export namespace process {
    /**
     * Executes the provided command and returns an object containing the exit code,
     * stdout, and stderr content.
     * @param command The command to execute.
     * @param args The command arguments.
     * @param options Options, such as environment variables.
     * @returns A promise that resolves to a RunResult object.
     * @throws {@link RunError} if provided command can not be executed.
     */
    export function exec(command: string, args?: string[], options?: RunOptions): Promise<RunResult>;
  }

  /**
   * A special value wrapper denoting a value that is safe to not clean.
   * This is to be used when you can guarantee no identifiable information is contained in the value and the cleaning is improperly redacting it.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export class TelemetryTrustedValue<T = any> {
    readonly value: T;

    constructor(value: T);
  }

  /**
   * A telemetry logger which can be used by extensions to log usage and error telementry.
   *
   * A logger wraps around an {@link TelemetrySender sender} but it guarantees that
   * - user settings to disable or tweak telemetry are respected, and that
   * - potential sensitive data is removed
   *
   * It also enables an "echo UI" that prints whatever data is send and it allows the editor
   * to forward unhandled errors to the respective extensions.
   *
   * To get an instance of a `TelemetryLogger`, use
   * {@link env.createTelemetryLogger `createTelemetryLogger`}.
   */
  export interface TelemetryLogger {
    /**
     * An {@link Event} which fires when the enablement state of usage or error telemetry changes.
     */
    readonly onDidChangeEnableStates: Event<TelemetryLogger>;

    /**
     * Whether or not usage telemetry is enabled for this logger.
     */
    readonly isUsageEnabled: boolean;

    /**
     * Whether or not error telemetry is enabled for this logger.
     */
    readonly isErrorsEnabled: boolean;

    /**
     * Log a usage event.
     *
     * After completing cleaning, telemetry setting checks, and data mix-in calls `TelemetrySender.sendEventData` to log the event.
     * Automatically supports echoing to extension telemetry output channel.
     * @param eventName The event name to log
     * @param data The data to log
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logUsage(eventName: string, data?: Record<string, any | TelemetryTrustedValue>): void;

    /**
     * Log an error event.
     *
     * After completing cleaning, telemetry setting checks, and data mix-in calls `TelemetrySender.sendEventData` to log the event. Differs from `logUsage` in that it will log the event if the telemetry setting is Error+.
     * Automatically supports echoing to extension telemetry output channel.
     * @param eventName The event name to log
     * @param data The data to log
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logError(eventName: string, data?: Record<string, any | TelemetryTrustedValue>): void;

    /**
     * Log an error event.
     * @param error The error object which contains the stack trace cleaned of PII
     * @param data Additional data to log alongside the stack trace
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logError(error: Error, data?: Record<string, any | TelemetryTrustedValue>): void;

    /**
     * Dispose this object and free resources.
     */
    dispose(): void;
  }

  /**
   * The telemetry sender is the contract between a telemetry logger and some telemetry service. **Note** that extensions must NOT
   * call the methods of their sender directly as the logger provides extra guards and cleaning.
   */
  export interface TelemetrySender {
    /**
     * Function to send event data without a stacktrace. Used within a {@link TelemetryLogger}
     *
     * @param eventName The name of the event which you are logging
     * @param data A serializable key value pair that is being logged
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendEventData(eventName: string, data?: Record<string, any>): void;

    /**
     * Function to send an error. Used within a {@link TelemetryLogger}
     *
     * @param error The error being logged
     * @param data Any additional data to be collected with the exception
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    sendErrorData(error: Error, data?: Record<string, any>): void;

    /**
     * Optional flush function which will give this sender a chance to send any remaining events
     * as its {@link TelemetryLogger} is being disposed
     */
    flush?(): void | Promise<void>;
  }

  /**
   * Options for creating a {@link TelemetryLogger}
   */
  export interface TelemetryLoggerOptions {
    /**
     * Whether or not you want to avoid having the built-in common properties such as os, extension name, etc injected into the data object.
     * Defaults to `false` if not defined.
     */
    readonly ignoreBuiltInCommonProperties?: boolean;

    /**
     * Whether or not unhandled errors on the extension host caused by your extension should be logged to your sender.
     * Defaults to `false` if not defined.
     */
    readonly ignoreUnhandledErrors?: boolean;

    /**
     * Any additional common properties which should be injected into the data object.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly additionalCommonProperties?: Record<string, any>;
  }

  /**
   * The clipboard provides read and write access to the system's clipboard.
   */
  export interface Clipboard {
    /**
     * Read the current clipboard contents as text.
     * @returns A Promise that resolves to a string.
     */
    readText(): Promise<string>;

    /**
     * Writes text into the clipboard.
     * @returns A Promise that resolves when writing happened.
     */
    writeText(value: string): Promise<void>;
  }

  /**
   * The context provides write access to the system's context.
   */
  export namespace context {
    /**
     * Store a new value for key in the context.
     * This can be used in enablement of command or with the when property.
     * The key should consists of '"extension-id"."actual-key"'.
     *
     * @param key the key of the key/value pair to be added to the context
     * @param value value associated to the key
     * @param scope the scope to use to save the value
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export function setValue(key: string, value: any, scope?: 'onboarding'): void;
  }

  /**
   * Options to create new CliTool instance and register it in podman desktop
   */

  export interface CliToolOptions {
    name: string;
    displayName: string;
    markdownDescription: string;
    images: ProviderImages;

    /**
     * Within your extension, it is reccommended to implement your own functionality to check the current
     * version number of the CLI tool. For example, parsing the information from the CLI tool's `--version` flag.
     * Passing in path will also help to show where the CLI tool is expected to be installed.
     * This is usually the ~/.local/share/containers/podman-desktop/extensions-storage directory.
     * Note: The expected value should not include 'v'.
     */
    version: string;
    path: string;
  }

  /**
   * Options to update CliTool instance
   */
  export interface CliToolUpdateOptions {
    version: string;
    displayName?: string;
    markdownDescription?: string;
    images?: ProviderImages;
    path?: string;
  }

  export interface CliToolUpdate {
    version: string;
    doUpdate: (logger: Logger) => Promise<void>;
  }

  export type CliToolState = 'registered';

  export interface CliTool extends Disposable {
    id: string;
    name: string;
    displayName: string;
    markdownDescription: string;
    state: CliToolState;
    images: ProviderImages;
    extensionInfo: {
      id: string;
      label: string;
    };

    updateVersion(version: CliToolUpdateOptions): void;
    onDidUpdateVersion: Event<string>;

    // register cli update flow
    registerUpdate(update: CliToolUpdate): Disposable;
  }

  /**
   * The CLI module provides API to register CLI Tools that can be used
   * with Podman Desktop. The registered CLIs appears in settings on
   * `CLI Tools` page.
   */

  export namespace cli {
    /**
     * Register new CLI Tool
     * @param options CliToolsOptions instance to configure new instance of CliTool
     * @returns CliTool instance
     */
    export function createCliTool(options: CliToolOptions): CliTool;
  }

  /**
   * a specific error/recommendation found during an image check
   */
  export interface ImageCheck {
    /**
     * a short and descriptive name for the error/recommendation
     */
    name: string;
    /**
     * either the feedback is positive or negative
     */
    status: 'success' | 'failed';
    /**
     * severity of the error/recommendation, when the status is `failed`
     */
    severity?: 'low' | 'medium' | 'high' | 'critical';
    /**
     * full description of the error/recommendation
     */
    markdownDescription?: string;
  }

  /**
   * the complete result of an image check
   */
  export interface ImageChecks {
    /**
     * the list of errors/recommendations found during the image check
     */
    checks: ImageCheck[];
  }

  /**
   * Interface to be implemented by image checker providers
   */
  export interface ImageCheckerProvider {
    /**
     *
     * @param image Info about the image to analyze
     * @param token a cancellation token the function can use to be informed when the caller asks for the operation to be cancelled
     * @return the complete result of the analyze, either synchronously of through a Promise
     */
    check(image: ImageInfo, token?: CancellationToken): ProviderResult<ImageChecks>;
  }

  export interface ImageCheckerProviderMetadata {
    readonly label: string;
  }

  /**
   * Module providing to extensions a way to register as an image checker.
   *
   * An Image Checker is a program analyzing container images and
   * returning errors and recommendations, related to security,
   * optimization, best practices, etc.
   */
  export namespace imageChecker {
    /**
     * Register the extension as an Image Checker.
     *
     * As an image checker, a provider needs to implement a specific interface, so the core
     * application can call the provider with specific tasks when necessary.
     *
     * @param imageCheckerProvider an object implementing the `ImageCheckerProvider` interface
     * @param metadata optional metadata attached to this provider
     * @return A disposable that unregisters this provider when being disposed
     */
    export function registerImageCheckerProvider(
      imageCheckerProvider: ImageCheckerProvider,
      metadata?: ImageCheckerProviderMetadata,
    ): Disposable;
  }

  export namespace navigation {
    // Navigate to the Containers page
    export function navigateToContainers(): Promise<void>;
    // Navigate to the Container page
    export function navigateToContainer(id: string): Promise<void>;
    // Navigate to the Container logs tab
    export function navigateToContainerLogs(id: string): Promise<void>;
    // Navigate to the Container inspect tab
    export function navigateToContainerInspect(id: string): Promise<void>;
    // Navigate to the Container terminal tab
    export function navigateToContainerTerminal(id: string): Promise<void>;

    // Navigate to the Images page
    export function navigateToImages(): Promise<void>;
    // Navigate to a specific image referenced by id, engineId and tag
    export function navigateToImage(id: string, engineId: string, tag: string): Promise<void>;

    // Navigate to the Volumes page
    export function navigateToVolumes(): Promise<void>;
    // Navigate to a specific volume
    export function navigateToVolume(name: string, engineId: string): Promise<void>;

    // Navigate to the Pods page
    export function navigateToPods(): Promise<void>;
    // Navigate to a specific pod referenced by kind, name and engineId
    export function navigateToPod(kind: string, name: string, engineId: string): Promise<void>;

    // Navigate to a specific contribution (aka extension page) referenced by name
    export function navigateToContribution(name: string): Promise<void>;

    /**
     * Navigate to a specific Webview
     * @param webviewId The id of the Webview to navigate to
     * @see {@link window.listWebviews listWebviews} to get a list of Webviews and their ids
     * @see {@link window.createWebviewPanel createWebviewPanel} for creating a Webview
     */
    export function navigateToWebview(webviewId: string): Promise<void>;

    /**
     * Navigate to Authentication settings page
     */
    export function navigateToAuthentication(): Promise<void>;

    /**
     * Navigate to Resources page
     */
    export function navigateToResources(): Promise<void>;
    /**
     * Navigate to the Edit Provider Container Connection page
     */
    export function navigateToEditProviderContainerConnection(connection: ProviderContainerConnection): Promise<void>;
  }

  /**
   * The event data that is fired when a secret is added or removed.
   */
  export interface SecretStorageChangeEvent {
    /**
     * The key of the secret that has changed.
     */
    readonly key: string;
  }

  /**
   * Represents a storage utility for secrets, information that is
   * sensitive.
   */
  export interface SecretStorage {
    /**
     * Retrieve a secret that was stored with key. Returns undefined if there
     * is no secret matching that key.
     * @param key The key the secret was stored under.
     * @returns The stored value or `undefined`.
     */
    get(key: string): Promise<string | undefined>;

    /**
     * Store a secret under a given key.
     * @param key The key to store the secret under.
     * @param value The secret.
     */
    store(key: string, value: string): Promise<void>;

    /**
     * Remove a secret from storage.
     * @param key The key the secret was stored under.
     */
    delete(key: string): Promise<void>;

    /**
     * Fires when a secret is stored or deleted.
     */
    onDidChange: Event<SecretStorageChangeEvent>;
  }
}
