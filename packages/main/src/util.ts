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

import { BrowserWindow } from 'electron';
import * as os from 'os';

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

export const getCommandLineArgs = (argv: string[], argName: string, exactMatch: boolean): string | undefined => {
  if (!Array.isArray(argv)) {
    throw new Error(`TypeError invalid func arg, must be an array: ${argv}`);
  }

  const argNameToFind = argName.toLocaleLowerCase();

  for (let i = 0, len = argv.length; i < len; i++) {
    const arg = argv[i].toLocaleLowerCase();
    if ((exactMatch && arg === argNameToFind) || (!exactMatch && arg.startsWith(argNameToFind))) {
      return argv[i];
    }
  }

  return undefined;
};
