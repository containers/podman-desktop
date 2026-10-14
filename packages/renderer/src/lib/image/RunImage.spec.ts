/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import type { ImageInspectInfo, SecretInfo } from '@desktop-framework/api';
import type { ImageInfo } from '@desktop-framework/extension-api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { router } from 'tinro';
import { afterEach, beforeAll, beforeEach, describe, expect, type Mock, test, vi } from 'vitest';

import type { ContainerInfoUI } from '/@/lib/container/ContainerInfoUI';
import RunImage from '/@/lib/image/RunImage.svelte';
import type { VolumeInfoUI } from '/@/lib/volume/VolumeInfoUI';
import { mockBreadcrumb } from '/@/stores/breadcrumb.spec';
import { containersInfos } from '/@/stores/containers';
import { imagesInfos } from '/@/stores/images';
import { secretsInfo } from '/@/stores/secrets';
import { volumeListInfos } from '/@/stores/volumes';

const originalConsoleDebug = console.debug;

const MY_IMAGE = {
  engineId: 'podman',
  engineType: 'podman',
  Id: 'sha256:5555',
  Size: 0,
} as unknown as ImageInfo;

// fake the window.events object
beforeAll(() => {
  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });
  vi.mocked(window.listNetworks).mockResolvedValue([]);
  vi.mocked(window.listContainers).mockResolvedValue([]);
  vi.mocked(window.listVolumes).mockResolvedValue([]);
  vi.mocked(window.createAndStartContainer).mockResolvedValue({ id: '1234' });

  mockBreadcrumb();
});

beforeEach(() => {
  console.error = vi.fn();
  vi.clearAllMocks();
  secretsInfo.set([]);
  volumeListInfos.set([]);
  router.goto('/basic');
});

afterEach(() => {
  console.error = originalConsoleDebug;
  vi.useRealTimers();
});

async function waitRender(): Promise<void> {
  render(RunImage, {
    engineId: MY_IMAGE.engineId,
    imageID: MY_IMAGE.Id,
    base64RepoTag: btoa('<none>'),
  });
  await tick();
  await tick();
}

async function createRunImage(entrypoint?: string | string[], cmd?: string[]): Promise<void> {
  imagesInfos.set([MY_IMAGE]);
  const imageInfo: ImageInspectInfo = {
    Architecture: '',
    Author: '',
    Comment: '',
    Config: {
      ArgsEscaped: false,
      AttachStderr: false,
      AttachStdin: false,
      AttachStdout: false,
      Cmd: cmd ?? [],
      Domainname: '',
      Entrypoint: entrypoint,
      Env: [],
      ExposedPorts: {},
      Hostname: '',
      Image: '',
      Labels: {},
      OnBuild: [],
      OpenStdin: false,
      StdinOnce: false,
      Tty: false,
      User: '',
      Volumes: {},
      WorkingDir: '',
    },
    Container: '',
    ContainerConfig: {
      ArgsEscaped: false,
      AttachStderr: false,
      AttachStdin: false,
      AttachStdout: false,
      Cmd: [],
      Domainname: '',
      Env: [],
      ExposedPorts: {},
      Hostname: '',
      Image: '',
      Labels: {},
      OpenStdin: false,
      StdinOnce: false,
      Tty: false,
      User: '',
      Volumes: {},
      WorkingDir: '',
    },
    Created: '',
    DockerVersion: '',
    GraphDriver: { Data: { DeviceId: '', DeviceName: '', DeviceSize: '' }, Name: '' },
    Id: '',
    Os: '',
    Parent: '',
    RepoDigests: [],
    RepoTags: [],
    RootFS: {
      Type: '',
    },
    Size: 0,
    VirtualSize: 0,
    engineId: 'engineid',
    engineName: 'engineName',
    engineType: 'podman',
  };
  (window.getImageInspect as Mock).mockResolvedValue(imageInfo);
  await waitRender();
}

