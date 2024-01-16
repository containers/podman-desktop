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

import { describe, beforeEach, expect, test, vi } from 'vitest';
import { ImageUtils } from './image-utils';
import type { ImageInfo } from '../../../../main/src/plugin/api/image-info';
import { ContextUI } from '../context/context';
import type { ViewInfoUI } from '../../../../main/src/plugin/api/view-info';

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
