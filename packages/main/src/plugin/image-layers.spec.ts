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

import { beforeEach, expect, test, vi } from 'vitest';
import { type ImageLayerFile, getLayersFromImageArchive } from './image-layers.js';
import fs from 'node:fs';
import nodeTar, { Parse } from 'tar';
import * as fileTree from './file-tree.js';

beforeEach(() => {
  vi.resetAllMocks();
  vi.mock('node:fs');
  vi.mock('tar');
});

type FileOptions = {
  gid?: number;
  isBlock?: boolean;
  isChar?: boolean;
  isDir?: boolean;
  isExec?: boolean;
  isFifo?: boolean;
  isLink?: boolean;
  isSGID?: boolean;
  isSUID?: boolean;
  linkTarget?: string;
  modeString?: string;
  size?: number;
  typeChar?: string;
  uid?: number;
};

function newFile(val: FileOptions): ImageLayerFile {
  return {
    isBlock: val.isBlock || false,
    isChar: val.isChar || false,
    isDir: val.isDir || false,
    isExec: val.isExec || false,
    isFifo: val.isFifo || false,
    isLink: val.isLink || false,
    isSGID: val.isSGID || false,
    isSUID: val.isSUID || false,
    linkTarget: val.linkTarget,
    modeString: val.modeString || '',
    size: val.size || 0,
    typeChar: val.typeChar || '-',
    uid: val.uid,
    gid: val.gid,
  };
}

test('should return no layer when manifest contains no layers', async () => {
  vi.spyOn(fs, 'readFileSync').mockImplementation((path: fs.PathOrFileDescriptor) => {
    switch (String(path).replace(/\\/g, '/')) {
      case '/path/to/archive/manifest.json':
        return JSON.stringify([]);
      default:
        return '';
    }
  });
  const result = await getLayersFromImageArchive('/path/to/archive');
  expect(result).toEqual([]);
});

test('should add files to filetree', async () => {
  const addPathSpy = [vi.fn(), vi.fn()];
  const fileTreeSpy = vi.spyOn(fileTree, 'FileTree');
  fileTreeSpy.mockReturnValueOnce({
    addPath: addPathSpy[0],
  } as unknown as fileTree.FileTree<ImageLayerFile>);
  fileTreeSpy.mockReturnValueOnce({
    addPath: addPathSpy[1],
  } as unknown as fileTree.FileTree<ImageLayerFile>);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.spyOn(nodeTar, 'list').mockImplementation((options: any) => {
    switch (String(options.file).replace(/\\/g, '/')) {
      case '/path/to/archive/layer1.tar':
        options.onentry?.({
          type: 'Directory',
          path: '/etc',
          size: 0,
          mode: 0o755,
          uid: 101,
          gid: 100,
        } as unknown as nodeTar.ReadEntry);
        options.onentry?.({
          path: '/etc/config.txt',
          size: 101,
          mode: 0o644,
          uid: 101,
          gid: 100,
        } as unknown as nodeTar.ReadEntry);
        options.onentry?.({
          type: 'Directory',
          path: '/bin',
          size: 0,
          mode: 0o755,
        } as unknown as nodeTar.ReadEntry);
        options.onentry?.({
          path: '/bin/app',
          size: 102,
          mode: 0o755,
        } as unknown as nodeTar.ReadEntry);
        options.onentry?.({
          path: '/bin/suid-app',
          size: 102,
          mode: 0o4755,
        } as unknown as nodeTar.ReadEntry);
        options.onentry?.({
          path: '/bin/sgid-app',
          size: 102,
          mode: 0o2755,
        } as unknown as nodeTar.ReadEntry);
        options.onentry?.({
          path: '/bin/link-to-app',
          size: 0,
          mode: 0o755,
          type: 'SymbolicLink',
          linkpath: './app',
        } as unknown as nodeTar.ReadEntry);
    }
    return new Parse();
  });
  vi.spyOn(fs, 'readFileSync').mockImplementation((path: fs.PathOrFileDescriptor) => {
    switch (String(path).replace(/\\/g, '/')) {
      case '/path/to/archive/manifest.json':
        return JSON.stringify([
          {
            Layers: ['layer1.tar', 'layer2.tar'],
            Config: 'config.json',
          },
        ]);
      case '/path/to/archive/config.json':
        return JSON.stringify({
          history: [
            {
              created: '2024-02-19T09:41:29.176752898Z',
              created_by: '/bin/sh -c #(nop) COMMAND WITHOUT LAYER',
              empty_layer: true,
            },
            {
              comment: 'FROM c575d163c492',
              created: '2024-02-19T09:41:29.336632424Z',
              created_by: '/bin/sh -c #(nop) COMMAND 1',
            },
            {
              comment: 'FROM 656b6b7ab339',
              created: '2024-02-19T09:42:36.05895774Z',
              created_by: '/bin/sh -c #(nop) COMMAND 2',
            },
          ],
        });
      default:
        return '';
    }
  });
  const result = await getLayersFromImageArchive('/path/to/archive');
  expect(result.length).toBe(2);
  const layer0 = result[0];
  expect(layer0.history).toEqual('COMMAND 1');
  expect(layer0.id).toEqual('layer1.tar');
  expect(fileTreeSpy).toHaveBeenCalledTimes(2);
  expect(addPathSpy[0]).toHaveBeenCalledTimes(7);
  expect(addPathSpy[0]).toHaveBeenNthCalledWith(
    1,
    '/etc',
    newFile({ typeChar: 'd', isDir: true, isExec: true, modeString: 'rwxr-xr-x', uid: 101, gid: 100 }),
    0,
  );
  expect(addPathSpy[0]).toHaveBeenNthCalledWith(
    2,
    '/etc/config.txt',
    newFile({ size: 101, modeString: 'rw-r--r--', uid: 101, gid: 100 }),
    101,
  );
  expect(addPathSpy[0]).toHaveBeenNthCalledWith(
    3,
    '/bin',
    newFile({ typeChar: 'd', isDir: true, isExec: true, modeString: 'rwxr-xr-x' }),
    0,
  );
  expect(addPathSpy[0]).toHaveBeenNthCalledWith(
    4,
    '/bin/app',
    newFile({ size: 102, modeString: 'rwxr-xr-x', isExec: true }),
    102,
  );
  expect(addPathSpy[0]).toHaveBeenNthCalledWith(
    5,
    '/bin/suid-app',
    newFile({ size: 102, modeString: 'rwxr-xr-x', isExec: true, isSUID: true }),
    102,
  );
  expect(addPathSpy[0]).toHaveBeenNthCalledWith(
    6,
    '/bin/sgid-app',
    newFile({ size: 102, modeString: 'rwxr-xr-x', isExec: true, isSGID: true }),
    102,
  );
  expect(addPathSpy[0]).toHaveBeenNthCalledWith(
    7,
    '/bin/link-to-app',
    newFile({ modeString: 'rwxr-xr-x', isExec: true, isLink: true, linkTarget: './app' }),
    0,
  );
  expect(addPathSpy[1]).not.toHaveBeenCalled();
});
