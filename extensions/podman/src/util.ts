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
import * as path from 'node:path';

import type { LifecycleContext, Logger } from '@podman-desktop/api';

const windows = os.platform() === 'win32';
export function isWindows(): boolean {
  return windows;
}
const mac = os.platform() === 'darwin';
export function isMac(): boolean {
  return mac;
}
const linux = os.platform() === 'linux';
export function isLinux(): boolean {
  return linux;
}
const xdgDataDirectory = '.local/share/containers';
export function appHomeDir(): string {
  return xdgDataDirectory + '/podman';
}

const configDirectory = '.config/containers';
export function appConfigDir(): string {
  return `${configDirectory}/podman`;
}

/**
 * @returns true if app running in dev mode
 */
export function isDev(): boolean {
  if (process.env.ELECTRON_IS_DEV) {
    return Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
  }
  return false;
}

export interface RunOptions {
  env?: NodeJS.ProcessEnv;
}

export function getAssetsFolder(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (isDev()) {
    return path.resolve(__dirname, '..', 'assets');
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return path.resolve((process as any).resourcesPath, 'extensions', 'podman', 'assets');
  }
}

/**
 * LoggerDelegator class implements the Logger interface and acts as a delegator for multiple Logger instances.
 * It allows to combine multiple loggers into a single logger and forwards log, error, and warn messages to each
 * individual logger in its internal list.
 *
 * This class addresses a specific use case where the new process API requires a single logger object, but we have
 * separate loggers and lifecycle contexts, where each lifecycle context also contains a logger object.
 * To accommodate this scenario, this adapter is created to hold multiple logger objects
 * and delegate method calls to each of them, providing a unified logger interface for the process API.
 *
 * If a similar use case arises in other extensions, it will be necessary to extend the RunOptions interface
 * by adding a new field called `lifecycleContext` that can hold a LifecycleContext instance.
 * Subsequently, the LoggerDelegator class can be removed, and the new RunOptions interface with the `lifecycleContext`
 * field can be used directly, simplifying the process of passing the logger to the process API while preserving
 * the necessary functionalities.
 */
export class LoggerDelegator implements Logger {
  private loggers: Logger[] = [];

  constructor(...loggersOrContexts: (Logger | LifecycleContext | undefined)[]) {
    loggersOrContexts.forEach(loggerOrContext => {
      if (loggerOrContext === undefined) {
        return;
      }
      if (typeof loggerOrContext.log === 'object') {
        this.loggers.push(loggerOrContext.log);
      } else if (typeof loggerOrContext.log === 'function') {
        this.loggers.push(loggerOrContext as Logger);
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(...data: any[]): void {
    this.loggers.forEach(logger => logger.log(...data));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...data: any[]): void {
    this.loggers.forEach(logger => logger.error(...data));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...data: any[]): void {
    this.loggers.forEach(logger => logger.warn(...data));
  }
}

// this is workaround, wsl2 some time send output in utf16le, but we treat that as utf8,
// this code just eliminate every 'empty' character
/**
 * this function is a workaround to clean the output received by WSL2. Some time it sends output in utf16le, but we treat that as utf8,
 * this code just eliminate every 'empty' character
 * @param out the string to clean
 * @returns the string cleaned
 */
export function normalizeWSLOutput(out: string): string {
  let str = '';
  for (let i = 0; i < out.length; i++) {
    if (out.charCodeAt(i) !== 0) {
      str += out.charAt(i);
    }
  }
  return str;
}
