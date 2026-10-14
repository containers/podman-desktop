/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { WebviewInfo } from '@desktop-framework/api';

import { type IpcApi, type WebviewElement, WebviewLifecycleManager } from './webview-lifecycle-manager';

/**
 * Configuration options for the webview lifecycle directive
 */
export interface WebviewDirectiveOptions {
  /**
   * Information about the webview being managed
   * @optional Used for webview identification and cleanup logic
   */
  webviewInfo?: WebviewInfo;

  /**
   * Custom IPC API for communicating with the main process
   * @optional If not provided, will use window globals from preload script
   */
  ipcApi?: IpcApi;
}

/**
 * Return type for Svelte action/directive lifecycle methods
 */
export interface WebviewDirectiveReturn {
  /**
   * Called when the directive's options change
   * @param newOptions - Updated configuration options
   */
  update(newOptions: WebviewDirectiveOptions): void;

  /**
   * Called when the element is removed from the DOM
   * Performs cleanup including event listener removal and resource cleanup
   */
  destroy(): void;
}

/**
 * Safely creates an IPC API from window globals with proper error handling.
 *
 * This function attempts to create an IPC API object by reading the webview DevTools
 * management functions from the global window object. These functions should be
 * exposed by the preload script during application initialization.
 *
 * @returns An IPC API object with registerWebviewDevTools and cleanupWebviewDevTools methods
 * @throws {Error} When required window globals are not available or undefined
 *
 * @example
 * ```typescript
 * try {
 *   const ipcApi = createWindowIpcApi();
 *   // Use ipcApi for webview DevTools management
 * } catch (error) {
 *   console.error('Failed to create IPC API:', error);
 *   // Handle the error appropriately
 * }
 * ```
 */
export function createWindowIpcApi(): IpcApi {
  if (!window.registerWebviewDevTools || !window.cleanupWebviewDevTools) {
    throw new Error(
      'Required webview DevTools management functions are not available on window. ' +
        'Ensure the preload script has properly exposed registerWebviewDevTools and cleanupWebviewDevTools.',
    );
  }

  return {
    registerWebviewDevTools: window.registerWebviewDevTools,
    cleanupWebviewDevTools: window.cleanupWebviewDevTools,
  };
}

/**
 * Dependencies for webview lifecycle management.
 *
 * This interface enables dependency injection for testing purposes and custom implementations.
 * All dependencies are optional and have sensible defaults for production use.
 *
 * @example
 * ```typescript
 * // For testing with mocked dependencies
 * const mockDependencies: WebviewLifecycleDependencies = {
 *   ipcApi: mockIpcApi,
 *   createManager: vi.fn().mockReturnValue(mockManager),
 *   createIpcApi: vi.fn().mockReturnValue(mockIpcApi),
 * };
 *
 * webviewLifecycleInternal(mockElement, options, mockDependencies);
 * ```
 */
export interface WebviewLifecycleDependencies {
  /**
   * IPC API for communicating with the main process.
   *
   * When provided, this IPC API will be used directly instead of creating one
   * from window globals or the options parameter.
   *
   * @optional Priority: options.ipcApi > dependencies.ipcApi > createIpcApi()
   */
  ipcApi?: IpcApi;

  /**
   * Factory function for creating WebviewLifecycleManager instances.
   *
   * Allows injection of custom or mocked lifecycle managers for testing.
   * The factory receives the resolved IPC API and webview info.
   *
   * @param ipcApi - The resolved IPC API to pass to the manager
   * @param webviewInfo - Optional webview information for identification
   * @returns A WebviewLifecycleManager instance or compatible object
   * @default WebviewLifecycleManager constructor
   */
  createManager?: (ipcApi: IpcApi, webviewInfo?: WebviewInfo) => WebviewLifecycleManager;

  /**
   * Factory function for creating IPC API from window globals.
   *
   * Used as fallback when no IPC API is provided via options or dependencies.
   * Useful for testing scenarios where window globals need to be mocked.
   *
   * @returns An IPC API object compatible with the IpcApi interface
   * @throws {Error} When required window globals are not available
   * @default createWindowIpcApi
   */
  createIpcApi?: () => IpcApi;
}

/**
 * Internal implementation of webview lifecycle directive with dependency injection.
 * Exported for testing purposes.
 *
 * @param node - The HTML element (webview) to attach the directive to
 * @param options - Configuration options for the directive
 * @param dependencies - Injectable dependencies for testing
 */
export function webviewLifecycleInternal(
  node: HTMLElement,
  options: WebviewDirectiveOptions = {},
  dependencies: WebviewLifecycleDependencies = {},
): WebviewDirectiveReturn {
  const webview = node as unknown as WebviewElement;

  const {
    createIpcApi = createWindowIpcApi,
    createManager = (ipcApi: IpcApi, webviewInfo?: WebviewInfo): WebviewLifecycleManager =>
      new WebviewLifecycleManager(ipcApi, webviewInfo),
  } = dependencies;

  const ipcApi: IpcApi = options.ipcApi ?? dependencies.ipcApi ?? createIpcApi();
  const manager = createManager(ipcApi, options.webviewInfo);

  const domReadyHandler = (_event: Event): void => manager.handleDomReady(webview);
  const devtoolsOpenedHandler = (_event: Event): void => manager.handleDevToolsOpened();

  webview.addEventListener('dom-ready', domReadyHandler);
  webview.addEventListener('devtools-opened', devtoolsOpenedHandler);

  return {
    /**
     * Called when the directive's options change
     */
    update(newOptions: WebviewDirectiveOptions): void {
      manager.updateWebviewInfo(newOptions.webviewInfo);
    },

    /**
     * Called when the element is removed from the DOM
     */
    destroy(): void {
      manager.cleanup();
      webview.removeEventListener('dom-ready', domReadyHandler);
      webview.removeEventListener('devtools-opened', devtoolsOpenedHandler);
    },
  };
}

/**
 * Svelte action/directive that manages webview lifecycle events.
 * Handles DevTools registration and cleanup to prevent application crashes.
 *
 * @param node - The HTML element (webview) to attach the directive to
 * @param options - Configuration options for the directive
 * @returns Object with update and destroy methods for Svelte action lifecycle
 *
 * @example
 * ```svelte
 * <webview use:webviewLifecycle={{ webviewInfo }} />
 * ```
 *
 * @example
 * ```svelte
 * <webview use:webviewLifecycle={{ webviewInfo, ipcApi: customIpcApi }} />
 * ```
 */
export function webviewLifecycle(node: HTMLElement, options: WebviewDirectiveOptions = {}): WebviewDirectiveReturn {
  return webviewLifecycleInternal(node, options);
}
