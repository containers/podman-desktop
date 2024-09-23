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

const AdmZip = require('adm-zip');
const path = require('path');
const packageJson = require('../package.json');
const { mkdirp } = require('mkdirp');
const fs = require('fs');
const byline = require('byline');
const cp = require('copyfiles');

const destFile = path.resolve(__dirname, `../${packageJson.name}.cdix`);
const builtinDirectory = path.resolve(__dirname, '../builtin');
const zipDirectory = path.resolve(builtinDirectory, `${packageJson.name}.cdix`);
const extFiles = path.resolve(__dirname, '../.extfiles');
const fileStream = fs.createReadStream(extFiles, { encoding: 'utf8' });

const includedFiles = [];

// remove the .cdix file before zipping
if (fs.existsSync(destFile)) {
  fs.rmSync(destFile);
}
// remove the builtin folder before zipping
if (fs.existsSync(builtinDirectory)) {
  fs.rmSync(builtinDirectory, { recursive: true, force: true });
}

byline(fileStream)
  .on('data', line => {
    includedFiles.push(line);
  })
  .on('error', () => {
    throw new Error('Error reading .extfiles');
  })
  .on('end', () => {
    includedFiles.push(zipDirectory);
    mkdirp.sync(zipDirectory);
    console.log(`Copying files to ${zipDirectory}`);
    cp(includedFiles, error => {
      if (error) {
        throw new Error('Error copying files', error);
      }
      console.log(`Zipping files to ${destFile}`);
      const zip = new AdmZip();
      zip.addLocalFolder(zipDirectory);
      zip.writeZip(destFile);
    });
  });
