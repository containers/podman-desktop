#!/usr/bin/env node
/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

const AdmZip = require('adm-zip');
const path = require('path');
const packageJson = require('../package.json');
const fs = require('fs');
const { mkdirp } = require('mkdirp');

const destFile = path.resolve(__dirname, `../${packageJson.name}.cdix`);
const builtinDirectory = path.resolve(__dirname, '../builtin');
const unzippedDirectory = path.resolve(builtinDirectory, `${packageJson.name}.cdix`);
// remove the .cdix file before zipping
if (fs.existsSync(destFile)) {
  fs.rmSync(destFile);
}
// remove the builtin folder before zipping
if (fs.existsSync(builtinDirectory)) {
  fs.rmSync(builtinDirectory, { recursive: true, force: true });
}

const zip = new AdmZip();
zip.addLocalFolder(path.resolve(__dirname, '../'));
zip.writeZip(destFile);

// create unzipped built-in
mkdirp(unzippedDirectory).then(() => {
  const unzip = new AdmZip(destFile);
  unzip.extractAllTo(unzippedDirectory);
});
