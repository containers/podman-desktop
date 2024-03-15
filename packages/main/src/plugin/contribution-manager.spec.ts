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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';

import type { RunResult } from '@podman-desktop/api';
import * as jsYaml from 'js-yaml';
import { EventEmitter } from 'stream-json/Assembler.js';
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import * as util from '../util.js';
import type { ApiSenderType } from './api.js';
import type { ContributionInfo } from './api/contribution-info.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import type { DockerExtensionMetadata } from './contribution-manager.js';
import { ContributionManager } from './contribution-manager.js';
import type { Directories } from './directories.js';
import type { Proxy } from './proxy.js';
import type { IDisposable } from './types/disposable.js';
import { Exec } from './util/exec.js';

let contributionManager: TestContributionManager;

let composeFileExample: any;

const ociImage = 'quay.io/my-image';
const extensionName = 'my-extension';
const portNumber = 10000;

const eventEmitter = new EventEmitter();

const send = (channel: string, data?: unknown): void => {
  eventEmitter.emit(channel, data);
};

const receive = (channel: string, func: (...args: unknown[]) => void): IDisposable => {
  eventEmitter.on(channel, func);
  return {
    dispose: () => {
      eventEmitter.off(channel, func);
    },
  } as unknown as IDisposable;
};

const apiSender: ApiSenderType = {
  send,
  receive,
};

class TestContributionManager extends ContributionManager {
  addContribution(contribution: ContributionInfo): number {
    return this.contributions.push(contribution);
  }

  setStartedContribution(contribId: string, val: boolean): void {
    this.startedContributions.set(contribId, val);
  }

  hasStartedContribution(contribId: string): boolean {
    return this.startedContributions.has(contribId);
  }

  resetContributions(): void {
    this.contributions = [];
    this.startedContributions.clear();
  }
}

const getFirstRunningConnectionMock = vi.fn();
const containerProviderRegistry = {
  getFirstRunningConnection: getFirstRunningConnectionMock,
} as unknown as ContainerProviderRegistry;

const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
  getContributionStorageDir: () => '/fake-contribution-storage-directory',
} as unknown as Directories;

const proxy = {
  isEnabled: vi.fn().mockReturnValue(false),
} as unknown as Proxy;

const exec = new Exec(proxy);

beforeEach(() => {
  contributionManager = new TestContributionManager(apiSender, directories, containerProviderRegistry, exec);
});

const originalConsoleLogMethod = console.log;

const consoleLogMock = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
  contributionManager.resetContributions();

  const logs = (...args: any[]): void => {
    consoleLogMock(...args);
    originalConsoleLogMethod(...args);
  };

  console.log = logs;

  composeFileExample = {
    services: {
      'devenv-volumes': {
        image: 'fooImage',
      },
    },
  };
});

afterEach(() => {
  console.log = originalConsoleLogMethod;
});

test('Should interpret ${DESKTOP_PLUGIN_IMAGE}', async () => {
  const composeFile = {
    services: {
      'devenv-volumes': {
        image: '${DESKTOP_PLUGIN_IMAGE}',
      },
    },
  };
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFile);

  expect(result.services['devenv-volumes'].image).toBe(ociImage);
});

test('Should add custom labels', async () => {
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFileExample);

  expect(result.services['devenv-volumes'].labels).toStrictEqual({
    'com.docker.desktop.extension': 'true',
    'com.docker.desktop.extension.name': 'my-extension',
    'io.podman_desktop.PodmanDesktop.extension': 'true',
    'io.podman_desktop.PodmanDesktop.extensionName': 'my-extension',
  });
});

test('Should add restart policy', async () => {
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFileExample);

  expect(result.services['devenv-volumes'].deploy?.restart_policy?.condition).toBe('always');
});

test('Should add volumes from', async () => {
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFileExample);

  expect(result.services['devenv-volumes'].volumes_from).toStrictEqual(['podman-desktop-socket']);

  // check the volume is not added on the podman-desktop-socket service
  expect(result.services['podman-desktop-socket'].volumes_from).toBeUndefined();
});

test('Should not add a service to expose port if no socket', async () => {
  const result = await contributionManager.doEnhanceCompose(ociImage, extensionName, portNumber, composeFileExample);

  // check new service is being added
  const podmanDesktopService = result.services['podman-desktop-socket'];
  expect(podmanDesktopService).toBeDefined();

  // check new service is exposing the port
  expect(podmanDesktopService.ports).toBeUndefined();

  // check the volumes is mounted
  expect(podmanDesktopService.volumes).toStrictEqual(['/run/guest-services']);

  // no socket exposure
  expect(podmanDesktopService.command).not.toContain('socat');
});

