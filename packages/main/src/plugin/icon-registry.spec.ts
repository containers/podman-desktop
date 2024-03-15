/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import path from 'node:path';

import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import type { ApiSenderType } from './api.js';
import type { AnalyzedExtension } from './extension-loader.js';
import { IconRegistry } from './icon-registry.js';

let iconRegistry: IconRegistry;
const apiSenderSendMock = vi.fn();

vi.mock('../util', async () => {
  return {
    isWindows: (): boolean => false,
  };
});

beforeAll(async () => {
  iconRegistry = new IconRegistry({
    send: apiSenderSendMock,
  } as unknown as ApiSenderType);
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('should register icon contribution', async () => {
  const fontPath = 'bootstrap-icons.woff2';
  const fontCharacter = '\\F844';
  const iconDescription = 'This is my icon';
  const icons = {
    'my-icon-id': {
      description: iconDescription,
      default: {
        fontPath,
        fontCharacter,
      },
    },
  };

  const extensionPath = `${path.sep}root${path.sep}path`;
  const extensionId = 'myextension.id';
  const extension = {
    path: extensionPath,
    id: extensionId,
  } as AnalyzedExtension;

  // register icons
  iconRegistry.registerIconContribution(extension, icons);

  // expect to have registered the icon
  expect(apiSenderSendMock).toHaveBeenCalledWith('icon-update');
  expect(apiSenderSendMock).toHaveBeenCalledWith('font-update');

  // grab the icons
  const allIcons = iconRegistry.listIcons();
  expect(allIcons).toHaveLength(1);
  const icon = allIcons[0];
  expect(icon.id).toBe('my-icon-id');
  expect(icon.definition.fontCharacter).toBe(fontCharacter);
  expect(icon.definition.description).toBe(iconDescription);
  expect(icon.definition.font).toBeDefined();
  expect(icon.definition.font?.src).toStrictEqual([
    {
      format: 'woff2',
      location: `${extensionPath}${path.sep}${fontPath}`,
      browserURL: `url('file://${extensionPath}${path.sep}${fontPath}')`,
    },
  ]);
  expect(icon.definition.font?.fontId).toBe(`${extensionId}-${fontPath}`);
});
