/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

// eslint-disable-next-line unicorn/prefer-node-protocol
import { Buffer } from 'buffer';
import { filesize } from 'filesize';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';

import type { ContainerInfo } from '/@api/container-info';
import type { ImageInfo } from '/@api/image-info';
import {
  isViewContributionBadge,
  isViewContributionIcon,
  type ViewContributionBadgeValue,
  type ViewInfoUI,
} from '/@api/view-info';

import type { ContextUI } from '../context/context';
import { ContextKeyExpr } from '../context/contextKey';
import ImageIcon from '../images/ImageIcon.svelte';
import ManifestIcon from '../images/ManifestIcon.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

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
  getInUse(imageInfo: ImageInfo, repositoryTag?: string, containersInfo?: ContainerInfo[]): boolean {
    if (!containersInfo) {
      return false;
    }

    // if there is a container with the same image id and the same repository tag, it's in use
    // else check if we have an untagged ilmage and in that case we check that container is matching the image id
    return containersInfo.some(container => {
      return (
        (container.ImageID === imageInfo.Id && container.Image === repositoryTag) ||
        (!!repositoryTag === false && imageInfo.Id.includes(container.Image) && (imageInfo.RepoTags ?? []).length === 0)
      );
    });
  }

  computeBagdes(
    imageInfo: ImageInfo,
    context?: ContextUI,
    viewContributions?: ViewInfoUI[],
  ): ViewContributionBadgeValue[] {
    if (!context || !viewContributions) {
      return [];
    }
    const badges: ViewContributionBadgeValue[] = [];
    if (context && viewContributions) {
      for (const contribution of viewContributions) {
        if (isViewContributionBadge(contribution.value)) {
          // adapt the context to work with images (e.g save image labels into the context)
          this.adaptContextOnImage(context, imageInfo);
          // deserialize the when clause
          const whenDeserialized = ContextKeyExpr.deserialize(contribution.value.when);
          // if the when clause has to be applied to this image
          if (whenDeserialized?.evaluate(context)) {
            badges.push(contribution.value.badge);
          }
        }
      }
    }
    return badges;
  }

  iconClass(imageInfo: ImageInfo, context?: ContextUI, viewContributions?: ViewInfoUI[]): string | undefined {
    if (!context || !viewContributions) {
      return undefined;
    }

    let icon;
    if (context && viewContributions) {
      for (const contribution of viewContributions) {
        if (isViewContributionIcon(contribution.value)) {
          // adapt the context to work with images (e.g save image labels into the context)
          this.adaptContextOnImage(context, imageInfo);
          // deserialize the when clause
          const whenDeserialized = ContextKeyExpr.deserialize(contribution.value.when);
          // if the when clause has to be applied to this image
          if (whenDeserialized?.evaluate(context)) {
            // handle ${} in icon class
            // and interpret the value and replace with the class-name
            const match = contribution.value.icon.match(/\$\{(.*)\}/);
            if (match && match.length === 2) {
              const className = match[1];
              icon = contribution.value.icon.replace(match[0], `podman-desktop-icon-${className}`);
            }
          }
        }
      }
    }
    return icon;
  }

  getImagesInfoUI(
    imageInfo: ImageInfo,
    containersInfo: ContainerInfo[],
    context?: ContextUI,
    viewContributions?: ViewInfoUI[],
    imageList?: ImageInfo[],
  ): ImageInfoUI[] {
    let icon = this.iconClass(imageInfo, context, viewContributions) ?? ImageIcon;
    const badges = this.computeBagdes(imageInfo, context, viewContributions);
    let children: ImageInfoUI[] = [];

    if (imageInfo.isManifest) {
      icon = ManifestIcon;

      // Retrieve the images that are part of the manifest
      const images = this.getImagesFromManifest(imageInfo, imageList ?? []);
      children = images
        .map(child => this.getImagesInfoUI(child, containersInfo, context, viewContributions, imageList))
        .flat();
    }

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
          status: this.getInUse(imageInfo, undefined, containersInfo) ? 'USED' : 'UNUSED',
          badges,
          icon,
          labels: imageInfo.Labels,
          isManifest: imageInfo.isManifest,
          digest: imageInfo.Digest,
          children,
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
          status: this.getInUse(imageInfo, repoTag, containersInfo) ? 'USED' : 'UNUSED',
          badges,
          icon,
          labels: imageInfo.Labels,
          isManifest: imageInfo.isManifest,
          digest: imageInfo.Digest,
          children,
        };
      });
    }
  }

  adaptContextOnImage(context: ContextUI, image: ImageInfo): void {
    context.setValue('imageLabelKeys', image.Labels ? Object.keys(image.Labels) : []);
  }

  deleteImage(image: ImageInfoUI) {
    const imageId = image.name === '<none>' ? image.id : `${image.name}:${image.tag}`;
    return window.deleteImage(image.engineId, imageId);
  }

  getImageInfoUI(
    imageInfo: ImageInfo,
    base64RepoTag: string,
    containersInfo: ContainerInfo[],
    context?: ContextUI,
    viewContributions?: ViewInfoUI[],
  ): ImageInfoUI | undefined {
    const images = this.getImagesInfoUI(imageInfo, containersInfo, context, viewContributions);
    return images.find(image => image.base64RepoTag === base64RepoTag);
  }

  // Input is an image and a list of images
  // if the image is a manifest, do inspect manifest to get the digest of each image part of the manifest.
  // go through the list of images and find the images with the same digest, and return those images.
  getImagesFromManifest(manifestImage: ImageInfo, imageList: ImageInfo[]): ImageInfo[] {
    // If for some reason the image passed in is not a manifest, just return an empty array.
    if (!manifestImage.isManifest && !manifestImage.manifests) {
      return [];
    }

    // Using manifests array in the inspect, find the images with the same digest.
    return imageList.filter(image => {
      if (manifestImage.manifests) {
        return manifestImage.manifests.some(manifest => manifest.digest === image.Digest);
      }
    });
  }
}
