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

import * as fs from 'node:fs';
import { resolve } from 'node:path';

import * as extensionApi from '@podman-desktop/api';
import { shellPath } from 'shell-path';

import type { OS } from './os';

export class Detect {
  constructor(
    private os: OS,
    private storagePath: string,
  ) {}

  // search if kubectl is available in the path (+ include storage/bin folder)
  async checkForKubectl(): Promise<boolean> {
    try {
      await extensionApi.process.exec('kubectl', ['version', '--client', 'true']);
      return true;
    } catch (e) {
      return false;
    }
  }

  // search if kubectl is available is installed system wide
  async checkSystemWideKubectl(): Promise<boolean> {
    // runCommand appends the storage/bin folder to the PATH
    // so let's set the env PATH to the system path before running the command
    // to avoid the storage/bin folder to be appended to the PATH
    try {
      await extensionApi.process.exec('kubectl', ['version', '--client', 'true'], {
        env: { PATH: process.env.PATH ?? '' },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
  // search if the kubectl is available in the storage/bin path
  async checkStoragePath(): Promise<boolean> {
    // check that extension/bin folder is in the PATH
    const extensionBinPath = resolve(this.storagePath, 'bin');

    // grab current path
    const currentPath = await shellPath();
    return currentPath.includes(extensionBinPath);
  }

  // Check to see that kubectl exists in the storage directory and return the path if it does
  async getStoragePath(): Promise<string> {
    const extensionBinPath = resolve(this.storagePath, 'bin');

    // append file extension
    let fileExtension = '';
    if (this.os.isWindows()) {
      fileExtension = '.exe';
    }
    const kubectlPath = resolve(extensionBinPath, `kubectl${fileExtension}`);

    // Check that kubectlPath exists using node:fs
    // else, error out
    if (fs.existsSync(kubectlPath)) {
      return kubectlPath;
    } else {
      return '';
    }
  }
}
