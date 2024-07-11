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

import { promises } from 'node:fs';
import os from 'node:os';
import path, { join } from 'node:path';

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import { FileSystemWatcherImpl } from './filesystem-monitoring.js';
import { Uri } from './types/uri.js';

let rootdir: string;
let watcher: FileSystemWatcherImpl | undefined;

beforeEach(async () => {
  rootdir = await promises.mkdtemp(path.join(os.tmpdir(), 'pd-tests-'));
  // chokidar can fail with symlinks in some circumstances, let's resolve them
  rootdir = await promises.realpath(rootdir);
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
  const watchedFile = path.join(rootdir, 'file.txt');
  watcher = new FileSystemWatcherImpl(watchedFile);

  const readyListener = vi.fn();
  watcher.onReady(readyListener);

  const createListener = vi.fn();
  watcher.onDidCreate(createListener);
  const changeListener = vi.fn();
  watcher.onDidChange(changeListener);
  const unlinkListener = vi.fn();
  watcher.onDidDelete(unlinkListener);

  await vi.waitFor(async () => {
    expect(readyListener).toHaveBeenCalled();
  });

  expect(createListener).not.toHaveBeenCalled();
  const h = await promises.open(watchedFile, 'a');
  await h.close();
  await vi.waitFor(async () => {
    expect(createListener).toHaveBeenCalledWith(Uri.file(watchedFile));
  });

  expect(changeListener).not.toHaveBeenCalled();
  await promises.writeFile(watchedFile, 'new content');
  await vi.waitFor(async () => {
    expect(changeListener).toHaveBeenCalledWith(Uri.file(watchedFile));
  });

  expect(unlinkListener).not.toHaveBeenCalled();
  await promises.rm(watchedFile);
  await vi.waitFor(async () => {
    expect(unlinkListener).toHaveBeenCalledWith(Uri.file(watchedFile));
  });
});

test('should send event onDidCreate when a directory is created into a watched directory', async () => {
  watcher = new FileSystemWatcherImpl(rootdir);

  const readyListener = vi.fn();
  watcher.onReady(readyListener);

  const createListener = vi.fn();
  watcher.onDidCreate(createListener);
  const changeListener = vi.fn();
  watcher.onDidChange(changeListener);
  const unlinkListener = vi.fn();
  watcher.onDidDelete(unlinkListener);

  await vi.waitFor(async () => {
    expect(readyListener).toHaveBeenCalled();
  });

  expect(createListener).toHaveBeenCalledWith(Uri.file(rootdir));
  expect(changeListener).not.toHaveBeenCalled();
  expect(unlinkListener).not.toHaveBeenCalled();

  const createdDir = path.join(rootdir, 'dir');
  await promises.mkdir(createdDir);

  await vi.waitFor(async () => {
    expect(createListener).toHaveBeenCalledWith(Uri.file(createdDir));
  });
  expect(changeListener).not.toHaveBeenCalled();
  expect(unlinkListener).not.toHaveBeenCalled();
});

test('should send event onDidCreate when a file is created inside a non-existent directory', async () => {
  const watchedFile = path.join(rootdir, 'dir/file.txt');
  watcher = new FileSystemWatcherImpl(watchedFile);

  const readyListener = vi.fn();
  watcher.onReady(readyListener);

  const createListener = vi.fn();
  watcher.onDidCreate(createListener);
  const changeListener = vi.fn();
  watcher.onDidChange(changeListener);
  const unlinkListener = vi.fn();
  watcher.onDidDelete(unlinkListener);

  expect(createListener).not.toHaveBeenCalled();
  expect(changeListener).not.toHaveBeenCalled();
  expect(unlinkListener).not.toHaveBeenCalled();

  await vi.waitFor(async () => {
    expect(readyListener).toHaveBeenCalled();
  });

  const dir = path.dirname(watchedFile);
  await promises.mkdir(dir);

  const h = await promises.open(watchedFile, 'a');
  await h.close();

  await vi.waitFor(async () => {
    expect(createListener).toHaveBeenCalledWith(Uri.file(watchedFile));
  });
  expect(changeListener).not.toHaveBeenCalled();
  expect(unlinkListener).not.toHaveBeenCalled();
});

test('watch a file in a directory being a symlink to another directory', async () => {
  const target = join(rootdir, 'realdir');
  const link = join(rootdir, 'link');
  const watchedFile = join(link, 'file.txt');
  const realfile = join(target, 'file.txt');
  await promises.mkdir(target);
  await promises.symlink(target, link);
  watcher = new FileSystemWatcherImpl(watchedFile);

  const readyListener = vi.fn();
  watcher.onReady(readyListener);

  const createListener = vi.fn();
  watcher.onDidCreate(createListener);
  const changeListener = vi.fn();
  watcher.onDidChange(changeListener);
  const unlinkListener = vi.fn();
  watcher.onDidDelete(unlinkListener);

  expect(createListener).not.toHaveBeenCalled();
  expect(changeListener).not.toHaveBeenCalled();
  expect(unlinkListener).not.toHaveBeenCalled();

  await vi.waitFor(async () => {
    expect(readyListener).toHaveBeenCalled();
  });
  const h = await promises.open(watchedFile, 'a');
  await h.close();

  await vi.waitFor(async () => {
    expect(createListener).toHaveBeenCalledWith(Uri.file(realfile));
  });
});
