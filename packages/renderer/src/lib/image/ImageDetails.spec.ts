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

import '@testing-library/jest-dom/vitest';
import { describe, test, expect, vi, beforeAll, afterEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';

import ImageDetails from './ImageDetails.svelte';
import { get } from 'svelte/store';
import { imagesInfos } from '/@/stores/images';
import type { ImageInfo } from '../../../../main/src/plugin/api/image-info';

import { router } from 'tinro';
import { lastPage } from '/@/stores/breadcrumb';
import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import { containersInfos } from '/@/stores/containers';
import { imageCheckerProviders } from '/@/stores/image-checker-providers';

const listImagesMock = vi.fn();
const getContributedMenusMock = vi.fn();

const myImage: ImageInfo = {
  Id: 'myImage',
  Labels: {},
  engineId: 'engine0',
  engineName: 'podman',
  ParentId: '',
  RepoTags: ['myImageTag'],
  Created: 0,
  Size: 0,
  VirtualSize: 0,
  SharedSize: 0,
  Containers: 0,
};

const myNoneNameImage: ImageInfo = {
  ...myImage,
};
delete myNoneNameImage.RepoTags;

const deleteImageMock = vi.fn();
const hasAuthMock = vi.fn();

beforeAll(() => {
  (window as any).listImages = listImagesMock;
  (window as any).listContainers = vi.fn();
  (window as any).deleteImage = deleteImageMock;
  (window as any).hasAuthconfigForImage = hasAuthMock;

  (window as any).getContributedMenus = getContributedMenusMock;
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

afterEach(() => {
  vi.clearAllMocks();
});

test('Expect redirect to previous page if image is deleted', async () => {
  const routerGotoSpy = vi.spyOn(router, 'goto');
  listImagesMock.mockResolvedValue([myImage]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  while (get(imagesInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // remove myImage from the store when we call 'deleteImage'
  // it will then refresh the store and update ImageDetails page
  deleteImageMock.mockImplementation(() => {
    imagesInfos.update(images => images.filter(image => image.Id !== myImage.Id));
  });
  hasAuthMock.mockImplementation(() => {
    return new Promise(() => false);
  });

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  render(ImageDetails, { imageID: 'myImage', engineId: 'engine0', base64RepoTag: 'bXlJbWFnZVRhZw==' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  // click on delete image button
  const deleteButton = screen.getByRole('button', { name: 'Delete Image' });
  await fireEvent.click(deleteButton);

  // check that delete method has been called
  expect(deleteImageMock).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});

test('expect delete image called with image id when image name is <none>', async () => {
  listImagesMock.mockResolvedValue([myNoneNameImage]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(imagesInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  hasAuthMock.mockImplementation(() => {
    return new Promise(() => false);
  });

  // render the component
  render(ImageDetails, {
    imageID: 'myImage',
    engineId: 'engine0',
    base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
  });

  // click on delete image button
  const deleteButton = screen.getByRole('button', { name: 'Delete Image' });
  await fireEvent.click(deleteButton);

  // check that delete method has been called
  expect(deleteImageMock).toHaveBeenCalledWith(myNoneNameImage.engineId, myNoneNameImage.Id);
});

describe('expect display usage of an image', () => {
  test('expect used', async () => {
    const imageID = 'abcd12345';

    const containerInfo = {
      ImageID: imageID,
    } as unknown as ContainerInfo;
    containersInfos.set([containerInfo]);

    const myImage = {
      engineId: 'podman',
      Id: imageID,
      Size: 0,
    } as unknown as ImageInfo;
    imagesInfos.set([myImage]);

    hasAuthMock.mockImplementation(() => {
      return new Promise(() => false);
    });

    // render the component
    render(ImageDetails, {
      imageID: imageID,
      engineId: 'podman',
      base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
    });

    //  now check that we have the image saying it's in used
    const usage = screen.getByRole('status', { name: 'USED' });
    expect(usage).toBeInTheDocument();
  });

  test('expect unused', async () => {
    const imageID = 'abcd12345';

    // containers but not using the image
    const containerInfo = {
      ImageID: 'anotherID',
    } as unknown as ContainerInfo;
    containersInfos.set([containerInfo]);

    const myImage = {
      engineId: 'podman',
      Id: imageID,
      Size: 0,
    } as unknown as ImageInfo;
    imagesInfos.set([myImage]);

    hasAuthMock.mockImplementation(() => {
      return new Promise(() => false);
    });

    // render the component
    render(ImageDetails, {
      imageID: imageID,
      engineId: 'podman',
      base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
    });

    //  now check that we have the image saying it's in used
    const usage = screen.getByRole('status', { name: 'UNUSED' });
    expect(usage).toBeInTheDocument();
  });
});

test('expect Check tab is not displayed by default', () => {
  const imageID = '123456';
  const engineId = 'podman';
  const myImage = {
    engineId,
    Id: imageID,
    Size: 0,
  } as unknown as ImageInfo;
  imagesInfos.set([myImage]);

  hasAuthMock.mockImplementation(() => {
    return new Promise(() => false);
  });

  render(ImageDetails, {
    imageID,
    engineId,
    base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
  });
  const summaryTab = screen.getByRole('link', { name: 'Summary' });
  expect(summaryTab).toBeInTheDocument();
  const checkTab = screen.queryByRole('link', { name: 'Check' });
  expect(checkTab).not.toBeInTheDocument();
});

test('expect Check tab is displayed when an image checker provider exists', () => {
  const imageID = '123456';
  const engineId = 'podman';
  const myImage = {
    engineId,
    Id: imageID,
    Size: 0,
  } as unknown as ImageInfo;
  imagesInfos.set([myImage]);

  hasAuthMock.mockImplementation(() => {
    return new Promise(() => false);
  });

  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);
  render(ImageDetails, {
    imageID,
    engineId,
    base64RepoTag: Buffer.from('<none>', 'binary').toString('base64'),
  });
  const summaryTab = screen.getByRole('link', { name: 'Summary' });
  expect(summaryTab).toBeInTheDocument();
  const checkTab = screen.getByRole('link', { name: 'Check' });
  expect(checkTab).toBeInTheDocument();
});