test('Should add a service to expose port if socket', async () => {
  const socketPath = 'my-socket.sock';
  const result = await contributionManager.doEnhanceCompose(
    ociImage,
    extensionName,
    portNumber,
    composeFileExample,
    socketPath,
  );

  // check new service is being added
  const podmanDesktopService = result.services['podman-desktop-socket'];
  expect(podmanDesktopService).toBeDefined();

  // check new service is exposing the port
  expect(podmanDesktopService.ports).toStrictEqual(['10000:10000']);

  // check the volumes is mounted
  expect(podmanDesktopService.volumes).toStrictEqual(['/run/guest-services']);

  // socket exposure
  expect(podmanDesktopService.command).toContain('socat');
  // socket exposure
  expect(podmanDesktopService.command).toContain(`/run/guest-services/${socketPath}`);
});

test('Check invalid port file', async () => {
  vi.mock('node:fs');
  vi.mock('js-yaml');

  const metadata = {
    vm: {
      composefile: 'dummy-compose-file',
    },
  } as unknown as DockerExtensionMetadata;

  // mock existsSync as always returning true
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);

  // fake object
  vi.spyOn(jsYaml, 'load').mockReturnValue({});

  // mock readFile
  vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
    if (path.toString().endsWith('ports-file')) {
      return 'not a number';
    } else {
      return '';
    }
  });

  await expect(contributionManager.enhanceComposeFile('/fake/directory', ociImage, metadata)).rejects.toThrow(
    'does not contains a valid port number',
  );
});

test('waitForAContainerConnection', async () => {
  // mock getFirstRunningConnection
  getFirstRunningConnectionMock.mockResolvedValue({} as any);

  // should succeed
  const promise = contributionManager.waitForAContainerConnection();

  // wait a little code of promise is executed
  await new Promise(resolve => setTimeout(resolve, 100));

  // now send the 'extension-started' event
  apiSender.send('extensions-started', {});

  await promise;
});

test('waitForAContainerConnection delayed', async () => {
  // mock getFirstRunningConnection
  // first and second time fails, third time succeed
  getFirstRunningConnectionMock
    .mockImplementationOnce(() => {
      throw new Error('test error');
    })
    .mockReturnValueOnce({} as any);

  const promise = contributionManager.waitForAContainerConnection();

  // wait a little code of promise is executed
  await new Promise(resolve => setTimeout(resolve, 500));

  // now send the 'extension-started' event
  apiSender.send('extensions-started', {});

  // and now the provider-change event (failing)
  apiSender.send('provider-change', {});

  await promise;
});

test('waitForAContainerConnection delayed twice', async () => {
  // mock getFirstRunningConnection
  // first and second time fails, third time succeed
  getFirstRunningConnectionMock
    .mockImplementationOnce(() => {
      throw new Error('test error');
    })
    .mockImplementationOnce(() => {
      throw new Error('test error');
    })
    .mockReturnValueOnce({} as any);

  const promise = contributionManager.waitForAContainerConnection();

  // wait a little code of promise is executed
  await new Promise(resolve => setTimeout(resolve, 500));

  // now send the 'extension-started' event
  apiSender.send('extensions-started', {});

  // and now the provider-change event (failing)
  apiSender.send('provider-change', {});

  // and another one (succeed)
  apiSender.send('provider-change', {});

  await promise;
});

