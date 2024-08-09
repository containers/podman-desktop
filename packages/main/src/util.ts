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

import { BrowserWindow } from 'electron';

const windows = os.platform() === 'win32';
export function isWindows(): boolean {
  return windows;
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

export function requireNonUndefined<T>(obj: T | undefined, message?: string): T {
  if (obj === undefined) {
    throw new Error(message ? message : 'Found undefined value.');
  }

  return obj;
}
