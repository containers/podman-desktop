/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { join, resolve } from 'node:path';

import type { App as ElectronApp, NativeImage } from 'electron';
import { nativeImage } from 'electron';

import type { AppPlugin } from '/@/plugin/app-ready/app-plugin.js';
import type { DevIconBuilder } from '/@/plugin/app-ready/dev-icon-builder.js';
import { isMac } from '/@/util.js';

const BASE_ICON_RELATIVE_PATH = 'buildResources/icon.png';

/**
 * Dev-mode identity plugin that gives each dev instance a unique identity
 * so it can run alongside the packaged application without conflicts.
 */
export class AppIdentityDevPlugin implements AppPlugin {
  readonly #branch: string;

  constructor(
    private readonly app: ElectronApp,
    private readonly iconBuilder: DevIconBuilder,
  ) {
    this.#branch = import.meta.env['VITE_GIT_BRANCH'] ?? '';
  }

  onBeforeReady(): void {
    this.app.setPath('userData', join(this.app.getAppPath(), '.electron-user-data'));
  }

  async onReady(): Promise<void> {
    if (!isMac()) return;

    const label = this.#toBannerLabel(this.#branch);
    const baseIconPath = resolve(this.app.getAppPath(), BASE_ICON_RELATIVE_PATH);
    const baseIcon = nativeImage.createFromPath(baseIconPath);
    this.app.dock?.setIcon(this.iconBuilder.buildIcon(baseIcon, label));
  }

  getWindowIcon(): NativeImage {
    const base = nativeImage.createFromPath(resolve(this.app.getAppPath(), BASE_ICON_RELATIVE_PATH));
    return this.iconBuilder.buildIcon(base, this.#toBannerLabel(this.#branch));
  }

  dispose(): void {}

  #toBannerLabel(branch: string): string {
    if (!branch) return 'DEV';
    const issueMatch = /(?:GH|PR)-?(\d+)/i.exec(branch);
    if (issueMatch) return `${issueMatch[0]!.slice(0, 2).toUpperCase()} ${issueMatch[1]}`;
    const lastSegment = branch.split('/').pop() ?? branch;
    return lastSegment.slice(0, 8);
  }
}
