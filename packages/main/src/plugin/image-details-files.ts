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

import type { ImageFilesystemLayerUI } from '@desktop-framework/api';
import { FilesystemTree } from '@desktop-framework/api';
import type { ImageFile, ImageFilesystemLayer } from '@desktop-framework/extension-api';

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