describe('RunImage', () => {
  test('Expect that entrypoint is displayed', async () => {
    await createRunImage('entrypoint', []);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const entryPoint = screen.getByRole('textbox', { name: 'Entrypoint' });
    expect(entryPoint).toBeInTheDocument();
    expect((entryPoint as HTMLInputElement).value).toBe('entrypoint');
  });

  test('Expect that single element array entrypoint is displayed', async () => {
    await createRunImage(['entrypoint'], []);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const entryPoint = screen.getByRole('textbox', { name: 'Entrypoint' });
    expect(entryPoint).toBeInTheDocument();
    expect((entryPoint as HTMLInputElement).value).toBe('entrypoint');
  });

  test('Expect that two elements array entrypoint is displayed', async () => {
    await createRunImage(['entrypoint1', 'entrypoint2'], []);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const entryPoint = screen.getByRole('textbox', { name: 'Entrypoint' });
    expect(entryPoint).toBeInTheDocument();
    expect((entryPoint as HTMLInputElement).value).toBe('entrypoint1 entrypoint2');
  });

  test('Expect that single element array command is displayed', async () => {
    await createRunImage([], ['command']);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const command = screen.getByRole('textbox', { name: 'Command' });
    expect(command).toBeInTheDocument();
    expect((command as HTMLInputElement).value).toBe('command');
  });

  test('Expect that two elements array command is displayed', async () => {
    await createRunImage([], ['command1', 'command2']);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const entryPoint = screen.getByRole('textbox', { name: 'Command' });
    expect(entryPoint).toBeInTheDocument();
    expect((entryPoint as HTMLInputElement).value).toBe('command1 command2');
  });

  test('Expect that entrypoint is sent to API', async () => {
    await createRunImage('entrypoint', []);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint'] }),
    );
  });

  test('Expect that single array entrypoint is sent to API', async () => {
    await createRunImage(['entrypoint'], []);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint'] }),
    );
  });

  test('Expect that single array entrypoint with space is sent to API', async () => {
    await createRunImage(['entrypoint with space'], []);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint with space'] }),
    );
  });

  test('Expect that two elements array entrypoint is sent to API', async () => {
    await createRunImage(['entrypoint1', 'entrypoint2'], []);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint1', 'entrypoint2'] }),
    );
  });

  test('Expect that image without cmd is sent to API', async () => {
    await createRunImage(['entrypoint1', 'entrypoint2']);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint1', 'entrypoint2'] }),
    );
  });

  test('Expect that single array command is sent to API', async () => {
    await createRunImage([], ['command']);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Cmd: ['command'] }),
    );
  });

  test('Expect that single array command with space is sent to API', async () => {
    await createRunImage([], ['command with space']);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Cmd: ['command with space'] }),
    );
  });
  test('Expect that two elements array command is sent to API', async () => {
    await createRunImage([], ['command1', 'command2']);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Cmd: ['command1', 'command2'] }),
    );
  });

  test('Expect that image without entrypoint is sent to API', async () => {
    await createRunImage(undefined, ['command1', 'command2']);

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Cmd: ['command1', 'command2'] }),
    );
  });

  test('Expect to see an error if the container/host ranges have different size', async () => {
    (window.isFreePort as Mock).mockResolvedValue(true);

    await createRunImage(undefined, ['command1', 'command2']);

    const link1 = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link1);

    const customMappingButton = screen.getByRole('button', { name: 'Add custom port mapping' });
    await fireEvent.click(customMappingButton);

    const hostInput = screen.getByLabelText('host port');
    await userEvent.click(hostInput);
    await userEvent.clear(hostInput);
    await userEvent.keyboard('9000-9001');

    const containerInput = screen.getByLabelText('container port');
    await userEvent.click(containerInput);
    await userEvent.clear(containerInput);
    await userEvent.keyboard('9000-9003');

    // wait onPortInputTimeout (500ms) triggers
    await new Promise(resolve => setTimeout(resolve, 600));

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    const errorComponent = screen.getByLabelText('createError');
    expect(errorComponent.textContent?.trim()).toBe(
      'Error: host and container port ranges (9000-9001:9000-9003) have different lengths: 2 vs 4',
    );
  });

  test('Expect that container is created and redirected to tty page', async () => {
    const gotoSpy = vi.spyOn(router, 'goto');

    await createRunImage('entrypoint', []);

    const link = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(link);

    // wait few time
    await new Promise(resolve => setTimeout(resolve, 200));

    // expect to be redirected to tty page
    expect(gotoSpy).toHaveBeenCalledWith('/containers/1234/tty');
  });

  test('Expect that container is created and redirected to containers page', async () => {
    const gotoSpy = vi.spyOn(router, 'goto');

    router.goto('/advanced');

    await createRunImage('', []);

    const link1 = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link1);

    // select another tab
    const advancedTab = screen.getByRole('link', { name: 'Advanced' });
    await fireEvent.click(advancedTab);

    // wait
    await new Promise(resolve => setTimeout(resolve, 150));

    // remove the tty and openStdin checkboxes

    // uncheck tty box Attach a pseudo terminal
    const ttyCheckbox = screen.getByRole('checkbox', { name: 'Attach a pseudo terminal' });
    await fireEvent.click(ttyCheckbox);

    // uncheck openStdin box Keep STDIN open even if not attached
    const openStdinCheckbox = screen.getByRole('checkbox', { name: 'Use interactive' });
    await fireEvent.click(openStdinCheckbox);

    const link = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(link);

    // wait few time
    await new Promise(resolve => setTimeout(resolve, 200));

    // expect to be redirected to containers page as there is no tty
    expect(gotoSpy).toHaveBeenCalledWith('/containers');
  });

  test('Expect able to play with environment files', async () => {
    await createRunImage('', []);

    const link1 = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link1);

    // set the input field for the path
    const envFileInput = screen.getByRole('textbox', { name: 'environmentFile.0' });

    // remove readonly flag
    envFileInput.removeAttribute('readonly');
    const customEnvFile = '/my/custom-env-file';
    // set the value
    await userEvent.type(envFileInput, customEnvFile);

    // add a new element
    const addEnvFileButton = screen.getByRole('button', { name: 'Add env file after index 0' });
    await fireEvent.click(addEnvFileButton);

    // again (should be 3 now)
    await fireEvent.click(addEnvFileButton);

    // now set the input for fields 2 and 3
    const envFileInput2 = screen.getByRole('textbox', { name: 'environmentFile.1' });
    envFileInput2.removeAttribute('readonly');
    await userEvent.type(envFileInput2, 'foo2');

    const envFileInput3 = screen.getByRole('textbox', { name: 'environmentFile.2' });
    envFileInput3.removeAttribute('readonly');
    await userEvent.type(envFileInput3, 'foo3');

    // delete the entry 2
    const deleteEnvFileButton = screen.getByRole('button', { name: 'Delete env file at index 1' });
    await fireEvent.click(deleteEnvFileButton);

    // now click on start

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    // should have item 1 and item 3 as we deleted item 2
    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ EnvFiles: [customEnvFile, 'foo3'] }),
    );
  });

  test('Expect error to be visible if isFreePort is not free', async () => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
    });

    vi.mocked(window.isFreePort).mockRejectedValue(new Error('Port 8080 is already in use.'));
    router.goto('/basic');

    await createRunImage(undefined, ['command1', 'command2']);

    const customMappingButton = screen.getByRole('button', { name: 'Add custom port mapping' });
    await fireEvent.click(customMappingButton);

    const hostInput = screen.getByLabelText('host port');
    await userEvent.click(hostInput);
    await userEvent.clear(hostInput);
    await userEvent.keyboard('8080');

    const containerInput = screen.getByLabelText('container port');
    await userEvent.click(containerInput);
    await userEvent.clear(containerInput);
    await userEvent.keyboard('8080');

    // wait for debounce
    await vi.advanceTimersByTimeAsync(800);

    const error = await vi.waitFor(() => {
      return screen.getByText('Port 8080 is already in use.');
    });
    expect(error).toBeInTheDocument();
  });

  test('Expect "Create and start" button to be disabled when port is not free', async () => {
    (window.isFreePort as Mock).mockRejectedValue(new Error('Error Message'));
    router.goto('/basic');

    await createRunImage(undefined, ['command1', 'command2']);

    const link1 = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link1);

    const customMappingButton = screen.getByRole('button', { name: 'Add custom port mapping' });
    await fireEvent.click(customMappingButton);

    const hostInput = screen.getByLabelText('host port');
    await userEvent.click(hostInput);
    await userEvent.clear(hostInput);
    // adds a negative port
    await userEvent.keyboard('8080');

    const containerInput = screen.getByLabelText('container port');
    await userEvent.click(containerInput);
    await userEvent.clear(containerInput);
    await userEvent.keyboard('80');

    // wait onPortInputTimeout (500ms) triggers
    await new Promise(resolve => setTimeout(resolve, 600));

    const button = screen.getByRole('button', { name: 'Create and start' });
    await tick();
    expect((button as HTMLButtonElement).disabled).toBeTruthy();
  });

  test('Expect "Add secret mapping" button to be disabled when no secrets available', async () => {
    secretsInfo.set([]);
    await createRunImage('', []);

    const link = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link);

    const addButton = screen.getByRole('button', { name: 'Add secret mapping' });
    expect(addButton).toBeDisabled();
  });

  test('Expect "Add secret mapping" button to be enabled when secrets are available', async () => {
    secretsInfo.set([
      { engineId: 'engineid', engineName: 'podman', engineType: 'podman', Id: 's1', Name: 'my-secret' } as SecretInfo,
    ]);
    await createRunImage('', []);

    const link = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link);

    const addButton = screen.getByRole('button', { name: 'Add secret mapping' });
    expect(addButton).toBeEnabled();
  });

  test('Expect mount secret mapping to be sent to API as Secrets', async () => {
    secretsInfo.set([
      { engineId: 'engineid', engineName: 'podman', engineType: 'podman', Id: 's1', Name: 'my-secret' } as SecretInfo,
    ]);
    await createRunImage('', []);

    const link = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link);

    const addButton = screen.getByRole('button', { name: 'Add secret mapping' });
    await fireEvent.click(addButton);

    const targetInputs = screen.getAllByPlaceholderText('Path inside the container');
    const targetInput = targetInputs[targetInputs.length - 1]!;
    await userEvent.clear(targetInput);
    await userEvent.type(targetInput, '/run/secrets/my-secret');

    const button = screen.getByRole('button', { name: 'Create and start' });
    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({
        Secrets: [{ Source: 'my-secret', Target: '/run/secrets/my-secret' }],
        SecretEnv: {},
      }),
    );
  });

  test('Expect env secret mapping to be sent to API as SecretEnv', async () => {
    secretsInfo.set([
      { engineId: 'engineid', engineName: 'podman', engineType: 'podman', Id: 's1', Name: 'foo-data' } as SecretInfo,
    ]);
    await createRunImage('', []);

    const link = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link);

    const addButton = screen.getByRole('button', { name: 'Add secret mapping' });
    await fireEvent.click(addButton);

    // change type to env via keyboard navigation
    const typeDropdown = screen.getByRole('button', { name: 'Mount' });
    typeDropdown.focus();
    await userEvent.keyboard('[ArrowDown]');
    await userEvent.keyboard('[ArrowDown]');
    await userEvent.keyboard('[Enter]');

    const targetInput = screen.getByPlaceholderText('Name of the environment variable');
    await userEvent.clear(targetInput);
    await userEvent.type(targetInput, 'FOO_SECRET');

    const button = screen.getByRole('button', { name: 'Create and start' });
    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({
        Secrets: [],
        SecretEnv: { FOO_SECRET: 'foo-data' },
      }),
    );
  });

  test('Expect secret mapping to be removed when clicking remove button', async () => {
    secretsInfo.set([
      { engineId: 'engineid', engineName: 'podman', engineType: 'podman', Id: 's1', Name: 'my-secret' } as SecretInfo,
    ]);
    await createRunImage('', []);

    const link = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link);

    const addButton = screen.getByRole('button', { name: 'Add secret mapping' });
    await fireEvent.click(addButton);

    const removeButton = screen.getByRole('button', { name: 'Remove secret' });
    await fireEvent.click(removeButton);

    const button = screen.getByRole('button', { name: 'Create and start' });
    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({
        Secrets: [],
        SecretEnv: {},
      }),
    );
  });

  test('Expect able to play with devices', async () => {
    await createRunImage('', []);

    const link1 = screen.getByRole('link', { name: 'Advanced' });
    await fireEvent.click(link1);

    // set the input field for the path
    const deviceHostInput = screen.getByRole('textbox', { name: 'device.host.0' });

    // set the value
    await userEvent.type(deviceHostInput, '/dev/tty0');

    // add a new element
    const addDeviceButton = screen.getByRole('button', { name: 'Add device after index 0' });
    await fireEvent.click(addDeviceButton);

    // again (should be 3 now)
    await fireEvent.click(addDeviceButton);

    // now set the input for fields 2 and 3
    const deviceHostInput2 = screen.getByRole('textbox', { name: 'device.host.1' });
    await userEvent.type(deviceHostInput2, '/dev/tty1');

    const deviceHostInput3 = screen.getByRole('textbox', { name: 'device.host.2' });
    await userEvent.type(deviceHostInput3, '/dev/tty2');
    const deviceContainerInput3 = screen.getByRole('textbox', { name: 'device.container.2' });
    await userEvent.type(deviceContainerInput3, '/dev/ttyOnContainer2');

    // delete the entry 2
    const deleteDeviceButton = screen.getByRole('button', { name: 'Delete device at index 1' });
    await fireEvent.click(deleteDeviceButton);

    // now click on start

    const button = screen.getByRole('button', { name: 'Create and start' });

    await fireEvent.click(button);

    // should have item 1 and item 3 as we deleted item 2
    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({
        HostConfig: expect.objectContaining({
          Devices: [
            {
              CgroupPermissions: 'rwm',
              PathOnHost: '/dev/tty0',
              PathInContainer: '/dev/tty0',
            },
            {
              CgroupPermissions: 'rwm',
              PathOnHost: '/dev/tty2',
              PathInContainer: '/dev/ttyOnContainer2',
            },
          ],
        }),
      }),
    );
  });

  test('Expect "Create" button calls createAndStartContainer with start false', async () => {
    const gotoSpy = vi.spyOn(router, 'goto');

    await createRunImage('entrypoint', []);

    const button = screen.getByRole('button', { name: 'Create' });

    await fireEvent.click(button);

    await new Promise(resolve => setTimeout(resolve, 200));

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint'], start: false }),
    );
    expect(gotoSpy).toHaveBeenCalledWith('/containers/1234/summary');
  });

  test('Expect "Create" button to be disabled when invalidFields is true', async () => {
    vi.mocked(window.isFreePort).mockRejectedValue(new Error('Error Message'));
    router.goto('/basic');

    await createRunImage(undefined, ['command1', 'command2']);

    const link1 = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(link1);

    const customMappingButton = screen.getByRole('button', { name: 'Add custom port mapping' });
    await fireEvent.click(customMappingButton);

    const hostInput = screen.getByLabelText('host port');
    await userEvent.click(hostInput);
    await userEvent.clear(hostInput);
    await userEvent.keyboard('8080');

    const containerInput = screen.getByLabelText('container port');
    await userEvent.click(containerInput);
    await userEvent.clear(containerInput);
    await userEvent.keyboard('80');

    await new Promise(resolve => setTimeout(resolve, 600));

    const createButton = screen.getByRole('button', { name: 'Create' });
    await tick();
    expect((createButton as HTMLButtonElement).disabled).toBeTruthy();
  });

  test('Expect Cancel button navigates to images page', async () => {
    const gotoSpy = vi.spyOn(router, 'goto');

    await createRunImage('', []);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await fireEvent.click(cancelButton);

    expect(gotoSpy).toHaveBeenCalledWith('/images/');
  });
});

