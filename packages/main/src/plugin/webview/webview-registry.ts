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

import { existsSync } from 'node:fs';
import type * as http from 'node:http';
import { resolve } from 'node:path';

import type * as podmanDesktopAPI from '@podman-desktop/api';
import type { Application } from 'express';
import express from 'express';

import type { ApiSenderType } from '/@/plugin/api.js';
import type { WebviewInfo, WebviewSimpleInfo } from '/@/plugin/api/webview-info.js';
import { Uri } from '/@/plugin/types/uri.js';

import { getFreePort } from '../util/port.js';
import { WebviewImpl } from './webview-impl.js';
import { WebviewPanelImpl } from './webview-panel-impl.js';

type IconPath = Uri | { readonly light: Uri; readonly dark: Uri };

export class HttpServer {
  #app: Application;

  #instance: http.Server | undefined;

  constructor(app: Application) {
    this.#app = app;
    this.config(app);
  }

  private config(_app: Application): void {}

  async start(serverPort: number): Promise<void> {
    console.log('Starting http server to handle webviews on port', serverPort);
    // now listen on the port
    await new Promise<void>((resolve, reject) => {
      this.#instance = this.#app
        .listen(serverPort, () => {
          resolve();
        })
        .on('error', (err: unknown) => {
          reject(new Error(String(err)));
        });
    });
  }

  async stop(): Promise<void> {
    if (!this.#instance) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      this.#instance?.close((err: unknown) => {
        if (err) {
          reject(new Error(String(err)));
        } else {
          resolve();
        }
      });
    });
  }
}

export class WebviewRegistry {
  #count = 0;
  #webviews: Map<string, WebviewPanelImpl>;

  #apiSender: ApiSenderType;

  // express server instance for serving webviews
  #expressServer: HttpServer;

  #uuidAndPaths: Map<string, string>;

  #serverPort: number = 0;

  #app: Application;

  constructor(apiSender: ApiSenderType) {
    this.#apiSender = apiSender;
    this.#webviews = new Map();
    this.#uuidAndPaths = new Map();

    this.#app = express();
    this.#expressServer = new HttpServer(this.#app);
  }

  protected initRouting(): void {
    const router = this.buildRouter();
    this.configureRouter(router);
    this.useAppRouter(router);
  }

  protected useAppRouter(router: express.Router): void {
    this.#app.use('/', router);
  }

  protected configureRouter(router: express.Router): void {
    router.get('/*', (req, res) => {
      // no referrer, reject request
      if (!req.headers.referer) {
        res.status(500).send('invalid request');
        return;
      }

      // return empty page in  case of root path access
      if (req.path === '/') {
        res.send('<html></html>');
        return;
      }

      // get uuid of the request using the host
      // extract 58b7cdef-294f-4ace-93cc-de6e0a139592 from req.hostname 58b7cdef-294f-4ace-93cc-de6e0a139592.webview.localhost
      // check if hostname matches uuid pattern
      const uuidPattern = new RegExp('^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$');
      const uuid = req.hostname.split('.')[0];
      if (!uuidPattern.test(uuid)) {
        res.status(404).send('not found');
        return;
      }

      // check if webview with uuid exists
      const rootExtensionPath = this.#uuidAndPaths.get(uuid);

      if (!rootExtensionPath) {
        // throw an error (500)
        res.status(500).send('missing parameter');
        return;
      }

      // construct path from root path and req.path
      const fullPath = `${rootExtensionPath}/${req.path}`;

      // make it absolute
      const absolutePath = resolve(fullPath);

      // root path in absolute form
      const rootExtensionPathAbsolute = resolve(rootExtensionPath);

      // check that path is subfolder of root path
      if (!absolutePath.startsWith(rootExtensionPathAbsolute)) {
        res.status(404).send('not found');
        return;
      }

      // check that path exists on the filesystem
      if (!existsSync(absolutePath)) {
        res.status(404).send('not found');
        return;
      }

      // send content of absolute path with express
      res.sendFile(absolutePath);
    });
  }

  protected buildRouter(): express.Router {
    return express.Router({
      strict: true,
    });
  }

  async start(): Promise<void> {
    // init routing
    this.initRouting();

    // grab a free port
    this.#serverPort = await getFreePort(44000);

    // start the express server
    await this.#expressServer.start(this.#serverPort);
  }

