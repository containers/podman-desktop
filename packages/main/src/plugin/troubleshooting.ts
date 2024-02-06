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

import AdmZip from 'adm-zip';
import moment from 'moment';
import * as os from 'node:os';
import * as fs from 'node:fs';

const SYSTEM_FILENAME = 'system';

export interface FileMap {
  fileName: string;
  content: string;
}

export type LogType = 'log' | 'warn' | 'trace' | 'debug' | 'error';

export class Troubleshooting {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private apiSender: any) {}

  // The "main" function that is exposes that is used to gather
  // all the logs and save them to a zip file.
  // this also takes in the console logs and adds them to the zip file (see preload/src/index.ts) regarding memoryLogs
  async saveLogs(console: { logType: LogType; message: string }[], destination: string): Promise<string[]> {
    const systemLogs = await this.getSystemLogs();
    const consoleLogs = this.getConsoleLogs(console);
    const fileMaps = [...systemLogs, ...consoleLogs];
    await this.saveLogsToZip(fileMaps, destination);
    return fileMaps.map(fileMap => fileMap.fileName);
  }

  async saveLogsToZip(fileMaps: FileMap[], destination: string): Promise<void> {
    if (fileMaps.length === 0) return;

    const zip = new AdmZip();
    fileMaps.forEach(fileMap => {
      zip.addFile(fileMap.fileName, Buffer.from(fileMap.content, 'utf8'));
    });
    zip.writeZip(destination);
    console.log(`Zip file saved to ${destination}`);
  }

  getConsoleLogs(consoleLogs: { logType: LogType; message: string }[]): FileMap[] {
    const content = consoleLogs.map(log => `${log.logType} : ${log.message}`).join('\n');
    return [{ fileName: generateLogFileName('console'), content }];
  }

  async getSystemLogs(): Promise<FileMap[]> {
    switch (os.platform()) {
      case 'darwin':
        return this.getLogsFromFiles(
          ['launchd-stdout.log', 'launchd-stderr.log'],
          `${os.homedir()}/Library/Logs/Podman Desktop`,
        );
      case 'win32':
        return this.getLogsFromFiles(['podman-desktop'], `${os.homedir()}/AppData/Roaming/Podman Desktop/logs`);
      default:
        console.log('Unsupported platform for retrieving system logs');
        return [];
    }
  }

  private async getFileSystemContent(filePath: string, logName: string): Promise<FileMap> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return { fileName: generateLogFileName(SYSTEM_FILENAME + '-' + logName), content };
    } catch (error) {
      console.error(`Error reading file from ${filePath}: `, error);
      throw error;
    }
  }

  private async getLogsFromFiles(logFiles: string[], logDir: string): Promise<FileMap[]> {
    const logs: FileMap[] = [];
    for (const file of logFiles) {
      try {
        const filePath = `${logDir}/${file}`;

        // Check if the file exists, if not, skip it.
        if (!fs.existsSync(filePath)) {
          console.log(`File ${filePath} does not exist, skipping`);
          continue;
        }

        const fileMap = await this.getFileSystemContent(filePath, file);
        logs.push(fileMap);
      } catch (error) {
        console.error(`Error reading ${file}: `, error);
      }
    }
    return logs;
  }
}

export function generateLogFileName(filename: string, extension?: string): string {
  // If the filename has an extension like .log, move it to the end ofthe generated name
  // otherwise just use .txt
  const filenameParts = filename.split('.');
  // Use the file extension if it's provided, otherwise use the one from the file name, or default to txt
  const fileExtension = extension ? extension : filenameParts.length > 1 ? filenameParts[1] : 'txt';
  return `${filenameParts[0]}-${moment().format('YYYYMMDDHHmmss')}.${fileExtension}`;
}
