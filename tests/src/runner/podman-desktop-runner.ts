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

import type { ElectronApplication, JSHandle, Page } from 'playwright';
import { _electron as electron } from 'playwright';
import { join } from 'node:path';
import type { BrowserWindow } from 'electron';
import type { BasePage } from '../model/pages/base-page';

export class PodmanDesktopRunner {
  private _options: object;
  private _running: boolean;
  private _app: ElectronApplication | undefined;
  private _page: Page | undefined;
  private readonly _profile: string;
  private readonly _testOutput: string;

  constructor(profile = '') {
    this._running = false;
    this._profile = profile;
    this._testOutput = join('tests', 'output', this._profile);
    this._options = this.defaultOptions();
  }

  public async start(): Promise<Page> {
    if (this.isRunning()) {
      throw Error('Podman Desktop is already running');
    }

    // start the app with given properties
    this._app = await electron.launch({
      ...this._options,
    });
    // setup state
    this._running = true;
    this._page = await this.getElectronApp().firstWindow();
    // Direct Electron console to Node terminal.
    this.getPage().on('console', console.log);

    return this._page;
  }

  public getPage(): Page {
    if (this._page) {
      return this._page;
    } else {
      throw Error('Application was not started yet');
    }
  }

  public createPage<T extends BasePage>(type: new (page: Page) => T): T {
    return new type(this.getPage());
  }

  public getElectronApp(): ElectronApplication {
    if (this._app) {
      return this._app;
    } else {
      throw Error('Application was not started yet');
    }
  }

  public async getBrowserWindow(): Promise<JSHandle<BrowserWindow>> {
    return await this.getElectronApp().browserWindow(this.getPage());
  }

  public async screenshot(filename: string) {
    await this.getPage().screenshot({ path: join(this._testOutput, 'screenshots', filename), fullPage: true });
  }

  public async close() {
    if (!this.isRunning()) {
      throw Error('Podman Desktop is not running');
    }
    if (this.getElectronApp()) {
      await this.getElectronApp().close();
    }
    this._running = false;
  }

  private defaultOptions() {
    const directory = join(this._testOutput, 'videos');
    console.log(`video will be written to: ${directory}`);
    const env = this.setupPodmanDesktopCustomFolder();
    return {
      args: ['.'],
      env,
      recordVideo: {
        dir: directory,
        size: {
          width: 1050,
          height: 700,
        },
      },
    };
  }

  private setupPodmanDesktopCustomFolder(): object {
    const env: { [key: string]: string } = Object.assign({}, process.env as { [key: string]: string });
    const dir = join(this._testOutput, 'podman-desktop');
    console.log(`podman desktop custom config will be written to: ${dir}`);
    env.PODMAN_DESKTOP_HOME_DIR = dir;
    return env;
  }

  public isRunning(): boolean {
    return this._running;
  }

  public setOptions(value: object) {
    this._options = value;
  }

  public getTestOutput(): string {
    return this._testOutput;
  }

  public get options(): object {
    return this._options;
  }
}
