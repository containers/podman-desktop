/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import fs from 'node:fs';
import { join } from 'node:path';

import type { LoadContext, Plugin, PluginOptions as DocusaurusOptions } from '@docusaurus/types';

export interface PluginOptions extends DocusaurusOptions {
  id: string;
  // Folder where to write the sidebar
  output: string;
  // The path of the dist storybook folder
  storybookStatic: string;
}

function populate(folder: string, storybookStatic: string): void {
  const index = require(join(storybookStatic, 'index.json'));

  if (index['v'] !== 5)
    throw new Error(`index version is not compatible with current script. Expected 5 got ${index['v']}.`);

  const items = [];

  for (const [key] of Object.entries(index['entries'])) {
    items.push({
      type: 'doc',
      id: `${key}`,
      label: `${key}`,
    });
  }

  // Write the generate sidebar to the output directory
  fs.writeFileSync(join(folder, 'sidebar.cjs'), `module.exports = ${JSON.stringify(items)};`);
}

function parseOptions(opts: unknown): PluginOptions {
  if (!opts || typeof opts !== 'object') throw new Error('invalid plugin options');

  if (!('storybookStatic' in opts) || typeof opts['storybookStatic'] !== 'string')
    throw new Error('invalid storybookStatic plugin option');
  if (!('output' in opts) || typeof opts['output'] !== 'string') throw new Error('invalid output plugin option');
  if (!('id' in opts) || typeof opts['id'] !== 'string') throw new Error('invalid id plugin option');

  return {
    storybookStatic: opts['storybookStatic'],
    output: opts['output'],
    id: opts['id'],
  };
}

// ref
// https://docusaurus.io/docs/advanced/plugins
// https://docusaurus.io/docs/api/plugin-methods
export default async function storybookIntegration(_context: LoadContext, opts: unknown): Promise<Plugin> {
  const options = parseOptions(opts);

  if (!fs.existsSync(options.storybookStatic)) throw new Error('storybook need to be built.');
  populate(options.output, options.storybookStatic);

  return {
    name: 'docusaurus-storybook-integration',
    postBuild(): void {
      // copy storybook-static assets to docusaurus build folder
      const buildFolder = join(__dirname, 'build');
      // those file will be merged with docusaurus file
      fs.cpSync(join(options.storybookStatic, 'assets'), join(buildFolder, 'assets'), {
        recursive: true,
        force: true,
      });
      // copy sb folders
      fs.cpSync(join(options.storybookStatic, 'sb-addons'), join(buildFolder, 'sb-addons'), {
        recursive: true,
        force: true,
      });
      fs.cpSync(join(options.storybookStatic, 'sb-common-assets'), join(buildFolder, 'sb-common-assets'), {
        recursive: true,
        force: true,
      });
      fs.cpSync(join(options.storybookStatic, 'sb-manager'), join(buildFolder, 'sb-manager'), {
        recursive: true,
        force: true,
      });
      fs.cpSync(join(options.storybookStatic, 'sb-preview'), join(buildFolder, 'sb-preview'), {
        recursive: true,
        force: true,
      });
      fs.cpSync(join(options.storybookStatic, 'iframe.html'), join(buildFolder, 'storybook-iframe.html'), {
        force: true,
      });
      fs.cpSync(join(options.storybookStatic, 'index.json'), join(buildFolder, 'index.json'), { force: true });
    },
  };
}
