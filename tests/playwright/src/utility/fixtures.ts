import type { Page } from '@playwright/test';
import { test as base } from '@playwright/test';

import { WelcomePage } from '../model/pages/welcome-page';
import { NavigationBar } from '../model/workbench/navigation';
import { PodmanDesktopRunner } from '../runner/podman-desktop-runner';

export type TestFixtures = {
  pdRunner: PodmanDesktopRunner;
  navBar: NavigationBar;
  welcomePage: WelcomePage;
  page: Page;
};

export type PDRunnerOptions = {
  profile: string;
  customFolder: string;
  autoUpdate: boolean;
  autoCheckUpdate: boolean;
};

export const test = base.extend<TestFixtures & PDRunnerOptions>({
  profile: ['', { option: true }],
  customFolder: ['podman-desktop', { option: true }],
  autoUpdate: [true, { option: true }],
  autoCheckUpdate: [true, { option: true }],
  pdRunner: async ({ profile, customFolder, autoUpdate, autoCheckUpdate }, use) => {
    const pdRunner = await PodmanDesktopRunner.getInstance({ profile, customFolder, autoUpdate, autoCheckUpdate });
    await use(pdRunner);
  },
  page: async ({ pdRunner }, use) => {
    await use(pdRunner.getPage());
  },
  navBar: async ({ page }, use) => {
    const navBar = new NavigationBar(page);
    await use(navBar);
  },
  welcomePage: async ({ page }, use) => {
    const welcomePage = new WelcomePage(page);
    await use(welcomePage);
  },
});
export { expect } from '@playwright/test';
