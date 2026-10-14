/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { FileSystemWatcher } from '@desktop-framework/extension-api';
import type { FileMatcher } from 'get-tsconfig';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { FilesystemMonitoring } from '/@/plugin/filesystem-monitoring.js';

import type { AnalyzedExtension } from './extension-analyzer.js';
import type { ActivatedExtension } from './extension-loader.js';
import { ExtensionWatcher } from './extension-watcher.js';

vi.mock(import('get-tsconfig'));

const fileSystemMonitoring = {
  createFileSystemWatcher: vi.fn(),
} as unknown as FilesystemMonitoring;

class TestExtensionWatcher extends ExtensionWatcher {
  public override isWatched(extension: AnalyzedExtension): boolean {
    return super.isWatched(extension);
  }

  public override reloadExtension(extension: AnalyzedExtension): void {
    super.reloadExtension(extension);
  }

  public override async getTsConfigFileMatcher(extension: AnalyzedExtension): Promise<FileMatcher | undefined> {
    return super.getTsConfigFileMatcher(extension);
  }

  public override getWatcher(extension: ActivatedExtension): FileSystemWatcher | undefined {
    return super.getWatcher(extension);
  }
}

let extensionWatcher: TestExtensionWatcher;
const fakeAnalyzedExtension = {
  id: 'my.extensionId',
  path: 'fakePath',
} as unknown as AnalyzedExtension;
const fakeActivatedExtension = {
  id: 'my.extensionId',
} as unknown as ActivatedExtension;

const fileSystemOnDidChangeMock = vi.fn();
const fileSystemOnDidCreateMock = vi.fn();
const fileSystemOnDidDeleteMock = vi.fn();
const fileSystemDisposeMock = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetAllMocks();

  // mock createFileSystemWatcher
  vi.mocked(fileSystemMonitoring.createFileSystemWatcher).mockReturnValue({
    onDidChange: fileSystemOnDidChangeMock,
    onDidCreate: fileSystemOnDidCreateMock,
    onDidDelete: fileSystemOnDidDeleteMock,
    dispose: fileSystemDisposeMock,
  } as unknown as FileSystemWatcher);

  extensionWatcher = new TestExtensionWatcher(fileSystemMonitoring);
});

describe('monitor', () => {
  test('check without tsconfig / fileMatcher', async () => {
    const reloadSpy = vi.spyOn(extensionWatcher, 'reloadExtension');

    // call monitor
    await extensionWatcher.monitor(fakeAnalyzedExtension);

    // check that we called the createFileSystemWatcher method on fileSystemMonitoring
    expect(fileSystemMonitoring.createFileSystemWatcher).toHaveBeenCalled();

    // check with onDidCreate
    const onDidCreateCallback = fileSystemOnDidCreateMock.mock.calls[0]?.[0];
    expect(onDidCreateCallback).toBeDefined();
    // call the callback
    onDidCreateCallback({ fsPath: 'fakePath' });

    // check that we call reloadExtension method
    await vi.waitFor(() => expect(reloadSpy).toHaveBeenCalled());

    // clear the calls on reloadSpy
    reloadSpy.mockClear();

    //get argument of onDidChangeMock
    const onDidChangeCallback = fileSystemOnDidChangeMock.mock.calls[0]?.[0];
    expect(onDidChangeCallback).toBeDefined();

    // call the callback
    onDidChangeCallback({ fsPath: 'fakePath' });

    // check that we call reloadExtension method
    await vi.waitFor(() => expect(reloadSpy).toHaveBeenCalled());

    // clear the calls on reloadSpy
    reloadSpy.mockClear();

    // check with onDidDelete
    const onDidDeleteCallback = fileSystemOnDidDeleteMock.mock.calls[0]?.[0];
    expect(onDidDeleteCallback).toBeDefined();
    // call the callback
    onDidDeleteCallback({ fsPath: 'fakePath' });

    // check that we call reloadExtension method
    await vi.waitFor(() => expect(reloadSpy).toHaveBeenCalled());
  });

  test('check with tsconfig but in the source file', async () => {
    const reloadSpy = vi.spyOn(extensionWatcher, 'reloadExtension');

    // say that the file is part of the source
    const fakeFileMatcher = vi.fn().mockReturnValue(true) as FileMatcher;
    vi.spyOn(extensionWatcher, 'getTsConfigFileMatcher').mockResolvedValue(fakeFileMatcher);

    // call monitor
    await extensionWatcher.monitor(fakeAnalyzedExtension);

    // check that we called the createFileSystemWatcher method on fileSystemMonitoring
    expect(fileSystemMonitoring.createFileSystemWatcher).toHaveBeenCalled();

    //get argument of onDidChangeMock
    const onDidChangeCallback = fileSystemOnDidChangeMock.mock.calls[0]?.[0];
    expect(onDidChangeCallback).toBeDefined();

    // call the callback
    onDidChangeCallback({ fsPath: 'fakePath' });

    // check that we don't call reloadExtension method as we detected a change in the source file
    await vi.waitFor(() => expect(reloadSpy).not.toHaveBeenCalled());
  });

  test('check with tsconfig and not in the source file', async () => {
    const reloadSpy = vi.spyOn(extensionWatcher, 'reloadExtension');

    // say that the file is not part of the source
    const fakeFileMatcher = vi.fn().mockReturnValue(undefined) as FileMatcher;
    vi.spyOn(extensionWatcher, 'getTsConfigFileMatcher').mockResolvedValue(fakeFileMatcher);

    // call monitor
    await extensionWatcher.monitor(fakeAnalyzedExtension);

    // check that we called the createFileSystemWatcher method on fileSystemMonitoring
    expect(fileSystemMonitoring.createFileSystemWatcher).toHaveBeenCalled();

    //get argument of onDidChangeMock
    const onDidChangeCallback = fileSystemOnDidChangeMock.mock.calls[0]?.[0];
    expect(onDidChangeCallback).toBeDefined();

    // call the callback
    onDidChangeCallback({ fsPath: 'fakePath' });

    // check that we call reloadExtension method as we detected a change but not in the source file
    await vi.waitFor(() => expect(reloadSpy).toHaveBeenCalled());
  });

  test('check skip if already tracked', async () => {
    // replace the isWatched method to return true
    vi.spyOn(extensionWatcher, 'isWatched').mockReturnValue(true);
    const reloadSpy = vi.spyOn(extensionWatcher, 'reloadExtension');
    // call monitor
    await extensionWatcher.monitor(fakeAnalyzedExtension);

    // check that we didn't called the createFileSystemWatcher method on fileSystemMonitoring
    expect(fileSystemMonitoring.createFileSystemWatcher).not.toHaveBeenCalled();

    // and we didn't call reloadExtension method
    expect(reloadSpy).not.toHaveBeenCalled();
  });
});