  async makeDefaultWebviewVisible(id: string): Promise<void> {
    // filter all webviews matching the given id
    const activeWebviewPanels = Array.from(this.#webviews.values()).filter(webviewPanel => {
      return webviewPanel.internalId === id;
    });

    // update the state of the webviews
    for (const webviewPanel of activeWebviewPanels) {
      webviewPanel.updateViewState(true, true);
    }

    // now, update the state of the non active webviews
    const nonActiveWebviewPanels = Array.from(this.#webviews.values()).filter(webviewPanel => {
      return webviewPanel.internalId !== id;
    });
    for (const webviewPanel of nonActiveWebviewPanels) {
      webviewPanel.updateViewState(false, false);
    }
  }

  // stop the express server
  async stop(): Promise<void> {
    await this.#expressServer.stop();
  }

  createWebviewPanel(
    extensionInfo: { id: string; extensionPath: string; icon?: string | { light: string; dark: string } },
    viewType: string,
    title: string,
    options?: podmanDesktopAPI.WebviewOptions,
  ): podmanDesktopAPI.WebviewPanel {
    const id = `${this.#count}`;
    this.#count++;

    // default icon is the extension icon
    let iconPath: IconPath | undefined = undefined;
    if (extensionInfo.icon) {
      if (typeof extensionInfo.icon === 'string') {
        iconPath = Uri.file(extensionInfo.icon);
      } else {
        iconPath = {
          light: Uri.file(extensionInfo.icon.light),
          dark: Uri.file(extensionInfo.icon.dark),
        };
      }
    }

    const webview: WebviewImpl = new WebviewImpl(
      viewType,
      id,
      this.#apiSender,
      extensionInfo,
      this.#serverPort,
      options ?? {},
    );

    const webviewPanelImpl = new WebviewPanelImpl(id, this, this.#apiSender, webview, {
      title,
      iconPath,
      webviewOptions: options,
      viewType,
    });

    this.#uuidAndPaths.set(webview.uuid, extensionInfo.extensionPath);
    this.#webviews.set(webviewPanelImpl.internalId, webviewPanelImpl);
    this.#apiSender.send('webview-create', webviewPanelImpl.internalId);
    return webviewPanelImpl;
  }

  disposeWebviewPanel(webviewPanelImpl: WebviewPanelImpl): void {
    this.#webviews.delete(webviewPanelImpl.internalId);
    this.#apiSender.send('webview-delete', webviewPanelImpl.internalId);
  }

  async postMessageToWebview(id: string, message: { data: unknown }): Promise<void> {
    /// grab the webview
    const webviewPanelImpl = this.#webviews.get(id);

    await webviewPanelImpl?.webview.handleMessage(message.data);
  }

  async updateWebviewState(id: string, state: unknown): Promise<void> {
    /// grab the webview
    const webviewPanelImpl = this.#webviews.get(id);

    if (webviewPanelImpl) {
      // update state
      webviewPanelImpl.webview.state = state;
    }
  }

  getRegistryHttpPort(): number {
    return this.#serverPort;
  }

  listWebviews(): WebviewInfo[] {
    return Array.from(this.#webviews.entries()).map(entry => {
      const id = entry[0];
      const webviewPanelImpl = entry[1];
      const viewType: string = webviewPanelImpl.viewType;
      const sourcePath = webviewPanelImpl.webview.extensionInfo.extensionPath;
      const html = webviewPanelImpl.webview.html;
      const state = webviewPanelImpl.webview.state;

      let icon;
      if (webviewPanelImpl.iconPath instanceof Uri) {
        icon = webviewPanelImpl.iconPath.fsPath;
      }

      return {
        id,
        viewType,
        sourcePath,
        html,
        icon,
        name: webviewPanelImpl.title,
        uuid: webviewPanelImpl.webview.uuid,
        state,
      };
    });
  }

  // for external usage, do not expose path/html/internal details
  async listSimpleWebviews(): Promise<WebviewSimpleInfo[]> {
    return Array.from(this.#webviews.entries()).map(entry => {
      const id = entry[0];
      const webviewPanelImpl = entry[1];
      const viewType: string = webviewPanelImpl.viewType;
      return {
        id,
        viewType,
        title: webviewPanelImpl.title,
      };
    });
  }
}
