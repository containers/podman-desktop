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
import type { LogLevel } from 'electron-log';
import electronLog from 'electron-log';
import moment from 'moment';
import fs from 'fs';
import type ElectronLog from 'electron-log';
import path from 'path';
import util from 'util';

export class Logger {
  private readonly defaultMessageFormat = '{y}-{m}-{d} {h}:{i}:{s}:{ms} {z} | {level} | {text}';
  private readonly defaultLogFileName = 'podman-desktop.log';
  private readonly logPath: string;
  private readonly logger: ElectronLog.ElectronLog;
  private readonly desiredLogLevel: LogLevel;

  constructor(desiredLogLevel: LogLevel, customLogsFolder?: string) {
    this.desiredLogLevel = desiredLogLevel;

    this.logger = electronLog.create('application');
    this.logger.transports.console.level = this.desiredLogLevel;
    this.logger.transports.console.format = this.defaultMessageFormat;
    this.logger.transports.file.fileName = this.defaultLogFileName;
    this.logger.transports.file.level = this.desiredLogLevel;
    this.logger.transports.file.format = this.defaultMessageFormat;

    if (customLogsFolder) {
      if (!fs.existsSync(customLogsFolder)) {
        fs.mkdirSync(customLogsFolder, { recursive: true });
      }

      this.logPath = customLogsFolder;
      this.logger.transports.file.resolvePath = () => path.join(customLogsFolder, this.defaultLogFileName);
    } else {
      this.logPath = path.dirname(this.logger.transports.file.getFile().path);
    }

    const dayAgoMomentTimestamp = moment(Date.now()).subtract(1, 'days').valueOf();
    this.deleteLogsFromMoment(dayAgoMomentTimestamp);

    // forward all messages passed from console.log functions to logger
    Object.assign(console, this.logger.functions);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error(message: string, ...data: any[]): void {
    this.log('error', message, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public warn(message: string, ...data: any[]): void {
    this.log('warn', message, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public info(message: string, ...data: any[]): void {
    this.log('info', message, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public verbose(message: string, ...data: any[]): void {
    this.log('verbose', message, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public debug(message: string, ...data: any[]): void {
    this.log('debug', message, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public silly(message: string, ...data: any[]): void {
    this.log('silly', message, data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(logLevel: LogLevel, message: string, data: any[] = []): void {
    if (data && data.length > 0) {
      data.forEach(param => {
        message += `, '${param && typeof param}': ${JSON.stringify(param)}`;
      });
    }

    switch (logLevel) {
      case 'error':
        this.logger.error(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
      case 'info':
        this.logger.info(message);
        break;
      case 'verbose':
        this.logger.verbose(message);
        break;
      case 'debug':
        this.logger.debug(message);
        break;
      case 'silly':
        this.logger.silly(message);
        break;
    }
  }

  /**
   * Retrieves the path where logs are stored.
   */
  public getLogPath(): string {
    return this.logPath;
  }

  private deleteLogsFromMoment(deleteTimeStamp: number): void {
    const files = fs.readdirSync(this.logPath);
    files.forEach(file => {
      const filePath = path.join(this.logPath, file);
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const fileTimestamp = new Date(util.inspect(stat.mtime)).getTime();
        if (fileTimestamp < deleteTimeStamp) {
          fs.unlinkSync(filePath);
        }
      }
    });
  }
}
