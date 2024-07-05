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
  // The size of the files in the final filesystem
  sizeInContainer: number;
}

export function toImageFilesystemLayerUIs(layers: ImageFilesystemLayer[]): ImageFilesystemLayerUI[] {
  const result: ImageFilesystemLayerUI[] = [];
  let containerSizePreviousLayer = 0;
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
      stackTree.addPath(file.path, file, file.size);
      layerTree.addPath(file.path, file, file.size);
      sizeInArchive += file.size;
    }
    result.push({
      stackTree: stackTree.copy(),
      layerTree,
      ...layer,
      sizeInContainer: stackTree.size - containerSizePreviousLayer,
      sizeInArchive,
    });
    containerSizePreviousLayer = stackTree.size;
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
