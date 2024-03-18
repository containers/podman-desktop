/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import * as cheerio from 'cheerio';

const allowed: string[] = [
  '/api/namespaces/commands',
  '/api/enumerations/ProgressLocation',
  '/api/classes/Disposable',
  '/api/interfaces/Command',
  '/api/type-aliases/StatusBarAlignment',
  '/api/variables/StatusBarItemDefaultPriority',
];

// Extract a list of pathnames, given a fs path to a sitemap.xml file
// Docusaurus generates a build/sitemap.xml file for you!
export function extractSitemapPathnames(sitemapPath: string): string[] {
  const sitemap = fs.readFileSync(sitemapPath).toString();
  const $ = cheerio.load(sitemap, { xmlMode: true });
  let urls: string[] = [];
  $('loc').each(function handleLoc() {
    urls.push($(this).text());
  });

  // filter out all /tags/ pages and /blog page
  urls = urls.filter(url => !url.includes('/tags/') && !url.endsWith('/tags')).filter(url => !url.endsWith('/blog'));

  let pathnames = urls.map(url => new URL(url).pathname);

  // filter out all /api pages since they are auto generated
  // keeping an example of each type (namespace, enum, class, interface, type, variable) to avoid regression.
  pathnames = pathnames.filter(url => !url.startsWith('/api') || allowed.includes(url));

  return pathnames;
}

// Converts a pathname to a decent screenshot name
export function pathnameToArgosName(pathname: string): string {
  return pathname.replace(/^\/|\/$/g, '') || 'index';
}
