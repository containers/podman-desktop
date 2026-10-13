/**********************************************************************
 * Copyright (C) 2025-2026 Red Hat, Inc.
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

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ExtensionState } from '/@/model/core/states';
import type { ExtensionDetailsPage } from '/@/model/pages/extension-details-page';
import type { NavigationBar } from '/@/model/workbench/navigation';
import { expect as playExpect, test } from '/@/utility/fixtures';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PREINSTALLED_FILE =
  process.env.PRODUCT_TESTS === '1'
    ? path.resolve(__dirname, '..', '..', 'resources', 'rh-preinstalled-extensions.txt')
    : path.resolve(__dirname, '..', '..', 'resources', 'preinstalled-extensions.txt');
const DEFAULT_CATALOG_JSON_FILE =
  process.env.PRODUCT_TESTS === '1'
    ? path.resolve(__dirname, '..', '..', 'resources', 'rh-catalog-filtering.json')
    : path.resolve(__dirname, '..', '..', 'resources', 'catalog-filtering.json');

interface CatalogExtension {
  displayName: string;
}

function loadCatalogExtensionName(): string {
  const defaultCatalogFile = process.env.CATALOG_JSON_FILE;
  const catalogFile = defaultCatalogFile ?? DEFAULT_CATALOG_JSON_FILE;

  // eslint-disable-next-line n/no-sync
  const catalog = JSON.parse(readFileSync(catalogFile, 'utf-8')) as { extensions: CatalogExtension[] };
  const extensionName = catalog.extensions[0]?.displayName;
  if (!extensionName) {
    throw new Error(`No extension displayName found in catalog file: ${catalogFile}`);
  }

  return extensionName;
}

const catalogExtensionName = loadCatalogExtensionName();

interface PreInstalledExtension {
  label: string;
  name: string;
  version?: string;
}

function loadPreInstalledExtensions(): PreInstalledExtension[] {
  const envFile = process.env.PREINSTALLED_EXTENSIONS_FILE;
  const filePath = envFile ?? DEFAULT_PREINSTALLED_FILE;

  if (!existsSync(filePath)) {
    if (envFile) {
      throw new Error(`PREINSTALLED_EXTENSIONS_FILE not found: ${filePath}`);
    }
    return [];
  }

  // eslint-disable-next-line n/no-sync
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const extensions: PreInstalledExtension[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (raw.length === 0 || raw.startsWith('#')) continue;

    const pairs = Object.fromEntries(
      raw.split(',').map(pair => {
        const [key, ...rest] = pair.split('=');
        return [key.trim(), rest.join('=').trim()];
      }),
    );

    if (!pairs.label || !pairs.name) {
      throw new Error(`Malformed entry at ${filePath}:${i + 1} — missing label or name: "${raw}"`);
    }

    extensions.push({
      label: pairs.label,
      name: pairs.name,
      ...(pairs.version ? { version: pairs.version } : {}),
    });
  }

  return extensions;
}

const extensionsToTest = [
  {
    regionAreaLabel: 'podman-desktop.lima',
    extensionLabelName: 'lima',
    extensionHeading: 'lima',
  },
  {
    regionAreaLabel: 'podman-desktop.registries',
    extensionLabelName: 'registries',
    extensionHeading: 'registries',
  },
  {
    regionAreaLabel: 'podman-desktop.compose',
    extensionLabelName: 'compose',
    extensionHeading: 'compose',
  },
  {
    regionAreaLabel: 'podman-desktop.docker',
    extensionLabelName: 'docker',
    extensionHeading: 'docker',
  },
  {
    regionAreaLabel: 'podman-desktop.kind',
    extensionLabelName: 'kind',
    extensionHeading: 'kind',
  },
];

let pdVersion: string;

test.beforeAll(async ({ runner, welcomePage, statusBar }) => {
  runner.setVideoAndTraceName('builtin-extension-e2e');
  await welcomePage.handleWelcomePage(true);
  await playExpect(statusBar.versionButton).toBeVisible();
  pdVersion = await statusBar.versionButton.innerText();
});

test.afterAll(async ({ runner }) => {
  await runner.close();
});

for (const extension of extensionsToTest) {
  test.describe(`Verification of Built-In Extension: ${extension.extensionLabelName}`, {
    tag: ['@smoke', '@windows_sanity', '@macos_sanity'],
  }, () => {
    test.describe.configure({ mode: 'serial', retries: 1 });

    test(`Check ${extension.extensionLabelName} extension is enabled and present`, async ({ navigationBar }) => {
      await verifyBuiltInExtensionStatus(navigationBar, true, extension);
    });

    test(`Check that ${extension.extensionLabelName} extension can be disabled from Extension Page`, async ({
      navigationBar,
    }) => {
      const podmanExtensionPage = await openExtensionsPodmanPage(navigationBar, extension);
      await podmanExtensionPage.disableExtension();
      await verifyBuiltInExtensionStatus(navigationBar, false, extension);
    });

    test(`Check that ${extension.extensionLabelName} cannot be removed`, async ({ navigationBar }) => {
      const detailsPage = await openExtensionsPodmanPage(navigationBar, extension);
      await playExpect(detailsPage.removeExtensionButton).not.toBeEnabled();
    });

    test(`Check that ${extension.extensionLabelName} extension can be re-enabled from Extension Page`, async ({
      navigationBar,
    }) => {
      const podmanExtensionPage = await openExtensionsPodmanPage(navigationBar, extension);
      await podmanExtensionPage.enableExtension();
      await verifyBuiltInExtensionStatus(navigationBar, true, extension);
    });
  });
}

async function verifyBuiltInExtensionStatus(
  navigationBar: NavigationBar,
  enabled: boolean,
  ext: { regionAreaLabel: string; extensionLabelName: string; extensionHeading: string },
): Promise<void> {
  const dashboardPage = await navigationBar.openDashboard();
  await playExpect(dashboardPage.heading).toBeVisible({ timeout: 20_000 });

  const extensionsPage = await navigationBar.openExtensions();
  const extensionDetailsPage = await extensionsPage.openExtensionDetails(
    ext.extensionLabelName,
    ext.regionAreaLabel,
    ext.extensionHeading,
  );

  const extensionStatusLabel = extensionDetailsPage.status;

  await playExpect(extensionStatusLabel).toBeVisible();
  await extensionStatusLabel.scrollIntoViewIfNeeded();

  if (enabled) {
    await playExpect(extensionStatusLabel).toContainText(ExtensionState.Active, { timeout: 20_000 });
  } else {
    await playExpect(extensionStatusLabel).toContainText(ExtensionState.Disabled, { timeout: 20_000 });
  }

  const extensionsPageAfter = await navigationBar.openExtensions();
  const podmanExtensionPage = await extensionsPageAfter.openExtensionDetails(
    ext.extensionLabelName,
    ext.regionAreaLabel,
    ext.extensionHeading,
  );

  if (enabled) {
    await playExpect(podmanExtensionPage.enableButton).not.toBeVisible({
      timeout: 10_000,
    });
    await playExpect(podmanExtensionPage.disableButton).toBeVisible({
      timeout: 10_000,
    });
    await playExpect(podmanExtensionPage.status.getByText(ExtensionState.Active)).toBeVisible();
  } else {
    await playExpect(podmanExtensionPage.enableButton).toBeVisible({
      timeout: 10_000,
    });
    await playExpect(podmanExtensionPage.disableButton).not.toBeVisible({
      timeout: 10_000,
    });
    await playExpect(podmanExtensionPage.status.getByText(ExtensionState.Disabled)).toBeVisible();
  }
}

async function openExtensionsPodmanPage(
  navigationBar: NavigationBar,
  ext: {
    regionAreaLabel: string;
    extensionLabelName: string;
    extensionHeading: string;
  },
): Promise<ExtensionDetailsPage> {
  const extensionsPage = await navigationBar.openExtensions();
  return extensionsPage.openExtensionDetails(ext.extensionLabelName, ext.regionAreaLabel, ext.extensionHeading);
}

const preInstalledExtensions = loadPreInstalledExtensions();

for (const ext of preInstalledExtensions) {
  test.describe(`Verification of Pre-Installed Extension: ${ext.name}`, {
    tag: ['@smoke', '@windows_sanity', '@macos_sanity'],
  }, () => {
    test.describe.configure({ mode: 'serial', retries: 1 });

    test(`Check ${ext.name} is installed and active`, async ({ navigationBar }) => {
      const extensionsPage = await navigationBar.openExtensions();
      const extensionCard = await extensionsPage.getInstalledExtension(ext.name.toLowerCase(), ext.label);
      await playExpect(extensionCard.status).toHaveText(ExtensionState.Active, { timeout: 20_000 });
    });

    test(`Check ${ext.name} is marked as Pre-installed`, async ({ navigationBar }) => {
      const extensionsPage = await navigationBar.openExtensions();
      await extensionsPage.openInstalledTab();
      const card = extensionsPage.content.getByRole('region', { name: ext.label, exact: true });
      await playExpect(card).toContainText('Pre-installed');
    });

    test(`Check ${ext.name} shows expected version`, async ({ navigationBar }) => {
      const expectedVersion = ext.version ? `v${ext.version}` : pdVersion;
      const extensionsPage = await navigationBar.openExtensions();
      const version = await extensionsPage.getInstalledExtensionVersion(ext.name.toLowerCase(), ext.label);
      playExpect(version).toBe(expectedVersion);
    });

    test(`Check ${ext.name} cannot be removed`, async ({ navigationBar }) => {
      const extensionsPage = await navigationBar.openExtensions();
      const detailsPage = await extensionsPage.openExtensionDetails(ext.name.toLowerCase(), ext.label, ext.name);
      await playExpect(detailsPage.removeExtensionButton).not.toBeEnabled();
    });

    test(`Check ${ext.name} can be disabled and re-enabled`, async ({ navigationBar }) => {
      const extensionsPage = await navigationBar.openExtensions();
      const detailsPage = await extensionsPage.openExtensionDetails(ext.name.toLowerCase(), ext.label, ext.name);
      await detailsPage.disableExtension();
      await playExpect(detailsPage.status).toContainText(ExtensionState.Disabled, { timeout: 20_000 });
      await playExpect(detailsPage.removeExtensionButton).not.toBeEnabled();
      await detailsPage.enableExtension();
      await playExpect(detailsPage.status).toContainText(ExtensionState.Active, { timeout: 20_000 });
      await playExpect(detailsPage.removeExtensionButton).not.toBeEnabled();
    });
  });
}

test.describe('Extension search filtering', { tag: ['@smoke', '@windows_sanity', '@macos_sanity'] }, () => {
  test.describe.configure({ mode: 'serial' });

  test('Filter installed extensions by name', async ({ navigationBar }) => {
    const extensionsPage = await navigationBar.openExtensions();
    await playExpect(extensionsPage.heading).toBeVisible();
    await extensionsPage.openInstalledTab();

    const totalCards = await extensionsPage.countInstalledExtensionCards();
    playExpect(totalCards).toBeGreaterThan(0);

    const extensionsToFilter = [
      { search: 'podman', label: 'podman-desktop.podman' },
      { search: 'compose', label: 'podman-desktop.compose' },
    ];

    for (const { search, label } of extensionsToFilter) {
      await extensionsPage.filterByName(search);
      await playExpect
        .poll(async () => await extensionsPage.extensionCardIsVisible(label), { timeout: 10_000 })
        .toBeTruthy();
    }

    await extensionsPage.clearFilterByName();
    await playExpect
      .poll(async () => await extensionsPage.countInstalledExtensionCards(), { timeout: 10_000 })
      .toBe(totalCards);
  });

  test(`Filter catalog extension (${catalogExtensionName}) by name`, async ({ navigationBar }) => {
    const extensionsPage = await navigationBar.openExtensions();
    await playExpect(extensionsPage.heading).toBeVisible();
    await extensionsPage.openCatalogTab();

    await playExpect
      .poll(async () => await extensionsPage.countCatalogExtensionCards(), { timeout: 10_000 })
      .toBeGreaterThan(0);
    const totalCards = await extensionsPage.countCatalogExtensionCards();

    await extensionsPage.filterByName(catalogExtensionName);
    await playExpect
      .poll(async () => await extensionsPage.extensionCardIsVisible(catalogExtensionName), { timeout: 10_000 })
      .toBeTruthy();
    await playExpect
      .poll(async () => await extensionsPage.countCatalogExtensionCards(), { timeout: 10_000 })
      .toBeGreaterThanOrEqual(1);
    const filteredCards = await extensionsPage.countCatalogExtensionCards();
    playExpect(filteredCards).toBeLessThan(totalCards);

    await extensionsPage.clearFilterByName();
    await playExpect
      .poll(async () => await extensionsPage.countCatalogExtensionCards(), { timeout: 10_000 })
      .toBe(totalCards);
  });
});
