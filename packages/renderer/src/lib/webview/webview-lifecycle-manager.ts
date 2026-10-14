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

interface WebviewEventMap {
  'dom-ready': Event;
  'devtools-opened': Event;
}

// Combine webview events with standard HTML events
type ExtendedEventMap = HTMLElementEventMap & WebviewEventMap;

export interface WebviewElement extends Omit<HTMLElement, 'addEventListener' | 'removeEventListener'> {
  getWebContentsId(): number;
  addEventListener<K extends keyof ExtendedEventMap>(
    type: K,
    listener: (this: WebviewElement, ev: ExtendedEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof ExtendedEventMap>(
    type: K,
    listener: (this: WebviewElement, ev: ExtendedEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

export interface IpcApi {
  registerWebviewDevTools: (webcontentId: number) => Promise<void>;
  cleanupWebviewDevTools: (webcontentId: number) => Promise<void>;
}

/**
 * Manages the lifecycle of webview DevTools, handling registration and cleanup
 * to prevent application crashes when webviews are destroyed while DevTools are open.
 */
export class WebviewLifecycleManager {
  private webviewWebContentsId: number | undefined;
  private webviewInfo: WebviewInfo | undefined;

  constructor(
    private readonly ipcApi: IpcApi,
    webviewInfo?: WebviewInfo,
  ) {
    this.webviewInfo = webviewInfo;
  }

  /**
   * Updates the webview info when it changes
   */
  updateWebviewInfo(webviewInfo?: WebviewInfo): void {
    this.webviewInfo = webviewInfo;
  }

  /**
   * Handles the 'dom-ready' event from the webview.
   * Extracts and stores the webContentsId for later use.
   */
  handleDomReady(webview: WebviewElement): void {
    try {
      this.webviewWebContentsId = webview.getWebContentsId();
    } catch (err) {
      console.error('Failed to get webview webContentsId:', err);
    }
  }

  /**
   * Handles the 'devtools-opened' event from the webview.
   * Registers the webview with the DevTools management system.
   */
  handleDevToolsOpened(): void {
    if (this.webviewWebContentsId) {
      this.ipcApi
        .registerWebviewDevTools(this.webviewWebContentsId)
        .catch((err: unknown) => console.error('Failed to track webview process after DevTools opened:', err));
    }
  }

  /**
   * Cleans up the webview resources when it's being destroyed.
   * Should be called when the webview component is unmounted.
   */
  cleanup(): void {
    if (this.webviewWebContentsId && this.webviewInfo?.id) {
      this.ipcApi
        .cleanupWebviewDevTools(this.webviewWebContentsId)
        .catch((err: unknown) => console.error('Failed to cleanup webview:', err));
    }
  }

  /**
   * Gets the current webContentsId if available
   */
  getWebContentsId(): number | undefined {
    return this.webviewWebContentsId;
  }

  /**
   * Gets the current webview info
   */
  getWebviewInfo(): WebviewInfo | undefined {
    return this.webviewInfo;
  }
}
