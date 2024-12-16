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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';
import type { ImageInfo } from '/@api/image-info';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import PodEmptyScreen from './PodEmptyScreen.svelte';

vi.mock('/@/stores/providers', async () => {
  const store = await import('svelte/store');
  return {
    providerInfos: store.writable<ProviderInfo[]>([]),
  };
});

beforeAll(() => {
  Object.defineProperty(window, 'createPod', { value: vi.fn(), writable: true });
  Object.defineProperty(window, 'showMessageBox', { value: vi.fn() });
  Object.defineProperty(window, 'clipboardWriteText', { value: vi.fn() });
  Object.defineProperty(window, 'pullImage', { value: vi.fn() });
  Object.defineProperty(window, 'listImages', { value: vi.fn() });
  Object.defineProperty(window, 'createAndStartContainer', { value: vi.fn(), writable: true });
  Object.defineProperty(window, 'getProviderInfos', { value: vi.fn() });
  providerInfos.set([
    {
      containerConnections: [
        {
          status: 'started',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);
});

beforeEach(() => {
  vi.resetAllMocks();
});

const helloImage = 'quay.io/podman/hello:latest';
const error = new Error('Error message');
const errorMessage = {
  title: 'Error when running a pod',
  message: String(error),
};
const imageErrorMessage = {
  title: `Error when running a pod`,
  message: `Could not find '${helloImage}'' in images`,
};
const providerErrorMessage = {
  title: `Error when running a pod`,
  message: `No provider connections found`,
};
const buttonName = 'Start your first pod';
const getButton = screen.getByRole.bind(screen, 'button', { name: buttonName });
const copyToClipboard = 'Copy To Clipboard';
const imageInfo = {
  engineId: 'engineId',
  RepoTags: [helloImage],
} as ImageInfo;
const podInfo = { engineId: imageInfo.engineId, Id: 'Id' };
const podCreateCommand = `podman run -dt --pod new:myFirstPod ${helloImage}`;

function testComponent(name: string, fn: () => Promise<unknown>) {
  test(name, () => {
    vi.mocked(window.listImages).mockResolvedValue([imageInfo]);
    render(PodEmptyScreen);
    return fn();
  });
}

testComponent('renders button to run first pod', async () => {
  expect(getButton()).toBeVisible();
});

testComponent('button click creates and starts a pod', async () => {
  vi.spyOn(window, 'createPod').mockResolvedValue(podInfo);
  await fireEvent.click(getButton());
  expect(window.createPod).toBeCalledWith({ name: 'myFirstPod' });
  expect(window.createAndStartContainer).toBeCalledWith(podInfo.engineId, {
    Image: helloImage,
    pod: 'myFirstPod',
  });
});

testComponent('button click shows error message if creating pod fails', async () => {
  vi.spyOn(window, 'createPod').mockRejectedValue(error);
  await fireEvent.click(getButton());
  expect(window.showMessageBox).toBeCalledWith(errorMessage);
});

testComponent('button click shows error message if starting pod fails', async () => {
  vi.spyOn(window, 'createPod').mockResolvedValue(podInfo);
  vi.spyOn(window, 'createAndStartContainer').mockRejectedValue(error);
  await fireEvent.click(getButton());
  await vi.waitFor(() => expect(window.showMessageBox).toBeCalledWith(errorMessage));
});

test('button click shows error if image could not be pulled', async () => {
  vi.mocked(window.listImages).mockResolvedValue([]);
  render(PodEmptyScreen);
  await fireEvent.click(getButton());
  await vi.waitFor(() => expect(window.showMessageBox).toBeCalledWith(imageErrorMessage));
});

test('button click shows error message if there is no active provider connection', async () => {
  providerInfos.set([]);
  render(PodEmptyScreen);
  await fireEvent.click(getButton());
  await vi.waitFor(() => expect(window.showMessageBox).toBeCalledWith(providerErrorMessage));
});

testComponent(`${copyToClipboard} button click puts starting pod command to clipboard`, async () => {
  await fireEvent.click(screen.getByTitle(copyToClipboard));
  expect(window.clipboardWriteText).toBeCalledWith(podCreateCommand);
});
