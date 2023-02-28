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

import type { CliRun } from './cli-run';
import { shellPath } from 'shell-path';
import { resolve } from 'path';

export class Detect {
  constructor(private cliRun: CliRun, private storagePath: string) {}

  // search if docker-compose is available in the path (+ include storage/bin folder)
  async checkForDockerCompose(): Promise<boolean> {
    const result = await this.cliRun.runCommand('docker-compose', ['--version']);
    if (result.exitCode === 0) {
      return true;
    }
    return false;
  }

  // search if the python podman-compose is available in the path
  async checkForPythonPodmanCompose(): Promise<boolean> {
    const result = await this.cliRun.runCommand('podman-compose', ['--version']);
    if (result.exitCode === 0) {
      // check if it contains 'podman-composer'
      if (result.stdOut.includes('podman-composer')) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  // search if the podman-compose is available in the storage/bin path
  async checkStoragePath(): Promise<boolean> {
    // check that extension/bin folder is in the PATH
    const extensionBinPath = resolve(this.storagePath, 'bin');

    // grab current path
    const currentPath = await shellPath();
    if (currentPath.includes(extensionBinPath)) {
      return true;
    }

    return false;
  }
}
