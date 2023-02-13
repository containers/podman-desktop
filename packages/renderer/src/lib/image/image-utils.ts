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
    const res = humanizeDuration(age, { round: true, largest: 1 });
    return res;
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

  getEngineId(imageInfo: ImageInfo): string {
    return imageInfo.engineId;
  }

  getEngineName(imageInfo: ImageInfo): string {
    return imageInfo.engineName;
  }

  getBase64EncodedName(name: string) {
    return Buffer.from(name, 'binary').toString('base64');
  }

  getImagesInfoUI(imageInfo: ImageInfo): ImageInfoUI[] {
    if (!imageInfo.RepoTags) {
      return [
        {
          id: imageInfo.Id,
          shortId: this.getShortId(imageInfo.Id),
          createdAt: imageInfo.Created,
          age: this.humanizeAge(imageInfo.Created),
          humanSize: this.getHumanSize(imageInfo.Size),
          name: '<none>',
          engineId: this.getEngineId(imageInfo),
          engineName: this.getEngineName(imageInfo),
          tag: '',
          base64RepoTag: this.getBase64EncodedName('<none>'),
          selected: false,
          inUse: imageInfo.Containers > 0,
        },
      ];
    } else {
      return imageInfo.RepoTags.map(repoTag => {
        return {
          id: imageInfo.Id,
          shortId: this.getShortId(imageInfo.Id),
          createdAt: imageInfo.Created,
          age: this.humanizeAge(imageInfo.Created),
          humanSize: this.getHumanSize(imageInfo.Size),
          name: this.getName(repoTag),
          engineId: this.getEngineId(imageInfo),
          engineName: this.getEngineName(imageInfo),
          tag: this.getTag(repoTag),
          base64RepoTag: this.getBase64EncodedName(repoTag),
          selected: false,
          inUse: imageInfo.Containers > 0,
        };
      });
    }
  }

  getImageInfoUI(imageInfo: ImageInfo, base64RepoTag: string): ImageInfoUI {
    const images = this.getImagesInfoUI(imageInfo);
    const matchingImages = images.filter(image => image.base64RepoTag === base64RepoTag);
    if (matchingImages.length === 1) {
      return matchingImages[0];
    }
    throw new Error(`Unable to find a matching image for id ${imageInfo.Id} and tag ${base64RepoTag}`);
  }
}
