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

import type { LifecycleContext, Logger } from '@podman-desktop/api';

export class LifecycleContextImpl implements LifecycleContext {
  log: LoggerImpl;

  constructor() {
    this.log = new LoggerImpl();
  }
}

export class LoggerImpl implements Logger {
  private logHandler?: Logger;
  private buffer: Array<{ type: LogType; data: unknown[] }> = [];

  setLogHandler(handler: Logger): void {
    this.logHandler = handler;
    if (this.buffer.length > 0) {
      for (const message of this.buffer) {
        switch (message.type) {
          case LogType.LOG:
            handler.log(message.data);
            break;
          case LogType.ERROR:
            handler.error(message.data);
            break;
          case LogType.WARN:
            handler.warn(message.data);
            break;
        }
      }
    }
  }

  removeLogHandler(): void {
    this.logHandler = undefined;
  }

  log(...data: unknown[]): void {
    this.logHandler?.log(...data);
    this.buffer.push({ type: LogType.LOG, data });
  }
  error(...data: unknown[]): void {
    this.logHandler?.error(...data);
    this.buffer.push({ type: LogType.ERROR, data });
  }
  warn(...data: unknown[]): void {
    this.logHandler?.warn(...data);
    this.buffer.push({ type: LogType.WARN, data });
  }
}

enum LogType {
  LOG,
  ERROR,
  WARN,
}
