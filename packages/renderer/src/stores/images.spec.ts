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

import type { ImageInfo } from '@desktop-framework/api';
import { get } from 'svelte/store';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { filtered, imagesEventStore, imagesInfos } from './images';

const callbacks = new Map<string, (data?: unknown) => void | Promise<void>>();

// We always mock findMatchInLeaves to return true so we can test image.ts without having to render
// the component, as we are not testing the $searchPattern store / functionality.
vi.mock(import('./search-util'), () => ({
  findMatchInLeaves: vi.fn(() => true), // Assume it always finds a match unless specified otherwise
}));

beforeEach(() => {
  callbacks.clear();
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((message, callback) => {
    callbacks.set(message, callback);
    return { dispose: vi.fn() };
  });
});

test('images should be updated in case of a image is loaded from an archive', async () => {
  // initial images
  vi.mocked(window.listImages).mockResolvedValue([
    {
      Id: '1',
    } as unknown as ImageInfo,
  ]);
  const storeInfo = imagesEventStore.setup();

  // send 'extensions-already-started' event
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // fetch
  await storeInfo.fetch();

  // now get list
  const images = get(imagesInfos);
  expect(images.length).toBe(1);
  expect(images[0].Id).toBe('1');

  // ok now mock the listImages function to return an empty list
  vi.mocked(window.listImages).mockResolvedValue([]);

  // call 'image-loadfromarchive-event' event
  const imageLoadFromArchiveCallback = callbacks.get('image-loadfromarchive-event');
  assert(imageLoadFromArchiveCallback);
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
    vi.mocked(window.listImages).mockResolvedValue([
      { Id: '2' } as unknown as ImageInfo, // Simulate isManifest field missing
    ]);

    // Setup, callback and fetch the images
    const storeInfo = imagesEventStore.setup();
    window.dispatchEvent(new CustomEvent('extensions-already-started'));
    await storeInfo.fetch();

    const images = get(filtered);
    expect(images.length).toBe(1);
    expect(images[0].Id).toBe('2');
  });

  test('images with isManifest false should be included', async () => {
    // isManifest but set to false
    vi.mocked(window.listImages).mockResolvedValue([{ Id: '3', isManifest: false } as unknown as ImageInfo]);

    // Setup, callback and fetch the images
    const storeInfo = imagesEventStore.setup();
    window.dispatchEvent(new CustomEvent('extensions-already-started'));
    await storeInfo.fetch();

    // Check the filtered images
    const images = get(filtered);
    expect(images.length).toBe(1);
    expect(images[0].Id).toBe('3');
    expect(images[0].isManifest).toBe(false);
  });

  test('images with isManifest true should be included', async () => {
    // isManifest but set to true
    vi.mocked(window.listImages).mockResolvedValue([{ Id: '4', isManifest: true } as unknown as ImageInfo]);

    // Setup, callback and fetch the images
    const storeInfo = imagesEventStore.setup();
    window.dispatchEvent(new CustomEvent('extensions-already-started'));
    await storeInfo.fetch();

    // Check the filtered images, make sure that we do NOT have any images
    // as we do not want filtered to show images with isManifest set to true
    const images = get(filtered);
    expect(images.length).toBe(1);
  });

  test('check against 3 images with different isManifest values', async () => {
    // 3 images with different isManifest values
    vi.mocked(window.listImages).mockResolvedValue([
      { Id: '5', isManifest: false } as unknown as ImageInfo,
      { Id: '6', isManifest: true } as unknown as ImageInfo,
      { Id: '7' } as unknown as ImageInfo, // Simulate isManifest field missing
    ]);

    // Setup, callback and fetch the images
    const storeInfo = imagesEventStore.setup();
    window.dispatchEvent(new CustomEvent('extensions-already-started'));
    await storeInfo.fetch();

    // Check the filtered images
    const images = get(filtered);

    // Expect to have 3 images now
    expect(images.length).toBe(3);

    // Check the first image
    expect(images[0].Id).toBe('5');
    expect(images[0].isManifest).toBe(false);

    // Check the second image
    expect(images[1].Id).toBe('6');
    expect(images[1].isManifest).toBeDefined();
  });
});
