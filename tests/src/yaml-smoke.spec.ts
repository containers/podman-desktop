/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { Page } from '@playwright/test';
import type { RunnerTestContext } from './testContext/runner-test-context';
import { afterAll, beforeAll, test, describe, beforeEach, expect } from 'vitest';
import { expect as playExpect } from '@playwright/test';
import { PodmanDesktopRunner } from './runner/podman-desktop-runner';
import { WelcomePage } from './model/pages/welcome-page';
import { NavigationBar } from './model/workbench/navigation';
import { deletePod } from './utility/operations';
import path from 'path';

let pdRunner: PodmanDesktopRunner;
let page: Page;

beforeAll(async () => {
  pdRunner = new PodmanDesktopRunner();
  page = await pdRunner.start();
  pdRunner.setVideoName('play-yaml-e2e');

  await new WelcomePage(page).handleWelcomePage(true);
});

beforeEach<RunnerTestContext>(async ctx => {
  ctx.pdRunner = pdRunner;
});

afterAll(async () => {
  await pdRunner.close();
});

describe.skipIf(process.env.GITHUB_ACTIONS && process.env.RUNNER_OS === 'Linux')(
  'Play yaml file to pull images and create pods',
  async () => {
    test('Playing yaml', async () => {
      const navigationBar = new NavigationBar(page);
      let podsPage = await navigationBar.openPods();
      await playExpect(podsPage.heading).toBeVisible();

      const playYamlPage = await podsPage.openPlayKubeYaml();
      await playExpect(playYamlPage.heading).toBeVisible();

      const yamlFilePath = path.resolve(__dirname, '..', 'resources', 'primary-podify-demo.yaml');
      podsPage = await playYamlPage.playYaml(yamlFilePath);
      await playExpect(podsPage.heading).toBeVisible();

      playExpect(await podsPage.podExists('podify-demo-pod')).toBeTruthy();
      await deletePod(page, 'podify-demo-pod');
      playExpect(await podsPage.podExists('podify-demo-pod')).toBeFalsy();

      let imagesPage = await navigationBar.openImages();
      await playExpect(imagesPage.heading).toBeVisible();
      expect(await imagesPage.waitForImageExists('podify-demo-backend')).toBeTruthy();

      const imageDetailsPage = await imagesPage.openImageDetails('podify-demo-backend');
      await playExpect(imageDetailsPage.heading).toBeVisible();
      imagesPage = await imageDetailsPage.deleteImage();
      expect(await imagesPage.waitForImageDelete('podify-demo-backend')).toBeTruthy();
    }, 75000);
  },
);