describe('findComposeBinary', () => {
  vi.mock('./util', () => {
    return {
      isWindows: vi.fn(),
      isMac: vi.fn(),
      isLinux: vi.fn(),
      exec: vi.fn(),
    };
  });

  vi.mock('../util/exec', () => {
    return vi.fn();
  });

  test('Check findComposeBinary on Windows', async () => {
    vi.mock('node:fs');

    vi.spyOn(util, 'isWindows').mockImplementation(() => true);

    // mock exec
    vi.spyOn(exec, 'exec').mockResolvedValue({} as RunResult);

    const binary = await contributionManager.findComposeBinary();

    expect(binary).toBe('docker-compose.exe');
  });

  test('Check findComposeBinary not exists on Windows', async () => {
    vi.mock('node:fs');

    vi.spyOn(util, 'isWindows').mockImplementation(() => true);

    // mock exec
    vi.spyOn(exec, 'exec').mockRejectedValue(new Error('not found'));

    const binary = await contributionManager.findComposeBinary();

    // not found
    expect(binary).toBeUndefined();
  });

  test('Check findComposeBinary on macOS', async () => {
    vi.mock('node:fs');

    vi.spyOn(util, 'isMac').mockImplementation(() => true);
    vi.spyOn(util, 'isWindows').mockImplementation(() => false);

    // mock existsSync as returning false first time and true second time
    vi.spyOn(fs, 'existsSync').mockReturnValueOnce(false).mockReturnValueOnce(true);

    // mock exec
    vi.spyOn(exec, 'exec').mockResolvedValue({} as RunResult);

    const binary = await contributionManager.findComposeBinary();

    // taking last binary path as first item did not exists during the test
    expect(binary).toBe('/opt/homebrew/bin/docker-compose');
  });

  test('Check findComposeBinary on Linux', async () => {
    vi.mock('node:fs');

    vi.spyOn(util, 'isLinux').mockImplementation(() => true);
    vi.spyOn(util, 'isMac').mockImplementation(() => false);
    vi.spyOn(util, 'isWindows').mockImplementation(() => false);

    // mock existsSync as returning true
    vi.spyOn(fs, 'existsSync').mockReturnValue(true);

    // mock exec
    vi.spyOn(exec, 'exec').mockResolvedValue({} as RunResult);

    const binary = await contributionManager.findComposeBinary();

    // taking first binary path as they all exists
    expect(binary).toBe('/usr/bin/docker-compose');
  });
});

describe('startVms', () => {
  test('do not start if nothing', async () => {
    const contrib1 = {
      extensionId: 'contrib1',
    } as ContributionInfo;
    const contrib2 = {
      extensionId: 'contrib3',
    } as ContributionInfo;

    contributionManager.addContribution(contrib1);
    contributionManager.addContribution(contrib2);
    // vm method
    const startVMMethod = vi.spyOn(contributionManager, 'startVM').mockResolvedValue({} as any);

    // spy waitForAContainerConnection
    const waitForAContainerConnectionMethod = vi
      .spyOn(contributionManager, 'waitForAContainerConnection')
      .mockResolvedValue({} as any);

    await contributionManager.startVMs();

    expect(startVMMethod).not.toBeCalled();
    expect(waitForAContainerConnectionMethod).not.toBeCalled();
  });

  test('start a VM', async () => {
    const contrib1 = {
      extensionId: 'contrib1',
    } as ContributionInfo;
    const contrib2 = {
      extensionId: 'contrib2',
      vmCustomizedComposeFile: 'compose-contrib2.yaml',
    } as ContributionInfo;
    const contrib3 = {
      extensionId: 'contrib3',
    } as ContributionInfo;

    contributionManager.addContribution(contrib1);
    contributionManager.addContribution(contrib2);
    contributionManager.addContribution(contrib3);
    // vm method
    const startVMMethod = vi.spyOn(contributionManager, 'startVM').mockResolvedValue({} as any);

    // spy waitForAContainerConnection
    const waitForAContainerConnectionMethod = vi
      .spyOn(contributionManager, 'waitForAContainerConnection')
      .mockResolvedValue({} as any);

    await contributionManager.startVMs();

    expect(startVMMethod).toHaveBeenCalledWith('contrib2', 'compose-contrib2.yaml');
    expect(waitForAContainerConnectionMethod).toHaveBeenCalled();
  });
});

describe('startVM', () => {
  beforeAll(() => {
    contributionManager = new TestContributionManager(apiSender, directories, containerProviderRegistry, exec);
  });

  test('start a VM without compose file', async () => {
    await contributionManager.startVM('contrib1');
    expect(consoleLogMock).toBeCalledWith(
      'skip extensionId contrib1 start as there is no vmCustomizedComposeFile parameter',
    );
  });

  test('start a VM already started', async () => {
    contributionManager.setStartedContribution('contrib1', true);
    await contributionManager.startVM('contrib1', '/path/to/compose.yaml');
    expect(consoleLogMock).toBeCalledWith('skip already started VM for extension contrib1');
  });

  test('start a VM', async () => {
    const execComposeCommand = vi.spyOn(contributionManager, 'execComposeCommand').mockResolvedValue({} as any);

    await contributionManager.startVM('contrib1', '/path/to/compose.yaml');

    const parentDir = '/path/to';
    const composeArgs = ['-p', 'podman-desktop-ext-contrib1', 'up', '-d'];
    expect(execComposeCommand).toBeCalledWith(parentDir, composeArgs);
  });

  test('start a VM with monitor', async () => {
    const waitForRunningStateSpy = vi.spyOn(contributionManager, 'waitForRunningState').mockResolvedValue({} as any);
    vi.spyOn(contributionManager, 'execComposeCommand').mockResolvedValue({} as any);

    await contributionManager.startVM('contrib1', '/path/to/compose.yaml', true);

    expect(waitForRunningStateSpy).toBeCalled();
  });
});

