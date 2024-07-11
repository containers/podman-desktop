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

import type {
  Event,
  Uri,
  WebviewOptions,
  WebviewPanel,
  WebviewPanelOnDidChangeViewStateEvent,
} from '@podman-desktop/api';

import type { ApiSenderType } from '/@/plugin/api.js';
import { Emitter } from '/@/plugin/events/emitter.js';
import { NavigationPage } from '/@api/navigation-page.js';
import type { NavigationRequest } from '/@api/navigation-request.js';

import type { WebviewImpl } from './webview-impl.js';
import type { WebviewRegistry } from './webview-registry.js';

type IconPath = Uri | { readonly light: Uri; readonly dark: Uri };

export class WebviewPanelImpl implements WebviewPanel {
  readonly #internalId: string;
  readonly #webviewRegistry: WebviewRegistry;
  readonly #apiSender: ApiSenderType;

  readonly #webview: WebviewImpl;

  #visible: boolean = false;
  #active: boolean = false;
  #disposed: boolean = false;
  #title: string;
  #iconPath?: IconPath;
  readonly #viewType: string;

  readonly #onDidDispose = new Emitter<void>();
  readonly onDidDispose: Event<void> = this.#onDidDispose.event;

  readonly #onDidChangeViewState = new Emitter<WebviewPanelOnDidChangeViewStateEvent>();
  readonly onDidChangeViewState: Event<WebviewPanelOnDidChangeViewStateEvent> = this.#onDidChangeViewState.event;

  constructor(
    internalId: string,
    webviewRegistry: WebviewRegistry,
    apiSender: ApiSenderType,
    webview: WebviewImpl,
    panelDetails: {
      title: string;
      iconPath?: IconPath;
      webviewOptions?: WebviewOptions;
      viewType: string;
    },
  ) {
    this.#internalId = internalId;
    this.#webviewRegistry = webviewRegistry;
    this.#apiSender = apiSender;
    this.#webview = webview;

    this.#title = panelDetails.title;
    this.#iconPath = panelDetails.iconPath;
    this.#viewType = panelDetails.viewType;
  }

  get internalId(): string {
    return this.#internalId;
  }

  get viewType(): string {
    this.assertNotDisposed();
    return this.#viewType;
  }

  get title(): string {
    this.assertNotDisposed();
    return this.#title;
  }

  set title(val: string) {
    this.assertNotDisposed();
    if (this.#title !== val) {
      this.#title = val;
      // need to notify the render that the title has changed
      this.#apiSender.send('webview-panel-update:title', { id: this.#internalId, title: val });
    }
  }

  get visible(): boolean {
    this.assertNotDisposed();
    return this.#visible;
  }

  get active(): boolean {
    this.assertNotDisposed();
    return this.#active;
  }

  get webview(): WebviewImpl {
    return this.#webview;
  }

  get iconPath(): IconPath | undefined {
    return this.#iconPath;
  }

  set iconPath(val: IconPath) {
    this.assertNotDisposed();

    if (this.#iconPath !== val) {
      this.#iconPath = val;
      // need to update the list of webviews
      this.#apiSender.send('webview-update');
    }
  }

  protected assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error(`The webview panel ${this.#viewType}/${this.#title} has been disposed.`);
    }
  }

  // called from renderer side to update the view state
  updateViewState(visible: boolean, active: boolean): void {
    // if disposed, do nothing
    if (this.#disposed) {
      return;
    }

    if (this.#active !== active || this.#visible !== visible) {
      this.#active = active;
      this.#visible = visible;
      // notify
      this.#onDidChangeViewState.fire({ webviewPanel: this });
    }
  }

  reveal(_preserveFocus?: boolean): void {
    this.assertNotDisposed();

    // notify the renderer to reveal the webview
    const navigationRequest: NavigationRequest<NavigationPage.WEBVIEW> = {
      page: NavigationPage.WEBVIEW,
      parameters: {
        id: this.#internalId,
      },
    };
    this.#apiSender.send('navigate', navigationRequest);
  }

  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;

    // delegate removal
    this.#webviewRegistry.disposeWebviewPanel(this);

    // dispose the webview as well
    this.#webview.dispose();

    // notify disposable
    this.#onDidDispose.fire();

    // dispose emitters
    this.#onDidDispose.dispose();
    this.#onDidChangeViewState.dispose();
  }
}
