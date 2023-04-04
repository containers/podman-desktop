import type { ElectronApplication } from 'playwright';
import { _electron as electron } from 'playwright';
import { afterAll, beforeAll, expect, test } from 'vitest';

let electronApp: ElectronApplication;

beforeAll(async () => {
  electronApp = await electron.launch({
    args: ['.'],
  });
  electronApp.process().stderr?.on('data', error => console.log(`stderr: ${error}`));
  electronApp.process().stdout?.on('data', out => console.log(`stdout: ${out}`));
});

afterAll(async () => {
  await electronApp.close();
});

test('Main window state', async () => {
  const windowState: { isVisible: boolean; isDevToolsOpened: boolean; isCrashed: boolean } = await electronApp.evaluate(
    ({ BrowserWindow }) => {
      const mainWindow = BrowserWindow.getAllWindows()[0];

      const getState = () => ({
        isVisible: mainWindow.isVisible(),
        isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
        isCrashed: mainWindow.webContents.isCrashed(),
      });

      return new Promise(resolve => {
        if (mainWindow.isVisible()) {
          resolve(getState());
        } else mainWindow.once('ready-to-show', () => setTimeout(() => resolve(getState()), 0));
      });
    },
  );

  expect(windowState.isCrashed, 'App was crashed').toBeFalsy();
  expect(windowState.isVisible, 'Main window was not visible').toBeTruthy();
  expect(windowState.isDevToolsOpened, 'DevTools was opened').toBeFalsy();
});

test('Main window web content', async () => {
  const page = await electronApp.firstWindow();
  await delay(5000);
  const element = await page.$('#app', { strict: true });
  expect(element, 'Cannot find root element').toBeDefined();
  expect((await element.innerHTML()).trim(), 'Window content was empty').not.equal('');
  await page.screenshot({ path: 'intro.png' });
});

export async function delay(ms: number) {
  console.log(`Delaying for ${ms} ms`);
  return new Promise(resolve => setTimeout(resolve, ms));
}
