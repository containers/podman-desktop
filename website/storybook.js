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

const fs = require('node:fs');
const path = require('node:path');

function populate(folder, storybookStatic) {
  const index = require(path.join(storybookStatic, 'index.json'));

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

  fs.writeFileSync(path.join(folder, 'sidebar.cjs'), `module.exports = ${JSON.stringify(items)};`);
}

// ref
// https://docusaurus.io/docs/advanced/plugins
// https://docusaurus.io/docs/api/plugin-methods
export default async function storybookIntegration(context, opts) {
  const storybookStatic = opts['storybookStatic'] ?? undefined;
  if (!storybookStatic) throw new Error('storybookStatic option must be defined.');

  const target = opts['path'] ?? undefined;
  if (!target) throw new Error('path option must be defined.');

  if (!fs.existsSync(storybookStatic)) throw new Error('storybook need to be built.');
  populate(target, storybookStatic);

  return {
    name: 'docusaurus-storybook-integration',
    async postBuild() {
      // copy storybook-static assets to docusaurus build folder
      const buildFolder = path.join(__dirname, 'build');
      // those file will be merged with docusaurus file
      fs.cpSync(path.join(storybookStatic, 'assets'), path.join(buildFolder, 'assets'), {
        recursive: true,
        force: true,
      });
      // copy sb folders
      fs.cpSync(path.join(storybookStatic, 'sb-addons'), path.join(buildFolder, 'sb-addons'), {
        recursive: true,
        force: true,
      });
      fs.cpSync(path.join(storybookStatic, 'sb-common-assets'), path.join(buildFolder, 'sb-common-assets'), {
        recursive: true,
        force: true,
      });
      fs.cpSync(path.join(storybookStatic, 'sb-manager'), path.join(buildFolder, 'sb-manager'), {
        recursive: true,
        force: true,
      });
      fs.cpSync(path.join(storybookStatic, 'sb-preview'), path.join(buildFolder, 'sb-preview'), {
        recursive: true,
        force: true,
      });
      // copy
      fs.cpSync(path.join(storybookStatic, 'iframe.html'), path.join(buildFolder, 'storybook-iframe.html'), {
        force: true,
      });
      fs.cpSync(path.join(storybookStatic, 'index.json'), path.join(buildFolder, 'index.json'), { force: true });
    },
  };
}
