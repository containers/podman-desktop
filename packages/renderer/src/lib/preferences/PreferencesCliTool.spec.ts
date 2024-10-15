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

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import type { CliToolInfo } from '/@api/cli-tool-info';

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
  canUpdate: false,
  canInstall: false,
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
  canUpdate: false,
  canInstall: false,
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
  canUpdate: true,
  canInstall: false,
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
  version: '1.0.1',
  path: 'path/to/tool-name-4',
  canUpdate: true,
  canInstall: false,
};

const cliToolInfoItem5: CliToolInfo = {
  id: 'ext-id.tool-name4',
  name: 'tool-name4',
  description: 'markdown description4',
  displayName: 'tools-display-name4',
  state: 'registered',
  extensionInfo: {
    id: 'ext-id4',
    label: 'ext-label4',
  },
  canUpdate: false,
  canInstall: false,
};

const cliToolInfoItem6: CliToolInfo = {
  id: 'ext-id.tool-name4',
  name: 'tool-name4',
  description: 'markdown description4',
  displayName: 'tools-display-name4',
  state: 'registered',
  extensionInfo: {
    id: 'ext-id4',
    label: 'ext-label4',
  },
  canUpdate: false,
  canInstall: true,
};

const cliToolInfoItem7: CliToolInfo = {
  id: 'ext-id.tool-name7',
  name: 'tool-name7',
  description: 'markdown description7',
  displayName: 'tools-display-name7',
  state: 'registered',
  extensionInfo: {
    id: 'ext-id7',
    label: 'ext-label7',
  },
  version: '1.0.1',
  path: 'path/to/tool-name-7',
  canUpdate: true,
  canInstall: true,
};

