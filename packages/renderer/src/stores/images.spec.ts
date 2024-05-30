/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { get } from 'svelte/store';
import type { Mock } from 'vitest';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import type { ImageInfo } from '/@api/image-info';

import { filtered, imagesEventStore, imagesInfos } from './images';

// first, path window object
const callbacks = new Map<string, any>();
const eventEmitter = {
  receive: (message: string, callback: any) => {
    callbacks.set(message, callback);
  },
};

const listImagesMock: Mock<any, Promise<ImageInfo[]>> = vi.fn();

Object.defineProperty(global, 'window', {
  value: {
    listImages: listImagesMock,
    events: {
      receive: eventEmitter.receive,
    },
    addEventListener: eventEmitter.receive,
  },
  writable: true,
});

// We always mock findMatchInLeaves to return true so we can test image.ts without having to render
// the component, as we are not testing the $searchPattern store / functionality.
vi.mock('./search-util', () => ({
  findMatchInLeaves: vi.fn(() => true), // Assume it always finds a match unless specified otherwise
}));

beforeAll(() => {
  vi.clearAllMocks();
});

test('images should be updated in case of a image is loaded from an archive', async () => {
  // initial images
  listImagesMock.mockResolvedValue([
    {
      Id: 1,
    } as unknown as ImageInfo,
  ]);
  const storeInfo = imagesEventStore.setup();

  const callback = callbacks.get('extensions-already-started');
  // send 'extensions-already-started' event
  expect(callback).toBeDefined();
  await callback();

  // fetch
  await storeInfo.fetch();

  // now get list
  const images = get(imagesInfos);
  expect(images.length).toBe(1);
  expect(images[0].Id).toBe(1);

  // ok now mock the listImages function to return an empty list
  listImagesMock.mockResolvedValue([]);

  // call 'image-loadfromarchive-event' event
  const imageLoadFromArchiveCallback = callbacks.get('image-loadfromarchive-event');
  expect(imageLoadFromArchiveCallback).toBeDefined();
  await imageLoadFromArchiveCallback();

  // wait debounce
  await new Promise(resolve => setTimeout(resolve, 2000));

  // check if the images have been updated
  const images2 = get(imagesInfos);
  expect(images2.length).toBe(0);
});

describe('filtered images tests', () => {
  test('images with isManifest field missing should be included', async () => {
    // No isManifest field
    listImagesMock.mockResolvedValue([
      { Id: 2 } as unknown as ImageInfo, // Simulate isManifest field missing
    ]);

    // Setup, callback and fetch the images
    const storeInfo = imagesEventStore.setup();
    const callback = callbacks.get('extensions-already-started');
    await callback();
    await storeInfo.fetch();

    const images = get(filtered);
    expect(images.length).toBe(1);
    expect(images[0].Id).toBe(2);
  });

  test('images with isManifest false should be included', async () => {
    // isManifest but set to false
    listImagesMock.mockResolvedValue([{ Id: 3, isManifest: false } as unknown as ImageInfo]);

    // Setup, callback and fetch the images
    const storeInfo = imagesEventStore.setup();
    const callback = callbacks.get('extensions-already-started');
    await callback();
    await storeInfo.fetch();

    // Check the filtered images
    const images = get(filtered);
    expect(images.length).toBe(1);
    expect(images[0].Id).toBe(3);
    expect(images[0].isManifest).toBe(false);
  });

  test('images with isManifest true should be included', async () => {
    // isManifest but set to true
    listImagesMock.mockResolvedValue([{ Id: 4, isManifest: true } as unknown as ImageInfo]);

    // Setup, callback and fetch the images
    const storeInfo = imagesEventStore.setup();
    const callback = callbacks.get('extensions-already-started');
    await callback();
    await storeInfo.fetch();

    // Check the filtered images, make sure that we do NOT have any images
    // as we do not want filtered to show images with isManifest set to true
    const images = get(filtered);
    expect(images.length).toBe(1);
  });

  test('check against 3 images with different isManifest values', async () => {
    // 3 images with different isManifest values
    listImagesMock.mockResolvedValue([
      { Id: 5, isManifest: false } as unknown as ImageInfo,
      { Id: 6, isManifest: true } as unknown as ImageInfo,
      { Id: 7 } as unknown as ImageInfo, // Simulate isManifest field missing
    ]);

    // Setup, callback and fetch the images
    const storeInfo = imagesEventStore.setup();
    const callback = callbacks.get('extensions-already-started');
    await callback();
    await storeInfo.fetch();

    // Check the filtered images
    const images = get(filtered);

    // Expect to have 3 images now
    expect(images.length).toBe(3);

    // Check the first image
    expect(images[0].Id).toBe(5);
    expect(images[0].isManifest).toBe(false);

    // Check the second image
    expect(images[1].Id).toBe(6);
    expect(images[1].isManifest).toBeDefined();
  });
});
