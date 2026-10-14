/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import * as fs from 'node:fs';

import type { LogType } from '@desktop-framework/api';
import type { IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type AdmZip from 'adm-zip';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { DialogRegistry } from '/@/plugin/dialog-registry.js';
import { Uri } from '/@/plugin/types/uri.js';
import product from '/@product.json' with { type: 'json' };

import type { TroubleshootingFileMap } from './troubleshooting.js';
import { Troubleshooting } from './troubleshooting.js';

const DIALOG_REGISTRY_MOCK: DialogRegistry = {
  saveDialog: vi.fn(),
} as unknown as DialogRegistry;

const CONFIGURATION_REGISTRY_MOCK: IConfigurationRegistry = {
  registerConfigurations: vi.fn(),
} as unknown as IConfigurationRegistry;

const writeZipMock = vi.fn();
const addFileMock = vi.fn();

vi.mock(import('node:fs'));

vi.mock(import('adm-zip'), () => {
  return {
    default: class {
      addFile = addFileMock;
      writeZip = writeZipMock;
    } as unknown as typeof AdmZip,
  };
});

vi.mock(import('/@product.json'));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(product).name = 'Test Id';
  vi.mocked(product).artifactName = 'test-id';
});

test('init should register the logsTimestamps configuration', () => {
  const troubleshooting = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);
  troubleshooting.init();

  expect(CONFIGURATION_REGISTRY_MOCK.registerConfigurations).toHaveBeenCalledWith([
    expect.objectContaining({
      id: 'troubleshooting.logs',
      properties: expect.objectContaining({
        'troubleshooting.logsTimestamps': expect.objectContaining({
          type: 'boolean',
          default: false,
        }),
      }),
    }),
  ]);
});

describe('saveLogs', () => {
  test('should use DialogRegistry#saveDialog', async () => {
    const output = Uri.file('foo.zip');
    vi.mocked(DIALOG_REGISTRY_MOCK.saveDialog).mockResolvedValue(output);

    const troubleshooting = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);

    await troubleshooting.saveLogs([]);

    expect(DIALOG_REGISTRY_MOCK.saveDialog).toHaveBeenCalledExactlyOnceWith({
      defaultUri: expect.any(Uri),
      title: 'Save Logs as .zip',
    });
  });

  test('should return empty array if user cancelled save dialog', async () => {
    vi.mocked(DIALOG_REGISTRY_MOCK.saveDialog).mockResolvedValue(undefined);

    const troubleshooting = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);

    const result = await troubleshooting.saveLogs([]);
    expect(result).toHaveLength(0);
  });
});

// Test the saveLogsToZip function
test('Should save a zip file with the correct content', async () => {
  const zipFile = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);
  const fileMaps = [
    {
      filename: 'file1',
      content: 'content1',
    },
    {
      filename: 'file2',
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
  const zipFile = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);
  const fileMaps: TroubleshootingFileMap[] = [];

  const zipSpy = vi.spyOn(zipFile, 'saveLogsToZip');

  await zipFile.saveLogsToZip(fileMaps, 'test.zip');
  expect(zipSpy).toHaveBeenCalledWith(fileMaps, 'test.zip');

  expect(writeZipMock).not.toHaveBeenCalled();
});

// Expect the file name to have a .txt extension
test('Should have a .txt extension in the file name', async () => {
  const zipFile = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);
  const fileMaps = [
    {
      filename: 'file1',
      content: '',
    },
    {
      filename: 'file2',
      content: '',
    },
  ];

  const zipSpy = vi.spyOn(zipFile, 'saveLogsToZip');

  await zipFile.saveLogsToZip(fileMaps, 'test.zip');
  expect(zipSpy).toHaveBeenCalledWith(fileMaps, 'test.zip');

  expect(addFileMock).toHaveBeenCalledWith('file1', expect.any(Object));
  expect(addFileMock).toHaveBeenCalledWith('file2', expect.any(Object));
});

// Expect getConsoleLogs to correctly format the console logs passed in
test('Should correctly format console logs', async () => {
  const zipFile = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);
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

  expect(fileMaps[0]?.filename).toContain('console');
  expect(fileMaps[0]?.content).toContain('log : message1');
  expect(fileMaps[0]?.content).toContain('log : message2');
});

// Expect getSystemLogs to return getMacSystemLogs if the platform is darwin
// mock the private getMacSystemLogs function so we can spy on it
test('Should return getMacSystemLogs if the platform is darwin', async () => {
  // Mock platform to be darwin
  vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');

  const readFileMock = vi.spyOn(fs.promises, 'readFile');
  readFileMock.mockResolvedValue('content');

  // Mock exists to be true
  vi.mocked(fs.existsSync).mockReturnValue(true);

  const zipFile = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);
  const getSystemLogsSpy = vi.spyOn(zipFile, 'getSystemLogs');

  await zipFile.getSystemLogs();
  expect(getSystemLogsSpy).toHaveBeenCalled();

  // Expect it to have been called twice as it checked stdout and stderr
  expect(readFileMock).toHaveBeenCalledTimes(2);

  // Expect readFileMock to have been called with /Library/Logs/Podman Desktop/launchd-stdout.log but CONTAINED in the path
  expect(readFileMock).toHaveBeenCalledWith(expect.stringContaining('/Library/Logs/Test Id/launchd-stdout'), 'utf-8');
  expect(readFileMock).toHaveBeenCalledWith(expect.stringContaining('/Library/Logs/Test Id/launchd-stderr'), 'utf-8');
});

// Should return getWindowsSystemLogs if the platform is win32
// ~/AppData/Roaming/Podman Desktop/logs/podman-desktop.log
test('Should return getWindowsSystemLogs if the platform is win32', async () => {
  // Mock exists to be true
  vi.mocked(fs.existsSync).mockReturnValue(true);

  // Mock platform to be win32
  vi.spyOn(process, 'platform', 'get').mockReturnValue('win32');

  const readFileMock = vi.spyOn(fs.promises, 'readFile');
  readFileMock.mockResolvedValue('content');

  const zipFile = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);
  const getSystemLogsSpy = vi.spyOn(zipFile, 'getSystemLogs');

  await zipFile.getSystemLogs();
  expect(getSystemLogsSpy).toHaveBeenCalled();

  // Expect it to have been called once as it checked podman-desktop.log
  expect(readFileMock).toHaveBeenCalledTimes(1);

  // Expect readFileMock to have been called with ~/AppData/Roaming/Podman Desktop/logs/podman-desktop.log but CONTAINED in the path
  expect(readFileMock).toHaveBeenCalledWith(expect.stringContaining('/AppData/Roaming/Test Id/logs/test-id'), 'utf-8');
});

// test generateLogFileName for different cases
test.each([
  { file: 'test', extension: undefined, expected: /test-\d{14}\.txt/ }, // default to txt
  { file: 'test', extension: 'customExtension', expected: /test-\d{14}\.customExtension/ }, // use provided extension
  { file: 'test.log', extension: undefined, expected: /test-\d{14}\.log/ }, // use extension from filename
  { file: 'test.log', extension: 'customExtension', expected: /test-\d{14}\.customExtension/ }, //use provided extension
])('test generateLogFileName, file: $file, extension: $extension', async ({ file, extension, expected }) => {
  const ts = new Troubleshooting(DIALOG_REGISTRY_MOCK, CONFIGURATION_REGISTRY_MOCK);
  const filename = ts.generateLogFileName(file, extension);
  // Check the format of "name"-"date(14digits)"-"extension"
  expect(filename).toMatch(new RegExp(expected));
});
