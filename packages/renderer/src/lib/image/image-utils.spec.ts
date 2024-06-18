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

import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContainerInfo } from '/@api/container-info';
import type { ImageInfo } from '/@api/image-info';
import type { ViewInfoUI } from '/@api/view-info';

import { ContextUI } from '../context/context';
import { ImageUtils } from './image-utils';

let imageUtils: ImageUtils;

beforeEach(() => {
  vi.clearAllMocks();
  imageUtils = new ImageUtils();
});

test('should expect valid size', async () => {
  const size = imageUtils.getHumanSize(1000);
  expect(size).toBe('1 kB');
});

describe.each([
  { repoTag: 'nginx:latest', expectedName: 'nginx', expectedTag: 'latest' },
  { repoTag: 'quay.io/podman/hello:latest', expectedName: 'quay.io/podman/hello', expectedTag: 'latest' },
  {
    repoTag: 'my.registry:1234/podman/hello:latest',
    expectedName: 'my.registry:1234/podman/hello',
    expectedTag: 'latest',
  },
  {
    repoTag: 'my.registry:1234/podman/hello:my-custom-tag',
    expectedName: 'my.registry:1234/podman/hello',
    expectedTag: 'my-custom-tag',
  },
])('describe object add($a, $b)', ({ repoTag, expectedName, expectedTag }) => {
  test(`should parse correctly image ${repoTag}`, () => {
    expect(imageUtils.getName(repoTag)).toBe(expectedName);
    expect(imageUtils.getTag(repoTag)).toBe(expectedTag);
  });
});

test('should expect icon to be undefined if no context/view is passed', async () => {
  const imageInfo = {
    Id: '12345',
    Labels: {},
  } as unknown as ImageInfo;
  const icon = imageUtils.iconClass(imageInfo);
  expect(icon).toBe(undefined);
});

test('should expect icon to be valid value with context/view set', async () => {
  const context = new ContextUI();
  const view: ViewInfoUI = {
    extensionId: 'extension',
    viewId: 'id',
    value: {
      icon: '${kind-icon}',
      when: 'io.x-k8s.kind.cluster in imageLabelKeys',
    },
  };
  const imageInfo = {
    Id: '12345',
    Labels: {
      'io.x-k8s.kind.cluster': 'ok',
    },
  } as unknown as ImageInfo;
  const icon = imageUtils.iconClass(imageInfo, context, [view]);
  expect(icon).toBe('podman-desktop-icon-kind-icon');
});

test('should expect icon to be ContainerIcon if no context/view is passed', async () => {
  const imageInfo = {
    Id: 'container1',
    Size: 123,
  } as unknown as ImageInfo;
  const imageinfoUIs = imageUtils.getImagesInfoUI(imageInfo, []);
  expect(imageinfoUIs[0].icon).toBeDefined();
  expect(typeof imageinfoUIs[0].icon !== 'string').toBe(true);
});

test('check parsing of image info without labels', async () => {
  const context = new ContextUI();
  const imageInfo = {
    Id: '1234',
    Labels: '',
  } as unknown as ImageInfo;
  imageUtils.adaptContextOnImage(context, imageInfo);
});

test('should expect badge to be undefined if no context/view is passed', async () => {
  const imageInfo = {
    Id: '12345',
    Labels: {},
  } as unknown as ImageInfo;
  const badges = imageUtils.computeBagdes(imageInfo);
  expect(badges).toStrictEqual([]);
});

test('should expect badge to be valid value with context/view set', async () => {
  const context = new ContextUI();
  const view: ViewInfoUI = {
    extensionId: 'extension',
    viewId: 'id',
    value: {
      badge: {
        label: 'my-custom-badge',
        color: '#ff0000',
      },
      when: 'io.x-k8s.kind.cluster in imageLabelKeys',
    },
  };
  const imageInfo = {
    Id: '12345',
    Labels: {
      'io.x-k8s.kind.cluster': 'ok',
    },
  } as unknown as ImageInfo;
  const badges = imageUtils.computeBagdes(imageInfo, context, [view]);
  // size should be one
  expect(badges.length).toBe(1);

  expect(badges[0].label).toBe('my-custom-badge');
  expect(badges[0].color).toBe('#ff0000');
});

