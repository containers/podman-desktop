import type { BrowserWindow } from 'electron';
import type { ElectronApplication, JSHandle, Page } from 'playwright';
import { _electron as electron } from 'playwright';
import { afterAll, beforeAll, expect, test } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import { existsSync, copyFileSync, renameSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';

let electronApp: ElectronApplication;

let page: Page;
const userHome = os.homedir();
const navBarItems = ['Dashboard', 'Containers', 'Images', 'Pods', 'Volumes', 'Settings'];
const settingsPath = path.join(
  userHome,
  '.local',
  'share',
  'containers',
  'podman-desktop',
  'configuration',
  'settings.json',
);
const settingsBackupPath = path.join(
  userHome,
  '.local',
  'share',
  'containers',
  'podman-desktop',
  'configuration',
  'settings_backup.json',
);

beforeAll(async () => {
  // remove all videos/screenshots
  if (existsSync('tests/output')) {
    console.log('Cleaning up output folder...');
    await rm('tests/output', { recursive: true, force: true });
  }

  // clean up settings to show initial welcome screen and telemetry, create settings backup
  if (existsSync(settingsPath)) {
    console.log('Removing settings.json to get initial state');
    copyFileSync(settingsPath, settingsBackupPath);
    await rm(settingsPath, {force: true});
  }

  electronApp = await electron.launch({
    args: ['.'],
    recordVideo: {
      dir: 'tests/output/videos',
      size: {
        width: 1050,
        height: 700,
      },
    },
  });

  page = await electronApp.firstWindow();
});

afterAll(async () => {
  await electronApp.close();
  // restore backupe settings.json file
  if (existsSync(settingsBackupPath)) {
    await rm(settingsPath, {force: true});
    renameSync(settingsBackupPath, settingsPath);
  }
});

test('Check the Welcome page is displayed', async () => {
  // Direct Electron console to Node terminal.
  page.on('console', console.log);

  const window: JSHandle<BrowserWindow> = await electronApp.browserWindow(page);

  const windowState = await window.evaluate((mainWindow): Promise<{ isVisible: boolean; isCrashed: boolean }> => {
    const getState = () => ({
      isVisible: mainWindow.isVisible(),
      isCrashed: mainWindow.webContents.isCrashed(),
    });

    return new Promise(resolve => {
      /**
       * The main window is created hidden, and is shown only when it is ready.
       * See {@link ../packages/main/src/mainWindow.ts} function
       */

      mainWindow.webContents.closeDevTools();
      if (mainWindow.isVisible()) {
        resolve(getState());
      } else mainWindow.once('ready-to-show', () => resolve(getState()));
    });
  });
  expect(windowState.isCrashed, 'The app has crashed').toBeFalsy();
  expect(windowState.isVisible, 'The main window was not visible').toBeTruthy();

  await page.screenshot({ path: 'tests/output/screenshots/screenshot-welcome-page-init.png', fullPage: true });

  const welcomeMessage = page.locator('text=/Welcome to Podman Desktop.*/');
  await playExpect(welcomeMessage).toBeVisible();
});

test('Telemetry checkbox is present, set to true, consent can be changed', async () => {
  // wait for the initial screen to be loaded
  const telemetryConsent = page.getByText('Telemetry');
  expect(telemetryConsent).not.undefined;
  expect(await telemetryConsent.isChecked()).to.be.true;

  await telemetryConsent.click();
  expect(await telemetryConsent.isChecked()).to.be.false;
});

test('Redirection from Welcome page to Dashboard works', async () => {
  const goToPodmanDesktopButton = page.locator('button:text("Go to Podman Desktop")');
  // wait for visibility
  await goToPodmanDesktopButton.waitFor({ state: 'visible' });

  await page.screenshot({ path: 'tests/output/screenshots/screenshot-welcome-page-display.png', fullPage: true });

  // click on the button
  await goToPodmanDesktopButton.click();

  await page.screenshot({
    path: 'tests/output/screenshots/screenshot-welcome-page-redirect-to-dashboard.png',
    fullPage: true,
  });

  // check we have the dashboard page
  const dashboardTitle = page.getByRole('heading', { name: 'Dashboard' });
  await playExpect(dashboardTitle).toBeVisible();
});

test('Verify main UI elements are present in Status Bar', async () => {
  await playExpect(page.locator('xpath=.//li//div[@title="Help"]')).toBeVisible();
  await playExpect(page.locator('xpath=.//li//div[@title="Tasks"]')).toBeVisible();
  await playExpect(page.locator('xpath=.//li//div[@title="Share your feedback"]')).toBeVisible();
  await playExpect(page.locator('xpath=.//li//div[starts-with(@title, "Using version")]')).toBeVisible();
});

test('Verify main UI elements are present in Status Bar - Kind and Compose installation', async () => {
  await playExpect(page.locator('li', { hasText: 'Kind'})).toBeVisible();
  await playExpect(page.locator('li', { hasText: 'Compose'})).toBeVisible();
});

test('Verify main UI elements are present in Navigation Bar', async () => {
  for (const item of navBarItems) {
    const locator = page.getByRole('navigation').getByText(new RegExp(item));
    expect(locator).toBeDefined();
  }
});
