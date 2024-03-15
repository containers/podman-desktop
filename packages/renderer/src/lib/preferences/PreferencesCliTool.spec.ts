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

import { beforeEach } from 'node:test';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, suite, test, vi } from 'vitest';

import type { CliToolInfo } from '../../../../main/src/plugin/api/cli-tool-info';
import PreferencesCliTool from './PreferencesCliTool.svelte';

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
  version: '1.0.1',
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
  version: '1.0.1',
  path: 'path/to/tool-name-3',
  newVersion: '2.0.1',
};

const updateCliToolMock = vi.fn();
beforeEach(() => {
  (window as any).updateCliTool = updateCliToolMock;
});

afterEach(() => {
  vi.clearAllMocks();
});

suite('CLI Tool item', () => {
  test('check tool infos are displayed as expected if version is not specified', () => {
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem1,
    });
    const nameElement = screen.getByLabelText('cli-name');
    expect(nameElement).toBeDefined();
    expect(nameElement.textContent).equal(cliToolInfoItem1.name);
    const registeredByElement = screen.getByLabelText('cli-registered-by');
    expect(registeredByElement).toBeDefined();
    expect(registeredByElement.textContent).equal(`Registered by ${cliToolInfoItem1.extensionInfo.label}`);
    const displayNameElement = screen.getByLabelText('cli-display-name');
    expect(displayNameElement).toBeDefined();
    expect(displayNameElement.textContent).equal(cliToolInfoItem1.displayName);
    const versionElement = screen.queryByLabelText('cli-version');
    expect(versionElement).not.toBeInTheDocument();
    const updateLoadingButton = screen.queryByRole('button', { name: 'Update' });
    expect(updateLoadingButton).not.toBeInTheDocument();
  });

  test('check tool infos are displayed as expected and version is specified but there is no new version available', () => {
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem2,
    });
    const nameElement = screen.getByLabelText('cli-name');
    expect(nameElement).toBeDefined();
    expect(nameElement.textContent).equal(cliToolInfoItem2.name);
    const registeredByElement = screen.getByLabelText('cli-registered-by');
    expect(registeredByElement).toBeDefined();
    expect(registeredByElement.textContent).equal(`Registered by ${cliToolInfoItem2.extensionInfo.label}`);
    const displayNameElement = screen.getByLabelText('cli-display-name');
    expect(displayNameElement).toBeDefined();
    expect(displayNameElement.textContent).equal(cliToolInfoItem2.displayName);
    const versionElement = screen.getByLabelText('cli-version');
    expect(versionElement).toBeDefined();
    expect(versionElement.textContent).equal(`${cliToolInfoItem2.name} v${cliToolInfoItem2.version}`);
    const updateLoadingButton = screen.getByRole('button', { name: 'Update' });
    expect(updateLoadingButton).toBeInTheDocument();
    expect(updateLoadingButton).toBeDisabled();
  });

  test('check tool infos are displayed as expected and there is a new version available', () => {
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem3,
    });
    const nameElement = screen.getByLabelText('cli-name');
    expect(nameElement).toBeDefined();
    expect(nameElement.textContent).equal(cliToolInfoItem3.name);
    const registeredByElement = screen.getByLabelText('cli-registered-by');
    expect(registeredByElement).toBeDefined();
    expect(registeredByElement.textContent).equal(`Registered by ${cliToolInfoItem3.extensionInfo.label}`);
    const displayNameElement = screen.getByLabelText('cli-display-name');
    expect(displayNameElement).toBeDefined();
    expect(displayNameElement.textContent).equal(cliToolInfoItem3.displayName);
    const versionElement = screen.getByLabelText('cli-version');
    expect(versionElement).toBeDefined();
    expect(versionElement.textContent).equal(`${cliToolInfoItem3.name} v${cliToolInfoItem3.version}`);
    const updateAvailableElement = screen.getByRole('button', { name: 'Update available' });
    expect(updateAvailableElement).toBeDefined();
    expect(updateAvailableElement.textContent).toBe('Update available');
    const updateLoadingButton = screen.getByRole('button', { name: 'Update' });
    expect(updateLoadingButton).toBeInTheDocument();
    expect(updateLoadingButton).toBeEnabled();
  });

  test('if update fails the error message is shown', async () => {
    updateCliToolMock.mockRejectedValue('');
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem3,
    });
    const updateAvailableElement = screen.getByRole('button', { name: 'Update available' });
    expect(updateAvailableElement).toBeDefined();
    expect(updateAvailableElement.textContent).toBe('Update available');

    const failedErrorButton = screen.queryByRole('button', { name: `${cliToolInfoItem3.displayName} failed` });
    expect(failedErrorButton).not.toBeInTheDocument();

    await userEvent.click(updateAvailableElement);

    const failedErrorButton2 = screen.getByRole('button', { name: `${cliToolInfoItem3.displayName} failed` });
    expect(failedErrorButton2).toBeInTheDocument();
  });
});
