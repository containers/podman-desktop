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

import { test, vi, expect } from 'vitest';
import { Logger } from './logger';
import type { LogLevel } from 'electron-log';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import util from 'node:util';
import moment from 'moment/moment';

const desiredLogLevel: LogLevel = 'debug';

test('Should correct remove old log entries', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));
  fs.appendFileSync(path.join(tmpDir, 'a.log'), 'data to append', 'utf8');

  //synthetic pause in 10ms
  await sleep(10);
  function sleep(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  fs.appendFileSync(path.join(tmpDir, 'b.log'), 'data to append', 'utf8');

  const actualFiles = fs.readdirSync(tmpDir);

  expect(actualFiles.find(name => name === 'a.log')).toBeDefined();
  expect(actualFiles.find(name => name === 'b.log')).toBeDefined();
  expect(actualFiles.find(name => name === 'podman-desktop.log')).toBeUndefined();

  const bStat = fs.statSync(path.join(tmpDir, 'b.log'));

  // here we emulate mtime for b.log to be like two days old
  vi.spyOn(util, 'inspect').mockImplementation(object => {
    if (bStat.mtime.getMilliseconds() === (object as Date).getMilliseconds()) {
      return moment(object as Date)
        .subtract(2, 'd')
        .toDate();
    }

    return object;
  });

  new Logger(desiredLogLevel, tmpDir).info('some data');

  const actualFilesAfterLoggerInit = fs.readdirSync(tmpDir);

  expect(actualFilesAfterLoggerInit.find(name => name === 'a.log')).toBeDefined();
  expect(actualFilesAfterLoggerInit.find(name => name === 'b.log')).toBeUndefined();
  expect(actualFilesAfterLoggerInit.find(name => name === 'podman-desktop.log')).toBeDefined();

  fs.rmSync(tmpDir, { recursive: true });
});

test('Should return correct custom log path', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));

  const logger = new Logger(desiredLogLevel, tmpDir);
  logger.info('some data');

  const logPath = logger.getLogPath();

  expect(logPath).toBe(tmpDir);

  fs.rmSync(tmpDir, { recursive: true });
});

test('Should return correct default log path', () => {
  const logger = new Logger(desiredLogLevel);

  const expectedLogPath = getLibraryDefaultDir(process.platform, 'Podman Desktop');

  expect(logger.getLogPath()).toBe(expectedLogPath);
});

test('Should create custom log path', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));

  // this need to have temporary folder path, which is not created
  fs.rmSync(tmpDir, { recursive: true });

  expect(fs.existsSync(tmpDir)).toBeFalsy();

  new Logger(desiredLogLevel, tmpDir);

  expect(fs.existsSync(tmpDir)).toBeTruthy();

  fs.rmSync(tmpDir, { recursive: true });
});

test('Should call call logger.error method correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));
  const logger = new Logger(desiredLogLevel, tmpDir);
  const spyObj = vi.spyOn(logger, 'log');

  logger.error('error message', 'data');

  expect(spyObj).toBeCalledWith('error', 'error message', ['data']);

  fs.rmSync(tmpDir, { recursive: true });
});

test('Should call call logger.warn method correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));
  const logger = new Logger(desiredLogLevel, tmpDir);
  const spyObj = vi.spyOn(logger, 'log');

  logger.warn('warn message', 'data');

  expect(spyObj).toBeCalledWith('warn', 'warn message', ['data']);

  fs.rmSync(tmpDir, { recursive: true });
});

test('Should call call logger.info method correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));
  const logger = new Logger(desiredLogLevel, tmpDir);
  const spyObj = vi.spyOn(logger, 'log');

  logger.info('info message', 'data');

  expect(spyObj).toBeCalledWith('info', 'info message', ['data']);

  fs.rmSync(tmpDir, { recursive: true });
});

test('Should call call logger.verbose method correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));
  const logger = new Logger(desiredLogLevel, tmpDir);
  const spyObj = vi.spyOn(logger, 'log');

  logger.verbose('verbose message', 'data');

  expect(spyObj).toBeCalledWith('verbose', 'verbose message', ['data']);

  fs.rmSync(tmpDir, { recursive: true });
});

test('Should call call logger.debug method correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));
  const logger = new Logger(desiredLogLevel, tmpDir);
  const spyObj = vi.spyOn(logger, 'log');

  logger.debug('debug message', 'data');

  expect(spyObj).toBeCalledWith('debug', 'debug message', ['data']);

  fs.rmSync(tmpDir, { recursive: true });
});

test('Should call call logger.silly method correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'logger-'));
  const logger = new Logger(desiredLogLevel, tmpDir);
  const spyObj = vi.spyOn(logger, 'log');

  logger.silly('silly message', 'data');

  expect(spyObj).toBeCalledWith('silly', 'silly message', ['data']);

  fs.rmSync(tmpDir, { recursive: true });
});

function getLibraryDefaultDir(platform, appName) {
  if (platform === 'darwin') {
    return path.join(getHome(), 'Library/Logs', appName);
  }

  return path.join(getUserData(platform, appName), 'logs');
}

function getHome() {
  return os.homedir ? os.homedir() : process.env.HOME;
}

function getUserData(platform, appName) {
  return path.join(getAppData(platform), appName);
}

function getAppData(platform) {
  const home = getHome();

  switch (platform) {
    case 'darwin': {
      return path.join(home, 'Library/Application Support');
    }

    case 'win32': {
      return process.env.APPDATA || path.join(home, 'AppData/Roaming');
    }

    default: {
      return process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    }
  }
}
