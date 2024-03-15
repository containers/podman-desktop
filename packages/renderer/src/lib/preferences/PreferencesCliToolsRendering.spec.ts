/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { within } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeAll, expect, suite, test, vi } from 'vitest';

import { cliToolInfos } from '/@/stores/cli-tools';

import type { CliToolInfo } from '../../../../main/src/plugin/api/cli-tool-info';
import PreferencesCliToolsRendering from './PreferencesCliToolsRendering.svelte';

afterEach(() => {
  vi.clearAllMocks();
});

const cliToolInfoItem1: CliToolInfo = {
  id: 'ext-id.tool-name1',
  name: 'tool-name1',
  description: 'markdown description1',
  displayName: 'tools-display-name1',
  state: 'registered',
  extensionInfo: {
    id: 'ext-id1',
    label: 'ext-label1',
  },
  version: '1.0.1',
  path: 'path/to/tool-name-1',
};

const cliToolInfoItem2: CliToolInfo = {
  id: 'ext-id.tool-name2',
  name: 'tool-name2',
  description: 'markdown description2',
  displayName: 'tools-display-name2',
  state: 'registered',
  extensionInfo: {
    id: 'ext-id2',
    label: 'ext-label2',
  },
  images: {},
  version: '1.0.2',
  path: 'path/to/tool-name-2',
};

const cliToolInfoItem3: CliToolInfo = {
  id: 'ext-id.tool-name3',
  name: 'tool-name3',
  description: 'markdown description3',
  displayName: 'tools-display-name3',
  state: 'registered',
  extensionInfo: {
    id: 'ext-id3',
    label: 'ext-label3',
  },
  images: {
    icon: 'encoded-icon',
  },
  version: '1.0.3',
  path: 'path/to/tool-name-3',
};

const cliToolInfoItem4: CliToolInfo = {
  id: 'ext-id.tool-name4',
  name: 'tool-name4',
  description: 'markdown description4',
  displayName: 'tools-display-name4',
  state: 'registered',
  extensionInfo: {
    id: 'ext-id4',
    label: 'ext-label4',
  },
  images: {},
  version: '', // version is empty, so it should be showing the error
  path: '',
};

suite('CLI Tool Prefernces page shows', () => {
  const cliTools = [cliToolInfoItem1, cliToolInfoItem2, cliToolInfoItem3, cliToolInfoItem4];
  let cliToolRows: HTMLElement[] = [];

  function validatePropertyPresentation(labelName: string, getExpectedContent: (info: CliToolInfo) => string) {
    cliTools.forEach((tool, index) => {
      const nameElement = within(cliToolRows[index]).getByLabelText(labelName);
      expect(nameElement.textContent?.trim()).equals(getExpectedContent(tool));
    });
  }

  beforeAll(() => {
    cliToolInfos.set(cliTools);
    render(PreferencesCliToolsRendering, {});
    const cliToolsTable = screen.getByRole('table', { name: 'cli-tools' });
    cliToolRows = within(cliToolsTable).getAllByRole('row');
  });

  test('all registered tools', () => {
    expect(cliToolRows.length).equals(cliTools.length);
  });

  test('tool`s name', () => {
    validatePropertyPresentation('cli-name', toolInfo => toolInfo.name);
  });

  test('extension`s name that registered the tool', () => {
    validatePropertyPresentation('cli-registered-by', toolInfo => `Registered by ${toolInfo.extensionInfo.label}`);
  });

  test('tool`s display name', () => {
    validatePropertyPresentation('cli-display-name', toolInfo => toolInfo.displayName);
  });

  test('tool`s description', () => {
    validatePropertyPresentation('markdown-content', toolInfo => toolInfo.description);
  });

  test('tool`s logo is not shown if images.icon property is not present or images property is empty', () => {
    expect(within(cliToolRows[0]).queryAllByLabelText('cli-logo').length).equals(0);
    expect(within(cliToolRows[1]).queryAllByLabelText('cli-logo').length).equals(0);
  });

  test('tool`s logo is shown when images.icon property is present', () => {
    expect(within(cliToolRows[2]).getAllByLabelText('cli-logo').length).equals(1);
  });

  test('test tools version is shown', () => {
    // First three tools have version, the last one has empty version and should show error
    expect(within(cliToolRows[0]).queryAllByLabelText('cli-version')[0].textContent).toEqual('tool-name1 v1.0.1');
    expect(within(cliToolRows[1]).queryAllByLabelText('cli-version')[0].textContent).toEqual('tool-name2 v1.0.2');
    expect(within(cliToolRows[2]).queryAllByLabelText('cli-version')[0].textContent).toEqual('tool-name3 v1.0.3');

    // Expect cliToolRows[3] cli-version to not exist since we do not provide version
    expect(within(cliToolRows[3]).queryAllByLabelText('cli-version').length).toEqual(0);
  });
});
