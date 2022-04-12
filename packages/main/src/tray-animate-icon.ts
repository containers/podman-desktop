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

import type { Tray } from 'electron';
import * as path from 'path';

export type TrayIconStatus = 'initialized' | 'updating' | 'error' | 'ready';

export class AnimatedTray {
  private status: TrayIconStatus;
  private trayIconLoopId = 0;
  private animatedInterval: NodeJS.Timeout | undefined = undefined;
  private tray: Tray | undefined = undefined;

  constructor() {
    this.status = 'initialized';
    this.updateIcon();
  }

  protected getAssetsFolder(): string {
    // choose right folder for resources
    // see extraResources in electron-builder config file
    let assetsFolder;
    if (import.meta.env.PROD) {
      assetsFolder = path.resolve(process.resourcesPath, 'packages/main/src/assets');
    } else {
      assetsFolder = path.resolve(__dirname, '../src/assets');
    }

    return assetsFolder;
  }

  protected animateTrayIcon() {
    if (this.trayIconLoopId === 4) {
      this.trayIconLoopId = 0;
    }
    const imagePath = path.resolve(this.getAssetsFolder(), `tray-icon-step${this.trayIconLoopId}Template.png`);
    this.trayIconLoopId++;
    this.tray?.setImage(imagePath);
  }

  public setTray(tray: Tray): void {
    this.tray = tray;
    this.updateIcon();
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
        this.tray.setImage(path.resolve(this.getAssetsFolder(), 'tray-icon-emptyTemplate.png'));
        this.tray.setToolTip('Podman Desktop is initialized');
        break;
      case 'error':
        this.tray.setImage(path.resolve(this.getAssetsFolder(), 'tray-icon-errorTemplate.png'));
        this.tray.setToolTip('Podman Desktop has an error');
        break;
      case 'ready':
        this.tray.setImage(path.resolve(this.getAssetsFolder(), 'tray-iconTemplate.png'));
        this.tray.setToolTip('Podman Desktop is ready');
        break;
      case 'updating':
        this.animatedInterval = setInterval(this.animateTrayIcon.bind(this), 1000);
        this.tray.setToolTip('Podman Desktop: resources are being updated');
        break;
    }
  }

  getDefaultImage(): string {
    return path.resolve(this.getAssetsFolder(), 'tray-icon-emptyTemplate.png');
  }

  setStatus(status: TrayIconStatus) {
    this.status = status;
    this.updateIcon();
  }
}
