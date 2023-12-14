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

import { expect, test } from 'vitest';
import { promises, existsSync } from 'node:fs';
import { resolve } from 'node:path';

test('expect extension name match extension folder', async () => {
  // grab all folders in extensions folder
  const extensionsDir = __dirname;
  const allFiles = await promises.readdir(extensionsDir, { withFileTypes: true });
  const folders = allFiles.filter(dirent => dirent.isDirectory());

  // keep only folders with a package.json file inside
  const extensionsWithPackageJsonFile = folders.filter(folder => {
    // check if package.json exists
    const packageJsonPath = resolve(extensionsDir, folder.name, 'package.json');
    return existsSync(packageJsonPath);
  });

  // now check for each extension with a json file if the extension name match the folder name
  for (const extensionFolder of extensionsWithPackageJsonFile) {
    const packageJsonPath = resolve(extensionsDir, extensionFolder.name, 'package.json');
    const packageJson = await promises.readFile(packageJsonPath, 'utf8');
    const packageJsonObj = JSON.parse(packageJson);
    expect(packageJsonObj.name).toBe(extensionFolder.name);
  }
});
