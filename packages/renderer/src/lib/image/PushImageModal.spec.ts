/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { ImageInspectInfo } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { Terminal } from '@xterm/xterm';
import { tick } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { ImageInfoUI } from './ImageInfoUI';
import PushImageModal from './PushImageModal.svelte';

vi.mock(import('@xterm/xterm'));

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });

  vi.mocked(window.getImageInspect).mockRejectedValue({});
  vi.mocked(window.logsContainer).mockResolvedValue(undefined);
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
  arch: '',
  size: 0,
  humanSize: 'humanSize',
  base64RepoTag: 'base64RepoTag',
  selected: false,
  status: 'UNUSED',
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
  engineType: 'podman',
};

async function waitRender(customProperties: object): Promise<void> {
  render(PushImageModal, { ...customProperties });
  await tick();
}

type CallbackType = (name: string, data: string) => void;

describe('Expect Push Image dialog', () => {
  let callback: CallbackType | undefined;
  const closeCallback = vi.fn();
  function button(name: 'Cancel' | 'Push image' | 'Done'): HTMLElement | null {
    return screen.queryByRole('button', { name }) ?? screen.queryByRole('button', { name: `Loading ${name}` });
  }

  function terminal(): HTMLElement | null {
    return screen.queryByRole('term');
  }

  async function runTo(
    step:
      | 'DialogOpened'
      | 'PushPressed'
      | 'FirstMessage'
      | 'DataMessage'
      | 'DataErrorMessage'
      | 'EndAfterError'
      | 'End',
    authConfig = true,
  ): Promise<void> {
    vi.mocked(window.hasAuthconfigForImage).mockResolvedValue(authConfig);
    vi.mocked(window.getImageInspect).mockResolvedValue(fakedImageInspect);
    vi.mocked(window.pushImage).mockImplementation(async (_imageId, _imageTag, cb) => {
      callback = cb;
    });

    await waitRender({
      imageInfoToPush: fakedImage,
      closeCallback,
    });

    if (step === 'DialogOpened') return;

    const pushButton = screen.getByRole('button', { name: 'Push image' });
    await fireEvent.click(pushButton);

    if (step === 'PushPressed') return;

    callback?.('first-message', '');

    if (step === 'FirstMessage') return;

    callback?.('data', '{ "status": "DataMessage" }');
    await tick();

    if (step === 'DataMessage') return;

    if (step === 'EndAfterError' || step === 'DataErrorMessage') {
      callback?.('error', 'DataErrorMessage');
    }

    if (step === 'DataErrorMessage') return;

    callback?.('end', '');
  }

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('have "Cancel" and "Push Image" buttons disabled after open when auth configuration is missing', async () => {
    await runTo('DialogOpened', false);
    expect(button('Push image')).toBeDisabled();
    expect(button('Cancel')).toBeEnabled();
    expect(terminal()).toBeNull();
  });

  test('have "Cancel" and "Push Image" buttons enable after open when auth configuration is present', async () => {
    await runTo('DialogOpened');
    expect(button('Push image')).toBeEnabled();
    expect(button('Cancel')).toBeEnabled();
    expect(terminal()).toBeNull();
  });

  test('to close when "Cancel" button pressed', async () => {
    await runTo('DialogOpened');
    const cancelButton = button('Cancel');
    expect(cancelButton).toBeEnabled();
    if (cancelButton) {
      await fireEvent.click(cancelButton);
    }
    expect(closeCallback).toHaveBeenCalledOnce();
  });

  test('to have no "Cancel" button and "Push Image" button disabled after "Push Image" button pressed', async () => {
    await runTo('PushPressed');
    // the click on 'Push Image' button should set callback
    expect(callback).not.toBe(undefined);
    // window.pushImage() called, `Cancel` and `Push Image` buttons are
    // disabled and waiting for callback being called with first-message/data/end events
    expect(button('Push image')).toBeDisabled();
    expect(button('Cancel')).toBe(null);
    expect(screen.queryByRole('term')).toBeVisible();
  });

  test('to clean terminal when "first-message" event received', async () => {
    await runTo('FirstMessage');
    expect(Terminal.prototype.clear).toHaveBeenCalledOnce();
  });

  test('to write "status" property to terminal received in "data" even', async () => {
    await runTo('DataMessage');
    expect(Terminal.prototype.write).toBeCalledWith('DataMessage\n\r');
    expect(button('Push image')).toBeDisabled();
    expect(button('Cancel')).toBe(null);
  });

  test('to write error message to terminal from "data" event and reset buttons to initial state', async () => {
    await runTo('DataErrorMessage');
    expect(Terminal.prototype.write).toBeCalledWith('DataErrorMessage\n\r');
    expect(button('Push image')).toBeDisabled();
    expect(button('Cancel')).toBe(null);
  });

  test('to show "Cancel" and "Push image" buttons after push call finished with error', async () => {
    await runTo('EndAfterError');
    expect(button('Push image')).toBeEnabled();
    expect(button('Cancel')).toBeEnabled();
    expect(terminal()).toBeVisible();
  });

  test('to show "Done" button after successful push', async () => {
    await runTo('End');
    expect(button('Push image')).toBe(null);
    expect(button('Cancel')).toBe(null);
    expect(button('Done')).toBeEnabled();
    expect(terminal()).toBeVisible();
  });

  test('to close when "Done" button pressed', async () => {
    await runTo('End');
    const doneButton = button('Done');
    expect(doneButton).toBeEnabled();
    if (doneButton) {
      await fireEvent.click(doneButton);
    }
    expect(closeCallback).toHaveBeenCalledOnce();
  });
});