describe('RunImage container name collision', () => {
  test('Expect an error when the name matches one of an existing container aliases', async () => {
    // the store holds ContainerInfoUI, whose `name` is compose-stripped and slash-free.
    // The collision check compares against the raw `/name` form, so it needs `names`.
    containersInfos.set([
      {
        id: 'existing',
        engineId: 'engineid',
        name: 'web-1',
        names: ['/myproject-web-1', '/existing-container'],
      } as unknown as ContainerInfoUI,
    ]);

    await createRunImage(undefined, []);

    const nameInput = screen.getByRole('textbox', { name: 'Container Name' });
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'existing-container');

    await waitFor(() => expect(screen.getByText(/The name existing-container already exists/)).toBeInTheDocument());
  });
});

describe('RunImage volume mounts', () => {
  test('Expect volumes from volumeListInfos store to be filtered by engine and sorted', async () => {
    volumeListInfos.set([
      {
        name: 'volume-b',
        shortName: 'volume-b',
        engineId: 'engineid',
      } as VolumeInfoUI,
      {
        name: 'volume-a',
        shortName: 'volume-a',
        engineId: 'engineid',
      } as VolumeInfoUI,
      {
        name: 'other-engine-volume',
        shortName: 'other-engine-volume',
        engineId: 'other-engine',
      } as VolumeInfoUI,
    ]);

    await createRunImage('', []);

    const basicTab = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(basicTab);

    // Switch source type from Host path to Existing volume
    const sourceTypeDropdown = screen.getByRole('button', { name: 'Host path' });
    await fireEvent.click(sourceTypeDropdown);

    const existingVolumeOption = screen.getByRole('button', { name: 'Existing volume' });
    await fireEvent.click(existingVolumeOption);

    // Open existing volume dropdown
    const volumeDropdown = screen.getByRole('button', { name: 'Select a volume' });
    await fireEvent.click(volumeDropdown);

    expect(screen.getByRole('button', { name: 'volume-a' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'volume-b' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'other-engine-volume' })).not.toBeInTheDocument();
  });

  test('Expect 64-character hash volume names to display shortName but submit full name', async () => {
    const fullHashVolume = 'a1b2c3d4e5f678901234567890abcdef1234567890abcdef1234567890abcdef';
    const shortVolumeName = 'a1b2c3d4e5f6';

    volumeListInfos.set([
      {
        name: fullHashVolume,
        shortName: shortVolumeName,
        engineId: 'engineid',
      } as VolumeInfoUI,
    ]);

    await createRunImage('', []);

    const basicTab = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(basicTab);

    // Switch source type to Existing volume
    const sourceTypeDropdown = screen.getByRole('button', { name: 'Host path' });
    await fireEvent.click(sourceTypeDropdown);
    const existingVolumeOption = screen.getByRole('button', { name: 'Existing volume' });
    await fireEvent.click(existingVolumeOption);

    // Verify option label uses the short name
    const volumeDropdown = screen.getByRole('button', { name: 'Select a volume' });
    await fireEvent.click(volumeDropdown);
    const shortOption = screen.getByRole('button', { name: shortVolumeName });
    await fireEvent.click(shortOption);

    // Set container target
    const targetInput = screen.getByRole('textbox', { name: 'Path inside the container 0' });
    await userEvent.clear(targetInput);
    await userEvent.type(targetInput, '/mnt/hash');

    const createButton = screen.getByRole('button', { name: 'Create and start' });
    await fireEvent.click(createButton);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({
        HostConfig: expect.objectContaining({
          Binds: [`${fullHashVolume}:/mnt/hash`],
        }),
      }),
    );
  });

  test('Expect named volume to be submitted as Binds', async () => {
    volumeListInfos.set([
      {
        name: 'application-data',
        shortName: 'application-data',
        engineId: 'engineid',
      } as VolumeInfoUI,
    ]);

    await createRunImage('', []);

    const basicTab = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(basicTab);

    // Switch source type to Existing volume
    const sourceTypeDropdown = screen.getByRole('button', { name: 'Host path' });
    await fireEvent.click(sourceTypeDropdown);
    const existingVolumeOption = screen.getByRole('button', { name: 'Existing volume' });
    await fireEvent.click(existingVolumeOption);

    // Select application-data
    const volumeDropdown = screen.getByRole('button', { name: 'Select a volume' });
    await fireEvent.click(volumeDropdown);
    const appDataOption = screen.getByRole('button', { name: 'application-data' });
    await fireEvent.click(appDataOption);

    // Set container target
    const targetInput = screen.getByRole('textbox', { name: 'Path inside the container 0' });
    await userEvent.clear(targetInput);
    await userEvent.type(targetInput, '/var/lib/application');

    const createButton = screen.getByRole('button', { name: 'Create and start' });
    await fireEvent.click(createButton);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({
        HostConfig: expect.objectContaining({
          Binds: ['application-data:/var/lib/application'],
        }),
      }),
    );
  });

  test('Expect host path to be submitted and mode switch to clear source', async () => {
    volumeListInfos.set([
      {
        name: 'my-vol',
        shortName: 'my-vol',
        engineId: 'engineid',
      } as VolumeInfoUI,
    ]);

    await createRunImage('', []);

    const basicTab = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(basicTab);

    // Default is Host path
    const hostPathInput = screen.getByRole('textbox', { name: 'Host path 0' });
    await userEvent.type(hostPathInput, '/host/data');

    const targetInput = screen.getByRole('textbox', { name: 'Path inside the container 0' });
    await userEvent.type(targetInput, '/container/data');

    // Switch to Existing volume and verify source was cleared
    const sourceTypeDropdown = screen.getByRole('button', { name: 'Host path' });
    await fireEvent.click(sourceTypeDropdown);
    const existingVolumeOption = screen.getByRole('button', { name: 'Existing volume' });
    await fireEvent.click(existingVolumeOption);

    // Dropdown should be on 'Select a volume' (cleared)
    expect(screen.getByRole('button', { name: 'Select a volume' })).toBeInTheDocument();

    // Switch back to Host path
    const sourceTypeDropdown2 = screen.getByRole('button', { name: 'Existing volume' });
    await fireEvent.click(sourceTypeDropdown2);
    const hostPathOption = screen.getByRole('button', { name: 'Host path' });
    await fireEvent.click(hostPathOption);

    const hostPathInput2 = screen.getByRole('textbox', { name: 'Host path 0' });
    expect((hostPathInput2 as HTMLInputElement).value).toBe('');

    // Fill again and submit as host path
    await userEvent.type(hostPathInput2, '/host/data');

    const createButton = screen.getByRole('button', { name: 'Create and start' });
    await fireEvent.click(createButton);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({
        HostConfig: expect.objectContaining({
          Binds: ['/host/data:/container/data'],
        }),
      }),
    );
  });

  test('Expect incomplete rows to be omitted from container submission', async () => {
    await createRunImage('', []);

    const basicTab = screen.getByRole('link', { name: 'Basic' });
    await fireEvent.click(basicTab);

    // Verify host path works
    const hostPathInput = screen.getByRole('textbox', { name: 'Host path 0' });
    await userEvent.type(hostPathInput, '/valid/host/path');

    const targetInput = screen.getByRole('textbox', { name: 'Path inside the container 0' });
    await userEvent.type(targetInput, '/valid/container/path');

    // Add another row that is incomplete
    const addVolumeButton = screen.getByRole('button', { name: 'Add volume mount after index 0' });
    await fireEvent.click(addVolumeButton);

    // Switch row 1 to Existing volume without selecting a volume
    const sourceTypeDropdowns = screen.getAllByRole('button', { name: 'Host path' });
    await fireEvent.click(sourceTypeDropdowns[1]);
    const existingVolumeOption = screen.getByRole('button', { name: 'Existing volume' });
    await fireEvent.click(existingVolumeOption);

    const createButton = screen.getByRole('button', { name: 'Create and start' });
    await fireEvent.click(createButton);

    // Incomplete row 1 is omitted, only complete row 0 is in Binds
    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({
        HostConfig: expect.objectContaining({
          Binds: ['/valid/host/path:/valid/container/path'],
        }),
      }),
    );
  });
});
