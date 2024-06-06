/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { closeSync, mkdirSync, openSync, promises, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { FileSystemWatcherImpl } from './filesystem-monitoring.js';
import { Uri } from './types/uri.js';

let rootdir: string;
let watcher: FileSystemWatcherImpl | undefined;

beforeEach(async () => {
  rootdir = await promises.mkdtemp(path.join(os.tmpdir(), 'pd-tests-'));
});

afterEach(async () => {
  if (watcher) {
    watcher.dispose();
    watcher = undefined;
  }
  if (rootdir) {
    await promises.rm(rootdir, { recursive: true });
  }
});

test('should send event into onDid when a file is watched into an existing directory', async () => {
  const watchedFile = path.join(rootdir, '/path/to/watch/file.txt');
  const parentDir = path.dirname(watchedFile);

  mkdirSync(parentDir, { recursive: true });
  watcher = new FileSystemWatcherImpl(watchedFile);
  const createListener = vi.fn();
  watcher.onDidCreate(createListener);
  const changeListener = vi.fn();
  watcher.onDidChange(changeListener);
  const unlinkListener = vi.fn();
  watcher.onDidDelete(unlinkListener);

  expect(createListener).not.toHaveBeenCalled();
  const h = openSync(watchedFile, 'a');
  closeSync(h);
  await vi.waitFor(async () => {
    expect(createListener).toHaveBeenCalledWith(Uri.file(watchedFile));
  });

  expect(changeListener).not.toHaveBeenCalled();
  writeFileSync(watchedFile, 'new content');
  await vi.waitFor(async () => {
    expect(changeListener).toHaveBeenCalledWith(Uri.file(watchedFile));
  });

  expect(unlinkListener).not.toHaveBeenCalled();
  rmSync(watchedFile);
  await vi.waitFor(async () => {
    expect(unlinkListener).toHaveBeenCalledWith(Uri.file(watchedFile));
  });
});
