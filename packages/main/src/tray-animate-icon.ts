/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import * as path from 'node:path';

import type { Tray } from 'electron';
import { app, nativeTheme } from 'electron';

import { isLinux, isMac } from './util.js';

export type TrayIconStatus = 'initialized' | 'updating' | 'error' | 'ready';

export class AnimatedTray {
  private status: TrayIconStatus;
  private trayIconLoopId = 0;
  private animatedInterval: NodeJS.Timeout | undefined = undefined;
  private tray: Tray | undefined = undefined;
  private color = 'default'; // default, light, dark
  static readonly MAIN_ASSETS_FOLDER = 'packages/main/src/assets';

  constructor() {
    this.status = 'initialized';
    this.updateIcon();

    // refresh icon when theme is being updated (especially for Windows as for macOS we always use template icon and on linux the menu bar is not related to the theme)
    nativeTheme.on('updated', () => {
      this.updateIcon();
    });
  }

  protected isProd(): boolean {
    return import.meta.env.PROD;
  }

  protected getAssetsFolder(): string {
    return path.resolve(app.getAppPath(), AnimatedTray.MAIN_ASSETS_FOLDER);
  }

  protected animateTrayIcon(): void {
    if (this.trayIconLoopId === 4) {
      this.trayIconLoopId = 0;
    }
    const imagePath = this.getIconPath(`step${this.trayIconLoopId}`);
    this.trayIconLoopId++;
    this.tray?.setImage(imagePath);
  }

  public setTray(tray: Tray): void {
    this.tray = tray;
    this.updateIcon();
  }

  // set the color of the icon if we're manually overriding the theme
  // and then update the current icon
  public setColor(color: string): void {
    this.color = color;
    this.updateIcon();
  }

  // provide the path to the icon depending on theme and platform
  protected getIconPath(iconName: string): string {
    let name;
    if (iconName === 'default') {
      name = '';
    } else {
      name = `-${iconName}`;
    }
    let suffix = '';
    // on Linux, always pickup dark icon
    if (isLinux()) {
      suffix = 'Dark';
    } else if (isMac()) {
      // on Mac, always pickup template icon
      suffix = 'Template';
    } else {
      // check based from the theme using electron nativeTheme
      if (nativeTheme.shouldUseDarkColors) {
        suffix = 'Dark';
      } else {
        suffix = 'Template';
      }
    }

    // Regardless what is the theme, if the user has set the color to light, we use the light icon, same as dark, etc.
    if (this.color === 'light') {
      suffix = 'Template';
    } else if (this.color === 'dark') {
      suffix = 'Dark';
    }

    return path.resolve(this.getAssetsFolder(), `tray-icon${name}${suffix}.png`);
  }

  protected updateIcon(): void {
    // do nothing until we have a tray
    if (!this.tray) {
      return;
    }

    // stop any existing interval
    if (this.animatedInterval) {
      clearInterval(this.animatedInterval);
    }
    switch (this.status) {
      case 'initialized':
        this.tray.setImage(this.getIconPath('empty'));
        this.tray.setToolTip('Podman Desktop is initialized');
        break;
      case 'error':
        this.tray.setImage(this.getIconPath('error'));
        this.tray.setToolTip('Podman Desktop has an error');
        break;
      case 'ready':
        this.tray.setImage(this.getIconPath('default'));
        this.tray.setToolTip('Podman Desktop is ready');
        break;
      case 'updating':
        this.animatedInterval = setInterval(this.animateTrayIcon.bind(this), 1000);
        this.tray.setToolTip('Podman Desktop: resources are being updated');
        break;
    }
  }

  getDefaultImage(): string {
    return this.getIconPath('empty');
  }

  setStatus(status: TrayIconStatus): void {
    this.status = status;
    this.updateIcon();
  }
}
