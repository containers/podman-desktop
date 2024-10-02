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

import type { ImageFile, ImageFilesystemLayer } from '@podman-desktop/api';

import { FilesystemTree } from './filesystem-tree';

export interface ImageFilesystemLayerUI extends ImageFilesystemLayer {
  // The files of the current layer and previous ones
  stackTree: FilesystemTree<ImageFile>;
  // The files of the current layer only
  layerTree: FilesystemTree<ImageFile>;
  // The sum of the sizes of all the files in the layer
  sizeInArchive: number;
  // The number of added/modified/removed files and the sizes of related changes
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
  addedSize: number;
  modifiedSize: number;
  removedSize: number;
}

export function toImageFilesystemLayerUIs(layers: ImageFilesystemLayer[]): ImageFilesystemLayerUI[] {
  const result: ImageFilesystemLayerUI[] = [];
  let addedCountPreviousLayer = 0;
  let modifiedCountPreviousLayer = 0;
  let removedCountPreviousLayer = 0;
  let addedSizePreviousLayer = 0;
  let modifiedSizePreviousLayer = 0;
  let removedSizePreviousLayer = 0;
  const stackTree = new FilesystemTree<ImageFile>('');
  for (const layer of layers) {
    const layerTree = new FilesystemTree<ImageFile>('');
    let sizeInArchive = 0;
    for (const whiteout of layer.whiteouts ?? []) {
      stackTree.hidePath(whiteout);
      layerTree.addWhiteout(whiteout);
    }
    for (const opaqueWhiteout of layer.opaqueWhiteouts ?? []) {
      stackTree.hideDirectoryContent(opaqueWhiteout);
      layerTree.addWhiteout(`${opaqueWhiteout}/*`);
    }
    for (const file of layer.files ?? []) {
      stackTree.addPath(file.path, file, file.size, file.type === 'directory');
      layerTree.addPath(file.path, file, file.size, file.type === 'directory');
      sizeInArchive += file.size;
    }
    result.push({
      stackTree: stackTree.copy(),
      layerTree,
      ...layer,
      sizeInArchive,
      addedCount: stackTree.addedCount - addedCountPreviousLayer,
      modifiedCount: stackTree.modifiedCount - modifiedCountPreviousLayer,
      removedCount: stackTree.removedCount - removedCountPreviousLayer,
      addedSize: stackTree.addedSize - addedSizePreviousLayer,
      modifiedSize: stackTree.modifiedSize - modifiedSizePreviousLayer,
      removedSize: stackTree.removedSize - removedSizePreviousLayer,
    });
    addedCountPreviousLayer = stackTree.addedCount;
    modifiedCountPreviousLayer = stackTree.modifiedCount;
    removedCountPreviousLayer = stackTree.removedCount;
    addedSizePreviousLayer = stackTree.addedSize;
    modifiedSizePreviousLayer = stackTree.modifiedSize;
    removedSizePreviousLayer = stackTree.removedSize;
  }
  return result;
}

export function isExec(data: ImageFile): boolean {
  return (data.mode & 0o111) !== 0;
}

// SUID, SGID, and sticky bit: https://www.redhat.com/sysadmin/suid-sgid-sticky-bit
export function modeString(data: ImageFile): string {
  return (
    (data.type === 'directory' ? 'd' : '-') +
    (data.mode & 0o400 ? 'r' : '-') +
    (data.mode & 0o200 ? 'w' : '-') +
    (data.mode & 0o4000 ? (data.mode & 0o100 ? 's' : 'S') : data.mode & 0o100 ? 'x' : '-') +
    (data.mode & 0o040 ? 'r' : '-') +
    (data.mode & 0o020 ? 'w' : '-') +
    (data.mode & 0o2000 ? (data.mode & 0o010 ? 's' : 'S') : data.mode & 0o010 ? 'x' : '-') +
    (data.mode & 0o004 ? 'r' : '-') +
    (data.mode & 0o002 ? 'w' : '-') +
    (data.mode & 0o1000 ? 't' : data.mode & 0o001 ? 'x' : '-')
  );
}