describe('isPodmanDesktopServiceAlive', () => {
  beforeAll(() => {
    contributionManager = new TestContributionManager(apiSender, directories, containerProviderRegistry, exec);
  });

  test('is Alive with JSON array', async () => {
    const items = [
      {
        Service: 'podman-desktop-socket',
        State: 'running',
      },
      {
        Service: 'my-app',
        State: 'running',
      },
    ];

    const execSpy = vi
      .spyOn(contributionManager, 'execComposeCommand')
      .mockResolvedValue({ stdout: JSON.stringify(items) } as any);

    const isAlive = await contributionManager.isPodmanDesktopServiceAlive('/fake/directory', 'my-project');
    expect(execSpy).toBeCalledWith('/fake/directory', ['-p', 'my-project', 'ps', '--format', 'json']);
    expect(isAlive).toBeTruthy();
  });

  test('is Alive with JSON newline object (docker compose v2.21+)', async () => {
    const item1 = {
      Service: 'podman-desktop-socket',
      State: 'running',
    };
    const item2 = {
      Service: 'my-app',
      State: 'running',
    };

    const fullString = JSON.stringify(item1) + '\n' + JSON.stringify(item2);

    const execSpy = vi
      .spyOn(contributionManager, 'execComposeCommand')
      .mockResolvedValue({ stdout: fullString } as any);

    const isAlive = await contributionManager.isPodmanDesktopServiceAlive('/fake/directory', 'my-project');
    expect(execSpy).toBeCalledWith('/fake/directory', ['-p', 'my-project', 'ps', '--format', 'json']);
    expect(isAlive).toBeTruthy();
  });

  test('is not alive', async () => {
    const items = [
      {
        Service: 'podman-desktop-socket',
        State: 'unknown',
      },
      {
        Service: 'my-app',
        State: 'running',
      },
    ];

    const execSpy = vi
      .spyOn(contributionManager, 'execComposeCommand')
      .mockResolvedValue({ stdout: JSON.stringify(items) } as any);

    const isAlive = await contributionManager.isPodmanDesktopServiceAlive('/fake/directory', 'my-project');
    expect(execSpy).toBeCalledWith('/fake/directory', ['-p', 'my-project', 'ps', '--format', 'json']);
    expect(isAlive).toBeFalsy();
  });

  test('JSON output corrupted', async () => {
    vi.spyOn(contributionManager, 'execComposeCommand').mockResolvedValue({ stdout: 'hello' } as any);

    await expect(contributionManager.isPodmanDesktopServiceAlive('/fake/directory', 'my-project')).rejects.toThrow(
      'unable to parse the result of the ps command',
    );
  });

  test('service is missing', async () => {
    const items = [
      {
        Service: 'my-app',
        State: 'running',
      },
    ];

    vi.spyOn(contributionManager, 'execComposeCommand').mockResolvedValue({ stdout: JSON.stringify(items) } as any);

    await expect(contributionManager.isPodmanDesktopServiceAlive('/fake/directory', 'my-project')).rejects.toThrow(
      'unable to find the podman-desktop-socket service in the ps command',
    );
  });
});

describe('waitForRunningState', () => {
  beforeAll(() => {
    contributionManager = new TestContributionManager(apiSender, directories, containerProviderRegistry, exec);
  });

  test('should work after few times', async () => {
    // resolve true after 4 calls
    const spyIsAlive = vi
      .spyOn(contributionManager, 'isPodmanDesktopServiceAlive')
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await contributionManager.waitForRunningState('/fake/directory', 'my-project');

    // check we have called 5 times the method isAlive
    expect(spyIsAlive).toBeCalledTimes(5);
  });

  test('should abort due to long wait', async () => {
    // resolve always false
    vi.spyOn(contributionManager, 'isPodmanDesktopServiceAlive').mockResolvedValue(false);

    await expect(contributionManager.waitForRunningState('/fake/directory', 'my-project', 2500)).rejects.toThrow(
      'The podman-desktop-socket service is not running after',
    );
  });
});

test('execComposeCommand on a non-Windows OS', async () => {
  vi.spyOn(contributionManager, 'findComposeBinary').mockResolvedValue('/my/compose');

  // create tuple
  const tuple = [
    {
      endpoint: {
        socketPath: '/my/socket',
      },
    },
    'arg2',
  ];

  getFirstRunningConnectionMock.mockReturnValue(tuple);

  // mock exec
  vi.spyOn(exec, 'exec').mockResolvedValue({} as RunResult);

  vi.spyOn(util, 'isWindows').mockImplementation(() => false);

  // call
  await contributionManager.execComposeCommand('/fake/directory', ['arg1', 'arg2']);

  // check
  expect(exec.exec).toBeCalledWith(
    '/my/compose',
    ['arg1', 'arg2'],
    expect.objectContaining({ env: { DOCKER_HOST: 'unix:///my/socket' }, cwd: '/fake/directory' }),
  );
});

