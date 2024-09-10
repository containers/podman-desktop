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

export function parseNotes(filename: string, releaseVersion: string): void {
  const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
  const resultText = fileContent.split('---', 3);

  // get release image url
  const imagePath = /image: (.+)\n/.exec(resultText[1]);
  const imageName = imagePath ? imagePath[1] : '';
  const imageUrl = imageName ? `https://podman-desktop.io${imageName}` : '';
  const blogUrl = `https://podman-desktop.io/blog/podman-desktop-release-${releaseVersion}`;

  // get summary part of release notes
  const text = resultText[2]
    .split('<!--truncate-->', 1)[0]
    .replace(/!\[.+\)\n/, '') // remove image link
    .replace(/\[Click here to download it\]\(.+\)!/, '') //remove download new version
    .replace(/\n(\n)+/g, '\n')
    .split('\n'); // change all multi-newlines chars to one newline char

  const summary = text.filter(line => line.includes('- **')); // all summary bullet points start with "- **"
  const summaryText = summary.slice(0, 4).join('\n');
  const titleText = text.filter(line => !line.includes('import'))[1];

  const jsonInput = { image: imageUrl, blog: blogUrl, title: titleText, summary: summaryText };

  fs.writeFileSync(`./static/release-notes/${releaseVersion}.json`, JSON.stringify(jsonInput));
}
