#!/usr/bin/env node
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
const { https } = require('follow-redirects');
const fs = require('node:fs');
const path = require('node:path');

const tools = require('../src/podman.json');

const platform = process.platform;

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest, { flags: 'wx' });

    const request = https.get(url, { headers: { 'User-Agent': 'Podman Desktop' } }, response => {
      if (response.statusCode === 200) {
        response.pipe(file);
      } else {
        file.close();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        fs.unlink(dest, () => { }); // Delete temp file
        reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
      }
    });

    request.on('error', err => {
      file.close();
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      fs.unlink(dest, () => { }); // Delete temp file
      reject(err.message);
    });

    file.on('finish', () => {
      resolve();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file.on('error', (err) => {
      file.close();
      console.error(err);
      if (err.code === 'EEXIST') {
        reject('File already exists');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        fs.unlink(dest, () => { }); // Delete temp file
        reject(err.message);
      }
    });
  });
}
async function downloadPackage(url, fileName) {
  if (url && fileName) {
    const destDir = path.resolve(__dirname, '..', 'assets');
    if(!fs.existsSync(destDir)){
      fs.mkdirSync(destDir);
    }
    const destFile = path.resolve(destDir, fileName);
    if (!fs.existsSync(destFile)) {
      console.log(`Downloading Podman package from ${url}`);
      await downloadFile(url, destFile);
      console.log(`Downloaded to ${destFile}`);
    } else {
      console.log(`Podman package ${url} already downloaded. Exiting...`);
    }
  } else {
    console.error(`Can't find Podman package to download. Please look on ${path.resolve(__dirname, '..', 'podman.json')}`);
    process.exit(42);
  }
}

let url, dlName;
if (platform === 'win32') {
  url = tools.platform.win32.url;
  dlName = tools.platform.win32.fileName;
  downloadPackage(url, dlName);
} else if (platform === 'darwin') {
  const aarch64 = downloadPackage(tools.platform.darwin.arch.arm64.url, tools.platform.darwin.arch.arm64.fileName);
  const amd64 = downloadPackage(tools.platform.darwin.arch.x64.url, tools.platform.darwin.arch.x64.fileName);
  Promise.all([aarch64, amd64]);
}


