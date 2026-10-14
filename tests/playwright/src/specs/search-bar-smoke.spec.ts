/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { CommandPalette } from '/@/model/pages/command-palette';
import { ContainersPage } from '/@/model/pages/containers-page';
import { expect as playExpect, test } from '/@/utility/fixtures';

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('search-bar-e2e');
  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Search bar verification', { tag: ['@smoke', '@windows_sanity', '@macos_sanity'] }, () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test('F1 key opens search bar in Commands mode', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openWithF1();

    await playExpect(commandPalette.commandPaletteInputField).toBeFocused();
    await playExpect(commandPalette.commandPaletteInputField).toHaveAttribute(
      'placeholder',
      'Search and execute commands',
    );

    await commandPalette.close();
  });

  test('Search button opens search bar', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openViaSearchButton();

    await playExpect(commandPalette.commandPaletteInputField).toBeFocused();
    await playExpect(commandPalette.selectedItem).toBeVisible({ timeout: 10_000 });

    await commandPalette.close();
  });

  test('Switching tabs updates placeholder text', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openViaSearchButton();

    await commandPalette.commandsTab.click();
    await playExpect(commandPalette.commandPaletteInputField).toHaveAttribute(
      'placeholder',
      'Search and execute commands',
    );

    await commandPalette.documentationTab.click();
    await playExpect(commandPalette.commandPaletteInputField).toHaveAttribute(
      'placeholder',
      'Search documentation and tutorials',
    );

    await commandPalette.goToTab.click();
    await playExpect(commandPalette.commandPaletteInputField).toHaveAttribute(
      'placeholder',
      'Search images, containers, pods, and other resources',
    );

    await commandPalette.allTab.click();
    await playExpect(commandPalette.commandPaletteInputField).toHaveAttribute(
      'placeholder',
      /Search.*Podman Desktop, or type > for commands/,
    );

    await commandPalette.close();
  });

  test('Typing filters results and shows empty state for no matches', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openViaSearchButton();

    await playExpect(commandPalette.selectedItem).toBeVisible({ timeout: 10_000 });

    await commandPalette.typeSearch('xyznonexistentfoobar123');
    await playExpect(commandPalette.noResultsMessage).toBeVisible();

    await commandPalette.close();
  });

  test('Clearing search input restores results', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openViaSearchButton();

    await commandPalette.typeSearch('xyznonexistentfoobar123');
    await playExpect(commandPalette.noResultsMessage).toBeVisible();

    await commandPalette.clearSearch();

    await playExpect(commandPalette.selectedItem).toBeVisible({ timeout: 10_000 });
    await playExpect(commandPalette.noResultsMessage).not.toBeVisible();

    await commandPalette.close();
  });

  test('Escape key closes the search bar', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openViaSearchButton();
    await playExpect(commandPalette.commandPaletteInputField).toBeVisible();

    await page.keyboard.press('Escape');
    await playExpect(commandPalette.commandPaletteInputField).not.toBeVisible();
  });

  test('Clicking outside closes the search bar', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openViaSearchButton();
    await playExpect(commandPalette.commandPaletteInputField).toBeVisible();

    await commandPalette.closeByClickingOutside();
  });

  test('Arrow keys navigate through results', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openWithF1();
    await playExpect(commandPalette.selectedItem).toBeVisible({ timeout: 10_000 });

    const resultCount = await commandPalette.resultItems.count();
    test.skip(resultCount < 2, 'Need at least 2 results to test arrow key navigation');

    const initialText = await commandPalette.selectedItem.innerText();

    await page.keyboard.press('ArrowDown');
    await playExpect(commandPalette.selectedItem).toHaveCount(1);
    const afterDownText = await commandPalette.selectedItem.innerText();
    playExpect(afterDownText).not.toBe(initialText);

    await page.keyboard.press('ArrowUp');
    await playExpect(commandPalette.selectedItem).toHaveCount(1);
    const afterUpText = await commandPalette.selectedItem.innerText();
    playExpect(afterUpText).toBe(initialText);

    await commandPalette.close();
  });

  test('Enter key executes selected command', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openWithF1();
    await playExpect(commandPalette.selectedItem).toBeVisible({ timeout: 10_000 });

    await page.keyboard.press('Enter');
    await playExpect(commandPalette.commandPaletteInputField).not.toBeVisible();
  });

  test('Go to tab shows navigation entries', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openViaSearchButton();

    await commandPalette.goToTab.click();
    await playExpect(commandPalette.commandPaletteInputField).toHaveAttribute(
      'placeholder',
      'Search images, containers, pods, and other resources',
    );

    await playExpect(commandPalette.selectedItem).toBeVisible({ timeout: 10_000 });

    await commandPalette.close();
  });

  test('Commands tab lists available commands', async ({ page }) => {
    const commandPalette = new CommandPalette(page);
    await commandPalette.openWithF1();

    await playExpect(commandPalette.commandPaletteInputField).toHaveAttribute(
      'placeholder',
      'Search and execute commands',
    );
    await playExpect(commandPalette.selectedItem).toBeVisible({ timeout: 10_000 });

    await commandPalette.close();
  });
});

test.describe('Search bar navigation', { tag: ['@smoke', '@windows_sanity', '@macos_sanity'] }, () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test('Navigate to Containers page via search bar', async ({ commandPalette }) => {
    const containersPage = await commandPalette.openContainers();
    await playExpect(containersPage.heading).toBeVisible();
  });

  test('Navigate to Images page via search bar', async ({ commandPalette }) => {
    const imagesPage = await commandPalette.openImages();
    await playExpect(imagesPage.heading).toBeVisible();
  });

  test('Navigate to Pods page via search bar', async ({ commandPalette }) => {
    const podsPage = await commandPalette.openPods();
    await playExpect(podsPage.heading).toBeVisible();
  });

  test('Navigate to Volumes page via search bar', async ({ commandPalette }) => {
    const volumesPage = await commandPalette.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();
  });

  test('Navigate to Networks page via search bar', async ({ commandPalette }) => {
    const networksPage = await commandPalette.openNetworks();
    await playExpect(networksPage.heading).toBeVisible();
  });

  test('Generic navigateTo method works with Go to tab', async ({ commandPalette, page }) => {
    await commandPalette.navigateTo('Containers');
    const containersPage = new ContainersPage(page);
    await playExpect(containersPage.heading).toBeVisible();
  });

  test('Navigate between pages via search bar consecutively', async ({ commandPalette }) => {
    const imagesPage = await commandPalette.openImages();
    await playExpect(imagesPage.heading).toBeVisible();

    const containersPage = await commandPalette.openContainers();
    await playExpect(containersPage.heading).toBeVisible();

    const volumesPage = await commandPalette.openVolumes();
    await playExpect(volumesPage.heading).toBeVisible();

    const podsPage = await commandPalette.openPods();
    await playExpect(podsPage.heading).toBeVisible();

    const networksPage = await commandPalette.openNetworks();
    await playExpect(networksPage.heading).toBeVisible();
  });

  test('Search bar navigation and sidebar navigation reach same pages', async ({ commandPalette, navigationBar }) => {
    const containersViaSidebar = await navigationBar.openContainers();
    await playExpect(containersViaSidebar.heading).toBeVisible();

    const imagesViaSearch = await commandPalette.openImages();
    await playExpect(imagesViaSearch.heading).toBeVisible();

    const containersViaSearch = await commandPalette.openContainers();
    await playExpect(containersViaSearch.heading).toBeVisible();
  });
});
