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

import * as os from 'node:os';
import { https } from 'follow-redirects';
import * as fs from 'node:fs';

export const isWindows = os.platform() === 'win32';
export const isMac = os.platform() === 'darwin';
export const isLinux = os.platform() === 'linux';

export function fetchJson<T>(url: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    https
      .get(url, { headers: { Accept: 'application/vnd.github.v3+json', 'User-Agent': 'Podman Desktop' } }, res => {
        let body = '';

        res.on('data', chunk => {
          body += chunk;
        });

        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve(json);
          } catch (error) {
            console.error(error.message);
          }
        });
      })
      .on('error', error => {
        reject(error);
      });
  });
}

export function downloadFile(url: string, dest: string): Promise<void> {
  console.error('Download: ' + url + ' to: ' + dest);
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest, { flags: 'wx' });

    const request = https.get(url, { headers: { 'User-Agent': 'Podman Desktop' } }, response => {
      if (response.statusCode === 200) {
        response.pipe(file);
      } else {
        file.close();
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        fs.unlink(dest, () => {}); // Delete temp file
        reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
      }
    });

    request.on('error', err => {
      file.close();
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      fs.unlink(dest, () => {}); // Delete temp file
      reject(err.message);
    });

    file.on('finish', () => {
      resolve();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    file.on('error', (err: any) => {
      file.close();

      if (err.code === 'EEXIST') {
        reject('File already exists');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        fs.unlink(dest, () => {}); // Delete temp file
        reject(err.message);
      }
    });
  });
}
