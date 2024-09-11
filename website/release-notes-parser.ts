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

import type {
  DefaultParseFrontMatter,
  ParseFrontMatterParams,
  ParseFrontMatterResult,
} from '@docusaurus/types/src/config';

export async function createNotesFiles(
  params: ParseFrontMatterParams & {
    defaultParseFrontMatter: DefaultParseFrontMatter;
  },
): Promise<ParseFrontMatterResult> {
  const result = await params.defaultParseFrontMatter(params);
  // eslint-disable-next-line sonarjs/slow-regex
  const versionRegex = /\d+\.\d+/;
  if (
    result.frontMatter.title &&
    /[Rr]elease/.exec(String(result.frontMatter.title)) &&
    versionRegex.exec(String(result.frontMatter.title))
  ) {
    const versionMatch = versionRegex.exec(String(result.frontMatter.title)) ?? [];
    const version = versionMatch ? versionMatch[0] : '';
    if (version) {
      const folderName = './static/release-notes';
      const fileContent = await fs.promises.readFile(params.filePath, { encoding: 'utf-8' });
      const resultText = fileContent.split('---', 3);

      // get release image url
      const imagePath = /image: (.+)\n/.exec(resultText[1]);
      const imageName = imagePath ? imagePath[1] : '';
      const imageUrl = imageName ? `https://podman-desktop.io${imageName}` : '';
      const pageName = /slug: (.+)\n/.exec(resultText[1]);
      const blogName = pageName ? pageName[1] : `podman-desktop-release-${version}`;
      const blogUrl = `https://podman-desktop.io/blog/${blogName}`;

      // get summary part of release notes
      const text = resultText[2]
        .replace(/!\[.+\)\n/, '') // remove image link
        .replace(/\[Click here to download it\]\(.+\)!/, '') //remove download new version
        .replace(/\n(\n)+/g, '\n') // change all multi-newlines chars to one newline char
        .split('\n');

      const summary = text.filter(line => line.includes('- **')); // all summary bullet points start with "- **"
      const summaryText = summary.slice(0, 4).join('\n'); // limit the number of bullet points to 4
      const titleText = text.filter(line => !line.includes('import') && line)[0];

      const jsonInput = { image: imageUrl, blog: blogUrl, title: titleText, summary: summaryText };

      if (!fs.existsSync(folderName)) {
        try {
          await fs.promises.mkdir(folderName);
        } catch (error) {
          // directory already exists
        }
      }

      await fs.promises.writeFile(`${folderName}/${version}.json`, JSON.stringify(jsonInput));
    }
  }
  return result;
}
