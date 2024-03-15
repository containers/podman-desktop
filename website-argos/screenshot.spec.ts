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

import * as fs from 'node:fs';

import { argosScreenshot } from '@argos-ci/playwright';
import { test } from '@playwright/test';

import { extractSitemapPathnames, pathnameToArgosName } from './utils';

// Constants
const siteUrl = 'http://localhost:3000';
const sitemapPath = '../website/build/sitemap.xml';
const stylesheetPath = './screenshot.css';
const stylesheet = fs.readFileSync(stylesheetPath).toString();

// Wait for hydration, requires Docusaurus v2.4.3+
// Docusaurus adds a <html data-has-hydrated="true"> once hydrated
// See https://github.com/facebook/docusaurus/pull/9256
function waitForDocusaurusHydration(): boolean {
  return document.documentElement.dataset.hasHydrated === 'true';
}

function screenshotPathname(pathname: string): void {
  test(`pathname ${pathname}`, async ({ page }) => {
    test.slow();
    const url = siteUrl + pathname;
    await page.goto(url);
    await page.waitForFunction(waitForDocusaurusHydration);

    // for downloads page, wait for the version being fetched
    if (pathname.includes('/downloads')) {
      // wait for the version being fetched during 5seconds using async setTimeout
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    await page.addStyleTag({ content: stylesheet });
    await argosScreenshot(page, pathnameToArgosName(pathname));
  });
}

test.describe('Docusaurus site screenshots', () => {
  const pathnames = extractSitemapPathnames(sitemapPath);
  console.log('Pathnames to screenshot:');
  pathnames.forEach(pathname => console.log(`- ${pathname}`));
  pathnames.forEach(screenshotPathname);
});
