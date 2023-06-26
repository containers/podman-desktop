import type { ElectronApplication, Page } from 'playwright';
import { _electron as electron } from 'playwright';
import { afterAll, beforeAll, test, describe } from 'vitest';
import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';

const outputDir = 'tests/output/pull-the-podman-hello-image/';
let electronApp: ElectronApplication;
let page: Page;

beforeAll(async () => {
  // remove all videos/screenshots
  if (existsSync(outputDir)) {
    console.log('Cleaning up output folder...');
    await rm(outputDir, { recursive: true, force: true });
  }

  electronApp = await electron.launch({
    args: ['.'],
    recordVideo: {
      dir: outputDir,
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

describe('Pulling the quay.io/podman/hello image', async () => {
  test('Go to Images', async () => {
    const goToImages = page.getByLabel('Images');
    await goToImages.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-dashboard.png', fullPage: true });
    await goToImages.click();
  });

  test('Click Pull an image', async () => {
    const clickPullAnImage = page.getByRole('button', { name: 'Pull an Image' });
    await clickPullAnImage.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-images.png', fullPage: true });
    await clickPullAnImage.click();
  });

  test('Image to pull: enter quay.io/podman/hello', async () => {
    const imageToPull = page.getByLabel('imageName');
    await imageToPull.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-pull-image-from-a-registry.png', fullPage: true });
    await imageToPull.fill('quay.io/podman/hello');
  });

  test('Click **Pull image**', async () => {
    const clickPullImage = page.getByRole('button', { name: 'Pull image' });
    await clickPullImage.waitFor({ state: 'visible' });
    await page.screenshot({
      path: outputDir + 'screenshot-pull-quay-io-podman-hello-image-from-a-registry.png',
      fullPage: true,
    });
    await clickPullImage.click();
  });

  test('Click **Done**', async () => {
    const clickDone = page.getByRole('button', { name: 'Done' });
    await clickDone.waitFor({ state: 'visible' });
    await page.screenshot({
      path: outputDir + 'screenshot-pull-quay-io-podman-hello-image-from-a-registry.png',
      fullPage: true,
    });
    await clickDone.click();
  });

  test('Go to **Images**', async () => {
    const goToImages = page.getByRole('heading', { level: 1, name: 'images' });
    await goToImages.waitFor({ state: 'visible' });
  });

  test('Search: enter quay.io/podman/hello', async () => {
    const imageToSearch = page.getByPlaceholder('Search Images');
    await imageToSearch.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-images-pulled.png', fullPage: true });
    await imageToSearch.fill('quay.io/podman/hello');
  });

  test('Click quay.io/podman/hello in the results table', async () => {
    const imageToClick = page.getByText('quay.io/podman/hello').last();
    await imageToClick.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-images-found-quay-io-podman-hello.png', fullPage: true });
    await imageToClick.click();
  });

  test('Go to Summary', async () => {
    const goToSummary = page.getByText('Summary').first();
    await goToSummary.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-image-details-summary.png', fullPage: true });
    await goToSummary.click();
  });

  test('Go to History', async () => {
    const goToHistory = page.getByText('History').first();
    await goToHistory.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-image-details-summary.png', fullPage: true });
    await goToHistory.click();
  });

  test('Go to Inspect', async () => {
    const goToInspect = page.getByText('Inspect').first();
    await goToInspect.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-image-details-summary.png', fullPage: true });
    await goToInspect.click();
  });

  test('Last screenshot', async () => {
    const goToInspect = page.getByText('Inspect').first();
    await goToInspect.waitFor({ state: 'visible' });
    await page.screenshot({ path: outputDir + 'screenshot-image-details-inspect.png', fullPage: true });
  });
});
