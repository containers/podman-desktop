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

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

import type { Page } from '@playwright/test';

import { HelpMenuComponent } from '/@/model/components/help-menu-component';
import {
  HelpMenuActionKind,
  type HelpMenuItem,
  type HelpMenuWindow,
  type ProductConfiguration,
  type ProductHelpMenuItem,
} from '/@/model/core/types';
import { TroubleshootingPage } from '/@/model/pages/troubleshooting-page';
import { ElectronRunner } from '/@/runner/electron-runner';
import type { Runner } from '/@/runner/podman-desktop-runner';
import { RunnerOptions } from '/@/runner/runner-options';
import { expect as playExpect, test } from '/@/utility/fixtures';

let configuredItems: ProductHelpMenuItem[];

test.use({ runnerOptions: new RunnerOptions({ customFolder: 'help-menu' }) });

test.beforeAll(async ({ runner, welcomePage }) => {
  runner.setVideoAndTraceName('help-menu-e2e');
  configuredItems = await getConfiguredItems(runner);
  await welcomePage.handleWelcomePage(true);
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

test.describe('Help menu', { tag: ['@smoke', '@windows_sanity', '@macos_sanity'] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('renders the configured product help menu items', async ({ page }) => {
    const actualItems = await getHelpMenuItems(page);
    const helpMenu = new HelpMenuComponent(page);

    await helpMenu.helpButton.click();
    await playExpect(helpMenu.menu).toBeVisible();

    playExpect(actualItems).toHaveLength(configuredItems.length);
    await playExpect(helpMenu.getItems()).toHaveCount(configuredItems.length);

    for (const [index, item] of configuredItems.entries()) {
      const row = helpMenu.getItem(index);
      const actualItem = actualItems[index];
      playExpect(actualItem.title).toBe(item.title);
      playExpect(actualItem.tooltip).toBe(item.tooltip);
      playExpect(actualItem.icon).toBe(item.icon);
      playExpect(actualItem.enabled).toBe(Boolean(item.command) || Boolean(item.link));
      playExpect(actualItem.action).toEqual(
        item.command
          ? { kind: HelpMenuActionKind.COMMAND, parameter: item.command }
          : item.link
            ? { kind: HelpMenuActionKind.LINK, parameter: item.link }
            : undefined,
      );

      await playExpect(row).toHaveText(item.title);
      await playExpect(helpMenu.getItemTooltip(index, item.tooltip ?? item.title)).toBeVisible();
      const iconMatches = await helpMenu.getItemIcon(index).evaluate((icon, expected) => {
        if (icon instanceof HTMLImageElement) {
          return icon.getAttribute('src') === expected;
        }
        return expected.split(/\s+/).every(className => icon.classList.contains(className));
      }, item.icon);
      playExpect(iconMatches, `icon for ${item.title}`).toBe(true);
    }

    await page.keyboard.press('Escape');
    await playExpect(helpMenu.menu).toBeHidden();
  });

  test('closes on Escape and an outside click', async ({ page, navigationBar }) => {
    const helpMenu = new HelpMenuComponent(page);

    await helpMenu.helpButton.click();
    await playExpect(helpMenu.menu).toBeVisible();
    await page.keyboard.press('Escape');
    await playExpect(helpMenu.menu).toBeHidden();

    await helpMenu.helpButton.click();
    await playExpect(helpMenu.menu).toBeVisible();
    await navigationBar.dashboardLink.click();
    await playExpect(helpMenu.menu).toBeHidden();
  });

  test('renders header-only items as disabled', async ({ page }) => {
    const headerIndexes = configuredItems.flatMap((item, index) => (!item.link && !item.command ? [index] : []));
    test.skip(headerIndexes.length === 0, 'No header-only help menu items are configured in product.json');

    const helpMenu = new HelpMenuComponent(page);
    await helpMenu.helpButton.click();
    await playExpect(helpMenu.menu).toBeVisible();

    for (const index of headerIndexes) {
      const row = helpMenu.getItem(index);
      await playExpect(row).toHaveClass(/pd-dropdown-disabled-item-text/);
      await playExpect(row).not.toHaveClass(/hover:cursor-pointer/);
    }

    await page.keyboard.press('Escape');
    await playExpect(helpMenu.menu).toBeHidden();
  });

  test('opens each configured link at its product URL', async ({ page, runner, navigationBar }) => {
    const links = configuredItems.flatMap((item, index) =>
      item.link && !item.command ? [{ index, url: item.link }] : [],
    );
    test.skip(links.length === 0, 'No link actions are configured in product.json');
    test.skip(!(runner instanceof ElectronRunner), 'Link interception requires the Electron test runner');

    const electronRunner = runner as ElectronRunner;
    await installExternalLinkSpy(electronRunner);

    try {
      const expectedUrls: string[] = [];
      const helpMenu = new HelpMenuComponent(page);

      for (const { index, url } of links) {
        if (await helpMenu.menu.isVisible()) {
          await navigationBar.dashboardLink.click();
          await playExpect(helpMenu.menu).toBeHidden();
        }
        await helpMenu.helpButton.click();
        await playExpect(helpMenu.menu).toBeVisible();
        await helpMenu.getItem(index).click();

        expectedUrls.push(url);
        await playExpect
          .poll(
            async () => {
              if (await helpMenu.externalLinkDialog.isVisible()) {
                return 'confirmation-required';
              }
              const openedUrls = await getExternalLinkCalls(electronRunner);
              return openedUrls.length >= expectedUrls.length ? 'opened' : 'waiting';
            },
            { timeout: 10_000 },
          )
          .not.toBe('waiting');

        if (await helpMenu.externalLinkDialog.isVisible()) {
          await playExpect(helpMenu.externalLinkDialog).toContainText(url);
          await helpMenu.getExternalLinkOpenButton().click();
        }

        await playExpect
          .poll(async () => await getExternalLinkCalls(electronRunner), { timeout: 10_000 })
          .toEqual(expectedUrls);
      }

      if (await helpMenu.menu.isVisible()) {
        await navigationBar.dashboardLink.click();
      }
    } finally {
      await restoreExternalLinkSpy(electronRunner);
    }
  });

  test('opens the Troubleshooting page when that command is configured', async ({ page }) => {
    const itemIndex = configuredItems.findIndex(item => item.command === 'troubleshooting');
    test.skip(itemIndex < 0, 'The Troubleshooting command is not configured in product.json');

    const helpMenu = new HelpMenuComponent(page);
    if (await helpMenu.menu.isVisible()) {
      await page.keyboard.press('Escape');
      await playExpect(helpMenu.menu).toBeHidden();
    }
    await helpMenu.helpButton.click();
    await playExpect(helpMenu.menu).toBeVisible();
    await helpMenu.getItem(itemIndex).click();

    const troubleshootingPage = new TroubleshootingPage(page);
    await playExpect(troubleshootingPage.heading).toBeVisible();
  });

  test('opens the feedback dialog when that command is configured', async ({ page }) => {
    const itemIndex = configuredItems.findIndex(item => item.command === 'feedback');
    test.skip(itemIndex < 0, 'The Feedback command is not configured in product.json');

    const helpMenu = new HelpMenuComponent(page);
    if (await helpMenu.menu.isVisible()) {
      await page.keyboard.press('Escape');
      await playExpect(helpMenu.menu).toBeHidden();
    }
    await helpMenu.helpButton.click();
    await playExpect(helpMenu.menu).toBeVisible();
    await helpMenu.getItem(itemIndex).click();

    await playExpect(helpMenu.feedbackDialog).toBeVisible();
  });
});

async function getHelpMenuItems(page: Page): Promise<HelpMenuItem[]> {
  return page.evaluate(async () => (window as unknown as HelpMenuWindow).helpMenuGetItems());
}

async function getConfiguredItems(runner: Runner): Promise<ProductHelpMenuItem[]> {
  let productPath: string;

  if (runner instanceof ElectronRunner) {
    const productDirectory = await runner
      .getElectronApp()
      .evaluate(({ app }) => (app.isPackaged ? process.resourcesPath : app.getAppPath()));
    productPath = resolve(productDirectory, 'product.json');
  } else if (process.env.PODMAN_DESKTOP_BINARY) {
    const binaryDirectory = dirname(process.env.PODMAN_DESKTOP_BINARY);
    productPath =
      process.platform === 'darwin'
        ? resolve(binaryDirectory, '..', 'Resources', 'product.json')
        : resolve(binaryDirectory, 'resources', 'product.json');
  } else {
    productPath = resolve(process.env.PODMAN_DESKTOP_ARGS ?? process.cwd(), 'product.json');
  }

  const product = JSON.parse(await readFile(productPath, 'utf8')) as ProductConfiguration;
  playExpect(product.helpMenu?.items, `helpMenu.items in ${productPath}`).toBeInstanceOf(Array);
  playExpect(product.helpMenu.items.length, `helpMenu.items in ${productPath}`).toBeGreaterThan(0);
  return product.helpMenu.items;
}

async function installExternalLinkSpy(runner: ElectronRunner): Promise<void> {
  await runner.getElectronApp().evaluate(({ shell }) => {
    type TestGlobal = typeof globalThis & {
      __helpMenuExternalLinkCalls?: string[];
      __helpMenuOriginalOpenExternal?: typeof shell.openExternal;
    };
    const testGlobal = globalThis as TestGlobal;
    testGlobal.__helpMenuExternalLinkCalls = [];
    testGlobal.__helpMenuOriginalOpenExternal = shell.openExternal;
    shell.openExternal = async (url: string): Promise<void> => {
      testGlobal.__helpMenuExternalLinkCalls?.push(url);
    };
  });
}

async function getExternalLinkCalls(runner: ElectronRunner): Promise<string[]> {
  return runner.getElectronApp().evaluate(() => {
    type TestGlobal = typeof globalThis & { __helpMenuExternalLinkCalls?: string[] };
    return (globalThis as TestGlobal).__helpMenuExternalLinkCalls ?? [];
  });
}

async function restoreExternalLinkSpy(runner: ElectronRunner): Promise<void> {
  await runner.getElectronApp().evaluate(({ shell }) => {
    type TestGlobal = typeof globalThis & {
      __helpMenuExternalLinkCalls?: string[];
      __helpMenuOriginalOpenExternal?: typeof shell.openExternal;
    };
    const testGlobal = globalThis as TestGlobal;
    if (testGlobal.__helpMenuOriginalOpenExternal) {
      shell.openExternal = testGlobal.__helpMenuOriginalOpenExternal;
    }
    delete testGlobal.__helpMenuExternalLinkCalls;
    delete testGlobal.__helpMenuOriginalOpenExternal;
  });
}