const updateCliToolMock = vi.fn();
beforeEach(() => {
  (window as any).updateCliTool = updateCliToolMock;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('CLI Tool item', () => {
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
    const displayFullPathElement = screen.getByText('Path: path/to/tool-name-2');
    expect(displayFullPathElement).toBeInTheDocument();
    const updateLoadingButton = screen.queryByRole('button', { name: 'Update' });
    expect(updateLoadingButton).not.toBeInTheDocument();
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

  test('check version is sent to updateCliTool', async () => {
    const selectCliToolVersionToUpdateMock = vi.fn().mockImplementation(() => Promise.resolve('1.1.1'));
    (window as any).selectCliToolVersionToUpdate = selectCliToolVersionToUpdateMock;
    (window as any).updateCliTool = updateCliToolMock;
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem4,
    });
    const updateAvailableElement = screen.getByRole('button', { name: 'Update available' });
    expect(updateAvailableElement).toBeDefined();
    expect(updateAvailableElement.textContent).toBe('Upgrade/Downgrade');

    await userEvent.click(updateAvailableElement);

    expect(selectCliToolVersionToUpdateMock).toBeCalledWith(cliToolInfoItem4.id);
    expect(updateCliToolMock).toBeCalledWith(cliToolInfoItem4.id, expect.any(Symbol), '1.1.1', expect.any(Function));
  });

  test('check tool infos are displayed as expected and without a new version', async () => {
    updateCliToolMock.mockRejectedValue('');
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem4,
    });
    const nameElement = screen.getByLabelText('cli-name');
    expect(nameElement).toBeDefined();
    expect(nameElement.textContent).equal(cliToolInfoItem4.name);
    const registeredByElement = screen.getByLabelText('cli-registered-by');
    expect(registeredByElement).toBeDefined();
    expect(registeredByElement.textContent).equal(`Registered by ${cliToolInfoItem4.extensionInfo.label}`);
    const displayNameElement = screen.getByLabelText('cli-display-name');
    expect(displayNameElement).toBeDefined();
    expect(displayNameElement.textContent).equal(cliToolInfoItem4.displayName);
    const versionElement = screen.getByLabelText('cli-version');
    expect(versionElement).toBeDefined();
    expect(versionElement.textContent).equal(`${cliToolInfoItem4.name} v${cliToolInfoItem4.version}`);
    const updateAvailableElement = screen.getByRole('button', { name: 'Update available' });
    expect(updateAvailableElement).toBeDefined();
    expect(updateAvailableElement.textContent).toBe('Upgrade/Downgrade');
    const updateLoadingButton = screen.getByRole('button', { name: 'Update' });
    expect(updateLoadingButton).toBeInTheDocument();
    expect(updateLoadingButton).toBeEnabled();
  });

  test('check no install button is displayed if there is no version and no installer registered', async () => {
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem5,
    });
    const nameElement = screen.getByLabelText('cli-name');
    expect(nameElement).toBeDefined();
    expect(nameElement.textContent).equal(cliToolInfoItem4.name);
    const registeredByElement = screen.getByLabelText('cli-registered-by');
    expect(registeredByElement).toBeDefined();
    expect(registeredByElement.textContent).equal(`Registered by ${cliToolInfoItem4.extensionInfo.label}`);
    const displayNameElement = screen.getByLabelText('cli-display-name');
    expect(displayNameElement).toBeDefined();
    expect(displayNameElement.textContent).equal(cliToolInfoItem4.displayName);
    const versionElement = screen.queryByLabelText('cli-version');
    expect(versionElement).not.toBeInTheDocument();
    const noVersionElement = screen.getByLabelText('no-cli-version');
    expect(noVersionElement).toBeDefined();
    expect(noVersionElement.textContent).equal('No version detected');
    const installLoadingButton = screen.queryByRole('button', { name: 'Install' });
    expect(installLoadingButton).not.toBeInTheDocument();
  });

  test('check the install button is displayed if there is no version and an installer has been registered', async () => {
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem6,
    });
    const nameElement = screen.getByLabelText('cli-name');
    expect(nameElement).toBeDefined();
    expect(nameElement.textContent).equal(cliToolInfoItem4.name);
    const registeredByElement = screen.getByLabelText('cli-registered-by');
    expect(registeredByElement).toBeDefined();
    expect(registeredByElement.textContent).equal(`Registered by ${cliToolInfoItem4.extensionInfo.label}`);
    const displayNameElement = screen.getByLabelText('cli-display-name');
    expect(displayNameElement).toBeDefined();
    expect(displayNameElement.textContent).equal(cliToolInfoItem4.displayName);
    const versionElement = screen.queryByLabelText('cli-version');
    expect(versionElement).not.toBeInTheDocument();
    const noVersionElement = screen.getByLabelText('no-cli-version');
    expect(noVersionElement).toBeDefined();
    expect(noVersionElement.textContent).equal('No version detected');
    const installLoadingButton = screen.getByRole('button', { name: 'Install' });
    expect(installLoadingButton).toBeInTheDocument();
    expect(installLoadingButton).toBeEnabled();
  });

  test('check no uninstall button is displayed if there is a version and no installer registered', async () => {
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem4,
    });
    const nameElement = screen.getByLabelText('cli-name');
    expect(nameElement).toBeDefined();
    expect(nameElement.textContent).equal(cliToolInfoItem4.name);
    const registeredByElement = screen.getByLabelText('cli-registered-by');
    expect(registeredByElement).toBeDefined();
    expect(registeredByElement.textContent).equal(`Registered by ${cliToolInfoItem4.extensionInfo.label}`);
    const displayNameElement = screen.getByLabelText('cli-display-name');
    expect(displayNameElement).toBeDefined();
    expect(displayNameElement.textContent).equal(cliToolInfoItem4.displayName);
    const versionElement = screen.getByLabelText('cli-version');
    expect(versionElement).toBeInTheDocument();
    expect(versionElement.textContent).equal(`${cliToolInfoItem4.name} v${cliToolInfoItem4.version}`);
    const uninstallLoadingButton = screen.queryByRole('button', { name: 'Uninstall' });
    expect(uninstallLoadingButton).not.toBeInTheDocument();
  });

  test('check the uninstall button is displayed if there is a version and an installer has been registered', async () => {
    render(PreferencesCliTool, {
      cliTool: cliToolInfoItem7,
    });
    const nameElement = screen.getByLabelText('cli-name');
    expect(nameElement).toBeDefined();
    expect(nameElement.textContent).equal(cliToolInfoItem7.name);
    const registeredByElement = screen.getByLabelText('cli-registered-by');
    expect(registeredByElement).toBeDefined();
    expect(registeredByElement.textContent).equal(`Registered by ${cliToolInfoItem7.extensionInfo.label}`);
    const displayNameElement = screen.getByLabelText('cli-display-name');
    expect(displayNameElement).toBeDefined();
    expect(displayNameElement.textContent).equal(cliToolInfoItem7.displayName);
    const versionElement = screen.getByLabelText('cli-version');
    expect(versionElement).toBeInTheDocument();
    expect(versionElement.textContent).equal(`${cliToolInfoItem7.name} v${cliToolInfoItem7.version}`);
    const uninstallLoadingButton = screen.getByRole('button', { name: 'Uninstall' });
    expect(uninstallLoadingButton).toBeInTheDocument();
    expect(uninstallLoadingButton).toBeEnabled();
    const updateLoadingButton = screen.getByRole('button', { name: 'Update' });
    expect(updateLoadingButton).toBeInTheDocument();
    expect(updateLoadingButton).toBeEnabled();
    const installLoadingButton = screen.queryByRole('button', { name: 'Install' });
    expect(installLoadingButton).not.toBeInTheDocument();
  });
});
