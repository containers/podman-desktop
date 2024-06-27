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

import type { ImageFilesystemLayer } from '@podman-desktop/api';
import { beforeEach, expect, suite, test, vi } from 'vitest';

import { ImageFilesImpl } from './image-files-impl.js';
import type { ImageFilesRegistry } from './image-files-registry.js';

suite('add to layer', () => {
  const currentDate = new Date(2020, 3, 1);
  let imageFilesProvider: ImageFilesImpl;

  beforeEach(() => {
    vi.setSystemTime(currentDate);
    imageFilesProvider = new ImageFilesImpl('an-id', {} as unknown as ImageFilesRegistry);
  });

  test('add file with default options', () => {
    const layer: ImageFilesystemLayer = { id: 'layer1' };
    const file1Options = {
      path: '/etc/hosts',
      mode: 0o644,
      size: 100,
    };
    const file2Options = {
      path: '/etc/sudoers',
      mode: 0o440,
      size: 200,
    };
    const defaultValues = {
      uid: 1,
      gid: 1,
      ctime: currentDate,
      atime: currentDate,
      mtime: currentDate,
    };
    imageFilesProvider.addFile(layer, file1Options).addFile(layer, file2Options);
    expect(layer.files?.length).toBe(2);
    expect(layer.files![0]).toEqual({
      ...file1Options,
      type: 'file',
      ...defaultValues,
    });
    expect(layer.files![1]).toEqual({
      ...file2Options,
      type: 'file',
      ...defaultValues,
    });
  });

  test('add file with all options set', () => {
    const layer: ImageFilesystemLayer = { id: 'layer1' };
    const file1Options = {
      path: '/etc/hosts',
      mode: 0o644,
      size: 100,
      uid: 1001,
      gid: 1002,
      mtime: new Date(2019, 3, 1),
      ctime: new Date(2019, 3, 2),
      atime: new Date(2019, 3, 3),
    };
    const file2Options = {
      path: '/etc/sudoers',
      mode: 0o440,
      size: 200,
      uid: 1003,
      gid: 1004,
      mtime: new Date(2021, 3, 1),
      ctime: new Date(2021, 3, 2),
      atime: new Date(2021, 3, 3),
    };
    imageFilesProvider.addFile(layer, file1Options).addFile(layer, file2Options);
    expect(layer.files?.length).toBe(2);
    expect(layer.files![0]).toEqual({
      ...file1Options,
      type: 'file',
    });
    expect(layer.files![1]).toEqual({
      ...file2Options,
      type: 'file',
    });
  });

  test('add directory with default options', () => {
    const layer: ImageFilesystemLayer = { id: 'layer1' };
    const dir1Options = {
      path: '/etc',
      mode: 0o755,
    };
    const dir2Options = {
      path: '/root',
      mode: 0o700,
    };
    const defaultValues = {
      uid: 1,
      gid: 1,
      ctime: currentDate,
      atime: currentDate,
      mtime: currentDate,
    };
    imageFilesProvider.addDirectory(layer, dir1Options).addDirectory(layer, dir2Options);
    expect(layer.files?.length).toBe(2);
    expect(layer.files![0]).toEqual({
      ...dir1Options,
      type: 'directory',
      ...defaultValues,
      size: 0,
    });
    expect(layer.files![1]).toEqual({
      ...dir2Options,
      type: 'directory',
      ...defaultValues,
      size: 0,
    });
  });

  test('add directory with all options set', () => {
    const layer: ImageFilesystemLayer = { id: 'layer1' };
    const dir1Options = {
      path: '/etc',
      mode: 0o755,
      uid: 1001,
      gid: 1002,
      mtime: new Date(2019, 3, 1),
      ctime: new Date(2019, 3, 2),
      atime: new Date(2019, 3, 3),
    };
    const dir2Options = {
      path: '/root',
      mode: 0o700,
      size: 200,
      uid: 1003,
      gid: 1004,
      mtime: new Date(2021, 3, 1),
      ctime: new Date(2021, 3, 2),
      atime: new Date(2021, 3, 3),
    };
    imageFilesProvider.addDirectory(layer, dir1Options).addDirectory(layer, dir2Options);
    expect(layer.files?.length).toBe(2);
    expect(layer.files![0]).toEqual({
      ...dir1Options,
      type: 'directory',
      size: 0,
    });
    expect(layer.files![1]).toEqual({
      ...dir2Options,
      type: 'directory',
      size: 0,
    });
  });

  test('add symbolic link with default options', () => {
    const layer: ImageFilesystemLayer = { id: 'layer1' };
    const symlink1Options = {
      path: '/sbin',
      mode: 0o755,
      linkPath: '/bin',
    };
    const symlink2Options = {
      path: '/usr/sbin',
      mode: 0o700,
      linkPath: '/usr/bin',
    };
    const defaultValues = {
      uid: 1,
      gid: 1,
      ctime: currentDate,
      atime: currentDate,
      mtime: currentDate,
    };
    imageFilesProvider.addSymlink(layer, symlink1Options).addSymlink(layer, symlink2Options);
    expect(layer.files?.length).toBe(2);
    expect(layer.files![0]).toEqual({
      ...symlink1Options,
      type: 'symlink',
      ...defaultValues,
      size: 0,
    });
    expect(layer.files![1]).toEqual({
      ...symlink2Options,
      type: 'symlink',
      ...defaultValues,
      size: 0,
    });
  });

  test('add symbolic link with all options set', () => {
    const layer: ImageFilesystemLayer = { id: 'layer1' };
    const symlink1Options = {
      path: '/sbin',
      mode: 0o755,
      linkPath: '/bin',
      uid: 1001,
      gid: 1002,
      mtime: new Date(2019, 3, 1),
      ctime: new Date(2019, 3, 2),
      atime: new Date(2019, 3, 3),
    };
    const dir2Options = {
      path: '/usr/sbin',
      mode: 0o700,
      linkPath: '/usr/bin',
      size: 200,
      uid: 1003,
      gid: 1004,
      mtime: new Date(2021, 3, 1),
      ctime: new Date(2021, 3, 2),
      atime: new Date(2021, 3, 3),
    };
    imageFilesProvider.addSymlink(layer, symlink1Options).addSymlink(layer, dir2Options);
    expect(layer.files?.length).toBe(2);
    expect(layer.files![0]).toEqual({
      ...symlink1Options,
      type: 'symlink',
      size: 0,
    });
    expect(layer.files![1]).toEqual({
      ...dir2Options,
      type: 'symlink',
      size: 0,
    });
  });

  test('add whiteout', () => {
    const layer: ImageFilesystemLayer = { id: 'layer1' };
    const path1 = '/etc/oldfile1';
    const path2 = '/etc/oldfile2';
    imageFilesProvider.addWhiteout(layer, path1).addWhiteout(layer, path2);
    expect(layer.whiteouts?.length).toBe(2);
    expect(layer.whiteouts![0]).toEqual(path1);
    expect(layer.whiteouts![1]).toEqual(path2);
  });

  test('add opaque whiteout', () => {
    const layer: ImageFilesystemLayer = { id: 'layer1' };
    const path1 = '/tmp';
    const path2 = '/var/tmp';
    imageFilesProvider.addOpaqueWhiteout(layer, path1).addOpaqueWhiteout(layer, path2);
    expect(layer.opaqueWhiteouts?.length).toBe(2);
    expect(layer.opaqueWhiteouts![0]).toEqual(path1);
    expect(layer.opaqueWhiteouts![1]).toEqual(path2);
  });
});
