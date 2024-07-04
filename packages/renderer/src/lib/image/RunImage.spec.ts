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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { router } from 'tinro';
import { afterEach, beforeAll, beforeEach, describe, expect, type Mock, test, vi } from 'vitest';

import RunImage from '/@/lib/image/RunImage.svelte';
import type { ImageInspectInfo } from '/@api/image-inspect-info';

import { mockBreadcrumb } from '../../stores/breadcrumb.spec';
import { runImageInfo } from '../../stores/run-image-store';
import ImageIcon from '../images/ImageIcon.svelte';

const originalConsoleDebug = console.debug;

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).getImageInspect = vi.fn();
  (window as any).listNetworks = vi.fn().mockResolvedValue([]);
  (window as any).listContainers = vi.fn().mockResolvedValue([]);
  (window as any).createAndStartContainer = vi.fn().mockResolvedValue({ id: '1234' });
  (window as any).getFreePort = vi.fn();
  (window as any).isFreePort = vi.fn();

  mockBreadcrumb();
});

beforeEach(() => {
  console.error = vi.fn();
  vi.clearAllMocks();
});

afterEach(() => {
  console.error = originalConsoleDebug;
});

async function waitRender() {
  const result = render(RunImage);
  await tick();
  await tick();
  return result;
}

async function createRunImage(entrypoint?: string | string[], cmd?: string[]) {
  runImageInfo.set({
    age: '',
    base64RepoTag: '',
    createdAt: 0,
    engineId: '',
    engineName: '',
    size: 0,
    humanSize: '',
    id: '',
    status: 'UNUSED',
    name: '',
    selected: false,
    shortId: '',
    tag: '',
    icon: ImageIcon,
    badges: [],
    digest: 'sha256:1234567890',
  });
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

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint'] }),
    );
  });

  test('Expect that single array entrypoint is sent to API', async () => {
    await createRunImage(['entrypoint'], []);

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint'] }),
    );
  });

  test('Expect that single array entrypoint with space is sent to API', async () => {
    await createRunImage(['entrypoint with space'], []);

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint with space'] }),
    );
  });

  test('Expect that two elements array entrypoint is sent to API', async () => {
    await createRunImage(['entrypoint1', 'entrypoint2'], []);

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint1', 'entrypoint2'] }),
    );
  });

  test('Expect that image without cmd is sent to API', async () => {
    await createRunImage(['entrypoint1', 'entrypoint2'], undefined);

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Entrypoint: ['entrypoint1', 'entrypoint2'] }),
    );
  });

  test('Expect that single array command is sent to API', async () => {
    await createRunImage([], ['command']);

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Cmd: ['command'] }),
    );
  });

  test('Expect that single array command with space is sent to API', async () => {
    await createRunImage([], ['command with space']);

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Cmd: ['command with space'] }),
    );
  });
  test('Expect that two elements array command is sent to API', async () => {
    await createRunImage([], ['command1', 'command2']);

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Cmd: ['command1', 'command2'] }),
    );
  });

  test('Expect that image without entrypoint is sent to API', async () => {
    await createRunImage(undefined, ['command1', 'command2']);

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ Cmd: ['command1', 'command2'] }),
    );
  });

  test('Expect to see an error if the container/host ranges have different size', async () => {
    (window.isFreePort as Mock).mockResolvedValue(true);
    router.goto('/basic');

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

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    const errorComponent = screen.getByLabelText('createError');
    expect(errorComponent.textContent?.trim()).toBe(
      'Error: host and container port ranges (9000-9001:9000-9003) have different lengths: 2 vs 4',
    );
  });

  test('Expect that container is created and redirected to tty page', async () => {
    const gotoSpy = vi.spyOn(router, 'goto');

    await createRunImage('entrypoint', []);

    const link = screen.getByRole('button', { name: 'Start Container' });

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

    const link = screen.getByRole('button', { name: 'Start Container' });

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

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    // should have item 1 and item 3 as we deleted item 2
    expect(window.createAndStartContainer).toHaveBeenCalledWith(
      'engineid',
      expect.objectContaining({ EnvFiles: [customEnvFile, 'foo3'] }),
    );
  });

  test('Expect "start container" button to be disabled when port is not free', async () => {
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

    const button = screen.getByRole('button', { name: 'Start Container' });
    expect((button as HTMLButtonElement).disabled).toBeTruthy();
  });
});
