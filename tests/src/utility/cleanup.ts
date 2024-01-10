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

import type { Stats } from 'node:fs';
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';
import { userInfo } from 'os';

/**
 * Force remove recursively folder, if exists
 * @param path path to a folder to be force removed recursively
 */
export async function removeFolderIfExists(path: string) {
  console.log(`Cleaning up folder: ${path}`);
  if (existsSync(path)) {
    console.log(`Folder found, removing...`);
    walkDir(path);
    rmSync(path, { recursive: true, force: true, maxRetries: 5 });
  }
}

function walkDir(dir: string): void {
  const files = readdirSync(dir);
  getUserInfo();

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const isDirectory = statSync(filePath).isDirectory();
    const stats = statSync(filePath);

    if (isDirectory) {
      console.log(`[Folder]: ${filePath}`);
      printStats(stats);
      walkDir(filePath);
    } else {
      console.log(`[File]: ${filePath}`);
      printStats(stats);
    }
  });
}

function getUserInfo(): void {
  console.log(userInfo());
}

function printStats(stats: Stats) {
  console.log(` - owner: ${stats.uid} + mode: ${stats.mode.toString(8)} + Last modified: ${stats.mtime}`);
}
