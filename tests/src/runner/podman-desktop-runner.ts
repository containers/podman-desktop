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

export class PodmanDesktopRunner {
  private _options: object;
  private _running: boolean;
  private _app: ElectronApplication | undefined;
  private _page: Page | undefined;
  private readonly _profile: string;
  private readonly _customFolder;
  private readonly _testOutput: string;

  constructor(profile = '', customFolder = 'podman-desktop') {
    this._running = false;
    this._profile = profile;
    this._testOutput = join('tests', 'output', this._profile);
    this._customFolder = join(this._testOutput, customFolder);
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

    // also get stderr from the node process
    this._app.process().stderr?.on('data', data => {
      console.log(`STDERR: ${data}`);
    });

    await this.setupApplication();

    return this._page;
  }

  public getPage(): Page {
    if (this._page) {
      return this._page;
    } else {
      throw Error('Application was not started yet');
    }
  }

  public getElectronApp(): ElectronApplication {
    if (this._app) {
      return this._app;
    } else {
      throw Error('Application was not started yet');
    }
  }

  async getApplicationState(): Promise<{
    isVisible: boolean;
    isDevToolsOpened: boolean;
    isCrashed: boolean;
    isMaximized: boolean;
  }> {
    const window: JSHandle<BrowserWindow> = await this.getBrowserWindow();

    return await window.evaluate(
      (
        mainWindow,
      ): Promise<{ isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean; isMaximized: boolean }> => {
        const getState = () => ({
          isVisible: mainWindow.isVisible(),
          isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
          isCrashed: mainWindow.webContents.isCrashed(),
          isMaximized: mainWindow.isMaximized(),
        });

        return new Promise(resolve => {
          resolve(getState());
        });
      },
    );
  }

  async setupApplication(): Promise<void> {
    const window: JSHandle<BrowserWindow> = await this.getBrowserWindow();

    await window.evaluate((mainWindow): Promise<void> => {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
      mainWindow.focus();
      return new Promise(resolve => {
        if (mainWindow.isVisible()) {
          resolve();
        } else mainWindow.once('ready-to-show', () => resolve());
      });
    });
  }

  public async getBrowserWindow(): Promise<JSHandle<BrowserWindow>> {
    return await this.getElectronApp().browserWindow(this.getPage());
  }

  public async screenshot(filename: string) {
    await this.getPage().screenshot({ path: join(this._testOutput, 'screenshots', filename) });
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
    const dir = join(this._customFolder);
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
