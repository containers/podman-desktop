import type { BrowserWindow } from 'electron';
import type { ElectronApplication, JSHandle, Page } from 'playwright';
import { _electron as electron } from 'playwright';
import { afterAll, beforeAll, expect, test, describe } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';

let electronApp: ElectronApplication;
let page: Page;

beforeAll(async () => {
  // remove all videos/screenshots
  if (existsSync('tests/output')) {
    console.log('Cleaning up output folder...');
    await rm('tests/output', { recursive: true, force: true });
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
});

describe('Basic e2e verification of podman desktop start', async () => {
  test('Check the Welcome page is displayed', async () => {
    // Direct Electron console to Node terminal.
    page.on('console', console.log);

    const window: JSHandle<BrowserWindow> = await electronApp.browserWindow(page);

    const windowState = await window.evaluate(
      (mainWindow): Promise<{ isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean }> => {
        const getState = () => ({
          isVisible: mainWindow.isVisible(),
          isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
          isCrashed: mainWindow.webContents.isCrashed(),
        });

        return new Promise(resolve => {
          /**
           * The main window is created hidden, and is shown only when it is ready.
           * See {@link ../packages/main/src/mainWindow.ts} function
           */
          if (mainWindow.isVisible()) {
            resolve(getState());
          } else mainWindow.once('ready-to-show', () => resolve(getState()));
        });
      },
    );
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
});
