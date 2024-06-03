/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import * as extensionApi from '@podman-desktop/api';

export interface PodmanBinaryLocationResult {
  source: string;
  error?: Error;
  foundPath?: string;
}
export class PodmanBinaryLocationHelper {
  async getPodmanLocationMac(): Promise<PodmanBinaryLocationResult> {
    let source: string;
    let foundPath: string | undefined;
    let error: Error | undefined;
    // execute which podman command to see from where it is coming
    try {
      const { stdout } = await extensionApi.process.exec('which', ['podman']);
      foundPath = stdout;
      if (stdout.startsWith('/opt/podman/bin/podman')) {
        source = 'installer';
      } else if (stdout.startsWith('/usr/local/bin/podman') || stdout.startsWith('/opt/homebrew/bin/podman')) {
        source = 'brew';
      } else {
        source = 'unknown';
      }
    } catch (err) {
      error = err as Error;
      source = 'unknown';
      console.trace('unable to check from which path podman is coming', error);
    }
    return {
      source,
      error,
      foundPath,
    };
  }
}
