/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type { ImageInfo } from '../../../../main/src/plugin/api/image-info';
import type { ImageInfoUI } from './ImageInfoUI';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';
import { filesize } from 'filesize';
import { Buffer } from 'buffer';
import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';

export class ImageUtils {
  // extract SHA256 from image id and take the first 12 digits
  getShortId(id: string): string {
    if (id.startsWith('sha256:')) {
      id = id.substring('sha256:'.length);
    }
    return id.substring(0, 12);
  }

  getHumanSize(size: number): string {
    return `${filesize(size)}`;
  }

  humanizeAge(created: number): string {
    // get start time in ms (using unix timestamp for the created)
    const age = moment().diff(moment.unix(created));
    // make it human friendly
    return humanizeDuration(age, { round: true, largest: 1 });
  }

  refreshAge(imageInfoUi: ImageInfoUI): string {
    // make it human friendly
    return this.humanizeAge(imageInfoUi.createdAt);
  }

  getName(repoTag: string) {
    const indexTag = repoTag.lastIndexOf(':');
    if (indexTag > 0) {
      return repoTag.slice(0, indexTag);
    } else {
      return '';
    }
  }

  getTag(repoTag: string) {
    const indexTag = repoTag.lastIndexOf(':');
    if (indexTag > 0) {
      return repoTag.slice(indexTag + 1);
    } else {
      return '';
    }
  }

  getEngineId(containerInfo: ImageInfo): string {
    return containerInfo.engineId;
  }

  getEngineName(containerInfo: ImageInfo): string {
    return containerInfo.engineName;
  }

  getBase64EncodedName(name: string) {
    return Buffer.from(name, 'binary').toString('base64');
  }

  // is that this image is used by a container or not
  // search if there is a container matching this image
  getInUse(imageInfo: ImageInfo, containersInfo?: ContainerInfo[]): boolean {
    if (!containersInfo) {
      return false;
    }
    return containersInfo.some(container => container.ImageID === imageInfo.Id);
  }

  getImagesInfoUI(imageInfo: ImageInfo, containersInfo: ContainerInfo[]): ImageInfoUI[] {
    if (!imageInfo.RepoTags) {
      return [
        {
          id: imageInfo.Id,
          shortId: this.getShortId(imageInfo.Id),
          createdAt: imageInfo.Created,
          age: this.humanizeAge(imageInfo.Created),
          size: imageInfo.Size,
          humanSize: this.getHumanSize(imageInfo.Size),
          name: '<none>',
          engineId: this.getEngineId(imageInfo),
          engineName: this.getEngineName(imageInfo),
          tag: '',
          base64RepoTag: this.getBase64EncodedName('<none>'),
          selected: false,
          inUse: this.getInUse(imageInfo, containersInfo),
        },
      ];
    } else {
      return imageInfo.RepoTags.map(repoTag => {
        return {
          id: imageInfo.Id,
          shortId: this.getShortId(imageInfo.Id),
          createdAt: imageInfo.Created,
          age: this.humanizeAge(imageInfo.Created),
          size: imageInfo.Size,
          humanSize: this.getHumanSize(imageInfo.Size),
          name: this.getName(repoTag),
          engineId: this.getEngineId(imageInfo),
          engineName: this.getEngineName(imageInfo),
          tag: this.getTag(repoTag),
          base64RepoTag: this.getBase64EncodedName(repoTag),
          selected: false,
          inUse: this.getInUse(imageInfo, containersInfo),
        };
      });
    }
  }

  deleteImage(image: ImageInfoUI) {
    const imageId = image.name === '<none>' ? image.id : `${image.name}:${image.tag}`;
    return window.deleteImage(image.engineId, imageId);
  }

  getImageInfoUI(
    imageInfo: ImageInfo,
    base64RepoTag: string,
    containersInfo: ContainerInfo[],
  ): ImageInfoUI | undefined {
    const images = this.getImagesInfoUI(imageInfo, containersInfo);
    return images.find(image => image.base64RepoTag === base64RepoTag);
  }
}
