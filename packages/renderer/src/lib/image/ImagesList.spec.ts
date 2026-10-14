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

import type { ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import type { ImageInfo } from '@desktop-framework/extension-api';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { IMAGE_LIST_VIEW_BADGES, IMAGE_LIST_VIEW_ICONS, IMAGE_VIEW_BADGES, IMAGE_VIEW_ICONS } from '/@/lib/view/views';
import { imagesInfos } from '/@/stores/images';
import { providerInfos } from '/@/stores/providers';
import { viewsContributions } from '/@/stores/views';

import ImagesList from './ImagesList.svelte';

beforeEach(() => {
  providerInfos.set([]);
  imagesInfos.set([]);
  viewsContributions.set([]);
  vi.mocked(window.hasAuthconfigForImage).mockResolvedValue(false);
  vi.mocked(window.listViewsContributions).mockResolvedValue([]);
  vi.mocked(window.getConfigurationProperties).mockResolvedValue({});
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);
  vi.mocked(window.onDidUpdateProviderStatus).mockResolvedValue(undefined);

  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });
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
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  vi.mocked(window.listImages).mockResolvedValue([
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
  ] as unknown as ImageInfo[]);

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
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  vi.mocked(window.listImages).mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:old'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ] as unknown as ImageInfo[]);

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

