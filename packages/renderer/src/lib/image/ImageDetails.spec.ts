/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { containersInfos } from '/@/stores/containers';
import { imageCheckerProviders } from '/@/stores/image-checker-providers';
import { imagesInfos } from '/@/stores/images';
import { viewsContributions } from '/@/stores/views';
import type { ContainerInfo } from '/@api/container-info';
import type { ImageInfo } from '/@api/image-info';

import {
  IMAGE_DETAILS_VIEW_BADGES,
  IMAGE_DETAILS_VIEW_ICONS,
  IMAGE_LIST_VIEW_BADGES,
  IMAGE_LIST_VIEW_ICONS,
  IMAGE_VIEW_BADGES,
  IMAGE_VIEW_ICONS,
} from '../view/views';
import ImageDetails from './ImageDetails.svelte';

const listImagesMock = vi.fn();
const getContributedMenusMock = vi.fn();
const showMessageBoxMock = vi.fn();

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
  Digest: 'sha256:myImage',
};

const myNoneNameImage: ImageInfo = {
  ...myImage,
};
delete myNoneNameImage.RepoTags;

const deleteImageMock = vi.fn();
const hasAuthMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
  Object.defineProperty(window, 'listImages', { value: listImagesMock });
  Object.defineProperty(window, 'listContainers', { value: vi.fn() });
  Object.defineProperty(window, 'deleteImage', { value: deleteImageMock });
  Object.defineProperty(window, 'hasAuthconfigForImage', { value: hasAuthMock });
  Object.defineProperty(window, 'getImageCheckerProviders', { value: vi.fn().mockResolvedValue([]) });
  Object.defineProperty(window, 'listViewsContributions', { value: vi.fn().mockResolvedValue([]) });
  Object.defineProperty(window, 'getImageFilesProviders', { value: vi.fn().mockResolvedValue([]) });
  Object.defineProperty(window, 'getConfigurationProperties', { value: vi.fn().mockResolvedValue({}) });
  Object.defineProperty(window, 'getContributedMenus', { value: getContributedMenusMock });
});

beforeEach(() => {
  imagesInfos.set([]);
  viewsContributions.set([]);
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));
});

afterEach(() => {
  vi.clearAllMocks();
});

test('Expect redirect to previous page if image is deleted', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });

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

  // Wait for modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

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

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

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

test.each([
  { viewIdContrib: IMAGE_VIEW_ICONS },
  { viewIdContrib: IMAGE_DETAILS_VIEW_ICONS },
  { viewIdContrib: IMAGE_LIST_VIEW_ICONS },
])('Expect image status being changed with %s contribution', async ({ viewIdContrib }) => {
  const imageWithLabels: ImageInfo = {
    ...myImage,
    Labels: {
      'io.podman-desktop': 'true',
    },
  };
  listImagesMock.mockResolvedValue([imageWithLabels]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(imagesInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  hasAuthMock.mockImplementation(() => {
    return new Promise(() => false);
  });

  const contribs = [
    {
      extensionId: 'foo.bar',
      viewId: viewIdContrib,
      value: {
        icon: '${my-custom-icon}',
        when: 'io.podman-desktop in imageLabelKeys',
      },
    },
  ];

  // set viewsContributions
  viewsContributions.set(contribs);

  // render the component
  render(ImageDetails, {
    imageID: 'myImage',
    engineId: 'engine0',
    base64RepoTag: Buffer.from('myImageTag').toString('base64'),
  });

  // grab status icon of the image
  const statusElement = screen.getByRole('status', { name: 'UNUSED' });
  expect(statusElement).toBeInTheDocument();

  // now assert status item contains the icon
  const subElement = statusElement.getElementsByClassName('podman-desktop-icon-my-custom-icon');
  // should not be overriden for list contribution
  if (IMAGE_LIST_VIEW_ICONS === viewIdContrib) {
    expect(subElement.length).toBe(0);
  } else {
    expect(subElement.length).toBe(1);
  }
});

test.each([
  { viewIdContrib: IMAGE_VIEW_BADGES },
  { viewIdContrib: IMAGE_LIST_VIEW_BADGES },
  { viewIdContrib: IMAGE_DETAILS_VIEW_BADGES },
])('Expect badges added with %s contribution', async ({ viewIdContrib }) => {
  const imageWithLabels: ImageInfo = {
    ...myImage,
    Labels: {
      'io.podman-desktop': 'true',
    },
  };
  listImagesMock.mockResolvedValue([imageWithLabels]);
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  while (get(imagesInfos).length !== 1) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  hasAuthMock.mockImplementation(() => {
    return new Promise(() => false);
  });

  const contribs = [
    {
      extensionId: 'foo.bar',
      viewId: viewIdContrib,
      value: {
        badge: { label: 'my-custom-badge', color: '#ff0000' },
        when: 'io.podman-desktop in imageLabelKeys',
      },
    },
  ];

  // set viewsContributions
  viewsContributions.set(contribs);

  // render the component
  render(ImageDetails, {
    imageID: 'myImage',
    engineId: 'engine0',
    base64RepoTag: Buffer.from('myImageTag').toString('base64'),
  });

  // wait a litlle
  await new Promise(resolve => setTimeout(resolve, 100));

  // grab badge with label 'my-custom-badge'
  const badge = screen.queryByText('my-custom-badge');

  // should not be overriden for list contribution

  if (IMAGE_LIST_VIEW_BADGES === viewIdContrib) {
    expect(badge).not.toBeInTheDocument();
  } else {
    expect(badge).toBeInTheDocument();
    // color should be #ff0000
    expect(badge).toHaveStyle('background-color: #ff0000');
  }
});
