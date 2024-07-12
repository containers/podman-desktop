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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { viewsContributions } from '/@/stores/views';

import { imagesInfos } from '../../stores/images';
import { providerInfos } from '../../stores/providers';
import { IMAGE_LIST_VIEW_BADGES, IMAGE_LIST_VIEW_ICONS, IMAGE_VIEW_BADGES, IMAGE_VIEW_ICONS } from '../view/views';
import ImagesList from './ImagesList.svelte';

const listImagesMock = vi.fn();
const getProviderInfosMock = vi.fn();
const listViewsContributionsMock = vi.fn();

// fake the window.events object
beforeEach(() => {
  providerInfos.set([]);
  imagesInfos.set([]);
  viewsContributions.set([]);
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();
  (window as any).getContributedMenus = vi.fn();
  const onDidUpdateProviderStatusMock = vi.fn();
  (window as any).onDidUpdateProviderStatus = onDidUpdateProviderStatusMock;
  onDidUpdateProviderStatusMock.mockImplementation(() => Promise.resolve());
  (window as any).hasAuthconfigForImage = vi.fn();
  (window as any).hasAuthconfigForImage.mockImplementation(() => Promise.resolve(false));

  (window as any).listContainers = vi.fn();
  (window as any).listImages = listImagesMock;
  (window as any).getProviderInfos = getProviderInfosMock;
  (window as any).listViewsContributions = listViewsContributionsMock;
  listViewsContributionsMock.mockResolvedValue([]);
  (window as any).getConfigurationValue = vi.fn();
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);

  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

async function waitRender(customProperties: object): Promise<void> {
  render(ImagesList, { ...customProperties });
  await tick();
}

test('Expect no container engines being displayed', async () => {
  render(ImagesList);
  const noEngine = screen.getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();
});

test('Expect images being ordered by newest first', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  listImagesMock.mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:old'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:456456456456456',
      RepoTags: ['veryold:image'],
      Created: 1,
      Size: 1234,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:7897891234567890123',
      RepoTags: ['fedora:recent'],
      Created: 1644109612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  // wait store are populated
  while (get(imagesInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const fedoraRecent = screen.getByRole('cell', { name: 'fedora 789789123456 recent' });
  const fedoraOld = screen.getByRole('cell', { name: 'fedora 123456789012 old' });
  const veryOld = screen.getByRole('cell', { name: 'veryold 456456456456 image' });
  expect(fedoraRecent).toBeInTheDocument();
  expect(fedoraOld).toBeInTheDocument();
  expect(veryOld).toBeInTheDocument();

  expect(fedoraRecent.compareDocumentPosition(fedoraOld)).toBe(4);
  expect(fedoraRecent.compareDocumentPosition(veryOld)).toBe(4);
  expect(fedoraOld.compareDocumentPosition(veryOld)).toBe(4);
});

test('Expect filter empty screen', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  listImagesMock.mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:old'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  // wait store are populated
  while (get(imagesInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

describe('Contributions', () => {
  test.each([{ viewIdContrib: IMAGE_VIEW_ICONS }, { viewIdContrib: IMAGE_LIST_VIEW_ICONS }])(
    'Expect image status being changed with %s contribution',
    async ({ viewIdContrib }) => {
      getProviderInfosMock.mockResolvedValue([
        {
          name: 'podman',
          status: 'started',
          internalId: 'podman-internal-id',
          containerConnections: [
            {
              name: 'podman-machine-default',
              status: 'started',
            },
          ],
        },
      ]);

      const labels = {
        'podman-desktop.label': true,
      };

      listImagesMock.mockResolvedValue([
        {
          Id: 'sha256:1234567890123',
          RepoTags: ['fedora:old'],
          Created: 1644009612,
          Size: 123,
          Status: 'Running',
          engineId: 'podman',
          engineName: 'podman',
          Labels: labels,
        },
      ]);

      window.dispatchEvent(new CustomEvent('extensions-already-started'));
      window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
      window.dispatchEvent(new CustomEvent('image-build'));

      const contribs = [
        {
          extensionId: 'foo.bar',
          viewId: viewIdContrib,
          value: {
            icon: '${my-custom-icon}',
            when: 'podman-desktop.label in imageLabelKeys',
          },
        },
      ];

      listViewsContributionsMock.mockReset();
      listViewsContributionsMock.mockResolvedValue(contribs);
      // set viewsContributions
      viewsContributions.set(contribs);

      // wait store are populated
      while (get(imagesInfos).length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      while (get(providerInfos).length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await waitRender({});

      // check image icon of status being overrided due to contributed menu

      const fedoraOld = screen.getByRole('cell', { name: 'fedora 123456789012 old' });
      expect(fedoraOld).toBeInTheDocument();

      // now check that there is a custom icon for status column
      const statusElement = screen.getByRole('status', { name: 'UNUSED' });

      // now assert status item contains the icon
      const subElement = statusElement.getElementsByClassName('podman-desktop-icon-my-custom-icon');
      expect(subElement.length).toBe(1);
    },
  );

  test.each([{ viewIdContrib: IMAGE_VIEW_BADGES }, { viewIdContrib: IMAGE_LIST_VIEW_BADGES }])(
    'Expect bagde being added with %s contribution',
    async ({ viewIdContrib }) => {
      getProviderInfosMock.mockResolvedValue([
        {
          name: 'podman',
          status: 'started',
          internalId: 'podman-internal-id',
          containerConnections: [
            {
              name: 'podman-machine-default',
              status: 'started',
            },
          ],
        },
      ]);

      const labels = {
        'podman-desktop.label': true,
      };

      listImagesMock.mockResolvedValue([
        {
          Id: 'sha256:1234567890123',
          RepoTags: ['fedora:old'],
          Created: 1644009612,
          Size: 123,
          Status: 'Running',
          engineId: 'podman',
          engineName: 'podman',
          Labels: labels,
        },
      ]);

      window.dispatchEvent(new CustomEvent('extensions-already-started'));
      window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
      window.dispatchEvent(new CustomEvent('image-build'));

      const contribs = [
        {
          extensionId: 'foo.bar',
          viewId: viewIdContrib,
          value: {
            badge: {
              label: 'my-custom-badge',
              color: '#ff00ff',
            },
            when: 'podman-desktop.label in imageLabelKeys',
          },
        },
      ];

      listViewsContributionsMock.mockReset();
      listViewsContributionsMock.mockResolvedValue(contribs);
      // set viewsContributions
      viewsContributions.set(contribs);

      // wait store are populated
      while (get(imagesInfos).length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      while (get(providerInfos).length === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await waitRender({});

      // check few ms
      await new Promise(resolve => setTimeout(resolve, 100));

      // check badge is being added

      const fedoraOld = screen.getByRole('cell', { name: 'fedora my-custom-badge 123456789012 old' });
      expect(fedoraOld).toBeInTheDocument();

      // check background color
      expect(fedoraOld.innerHTML).contain('background-color: #ff00ff');
    },
  );
});

test('Expect importImage button redirects to image import page', async () => {
  const goToMock = vi.spyOn(router, 'goto');
  render(ImagesList);
  const btnImportImage = screen.getByRole('button', { name: 'Import Image' });
  expect(btnImportImage).toBeInTheDocument();

  await userEvent.click(btnImportImage);
  expect(goToMock).toBeCalledWith('/images/import');
});

test('expect redirect to saveImage page when at least one image is selected and the multiple save button is clicked', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  listImagesMock.mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:old'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:456456456456456',
      RepoTags: ['veryold:image'],
      Created: 1,
      Size: 1234,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:7897891234567890123',
      RepoTags: ['fedora:recent'],
      Created: 1644109612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ]);

  const goToMock = vi.spyOn(router, 'goto');

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  // wait store are populated
  while (get(imagesInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const toggleAll = screen.getByTitle('Toggle all');
  await fireEvent.click(toggleAll);

  const saveImages = screen.getByRole('button', { name: 'Save images' });
  await fireEvent.click(saveImages);

  expect(goToMock).toBeCalledWith('/images/save');
});

test('Expect load images button redirects to images load page', async () => {
  const goToMock = vi.spyOn(router, 'goto');
  render(ImagesList);
  const btnLoadImages = screen.getByRole('button', { name: 'Load Images' });
  expect(btnLoadImages).toBeInTheDocument();

  await userEvent.click(btnLoadImages);
  expect(goToMock).toBeCalledWith('/images/load');
});

test('Manifest images display without actions', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  // Set up the image list with one normal image and one manifest image
  listImagesMock.mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['normalimage:latest'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:7897891234567890123',
      RepoTags: ['manifestimage:latest'],
      Created: 1644109612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
      isManifest: true,
    },
  ]);

  // dispatch events
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  // wait store are populated
  while (get(imagesInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const manifestImageRow = screen.getByRole('row', { name: 'manifestimage' });
  expect(manifestImageRow).toBeInTheDocument();
  // Check that the manifest image is displayed with no:
  // Push Image
  // Edit Image
  // Delete Image
  // Save Image
  // or Show History buttons
  const pushImageButton = within(manifestImageRow).queryByRole('button', { name: 'Push Image' });
  expect(pushImageButton).not.toBeInTheDocument();
  const editImageButton = within(manifestImageRow).queryByRole('button', { name: 'Edit Image' });
  expect(editImageButton).not.toBeInTheDocument();
  const deleteImageButton = within(manifestImageRow).queryByRole('button', { name: 'Delete Image' });
  expect(deleteImageButton).not.toBeInTheDocument();
  const saveImageButton = within(manifestImageRow).queryByRole('button', { name: 'Save Image' });
  expect(saveImageButton).not.toBeInTheDocument();
  const showHistoryButton = within(manifestImageRow).queryByRole('button', { name: 'Show History' });
  expect(showHistoryButton).not.toBeInTheDocument();

  // Verify normal image is shown still.
  const normalImageRow = screen.getByRole('row', { name: 'normalimage' });
  expect(normalImageRow).toBeInTheDocument();
});

test('Expect user confirmation to pop up when preferences require', async () => {
  getProviderInfosMock.mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    },
  ]);

  listImagesMock.mockResolvedValue([
    {
      Id: 'sha256:1234567890',
      RepoTags: ['mockimage:latest'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ]);

  // dispatch events
  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  // wait store are populated
  while (get(imagesInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  while (get(providerInfos).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  await waitRender({});

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle image' });
  await fireEvent.click(checkboxes[0]);

  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

  (window as any).showMessageBox = vi.fn();
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 1 });

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);

  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 0 });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  vi.waitFor(() => expect(window.deleteImage).toHaveBeenCalled());
});
