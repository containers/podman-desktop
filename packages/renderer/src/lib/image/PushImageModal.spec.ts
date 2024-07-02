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

import '@testing-library/jest-dom/vitest';

import { fireEvent } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, expect, type Mock, test, vi } from 'vitest';

import type { ImageInspectInfo } from '/@api/image-inspect-info';

import type { ImageInfoUI } from './ImageInfoUI';
import PushImageModal from './PushImageModal.svelte';

vi.mock('xterm', () => {
  return {
    Terminal: vi
      .fn()
      .mockReturnValue({ loadAddon: vi.fn(), open: vi.fn(), write: vi.fn(), clear: vi.fn(), reset: vi.fn() }),
  };
});

const getConfigurationValueMock = vi.fn();
const hasAuthMock = vi.fn();
const pushImageMock = vi.fn();

beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).ResizeObserver = vi.fn().mockReturnValue({ observe: vi.fn(), unobserve: vi.fn() });
  (window as any).getImageInspect = vi.fn().mockImplementation(() => Promise.resolve({}));
  (window as any).logsContainer = vi.fn().mockResolvedValue(undefined);
  (window as any).refreshTerminal = vi.fn();
  (window as any).getConfigurationValue = getConfigurationValueMock;
  (window as any).hasAuthconfigForImage = hasAuthMock;
  (window as any).showMessageBox = vi.fn();
  (window as any).pushImage = pushImageMock;
});

// fake ImageInfoUI
const fakedImage: ImageInfoUI = {
  id: 'id',
  shortId: 'shortId',
  name: 'name',
  engineId: 'engineId',
  engineName: 'engineName',
  tag: 'tag',
  createdAt: 0,
  age: 'age',
  size: 0,
  humanSize: 'humanSize',
  base64RepoTag: 'base64RepoTag',
  selected: false,
  status: 'UNUSED',
  icon: {},
  badges: [],
  digest: 'sha256:1234567890',
};
const fakedImageInspect: ImageInspectInfo = {
  Architecture: '',
  Author: '',
  Comment: '',
  Config: {
    ArgsEscaped: false,
    AttachStderr: false,
    AttachStdin: false,
    AttachStdout: false,
    Cmd: [],
    Domainname: '',
    Entrypoint: [],
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

async function waitRender(customProperties: object): Promise<void> {
  render(PushImageModal, { ...customProperties });
  await tick();
}

test('Expect "Push Image" button to be disabled if window.hasAuthconfigForImage returns false', async () => {
  hasAuthMock.mockImplementation(() => {
    return new Promise(() => false);
  });
  (window.getImageInspect as Mock).mockResolvedValue(fakedImageInspect);

  await waitRender({
    imageInfoToPush: fakedImage,
    closeCallback: vi.fn(),
  });

  // Get the push button
  const pushButton = screen.getByRole('button', { name: 'Push image' });
  expect(pushButton).toBeInTheDocument();
  expect(pushButton).toBeDisabled();
});

test('Expect "Push Image" button to actually be clickable if window.hasAuthconfigForImage is true', async () => {
  hasAuthMock.mockImplementation(() => {
    return new Promise(() => true);
  });
  (window.getImageInspect as Mock).mockResolvedValue(fakedImageInspect);

  await waitRender({
    imageInfoToPush: fakedImage,
    closeCallback: vi.fn(),
  });

  // Get the push button
  const pushButton = screen.getByRole('button', { name: 'Push image' });
  expect(pushButton).toBeInTheDocument();

  // Actually able to click it
  fireEvent.click(pushButton);
});
