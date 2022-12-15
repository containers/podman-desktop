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

    // register installation flow
    registerInstallation(installation: ProviderInstallation): Disposable;

    // register update flow
    registerUpdate(update: ProviderUpdate): Disposable;

    // register autostart flow
    registerAutostart(autostart: ProviderAutostart): Disposable;

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

  export interface ProxySettings {
    httpProxy: string | undefined;
    httpsProxy: string | undefined;
    noProxy: string | undefined;
  }

  export namespace proxy {
    export function getProxySettings(): ProxySettings | undefined;
    export function setProxy(proxySettings: ProxySettings): void;
    // Podman Desktop has updated the settings, propagates the changes to the provider.
    export const onDidUpdateProxy: Event<ProxySettings>;

    // The state of the proxy
    export function isEnabled(): boolean;
    export const onDidStateChange: Event<boolean>;
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

  /**
   * Resource identifier for a resource
   */
  export class Uri {
    private constructor(scheme: string, authority: string, path: string);
    static file(path: string): Uri;
    readonly fsPath: string;
    readonly authority: string;
    readonly scheme: string;
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

  export namespace kubernetes {
    // Path to the configuration file
    export function getKubeconfig(): Uri;
    export const onDidUpdateKubeconfig: Event<KubeconfigUpdateEvent>;
    export function setKubeconfig(kubeconfig: Uri): Promise<void>;
  }
  /**
   * An event describing the update in kubeconfig location
   */
  export interface KubeconfigUpdateEvent {
    readonly type: 'CREATE' | 'UPDATE' | 'DELETE';
    readonly location: Uri;
  }

  export interface ContainerInfo {
    engineId: string;
    engineName: string;
    engineType: 'podman' | 'docker';
    StartedAt: string;
    pod?: {
      id: string;
      name: string;
      status: string;
      engineId: string;
    };
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
      Name?: string | undefined;
      Type: string;
      Source: string;
      Destination: string;
      Driver?: string | undefined;
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

  interface AuthConfig {
    username: string;
    password: string;
    serveraddress: string;
    email?: string | undefined;
  }

  interface RegistryConfig {
    [registryAddress: string]: {
      username: string;
      password: string;
    };
  }

  interface PortBinding {
    HostIp?: string | undefined;
    HostPort?: string | undefined;
  }

  interface PortMap {
    [key: string]: PortBinding[];
  }

  interface HostRestartPolicy {
    Name: string;
    MaximumRetryCount?: number | undefined;
  }

  interface HostConfig {
    AutoRemove?: boolean | undefined;
    Binds?: string[] | undefined;
    ContainerIDFile?: string | undefined;
    LogConfig?:
      | {
          Type: string;
          Config: unknown;
        }
      | undefined;
    NetworkMode?: string | undefined;
    PortBindings?: unknown;
    RestartPolicy?: HostRestartPolicy | undefined;
    VolumeDriver?: string | undefined;
    VolumesFrom?: unknown;
    Mounts?: MountConfig | undefined;
    CapAdd?: unknown;
    CapDrop?: unknown;
    Dns?: unknown[] | undefined;
    DnsOptions?: unknown[] | undefined;
    DnsSearch?: string[] | undefined;
    ExtraHosts?: unknown;
    GroupAdd?: string[] | undefined;
    IpcMode?: string | undefined;
    Cgroup?: string | undefined;
    Links?: unknown;
    OomScoreAdj?: number | undefined;
    PidMode?: string | undefined;
    Privileged?: boolean | undefined;
    PublishAllPorts?: boolean | undefined;
    ReadonlyRootfs?: boolean | undefined;
    SecurityOpt?: unknown;
    StorageOpt?: { [option: string]: string } | undefined;
    Tmpfs?: { [dir: string]: string } | undefined;
    UTSMode?: string | undefined;
    UsernsMode?: string | undefined;
    ShmSize?: number | undefined;
    Sysctls?: { [index: string]: string } | undefined;
    Runtime?: string | undefined;
    ConsoleSize?: number[] | undefined;
    Isolation?: string | undefined;
    MaskedPaths?: string[] | undefined;
    ReadonlyPaths?: string[] | undefined;
    CpuShares?: number | undefined;
    CgroupParent?: string | undefined;
    BlkioWeight?: number | undefined;
    BlkioWeightDevice?: unknown;
    BlkioDeviceReadBps?: unknown;
    BlkioDeviceWriteBps?: unknown;
    BlkioDeviceReadIOps?: unknown;
    BlkioDeviceWriteIOps?: unknown;
    CpuPeriod?: number | undefined;
    CpuQuota?: number | undefined;
    CpusetCpus?: string | undefined;
    CpusetMems?: string | undefined;
    Devices?: unknown;
    DeviceCgroupRules?: string[] | undefined;
    DeviceRequests?: DeviceRequest[] | undefined;
    DiskQuota?: number | undefined;
    KernelMemory?: number | undefined;
    Memory?: number | undefined;
    MemoryReservation?: number | undefined;
    MemorySwap?: number | undefined;
    MemorySwappiness?: number | undefined;
    NanoCpus?: number | undefined;
    OomKillDisable?: boolean | undefined;
    Init?: boolean | undefined;
    PidsLimit?: number | undefined;
    Ulimits?: unknown;
    CpuCount?: number | undefined;
    CpuPercent?: number | undefined;
    CpuRealtimePeriod?: number | undefined;
    CpuRealtimeRuntime?: number | undefined;
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
      Health?:
        | {
            Status: string;
            FailingStreak: number;
            Log: Array<{
              Start: string;
              End: string;
              ExitCode: number;
              Output: string;
            }>;
          }
        | undefined;
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
    ExecIDs?: string[] | undefined;
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
      Name?: string | undefined;
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
      Entrypoint?: string | string[] | undefined;
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
      Node?:
        | {
            ID: string;
            IP: string;
            Addr: string;
            Name: string;
            Cpus: number;
            Memory: number;
            Labels: unknown;
          }
        | undefined;
    };
  }

  interface ContainerJSONEvent {
    type: string;
    status: string;
    id: string;
    Type?: string;
  }

  export namespace containerEngine {
    export function listContainers(): Promise<ContainerInfo[]>;
    export function inspectContainer(engineId: string, id: string): Promise<ContainerInspectInfo>;
    export const onEvent: Event<ContainerJSONEvent>;
  }
}
