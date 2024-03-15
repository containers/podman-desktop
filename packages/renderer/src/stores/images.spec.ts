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
import { beforeAll, expect, test, vi } from 'vitest';

import type { ImageInfo } from '../../../main/src/plugin/api/image-info';
import { imagesEventStore, imagesInfos } from './images';

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
