/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { expect as playExpect, test } from '../utility/fixtures';
import { waitForPodmanMachineStartup } from '../utility/wait';

const imageToSearch = 'ghcr.io/linuxcontainers/alpine';
const httpdImage = 'docker.io/httpd';
const httpdTag = '2-alpine';

test.beforeAll(async ({ runner, welcomePage, page }) => {
  runner.setVideoAndTraceName('image-search');

  await welcomePage.handleWelcomePage(true);
  await waitForPodmanMachineStartup(page);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Image search verification @smoke', () => {
  test('Search for image and then clear field', async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const pullImagePage = await imagesPage.openPullImage();
    await playExpect(pullImagePage.heading).toBeVisible();

    const searchResults = await pullImagePage.getAllSearchResultsFor(imageToSearch, true);
    playExpect(searchResults.length).toBeGreaterThan(0);

    await pullImagePage.clearImageSearch();
  });

  test('Search for image and then search with tag also', async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const pullImagePage = await imagesPage.openPullImage();
    await playExpect(pullImagePage.heading).toBeVisible();

    let searchResults = await pullImagePage.getAllSearchResultsFor(imageToSearch, true);
    playExpect(searchResults.length).toBeGreaterThan(0);

    searchResults = await pullImagePage.refineSearchResults('3.13');
    playExpect(searchResults.length).toBe(4);
  });

  // TODO: This test is failing because the search results are not sorted by relevance as per https://github.com/containers/podman-desktop/issues/8929
  test.fail('First search result needs to be the most relevant', async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const pullImagePage = await imagesPage.openPullImage();
    await playExpect(pullImagePage.heading).toBeVisible();

    const searchResults = await pullImagePage.getFirstSearchResultFor('quay.io/podman', false);
    playExpect(searchResults).toContain('quay.io/podman');
  });

  test(`Search for ${httpdImage} after using intermediate steps`, async ({ navigationBar }) => {
    const imagesPage = await navigationBar.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const pullImagePage = await imagesPage.openPullImage();
    await playExpect(pullImagePage.heading).toBeVisible();

    let searchResults = await pullImagePage.getAllSearchResultsFor('htt', false);
    playExpect(searchResults.length).toBeGreaterThan(0);

    searchResults = await pullImagePage.refineSearchResults('pd');
    playExpect(searchResults.length).toBeGreaterThan(0);

    await pullImagePage.selectValueFromSearchResults(httpdImage);
    searchResults = await pullImagePage.getAllSearchResultsFor(httpdImage, true, httpdTag);
    playExpect(searchResults.length).toBeGreaterThan(0);
  });
});