test('Expect two images in list given image id and engine id', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  vi.mocked(window.listImages).mockResolvedValue([
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
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:1'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'docker',
      engineName: 'docker',
    },
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:2'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:2345678901234',
      RepoTags: ['fedora:3'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
    {
      Id: 'sha256:3456789012345',
      RepoTags: ['fedora:4'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ] as unknown as ImageInfo[]);

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

  await waitRender({ searchTerm: 'sha256:1234567890123', imageEngineId: 'podman' });

  const image1 = screen.queryByRole('cell', { name: 'fedora 123456789012 old' });
  expect(image1).toBeInTheDocument();
  const image2 = screen.queryByRole('cell', { name: 'fedora 123456789012 2' });
  expect(image2).toBeInTheDocument();
  const image3 = screen.queryByRole('cell', { name: 'fedora 123456789012 1' });
  expect(image3).not.toBeInTheDocument();
  const image4 = screen.queryByRole('cell', { name: 'fedora 234567890123 3' });
  expect(image4).not.toBeInTheDocument();
  const image5 = screen.queryByRole('cell', { name: 'fedora 345678901234 4' });
  expect(image5).not.toBeInTheDocument();
});

describe('Contributions', () => {
  test.each([{ viewIdContrib: IMAGE_VIEW_ICONS }, { viewIdContrib: IMAGE_LIST_VIEW_ICONS }])(
    'Expect image status being changed with %s contribution',
    async ({ viewIdContrib }) => {
      vi.mocked(window.getProviderInfos).mockResolvedValue([
        {
          name: 'podman',
          status: 'started',
          internalId: 'podman-internal-id',
          containerConnections: [
            {
              name: 'podman-machine-default',
              status: 'started',
            } as unknown as ProviderContainerConnectionInfo,
          ],
        } as unknown as ProviderInfo,
      ]);

      const labels = {
        'podman-desktop.label': true,
      };

      vi.mocked(window.listImages).mockResolvedValue([
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
      ] as unknown as ImageInfo[]);

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

      vi.mocked(window.listViewsContributions).mockReset();
      vi.mocked(window.listViewsContributions).mockResolvedValue(contribs);
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

      // check image icon of status being overridden due to contributed menu

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
      vi.mocked(window.getProviderInfos).mockResolvedValue([
        {
          name: 'podman',
          status: 'started',
          internalId: 'podman-internal-id',
          containerConnections: [
            {
              name: 'podman-machine-default',
              status: 'started',
            } as unknown as ProviderContainerConnectionInfo,
          ],
        } as unknown as ProviderInfo,
      ]);

      const labels = {
        'podman-desktop.label': true,
      };

      vi.mocked(window.listImages).mockResolvedValue([
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
      ] as unknown as ImageInfo[]);

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

      vi.mocked(window.listViewsContributions).mockReset();
      vi.mocked(window.listViewsContributions).mockResolvedValue(contribs);
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

      const fedoraOld = screen.getByRole('cell', { name: 'fedora badge-my-custom-badge 123456789012 old' });
      expect(fedoraOld).toBeInTheDocument();

      const badge = within(fedoraOld).getByText('my-custom-badge');

      // check background color
      expect(badge).toHaveStyle({
        'background-color': '#ff00ff',
      });
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
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  vi.mocked(window.listImages).mockResolvedValue([
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
  ] as unknown as ImageInfo[]);

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
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  // Set up the image list with one normal image and one manifest image
  vi.mocked(window.listImages).mockResolvedValue([
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
  ] as unknown as ImageInfo[]);

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
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  vi.mocked(window.listImages).mockResolvedValue([
    {
      Id: 'sha256:1234567890',
      RepoTags: ['mockimage:latest'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ] as unknown as ImageInfo[]);

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

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);

  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  await vi.waitFor(() => expect(window.deleteImage).toHaveBeenCalled());
});

test('Expect to see empty page and no table when no container engine is running', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'stopped',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);
  vi.mocked(window.listImages).mockResolvedValue([
    {
      Id: 'sha256:1234567890',
      RepoTags: ['mockimage:latest'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman',
      engineName: 'podman',
    },
  ] as unknown as ImageInfo[]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  // wait imageInfo store is populated
  await vi.waitUntil(() => get(imagesInfos).length > 0);

  await waitRender({});

  const table = screen.queryByRole('table');
  expect(table).toBeNull();

  const noContainerEngine = screen.getByText('No Container Engine');
  expect(noContainerEngine).toBeInTheDocument();
});

test('Expect environment column sorted by engineId', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  vi.mocked(window.listImages).mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['fedora:latest'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'engine-zzz',
      engineName: 'name-aaa',
    },
    {
      Id: 'sha256:2345678901234',
      RepoTags: ['alpine:latest'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'engine-aaa',
      engineName: 'name-zzz',
    },
  ] as unknown as ImageInfo[]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  await waitFor(() => {
    expect(get(imagesInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  const environment = screen.getByRole('columnheader', { name: 'Environment' });
  await fireEvent.click(environment);

  const cells = screen.getAllByRole('cell', { name: /alpine|fedora/ });
  expect(cells[0]).toHaveTextContent('alpine');
  expect(cells[1]).toHaveTextContent('fedora');
});

test('Expect environment dropdown to appear with multiple running connections', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      id: 'podman',
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          displayName: 'Podman Machine',
          status: 'started',
          type: 'podman',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
    {
      id: 'docker',
      name: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'docker-context',
          displayName: 'Docker Desktop',
          status: 'started',
          type: 'docker',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  vi.mocked(window.listImages).mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['podman-image:latest'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman.podman-machine-default',
      engineName: 'Podman Machine',
    },
    {
      Id: 'sha256:2345678901234',
      RepoTags: ['docker-image:latest'],
      Created: 1644009612,
      Size: 456,
      Status: 'Running',
      engineId: 'docker.docker-context',
      engineName: 'Docker Desktop',
    },
  ] as unknown as ImageInfo[]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  await waitFor(() => {
    expect(get(imagesInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  // Environment dropdown should be visible
  const environmentDropdown = screen.getByLabelText('Environment');
  expect(environmentDropdown).toBeInTheDocument();
});

test('Expect environment dropdown to filter images by selected environment', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      id: 'podman',
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          displayName: 'Podman Machine',
          status: 'started',
          type: 'podman',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
    {
      id: 'docker',
      name: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'docker-context',
          displayName: 'Docker Desktop',
          status: 'started',
          type: 'docker',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  vi.mocked(window.listImages).mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['podman-image:latest'],
      Created: 1644009612,
      Size: 123,
      Status: 'Running',
      engineId: 'podman.podman-machine-default',
      engineName: 'Podman Machine',
    },
    {
      Id: 'sha256:2345678901234',
      RepoTags: ['docker-image:latest'],
      Created: 1644009612,
      Size: 456,
      Status: 'Running',
      engineId: 'docker.docker-context',
      engineName: 'Docker Desktop',
    },
  ] as unknown as ImageInfo[]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('image-build'));

  await waitFor(() => {
    expect(get(imagesInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  // Both images should be visible initially
  expect(screen.getByText('podman-image')).toBeInTheDocument();
  expect(screen.getByText('docker-image')).toBeInTheDocument();

  // Select Podman environment from dropdown
  const dropdownContainer = screen.getByLabelText('Environment');
  const dropdownButton = within(dropdownContainer).getByRole('button');
  await fireEvent.click(dropdownButton);

  const podmanOption = await waitFor(async () => {
    await tick();
    return screen.getByRole('button', { name: 'Podman' });
  });
  await fireEvent.click(podmanOption);

  // Only podman image should be visible
  await waitFor(() => {
    expect(screen.getByText('podman-image')).toBeInTheDocument();
    expect(screen.queryByText('docker-image')).not.toBeInTheDocument();
  });
});