test('execComposeCommand on a Windows OS', async () => {
  vi.spyOn(contributionManager, 'findComposeBinary').mockResolvedValue('/my/compose');

  // create tuple
  const tuple = [
    {
      endpoint: {
        socketPath: '\\\\.\\pipe\\socket',
      },
    },
    'arg2',
  ];

  getFirstRunningConnectionMock.mockReturnValue(tuple);

  // mock exec
  vi.spyOn(exec, 'exec').mockResolvedValue({} as RunResult);

  vi.spyOn(util, 'isWindows').mockImplementation(() => true);

  // call
  await contributionManager.execComposeCommand('/fake/directory', ['arg1', 'arg2']);

  // check
  expect(exec.exec).toBeCalledWith(
    '/my/compose',
    ['arg1', 'arg2'],
    expect.objectContaining({ env: { DOCKER_HOST: 'npipe:////./pipe/socket' }, cwd: '/fake/directory' }),
  );
});

test('delete extension', async () => {
  const contrib1 = {
    extensionId: 'contrib1',
    vmCustomizedComposeFile: '/path/to/compose-contrib1.yaml',
  } as ContributionInfo;
  const contrib2 = {
    extensionId: 'contrib3',
  } as ContributionInfo;

  contributionManager.addContribution(contrib1);
  contributionManager.addContribution(contrib2);

  const execComposeCommand = vi.spyOn(contributionManager, 'execComposeCommand').mockResolvedValue({} as any);

  const initCommand = vi.spyOn(contributionManager, 'init').mockResolvedValue({} as any);

  // flag the extension as started
  contributionManager.setStartedContribution('contrib1', true);

  await contributionManager.deleteExtension('contrib1');

  // should have deleted the extension as being started
  expect(contributionManager.hasStartedContribution('contrib1')).toBeFalsy();
  expect(initCommand).toBeCalled();
  expect(execComposeCommand).toBeCalledWith('/path/to', ['-p', 'podman-desktop-ext-contrib1', 'down']);
});

test('init', async () => {
  vi.mock('node:fs');

  // mock existsSync as always returning true
  vi.mocked(fs.existsSync).mockReturnValue(true);

  vi.spyOn(contributionManager, 'loadMetadata').mockResolvedValueOnce({
    name: 'contrib1',
    version: '1.0.0',
    publisher: 'aquasec',
    description: 'Analyze image',
    ui: {
      'dashboard-tab': {
        title: 'Trivy',
        root: '/ui',
        src: 'index.html',
        backend: {
          socket: 'plugin-trivy.sock',
        },
      },
    },
  });

  vi.spyOn(contributionManager, 'loadMetadata').mockResolvedValueOnce({
    name: 'contrib2',
    ui: {
      'dashboard-tab': {
        title: 'OpenShift',
        root: '/ui',
        src: 'index.html',
      },
    },
  });

  vi.spyOn(contributionManager, 'startVMs').mockResolvedValue(undefined);

  vi.spyOn(contributionManager, 'loadBase64Icon').mockResolvedValue('icon');

  vi.mocked(fs.promises.readdir).mockResolvedValue([
    { isDirectory: () => true, name: 'contrib1' } as fs.Dirent,
    { isDirectory: () => true, name: 'contrib2' } as fs.Dirent,
  ]);

  // initialize the contribution manager
  await contributionManager.init();

  // now list contributions
  const contributions = contributionManager.listContributions();

  // should have 2
  expect(contributions.length).toBe(2);

  const openshiftExt = contributions.find(c => c.name === 'OpenShift');
  expect(openshiftExt).toBeDefined();

  const trivyExt = contributions.find(c => c.name === 'Trivy');
  expect(trivyExt).toBeDefined();

  expect(openshiftExt?.id).toBe('dashboard-tab');
  expect(openshiftExt?.version).toBe('');
  expect(openshiftExt?.publisher).toBe('');
  expect(openshiftExt?.description).toBe('');

  expect(trivyExt?.id).toBe('dashboard-tab');
  expect(trivyExt?.version).toBe('1.0.0');
  expect(trivyExt?.publisher).toBe('aquasec');
  expect(trivyExt?.description).toBe('Analyze image');
});