describe('inUse', () => {
  const imageInfoHello = {
    Id: 'sha256:1b10fa0fd8d184d9de22a553688af8f9f8adbabb11f5dfc15f1a0fdd21873db2',
    RepoTags: ['quay.io/podman/hello3:latest', 'quay.io/podman/hello2:latest', 'quay.io/podman/hello:latest'],
  } as unknown as ImageInfo;

  const untaggedImageInfo = {
    Id: 'sha256:1b10fa0fd8d184d9de22a553688af8f9f8adbabb11f5dfc15f1a0fdd21873db2',
  } as unknown as ImageInfo;

  const containerInfo = {
    Id: 'container1',
    Image: 'quay.io/podman/hello:latest',
    ImageID: 'sha256:1b10fa0fd8d184d9de22a553688af8f9f8adbabb11f5dfc15f1a0fdd21873db2',
  } as unknown as ContainerInfo;

  test('should expect inUsed with an untagged image', async () => {
    const containerInfo = {
      Id: 'container1',
      Image: 'sha256:1b10fa0fd8d184d9de22a553688af8f9f8adbabb11f5dfc15f1a0fdd21873db2',
      ImageID: 'sha256:1b10fa0fd8d184d9de22a553688af8f9f8adbabb11f5dfc15f1a0fdd21873db2',
    } as unknown as ContainerInfo;

    const isUsed = imageUtils.getInUse(untaggedImageInfo, undefined, [containerInfo]);
    // image should be used
    expect(isUsed).toBeTruthy();
  });

  test('should not expect inUsed without a containerInfo', async () => {
    const isUsed = imageUtils.getInUse(imageInfoHello);
    // image should not be used
    expect(isUsed).toBeFalsy();
  });

  test.each([
    ['quay.io/podman/hello:latest', true],
    ['quay.io/podman/hello2:latest', false],
    ['quay.io/podman/hello3:latest', false],
  ])('should expect different inUsed based on repoTag %s', async (repoTag: string, expected: boolean) => {
    const isUsed = imageUtils.getInUse(imageInfoHello, repoTag, [containerInfo]);
    // image should be used
    expect(isUsed).toBe(expected);
  });
});

describe('getImagesFromManifest and construct ImageInfoUI', () => {
  // What we will use throughout the test
  let imageUtils: ImageUtils;
  let manifestImage: ImageInfo;
  let imageList: ImageInfo[];
  let containerInfoList: ContainerInfo[];
  let contextUI: ContextUI;
  let viewContributions: ViewInfoUI[];

  beforeEach(() => {
    imageUtils = new ImageUtils();
    manifestImage = {
      Id: 'manifest1',
      isManifest: true,
      manifests: [
        // Specific images that are part of the manifest
        { digest: 'digest1' },
        { digest: 'digest2' },
      ],
      RepoTags: ['my.registry:1234/manifest:latest'],
      Created: 1599888000,
      Size: 2048,
    } as unknown as ImageInfo;

    // Example manifests (should pickup the first two images from the manifest)
    imageList = [
      { Id: 'image1', Digest: 'digest1', Created: 1599888000, Size: 1024 },
      { Id: 'image2', Digest: 'digest2', Created: 1599888000, Size: 1024 },
      { Id: 'image3', Digest: 'digest3', Created: 1599888000, Size: 1024 },
    ] as unknown as ImageInfo[];

    containerInfoList = [
      { Id: 'container1', Image: 'my.registry:1234/manifest:latest', ImageID: 'manifest1' },
    ] as unknown as ContainerInfo[];

    contextUI = new ContextUI();
    viewContributions = [{ extensionId: 'extension', viewId: 'id', value: {} }] as unknown as ViewInfoUI[];
  });

  test('should retrieve images part of the manifest and construct ImageInfoUI objects', () => {
    const children = imageUtils
      .getImagesFromManifest(manifestImage, imageList)
      .map(child => imageUtils.getImagesInfoUI(child, containerInfoList, contextUI, viewContributions, imageList))
      .flat();

    expect(children.length).toBe(2);
    expect(children[0].id).toBe('image1');
    expect(children[1].id).toBe('image2');
  });

  test('should construct ImageInfoUI object for manifest image', () => {
    const imageInfoUIs = imageUtils.getImagesInfoUI(
      manifestImage,
      containerInfoList,
      contextUI,
      viewContributions,
      imageList,
    );
    expect(imageInfoUIs.length).toBe(1);
    expect(imageInfoUIs[0].id).toBe('manifest1');
  });
});