describe('untrack', () => {
  test('dispose watcher', async () => {
    const fakeWatcher = {
      dispose: vi.fn(),
    } as unknown as FileSystemWatcher;

    // mock getWatcher to return the fakeWatcher
    const getWatcherSpy = vi.spyOn(extensionWatcher, 'getWatcher').mockReturnValue(fakeWatcher);

    // call untrack
    extensionWatcher.untrack(fakeActivatedExtension);

    // check that we called the dispose method on the watcher
    expect(fakeWatcher.dispose).toHaveBeenCalled();
    expect(getWatcherSpy).toHaveBeenCalled();
  });

  test('do not dispose watcher', async () => {
    // call untrack
    extensionWatcher.untrack(fakeActivatedExtension);

    // check that we didn't called the dispose method on the watcher
    expect(fileSystemMonitoring.createFileSystemWatcher).not.toHaveBeenCalled();
  });
});

test('dispose', async () => {
  await extensionWatcher.monitor(fakeAnalyzedExtension);
  extensionWatcher.dispose();

  expect(fileSystemDisposeMock).toHaveBeenCalled();
});

describe('reloadExtension', () => {
  test('check reloadExtension cancel timeout', async () => {
    let extensionReloadEvent: AnalyzedExtension | undefined;
    let eventCalledNumber = 0;
    // subscribe to events
    extensionWatcher.onNeedToReloadExtension(event => {
      extensionReloadEvent = event;
      eventCalledNumber++;
    });

    // make several calls to reloadExtension in a row to check how is working the dismiss of previous timeouts
    extensionWatcher.reloadExtension(fakeAnalyzedExtension);
    for (let i = 0; i < 10; i++) {
      // wait 100ms using setTimeout
      await new Promise(resolve => setTimeout(resolve, 100));

      // perform another call
      extensionWatcher.reloadExtension(fakeAnalyzedExtension);
    }

    // and now wait that we're calling the event
    await vi.waitFor(() => expect(extensionReloadEvent).toBeDefined(), { timeout: 3_000 });

    expect(extensionReloadEvent?.id).toBe(fakeAnalyzedExtension.id);

    // expect only one callback even if we spawn multiple orders
    expect(eventCalledNumber).toBe(1);
  });
});
