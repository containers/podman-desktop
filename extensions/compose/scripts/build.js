#!/usr/bin/env node
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

const zipper = require('zip-local');
const path = require('path');
const package = require('../package.json');
const { mkdirp } = require('mkdirp');
const fs = require('fs');

const destFile = path.resolve(__dirname, `../${package.name}.cdix`);
const builtinDirectory = path.resolve(__dirname, '../builtin');
const unzippedDirectory = path.resolve(builtinDirectory, `${package.name}.cdix`);
// remove the .cdix file before zipping
if (fs.existsSync(destFile)) {
  fs.rmSync(destFile);
}
// remove the builtin folder before zipping
if (fs.existsSync(builtinDirectory)) {
  fs.rmSync(builtinDirectory, { recursive: true, force: true });
}

zipper.sync.zip(path.resolve(__dirname, '../')).compress().save(destFile);

// create unzipped built-in
mkdirp(unzippedDirectory).then(() => {
  zipper.sync.unzip(destFile).save(unzippedDirectory);
});
