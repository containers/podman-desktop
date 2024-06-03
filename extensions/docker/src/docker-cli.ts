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
import * as extensionApi from '@podman-desktop/api';

const macosExtraPath = '/usr/local/bin:/opt/homebrew/bin:/opt/local/bin';

export function getInstallationPath(): string | undefined {
  const env = process.env;
  if (extensionApi.env.isMac) {
    if (!env.PATH) {
      return macosExtraPath;
    } else {
      return env.PATH.concat(':').concat(macosExtraPath);
    }
  } else {
    return env.PATH;
  }
}

export function getDockerCli(): string {
  if (extensionApi.env.isWindows) {
    return 'docker.exe';
  }
  return 'docker';
}

export interface InstalledDocker {
  version: string;
}

export async function getDockerInstallation(): Promise<InstalledDocker | undefined> {
  try {
    let { stdout: versionOut } = await extensionApi.process.exec(getDockerCli(), ['--version']);
    if (!versionOut.startsWith('Docker')) {
      // could be the podman-docker wrapper script
      return undefined;
    }
    versionOut = versionOut.replace(/, build .*$/, '');
    const versionArr = versionOut.split(' ');
    const version = versionArr[versionArr.length - 1];
    return { version };
  } catch (err) {
    // no docker binary
    return undefined;
  }
}
