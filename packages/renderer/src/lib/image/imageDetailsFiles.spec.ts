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
import { expect, test } from 'vitest';

import { toImageFilesystemLayerUIs } from './imageDetailsFiles';

test('toImageFilesystemLayerUIs with only added files', () => {
  const input: ImageFilesystemLayer[] = [
    {
      id: 'layer1',
      files: [
        {
          path: 'A/B/C.txt',
          type: 'file',
          mode: 0o644,
          uid: 1,
          gid: 1,
          ctime: new Date(),
          atime: new Date(),
          mtime: new Date(),
          size: 100,
        },
        {
          path: 'A/B/D.txt',
          type: 'file',
          mode: 0o644,
          uid: 1,
          gid: 1,
          ctime: new Date(),
          atime: new Date(),
          mtime: new Date(),
          size: 50,
        },
      ],
    },
    {
      id: 'layer2',
      files: [
        {
          path: 'A/B/E.txt',
          type: 'file',
          mode: 0o644,
          uid: 1,
          gid: 1,
          ctime: new Date(),
          atime: new Date(),
          mtime: new Date(),
          size: 20,
        },
      ],
    },
  ];
  const result = toImageFilesystemLayerUIs(input);
  expect(result[0].sizeInArchive).toBe(150);
  expect(result[0].sizeInContainer).toBe(150);
  expect(result[0].stackTree.size).toBe(150);
  expect(result[1].sizeInArchive).toBe(20);
  expect(result[1].sizeInContainer).toBe(20);
  expect(result[1].stackTree.size).toBe(170);
});

test('toImageFilesystemLayerUIs with a modified file', () => {
  const input: ImageFilesystemLayer[] = [
    {
      id: 'layer1',
      files: [
        {
          path: 'A/B/C.txt',
          type: 'file',
          mode: 0o644,
          uid: 1,
          gid: 1,
          ctime: new Date(),
          atime: new Date(),
          mtime: new Date(),
          size: 100,
        },
        {
          path: 'A/B/D.txt',
          type: 'file',
          mode: 0o644,
          uid: 1,
          gid: 1,
          ctime: new Date(),
          atime: new Date(),
          mtime: new Date(),
          size: 50,
        },
      ],
    },
    {
      id: 'layer2',
      files: [
        {
          path: 'A/B/D.txt',
          type: 'file',
          mode: 0o644,
          uid: 1,
          gid: 1,
          ctime: new Date(),
          atime: new Date(),
          mtime: new Date(),
          size: 42,
        },
      ],
    },
  ];
  const result = toImageFilesystemLayerUIs(input);
  expect(result[0].sizeInArchive).toBe(150);
  expect(result[0].sizeInContainer).toBe(150);
  expect(result[0].stackTree.size).toBe(150);
  expect(result[1].sizeInArchive).toBe(42);
  expect(result[1].sizeInContainer).toBe(-8);
  expect(result[1].stackTree.size).toBe(142);
});

test('toImageFilesystemLayerUIs with an file', () => {
  const input: ImageFilesystemLayer[] = [
    {
      id: 'layer1',
      files: [
        {
          path: 'A/B/C.txt',
          type: 'file',
          mode: 0o644,
          uid: 1,
          gid: 1,
          ctime: new Date(),
          atime: new Date(),
          mtime: new Date(),
          size: 100,
        },
        {
          path: 'A/B/D.txt',
          type: 'file',
          mode: 0o644,
          uid: 1,
          gid: 1,
          ctime: new Date(),
          atime: new Date(),
          mtime: new Date(),
          size: 50,
        },
      ],
    },
    {
      id: 'layer2',
      whiteouts: ['A/B/D.txt'],
    },
  ];
  const result = toImageFilesystemLayerUIs(input);
  expect(result[0].sizeInArchive).toBe(150);
  expect(result[0].sizeInContainer).toBe(150);
  expect(result[0].stackTree.size).toBe(150);
  expect(result[1].sizeInArchive).toBe(0);
  expect(result[1].sizeInContainer).toBe(-50);
  expect(result[1].stackTree.size).toBe(100);
});
