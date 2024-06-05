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

import { join } from 'node:path';

import type { FontDefinition } from '/@api/font-info.js';
import type { IconDefinition, IconInfo } from '/@api/icon-info.js';

import { isWindows } from '../util.js';
import type { ApiSenderType } from './api.js';
import type { AnalyzedExtension } from './extension-loader.js';

export class IconRegistry {
  private icons: Map<string, IconDefinition>;
  private fonts: Map<string, FontDefinition>;

  constructor(private apiSender: ApiSenderType) {
    this.icons = new Map();
    this.fonts = new Map();
  }

  protected registerIcon(iconId: string, definition: IconDefinition): void {
    if (this.icons.has(iconId)) {
      console.warn(`Icon ${iconId} already registered.`);
      return;
    }
    this.icons.set(iconId, definition);
    this.apiSender.send('icon-update');
  }

  protected registerFont(fontId: string, definition: FontDefinition): void {
    if (this.fonts.has(fontId)) {
      console.warn(`Font ${fontId} already registered.`);
      return;
    }
    this.fonts.set(fontId, definition);
    this.apiSender.send('font-update');
  }

  public registerIconContribution(
    extension: AnalyzedExtension,
    icons: { [key: string]: { description?: string; default?: { fontPath?: string; fontCharacter: string } } },
  ): void {
    // register each font and icon
    Object.entries(icons).forEach(([iconId, iconContribution]) => {
      // is there any default icon?
      const defaultAttributes = iconContribution.default;
      if (!defaultAttributes) {
        console.warn(`Expected contributes.icons.default for icon id ${iconId} to be defined.`);
        return;
      }
      // check we have a font character
      if (!defaultAttributes.fontCharacter) {
        console.warn(`Expected contributes.icons.default.fontCharacter for icon id ${iconId} to be defined.`);
        return;
      }

      // font Path ?
      if (!defaultAttributes.fontPath) {
        console.warn(`Expected contributes.icons.default.fontPath for icon id ${iconId} to be defined.`);
        return;
      }

      // get file extension of the font path
      const format = defaultAttributes.fontPath.split('.').pop() ?? '';
      if (format !== 'woff2') {
        console.warn(
          `Expected contributes.icons.default.fontPath to have file extension 'woff2' but found '${format}'."`,
        );
        return;
      }

      const iconFontLocation = join(extension.path, defaultAttributes.fontPath);

      // check that this location is inside the extension folder
      if (!iconFontLocation.startsWith(extension.path)) {
        console.warn(
          `Expected contributes.icons.default.fontPath for icon id ${iconId} to be included inside extension's folder (${extension.path}).`,
        );
        return;
      }

      // fontId is based on the extension id and the font path
      const fontId = `${extension.id}-${defaultAttributes.fontPath}`;

      let cleanedIconFontLocation = iconFontLocation.replace(/'/g, '%27');
      if (isWindows()) {
        cleanedIconFontLocation = cleanedIconFontLocation.replace(/\\/g, '/');
      }
      const browserURL = `url('file://${cleanedIconFontLocation}')`;

      // font definition
      const fontDefinition: FontDefinition = {
        fontId,
        src: [{ location: iconFontLocation, browserURL, format }],
      };

      // register font
      this.registerFont(fontId, fontDefinition);

      // icon definition
      const iconDefinition: IconDefinition = {
        description: iconContribution.description,
        fontCharacter: defaultAttributes.fontCharacter,
        font: fontDefinition,
      };

      // and now register the icon
      this.registerIcon(iconId, iconDefinition);
    });
  }

  listIcons(): IconInfo[] {
    return Array.from(this.icons.entries()).map(([id, definition]) => ({ id, definition }));
  }
}
