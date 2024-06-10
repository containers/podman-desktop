#!/usr/bin/env tsx
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

import { ColorRegistry } from '../packages/main/src/plugin/color-registry';
import type { ColorInfo } from '../packages/api/src/color-info';
import { writeFileSync } from 'node:fs';
import minimist from 'minimist';

// Create color registry
const registry = new ColorRegistry();
registry.init();

function getStylesheet(themeName: string): string {
  const colors = registry.listColors(themeName);
  const styles: string[] = [];
  colors.forEach((color: ColorInfo) => {
    const cssVar = color.cssVar;
    const colorValue = color.value;

    styles.push(`${cssVar}: ${colorValue};`);
  });
  return `
  :scope {
    ${styles.join('\n')}
  }
`;
}

function generateStylesheet(output: string): void {
  const themes = registry.listThemes();
  let stylesheet = '';
  for (const theme of themes) {
    stylesheet += `
@scope (.${theme}) {
  ${getStylesheet(theme)}
}
`;
  }
  writeFileSync(output, stylesheet);
}

const args = minimist(process.argv.slice(2));

const output: string | undefined = args['output'];
if (!output) throw new Error('missing output argument');

generateStylesheet(output);
