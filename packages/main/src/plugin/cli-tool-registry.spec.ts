/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { CliToolInstaller, CliToolOptions, CliToolSelectUpdate, CliToolUpdate, Logger } from '@podman-desktop/api';
import { afterEach, beforeEach, expect, suite, test, vi } from 'vitest';

import type { CliToolExtensionInfo } from '/@api/cli-tool-info.js';

import type { ApiSenderType } from './api.js';
import type { CliToolImpl } from './cli-tool-impl.js';
import { CliToolRegistry } from './cli-tool-registry.js';

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

let cliToolRegistry: CliToolRegistry;
suite('cli module', () => {
  beforeEach(() => {
    cliToolRegistry = new CliToolRegistry(apiSender);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
  const extensionInfo: CliToolExtensionInfo = {
    id: 'ext-publisher.ext-name',
    label: 'my-label',
  };

  suite('create CliTool', () => {
    test('creates CliTool instance using CliToolsOptions properties', () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      expect(newCliTool.id).equals(`${extensionInfo.id}.${options.name}`);
      expect(newCliTool.name).equals(options.name);
      expect(newCliTool.displayName).equals(options.displayName);
      expect(newCliTool.markdownDescription).equals(options.markdownDescription);
      expect(newCliTool.images).equals(options.images);
      expect(newCliTool.state).equals('registered');
    });

    test('CLI Tool registry sends "cli-tool-create" event when new tool is created', () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      cliToolRegistry.createCliTool(extensionInfo, options);

      expect(apiSender.send).toBeCalledWith('cli-tool-create');
    });

    test('CLI Tool registry generates CliToolInfo array for created tools', () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      const infoList = cliToolRegistry.getCliToolInfos();
      expect(infoList.length).equals(1);
      expect(infoList[0]).toMatchObject({
        id: newCliTool.id,
        name: newCliTool.name,
        displayName: newCliTool.displayName,
        description: newCliTool.markdownDescription,
        state: newCliTool.state,
        images: newCliTool.images,
        extensionInfo: newCliTool.extensionInfo,
        canUpdate: false,
      });
    });

    test('CLI Tool registry generates CliToolInfo array for created tools, if updater exists and tool has been installed by app, it can be updated', () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
        installationSource: 'extension',
      };
      const updater: CliToolSelectUpdate = {
        doUpdate: vi.fn(),
        selectVersion: vi.fn(),
      };
      const installer: CliToolInstaller = {
        doInstall: vi.fn(),
        selectVersion: vi.fn(),
        doUninstall: vi.fn(),
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      cliToolRegistry.registerUpdate(newCliTool as CliToolImpl, updater);
      cliToolRegistry.registerInstaller(newCliTool as CliToolImpl, installer);
      const infoList = cliToolRegistry.getCliToolInfos();
      expect(infoList.length).equals(1);
      expect(infoList[0]).toMatchObject({
        id: newCliTool.id,
        name: newCliTool.name,
        displayName: newCliTool.displayName,
        description: newCliTool.markdownDescription,
        state: newCliTool.state,
        images: newCliTool.images,
        extensionInfo: newCliTool.extensionInfo,
        canUpdate: true,
        canInstall: true,
      });
    });

    test('CLI Tool registry generates CliToolInfo array for created tools, if updater exists and tool has been installed by user, it can NOT be updated', () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
        installationSource: 'external',
      };
      const updater: CliToolSelectUpdate = {
        doUpdate: vi.fn(),
        selectVersion: vi.fn(),
      };
      const installer: CliToolInstaller = {
        doInstall: vi.fn(),
        selectVersion: vi.fn(),
        doUninstall: vi.fn(),
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      cliToolRegistry.registerUpdate(newCliTool as CliToolImpl, updater);
      cliToolRegistry.registerInstaller(newCliTool as CliToolImpl, installer);
      const infoList = cliToolRegistry.getCliToolInfos();
      expect(infoList.length).equals(1);
      expect(infoList[0]).toMatchObject({
        id: newCliTool.id,
        name: newCliTool.name,
        displayName: newCliTool.displayName,
        description: newCliTool.markdownDescription,
        state: newCliTool.state,
        images: newCliTool.images,
        extensionInfo: newCliTool.extensionInfo,
        canUpdate: false,
        canInstall: false,
        version: newCliTool.version,
      });
    });
  });

  suite('dispose CliTool', () => {
    test('sends "cli-tool-remove" event when cli tool is disposed', () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      newCliTool.dispose();
      expect(apiSender.send).toBeCalledWith('cli-tool-remove', newCliTool.id);
    });

    test('removes cli tool from the registry', () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      const infoListAfterCreate = cliToolRegistry.getCliToolInfos();
      expect(infoListAfterCreate.length).equals(1);
      newCliTool.dispose();
      const infoListAfterDispose = cliToolRegistry.getCliToolInfos();
      expect(infoListAfterDispose.length).equals(0);
    });
  });

  suite('update CliTool', () => {
    test('expect updater is registered and called', async () => {
      const updateMock = vi.fn();
      const updater: CliToolUpdate = {
        doUpdate: updateMock,
        version: '1.1.1',
      };
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      // register the updater and call it
      const disposeUpdater = cliToolRegistry.registerUpdate(newCliTool as CliToolImpl, updater);
      await cliToolRegistry.updateCliTool(newCliTool.id, {} as unknown as Logger);

      expect(updateMock).toBeCalled();
      updateMock.mockReset();

      // dispose the updater and check it is not called again
      disposeUpdater.dispose();
      expect(apiSender.send).toBeCalledWith('cli-tool-change', 'ext-publisher.ext-name.tool-name');
      await cliToolRegistry.updateCliTool(newCliTool.id, {} as unknown as Logger);

      expect(updateMock).not.toBeCalled();
    });
  });

  suite('selectCliToolVersionToUpdate', () => {
    test('throw if there is a no updater registered', async () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      await expect(cliToolRegistry.selectCliToolVersionToUpdate(newCliTool.id)).rejects.toThrowError(
        `No updater registered for ${newCliTool.id}`,
      );
    });

    test('throw if there is a CliToolUpdate registered', async () => {
      const updateMock = vi.fn();
      const updater: CliToolUpdate = {
        doUpdate: updateMock,
        version: '1.1.1',
      };
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      // register the updater and call the selectCliTool
      cliToolRegistry.registerUpdate(newCliTool as CliToolImpl, updater);
      await expect(cliToolRegistry.selectCliToolVersionToUpdate(newCliTool.id)).rejects.toThrowError(
        `No updater registered for ${newCliTool.id}`,
      );
    });

    test('check the selectVersion function of the updater is called correctly', async () => {
      const updateMock = vi.fn();
      const selectVersionMock = vi.fn();
      const updater: CliToolSelectUpdate = {
        doUpdate: updateMock,
        selectVersion: selectVersionMock,
      };
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
        version: '1.0.1',
        path: 'path/to/tool-name',
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      // register the updater and call the selectCliTool
      cliToolRegistry.registerUpdate(newCliTool as CliToolImpl, updater);
      await cliToolRegistry.selectCliToolVersionToUpdate(newCliTool.id);
      expect(selectVersionMock).toBeCalled();
    });
  });

  suite('isUpdaterToPredefinedVersion', () => {
    test('return true if item is instance of CliToolUpdate', () => {
      const updater: CliToolUpdate = {
        doUpdate: vi.fn(),
        version: '1.1.1',
      };
      const isCliToolUpdate = cliToolRegistry.isUpdaterToPredefinedVersion(updater);
      expect(isCliToolUpdate).toBeTruthy();
    });

    test('return false if item is NOT instance of CliToolUpdate', () => {
      const updater: CliToolSelectUpdate = {
        doUpdate: vi.fn(),
        selectVersion: vi.fn(),
      };
      const isCliToolUpdate = cliToolRegistry.isUpdaterToPredefinedVersion(updater);
      expect(isCliToolUpdate).toBeFalsy();
    });
  });

  suite('selectCliToolVersionToInstall', () => {
    test('throw if there is a no installer registered', async () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      await expect(cliToolRegistry.selectCliToolVersionToInstall(newCliTool.id)).rejects.toThrowError(
        `No installer registered for ${newCliTool.id}`,
      );
    });

    test('check the selectVersion function of the installer is called correctly', async () => {
      const installMock = vi.fn();
      const selectVersionMock = vi.fn();
      const installer: CliToolInstaller = {
        doInstall: installMock,
        selectVersion: selectVersionMock,
        doUninstall: vi.fn(),
      };
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      // register the updater and call the selectCliTool
      cliToolRegistry.registerInstaller(newCliTool as CliToolImpl, installer);
      await cliToolRegistry.selectCliToolVersionToInstall(newCliTool.id);
      expect(selectVersionMock).toBeCalled();
    });
  });

  suite('installCliTool', () => {
    const installMock = vi.fn();
    const uninstallMock = vi.fn();
    const selectVersionMock = vi.fn();
    const installer: CliToolInstaller = {
      doInstall: installMock,
      doUninstall: uninstallMock,
      selectVersion: selectVersionMock,
    };
    beforeEach(() => {
      vi.resetAllMocks();
      vi.restoreAllMocks();
    });
    test('check install is not called if there is no installer registered', async () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      await cliToolRegistry.installCliTool(newCliTool.id, {} as Logger);
      expect(installMock).not.toBeCalled();
    });

    test('check install is not called if the installer has been disposed', async () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      // register the updater and call the selectCliTool
      const dispose = cliToolRegistry.registerInstaller(newCliTool as CliToolImpl, installer);
      dispose.dispose();
      await cliToolRegistry.installCliTool(newCliTool.id, {} as Logger);
      expect(installMock).not.toBeCalled();
    });

    test('check the install function of the installer is called correctly', async () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      // register the updater and call the selectCliTool
      cliToolRegistry.registerInstaller(newCliTool as CliToolImpl, installer);
      await cliToolRegistry.installCliTool(newCliTool.id, {} as Logger);
      expect(installMock).toBeCalled();
    });

    test('check uninstall is not called if there is no installer registered', async () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      await cliToolRegistry.uninstallCliTool(newCliTool.id, {} as Logger);
      expect(uninstallMock).not.toBeCalled();
    });

    test('check the uninstall function of the installer is called correctly', async () => {
      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
      const uninstallCliMock = vi.fn();
      (newCliTool as CliToolImpl).uninstall = uninstallCliMock;
      // register the updater and call the selectCliTool
      cliToolRegistry.registerInstaller(newCliTool as CliToolImpl, installer);
      await cliToolRegistry.uninstallCliTool(newCliTool.id, {} as Logger);
      expect(uninstallMock).toBeCalled();
      expect(uninstallCliMock).toBeCalled();
    });
  });

  suite('cliTools', () => {
    test('check cliTool is correctly registered and disposed', async () => {
      let cliToolsUpdateNumbers = 0;
      cliToolRegistry.onDidCliToolsChange(() => {
        cliToolsUpdateNumbers++;
      });

      const options: CliToolOptions = {
        name: 'tool-name',
        displayName: 'tool-display-name',
        markdownDescription: 'markdown description',
        images: {},
      };
      const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);

      // check the cliTools list contains our cli tool
      let cliTools = cliToolRegistry.getCliTools();
      expect(cliTools.length).equals(1);
      if (!cliTools[0]) {
        throw new Error('no valid cli tool found');
      }
      expect(cliTools[0]).toBeDefined();
      expect(cliTools[0].name).equals('tool-name');

      // check the cliTools returned is the correct one
      const cliTool = cliToolRegistry.getCliTool(cliTools[0].id);
      expect(cliTool).toStrictEqual(cliTools[0]);

      // check the list is updated after disposing
      newCliTool.dispose();
      cliTools = cliToolRegistry.getCliTools();
      expect(cliTools.length).equals(0);

      // the onDidCliToolsChange should have been fired twice (creation, deletion)
      expect(cliToolsUpdateNumbers).equals(2);
    });
  });

  test('check conversion from cliTool to cliToolInfo is performed well', async () => {
    const options: CliToolOptions = {
      name: 'tool-name',
      displayName: 'tool-display-name',
      markdownDescription: 'markdown description',
      images: {},
    };
    const newCliTool = cliToolRegistry.createCliTool(extensionInfo, options);
    const cliToolInfo = cliToolRegistry['convertToCliToolInfo'](newCliTool);

    expect('updateVersion' in cliToolInfo).toBeFalsy();
    expect(cliToolInfo.name).equals(newCliTool.name);
    expect(cliToolInfo.displayName).equals(newCliTool.displayName);
    expect(cliToolInfo.markdownDescription).equals(newCliTool.markdownDescription);
    expect(cliToolInfo.version).equals(newCliTool.version);
  });
});
