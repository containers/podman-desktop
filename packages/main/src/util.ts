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

import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

import { BrowserWindow } from 'electron';

export function isWindows(): boolean {
  return os.platform() === 'win32';
}
export async function isWSL(): Promise<boolean> {
  const hyperv = await isHyperV();
  return isWindows() && !hyperv;
}
export async function isHyperV(): Promise<boolean> {
  if (!isWindows()) {
    return false;
  }
  // check if the env variable is set with hyperv
  if (process.env.CONTAINERS_MACHINE_PROVIDER === 'hyperv') {
    return true;
  }

  // as a final step we check if the containers.conf file set the provider to hyperv
  const providerRegex = /provider\s*=\s*"hyperv"/;
  return isValueInContainersConfig(providerRegex);
}
export async function isValueInContainersConfig(regex: RegExp): Promise<boolean> {
  const containersConfPath = getContainersConfPath();
  try {
    const containerConf = await fs.promises.readFile(containersConfPath, 'utf-8');
    return regex.test(containerConf);
  } catch (e) {
    console.log(String(e));
  }
  return false;
}
export function getContainersConfPath(): string {
  return path.resolve(os.homedir(), '.config/containers/containers.conf');
}
const mac = os.platform() === 'darwin';
export function isMac(): boolean {
  return mac;
}
const linux = os.platform() === 'linux';
export function isLinux(): boolean {
  return linux;
}
export function findWindow(): Electron.BrowserWindow | undefined {
  return BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
}

export const stoppedExtensions = { val: false };

export function getBase64Image(imagePath: string): string | undefined {
  try {
    if (fs.existsSync(imagePath)) {
      const imageContent = fs.readFileSync(imagePath);

      // convert to base64
      const base64Content = Buffer.from(imageContent).toString('base64');

      // create base64 image content
      return `data:image/png;base64,${base64Content}`;
    }
  } catch (error) {
    console.error(`Error while creating base64 image content for ${imagePath}`, error);
  }
  return undefined;
}
