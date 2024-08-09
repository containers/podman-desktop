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

import { normalizeWSLOutput } from './util';

export interface WSLVersionInfo {
  wslVersion?: string;
  kernelVersion?: string;
  windowsVersion?: string;
}

export class WslHelper {
  async getWSLVersionData(): Promise<WSLVersionInfo> {
    const { stdout } = await extensionApi.process.exec('wsl', ['--version'], { encoding: 'utf16le' });
    /*
      got something like
      WSL version: 1.2.5.0
      Kernel version: 5.15.90.1
      WSLg version: 1.0.51
      MSRDC version: 1.2.3770
      Direct3D version: 1.608.2-61064218
      DXCore version: 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp
      Windows version: 10.0.22621.2134

      N.B: the label before the colon symbol changes based on the system language. In an italian system you would have

      Versione WSL: 1.2.5.0
      Versione kernel: 5.15.90.1
      ...
    */

    // split the output in lines
    const lines = normalizeWSLOutput(stdout).split('\n');

    // the first line should display the version of the wsl - WSL version: 1.2.5.0
    const wslVersion = getVersionFromWSLOutput(lines[0], 'wsl');

    // the second line should display the kernel version - Kernel version: 5.15.90.1
    const kernelVersion = getVersionFromWSLOutput(lines[1], 'kernel');

    // the last line should display the Windows version - Windows version: 10.0.22621.2134
    const windowsVersion = getVersionFromWSLOutput(lines[6], 'windows');

    return { wslVersion, kernelVersion, windowsVersion };
  }
}

/**
 * it extract the content after the colon which should be the version of the tool/system
 * @param line the content to analyze
 * @param value the tool/system to find the version for
 * @returns the content after the colon if the line belongs to the tool/system we are searching info for
 */
function getVersionFromWSLOutput(line: string, value: string): string | undefined {
  if (!line) {
    return undefined;
  }
  const colonPosition = indexOfColons(line);
  if (colonPosition >= 0 && line.substring(0, colonPosition).toLowerCase().includes(value)) {
    return line.substring(colonPosition + 1).trim();
  }
  return undefined;
}

/**
 * When using a non-latin language like chinese, WSL also uses a different value for the colon symbol
 * There are three colons:
 * symbol | name            | number
 * :      | vertical colon  | 58
 * ：     | fullwidth colon | 65306
 * ﹕     | small colon     | 65109
 * This function returns the position of the first colon symbol found in the string
 */
function indexOfColons(value: string): number {
  for (let i = 0; i < value.length; i++) {
    const codeChar = value.charCodeAt(i);
    if (codeChar === 58 || codeChar === 65306 || codeChar === 65109) {
      return i;
    }
  }
  return -1;
}
