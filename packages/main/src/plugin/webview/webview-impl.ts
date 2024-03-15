/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { randomUUID } from 'node:crypto';

import type { Event, Webview, WebviewOptions } from '@podman-desktop/api';

import type { ApiSenderType } from '/@/plugin/api.js';
import { Emitter } from '/@/plugin/events/emitter.js';
import { Uri } from '/@/plugin/types/uri.js';

export class WebviewImpl implements Webview {
  readonly #apiSender: ApiSenderType;
  readonly #extensionInfo: { id: string; extensionPath: string };
  readonly #internalId: string;
  readonly #viewType: string;

  #html: string = '';
  #options: WebviewOptions;
  #disposed: boolean = false;
  #uuid: string = '';
  #serverPort: number;
  #state: unknown = {};

  readonly #onDidReceiveMessage = new Emitter<unknown>();
  readonly onDidReceiveMessage: Event<unknown> = this.#onDidReceiveMessage.event;

  constructor(
    readonly viewType: string,
    readonly internalId: string,
    readonly apiSender: ApiSenderType,
    readonly extensionInfoData: { id: string; extensionPath: string },
    serverPort: number,
    options: WebviewOptions,
  ) {
    this.#viewType = viewType;
    this.#internalId = internalId;
    this.#apiSender = apiSender;
    this.#extensionInfo = extensionInfoData;
    this.#options = options;
    this.#uuid = randomUUID();
    this.#serverPort = serverPort;
  }

  get html(): string {
    this.assertNotDisposed();
    return this.#html;
  }

  public get cspSource(): string {
    return `http://*.webview.localhost:${this.#serverPort}/`;
  }

  set html(val: string) {
    this.assertNotDisposed();
    if (this.#html !== val) {
      this.#html = val;
      // need to notify the render that the html has changed
      this.#apiSender.send('webview-update:html', { id: this.#internalId, html: val });
    }
  }

  get options(): WebviewOptions {
    this.assertNotDisposed();
    return this.#options;
  }

  // not public interface
  get extensionInfo(): { id: string; extensionPath: string } {
    return this.#extensionInfo;
  }

  // not public interface
  get uuid(): string {
    return this.#uuid;
  }

  // not public interface
  get state(): unknown {
    return this.#state;
  }
  set state(state: unknown) {
    this.#state = state;
  }

  set options(newOptions: WebviewOptions) {
    this.assertNotDisposed();

    if (JSON.stringify(this.#options) !== JSON.stringify(newOptions)) {
      // need to notify the render that the html has changed
      this.#apiSender.send('webview-update:options', { id: this.#internalId, options: newOptions });
    }

    this.#options = newOptions;
  }

  async postMessage(message: unknown): Promise<boolean> {
    if (this.#disposed) {
      return false;
    }
    this.#apiSender.send('webview-post-message', { id: this.#internalId, message });
    return true;
  }

  // notify the consumer if we receive a message
  async handleMessage(message: unknown): Promise<void> {
    this.#onDidReceiveMessage.fire(message);
  }

  protected assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error(`The webview coming from ${this.#viewType} has been disposed.`);
    }
  }

  asWebviewUri(resource: Uri): Uri {
    // if it comes from http/https, do not convert
    if (resource.scheme === 'http' || resource.scheme === 'https') {
      return resource;
    }

    // if it's a file, encode it
    if (resource.scheme === 'file') {
      // get substring of path
      // remove extension path from path
      const subPath = resource.path.substring(this.#extensionInfo.extensionPath.length);

      return new Uri(
        'http',
        `${this.#uuid}.webview.localhost:${this.#serverPort}`,
        subPath,
        resource.query,
        resource.fragment,
      );
    }
    throw new Error(`The resource ${resource.toString()} is not supported.`);
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;

    // dispose emitters
    this.#onDidReceiveMessage.dispose();
  }
}
