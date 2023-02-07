/*---------------------------------------------------------------------------------------------
 *  Copyright (C) Microsoft Corporation. All rights reserved.
 *  Copyright (C) 2022 - 2023 Red Hat, Inc.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this
 *  software and associated documentation files (the "Software"), to deal in the Software
 *  without restriction, including without limitation the rights to use, copy, modify,
 *  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to the following
 *  conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all copies
 *  or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 *  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 *  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
 *  OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 *  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 *  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *--------------------------------------------------------------------------------------------*/

type LogLevel = 'Trace' | 'Info' | 'Error';

class Log {
  private data2String(data: any): string {
    if (data instanceof Error) {
      return data.stack || data.message;
    }
    if (data.success === false && data.message) {
      return data.message;
    }
    return data.toString();
  }

  public info(message: string, data?: any): void {
    this.logLevel('Info', message, data);
  }

  public error(message: string, data?: any): void {
    this.logLevel('Error', message, data);
  }

  public logLevel(level: LogLevel, message: string, data?: any): void {
    if (level === 'Error') {
      console.error(`[${level}  - ${this.now()}] ${message}`);
      if (data) {
        console.error(this.data2String(data));
      }
    } else {
      console.info(`[${level}  - ${this.now()}] ${message}`);
      if (data) {
        console.info(this.data2String(data));
      }
    }
  }

  private now(): string {
    const now = new Date();
    return (
      padLeft(now.getUTCHours() + '', 2, '0') +
      ':' +
      padLeft(now.getMinutes() + '', 2, '0') +
      ':' +
      padLeft(now.getUTCSeconds() + '', 2, '0') +
      '.' +
      now.getMilliseconds()
    );
  }
}

function padLeft(s: string, n: number, pad = ' ') {
  return pad.repeat(Math.max(0, n - s.length)) + s;
}
const Logger = new Log();
export default Logger;
