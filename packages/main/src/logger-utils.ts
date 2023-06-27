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

import fs from 'fs';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import moment from 'moment';

/**
 * Perform compressing log paths given by additionalFiles parameter. Each parameter can be either file or folder.
 *
 * Returns the path to zipped archive that contains archived logs.
 *
 * @param logPaths log file or log folder
 */
export async function archiveLogs(...logPaths: string[]): Promise<string> {
  const logsPathName = `podman-desktop-logs-${moment().format('YYYYMMDD-HHmmss')}`;
  const tmpLogsPath = path.join(os.tmpdir(), logsPathName);

  if (!fs.existsSync(tmpLogsPath)) {
    await fs.promises.mkdir(tmpLogsPath);
  }

  await Promise.all(
    logPaths.map(async logSubject => {
      if (!fs.existsSync(logSubject)) return;

      const lstat = await fs.promises.lstat(logSubject);
      if (lstat.isDirectory()) {
        fs.cpSync(logSubject, path.join(tmpLogsPath, path.basename(logSubject)), { recursive: true });
      } else if (lstat.isFile()) {
        fs.cpSync(logSubject, path.join(tmpLogsPath, path.basename(logSubject)));
      }
    }),
  );

  const archivePath = path.join(os.tmpdir(), `${logsPathName}.zip`);
  const archive = archiver('zip', {
    zlib: { level: 9 },
    namePrependSlash: true,
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(fs.createWriteStream(archivePath));
  archive.directory(tmpLogsPath, path.basename(tmpLogsPath));
  await archive.finalize();

  fs.rmSync(tmpLogsPath, { recursive: true, force: true });

  return archivePath;
}
