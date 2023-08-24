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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';
import { test, vi, type Mock, beforeAll, describe, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { runImageInfo } from '../../stores/run-image-store';
import RunImage from '/@/lib/image/RunImage.svelte';
import type { ImageInspectInfo } from '../../../../main/src/plugin/api/image-inspect-info';
import { mockBreadcrumb } from '../../stores/breadcrumb';
import userEvent from '@testing-library/user-event';

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
  (window as any).createAndStartContainer = vi.fn();

  mockBreadcrumb();
});

async function waitRender() {
  const result = render(RunImage);

  //wait until dataReady is true
  while (result.component.$$.ctx[29] !== true) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return result;
}

async function createRunImage(entrypoint?: string | string[], cmd?: string[]) {
  runImageInfo.set({
    age: '',
    base64RepoTag: '',
    createdAt: 0,
    engineId: '',
    engineName: '',
    humanSize: '',
    id: '',
    inUse: false,
    name: '',
    selected: false,
    shortId: '',
    tag: '',
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
      Cmd: cmd,
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

    const entryPoint = screen.getByRole('textbox', { name: 'Entrypoint:' });
    expect(entryPoint).toBeInTheDocument();
    expect((entryPoint as HTMLInputElement).value).toBe('entrypoint');
  });

  test('Expect that single element array entrypoint is displayed', async () => {
    await createRunImage(['entrypoint'], []);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const entryPoint = screen.getByRole('textbox', { name: 'Entrypoint:' });
    expect(entryPoint).toBeInTheDocument();
    expect((entryPoint as HTMLInputElement).value).toBe('entrypoint');
  });

  test('Expect that two elements array entrypoint is displayed', async () => {
    await createRunImage(['entrypoint1', 'entrypoint2'], []);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const entryPoint = screen.getByRole('textbox', { name: 'Entrypoint:' });
    expect(entryPoint).toBeInTheDocument();
    expect((entryPoint as HTMLInputElement).value).toBe('entrypoint1 entrypoint2');
  });

  test('Expect that single element array command is displayed', async () => {
    await createRunImage([], ['command']);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const command = screen.getByRole('textbox', { name: 'Command:' });
    expect(command).toBeInTheDocument();
    expect((command as HTMLInputElement).value).toBe('command');
  });

  test('Expect that two elements array command is displayed', async () => {
    await createRunImage([], ['command1', 'command2']);

    const link = screen.getByRole('link', { name: 'Basic' });

    await fireEvent.click(link);

    const entryPoint = screen.getByRole('textbox', { name: 'Command:' });
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
    await createRunImage(undefined, ['command1', 'command2']);

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

    const button = screen.getByRole('button', { name: 'Start Container' });

    await fireEvent.click(button);

    const errorComponent = screen.getByLabelText('createError');
    expect(errorComponent.textContent.trim()).toBe(
      'Error: host and container port ranges (9000-9001:9000-9003) have different lengths: 2 vs 4',
    );
  });
});
