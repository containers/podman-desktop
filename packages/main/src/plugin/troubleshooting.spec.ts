/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); * you may not use this file except in compliance with the License.
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

import { beforeEach, expect, test, vi } from 'vitest';
import { Troubleshooting, generateLogFileName } from './troubleshooting.js';
import type { FileMap, LogType } from './troubleshooting.js';
import * as fs from 'node:fs';

const writeZipMock = vi.fn();
const addFileMock = vi.fn();

vi.mock('electron', () => {
  return {
    ipcMain: {
      emit: vi.fn(),
      on: vi.fn(),
    },
  };
});

vi.mock('adm-zip', () => {
  return {
    default: class {
      addFile = addFileMock;
      writeZip = writeZipMock;
    },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

// Test the saveLogsToZip function
test('Should save a zip file with the correct content', async () => {
  const zipFile = new Troubleshooting(undefined);
  const fileMaps = [
    {
      fileName: 'file1',
      content: 'content1',
    },
    {
      fileName: 'file2',
      content: 'content2',
    },
  ];

  const zipSpy = vi.spyOn(zipFile, 'saveLogsToZip');

  await zipFile.saveLogsToZip(fileMaps, 'test.zip');
  expect(zipSpy).toHaveBeenCalledWith(fileMaps, 'test.zip');

  expect(writeZipMock).toHaveBeenCalledWith('test.zip');
});

// Do not expect writeZipMock to have been called if fileMaps is empty
test('Should not save a zip file if fileMaps is empty', async () => {
  const zipFile = new Troubleshooting(undefined);
  const fileMaps: FileMap[] = [];

  const zipSpy = vi.spyOn(zipFile, 'saveLogsToZip');

  await zipFile.saveLogsToZip(fileMaps, 'test.zip');
  expect(zipSpy).toHaveBeenCalledWith(fileMaps, 'test.zip');

  expect(writeZipMock).not.toHaveBeenCalled();
});

// Expect the file name to have a .txt extension
test('Should have a .txt extension in the file name', async () => {
  const zipFile = new Troubleshooting(undefined);
  const fileMaps = [
    {
      fileName: 'file1',
      content: 'content1',
    },
    {
      fileName: 'file2',
      content: 'content2',
    },
  ];

  const zipSpy = vi.spyOn(zipFile, 'saveLogsToZip');

  await zipFile.saveLogsToZip(fileMaps, 'test.zip');
  expect(zipSpy).toHaveBeenCalledWith(fileMaps, 'test.zip');

  expect(addFileMock).toHaveBeenCalledWith('file1.txt', Buffer.from('content1', 'utf8'));
  expect(addFileMock).toHaveBeenCalledWith('file2.txt', Buffer.from('content2', 'utf8'));
});

// Expect getConsoleLogs to correctly format the console logs passed in
test('Should correctly format console logs', async () => {
  const zipFile = new Troubleshooting(undefined);
  const consoleLogs = [
    {
      logType: 'log' as LogType,
      date: new Date(),
      message: 'message1',
    },
    {
      logType: 'log' as LogType,
      date: new Date(),
      message: 'message2',
    },
  ];

  const zipSpy = vi.spyOn(zipFile, 'getConsoleLogs');

  const fileMaps = zipFile.getConsoleLogs(consoleLogs);
  expect(zipSpy).toHaveBeenCalledWith(consoleLogs);

  expect(fileMaps[0].fileName).toContain('console');
  expect(fileMaps[0].content).toContain('log : message1');
  expect(fileMaps[0].content).toContain('log : message2');
});

// Expect getSystemLogs to return getMacSystemLogs if the platform is darwin
// mock the private getMacSystemLogs function so we can spy on it
test('Should return getMacSystemLogs if the platform is darwin', async () => {
  // Mock platform to be darwin
  vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');

  const readFileMock = vi.spyOn(fs.promises, 'readFile');
  readFileMock.mockResolvedValue('content');

  // Mock exists to be true
  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  const zipFile = new Troubleshooting(undefined);
  const getSystemLogsSpy = vi.spyOn(zipFile, 'getSystemLogs');

  await zipFile.getSystemLogs();
  expect(getSystemLogsSpy).toHaveBeenCalled();

  // Expect it to have been called twice as it checked stdout and stderr
  expect(readFileMock).toHaveBeenCalledTimes(2);

  // Expect readFileMock to have been called with /Library/Logs/Podman Desktop/launchd-stdout.log but CONTAINED in the path
  expect(readFileMock).toHaveBeenCalledWith(
    expect.stringContaining('/Library/Logs/Podman Desktop/launchd-stdout.log'),
    'utf8',
  );
  expect(readFileMock).toHaveBeenCalledWith(
    expect.stringContaining('/Library/Logs/Podman Desktop/launchd-stderr.log'),
    'utf8',
  );
});

// Should return getWindowsSystemLogs if the platform is win32
// ~/AppData/Roaming/Podman Desktop/logs/podman-desktop.log
test('Should return getWindowsSystemLogs if the platform is win32', async () => {
  // Mock exists to be true
  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

  // Mock platform to be win32
  vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');

  const readFileMock = vi.spyOn(fs.promises, 'readFile');
  readFileMock.mockResolvedValue('content');

  const zipFile = new Troubleshooting(undefined);
  const getSystemLogsSpy = vi.spyOn(zipFile, 'getSystemLogs');

  await zipFile.getSystemLogs();
  expect(getSystemLogsSpy).toHaveBeenCalled();

  // Expect it to have been called once as it checked podman-desktop.log
  expect(readFileMock).toHaveBeenCalledTimes(1);

  // Expect readFileMock to have been called with ~/AppData/Roaming/Podman Desktop/logs/podman-desktop.log but CONTAINED in the path
  expect(readFileMock).toHaveBeenCalledWith(
    expect.stringContaining('/AppData/Roaming/Podman Desktop/logs/podman-desktop.log'),
    'utf8',
  );
});

test('test generateLogFileName', async () => {
  const fileName = generateLogFileName('test');

  // Simple regex to check that the file name is in the correct format (YYYMMDDHHmmss)
  expect(fileName).toMatch(/[0-9]{14}/);
  expect(fileName).toContain('test');
});
