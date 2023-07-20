/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { ElectronApplication, Page } from 'playwright';
import { _electron as electron } from 'playwright';

export class PodmanDesktopRunner {
  private _path: string;
  private _running: boolean;
  private _properties: object;
  private _app!: ElectronApplication;

  constructor(path: string, properties: object) {
    this._path = path;
    this._running = false;
    this._properties = properties;
  }

  public async startApp(): Promise<ElectronApplication> {
    if (this.isRunning()) {
      throw Error('Podman Desktop is already running');
    }
    // start the app with given properties
    this.app = await electron.launch({
      args: [this._path],
      ...this._properties,
    });
    // setup state
    this.running = true;
    return this._app;
  }

  public async getPage(): Promise<Page> {
    return await this.app.firstWindow();
  }

  public async closeApp() {
    if (!this.isRunning()) {
      throw Error('Podman Desktop is not running');
    }
    if (this.app) {
      await this.app.close();
    }
    this.running = false;
  }

  public isRunning(): boolean {
    return this._running;
  }

  public get path(): string {
    return this._path;
  }

  public set running(value: boolean) {
    this._running = value;
  }

  public get app(): ElectronApplication {
    return this._app;
  }

  public set app(value: ElectronApplication) {
    this._app = value;
  }
}
