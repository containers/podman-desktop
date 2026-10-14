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

import '@testing-library/jest-dom/vitest';

import type { ImageChecks } from '@desktop-framework/extension-api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { imageCheckerProviders } from '/@/stores/image-checker-providers';

import ImageDetailsCheck from './ImageDetailsCheck.svelte';

const getCancellableTokenSourceMock = vi.fn();
const imageCheckMock = vi.fn();
const cancelTokenSpy = vi.fn();

const tokenID = 70735;
beforeAll(() => {
  Object.defineProperty(window, 'getCancellableTokenSource', { value: getCancellableTokenSourceMock });
  getCancellableTokenSourceMock.mockReturnValue(tokenID);
  Object.defineProperty(window, 'imageCheck', { value: imageCheckMock });
  Object.defineProperty(window, 'cancelToken', { value: cancelTokenSpy.mockResolvedValue(undefined) });
  Object.defineProperty(window, 'telemetryTrack', { value: vi.fn().mockResolvedValue(undefined) });
});

beforeEach(() => {
  vi.clearAllMocks();
});

const never = (): Promise<never> => new Promise<never>(() => {});

test('expect to display wait message before to receive results', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  // never returns results
  vi.mocked(window.imageCheck).mockReturnValue(never());

  render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      engineType: 'podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
      Digest: 'digest',
    },
  });

  await vi.waitFor(() => {
    const msg = screen.getByRole('status', { name: 'Analysis Status' });
    expect(msg).toHaveTextContent('Image analysis in progress');
  });
});

test('expect to cancel when clicking the Cancel button', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  // never returns results
  vi.mocked(window.imageCheck).mockReturnValue(never());

  render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      engineType: 'podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
      Digest: 'digest',
    },
  });

  await vi.waitFor(async () => {
    const abortBtn = screen.getByRole('button', { name: 'Cancel' });
    await fireEvent.click(abortBtn);
  });

  await tick();
  const msg = screen.getByRole('status', { name: 'Analysis Status' });
  expect(msg).toHaveTextContent('Image analysis canceled');

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);
});

test('expect to cancel when destroying the component', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  // never returns results
  vi.mocked(window.imageCheck).mockReturnValue(never());

  const result = render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      engineType: 'podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
      Digest: 'digest',
    },
  });

  await vi.waitFor(async () => {
    screen.getByRole('button', { name: 'Cancel' });
  });

  result.unmount();

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);
});

test('expect to not cancel again when destroying the component after manual cancel', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  // never returns results
  vi.mocked(window.imageCheck).mockReturnValue(never());

  const result = render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      engineType: 'podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
      Digest: 'digest',
    },
  });

  await vi.waitFor(async () => {
    const abortBtn = screen.getByRole('button', { name: 'Cancel' });
    await fireEvent.click(abortBtn);
  });

  await tick();
  const msg = screen.getByRole('status', { name: 'Analysis Status' });
  expect(msg).toHaveTextContent('Image analysis canceled');

  expect(cancelTokenSpy).toHaveBeenCalledWith(tokenID);

  result.unmount();

  expect(cancelTokenSpy).toHaveBeenCalledTimes(1);
});

test('expect to display results from image checker provider', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockResolvedValue({
    checks: [
      {
        name: 'check1',
        status: 'failed',
        markdownDescription: 'an error for check1',
        severity: 'critical',
      },
    ],
  } as ImageChecks);

  render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      engineType: 'podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
      Digest: 'digest',
    },
  });

  await vi.waitFor(() => {
    const msg = screen.getByRole('status', { name: 'Analysis Status' });
    expect(msg).toHaveTextContent('Image analysis complete');
  });

  await vi.waitFor(() => {
    const cell = screen.getByRole('row', { name: 'check1' });
    expect(cell).toBeInTheDocument();
  });
});

test('expect to not cancel when destroying the component after displaying results from image checker provider', async () => {
  imageCheckerProviders.set([
    {
      id: 'provider1',
      label: 'Image Checker',
    },
  ]);

  imageCheckMock.mockResolvedValue({
    checks: [
      {
        name: 'check1',
        status: 'failed',
        markdownDescription: 'an error for check1',
        severity: 'critical',
      },
    ],
  } as ImageChecks);

  const result = render(ImageDetailsCheck, {
    imageInfo: {
      engineId: 'podman.Podman',
      engineName: 'Podman',
      engineType: 'podman',
      Id: 'sha256:3696f18be9a51a60395a7c2667e2fcebd2d913af0ad6da287e03810fda566833',
      ParentId: '7f8297e79d497136a7d75d506781b545b20ea599041f02ab14aa092e24f110b7',
      RepoTags: ['quay.io/user/image-name:v0.0.1'],
      Created: 1701338214,
      Size: 34134140,
      VirtualSize: 34134140,
      SharedSize: 0,
      Labels: {},
      Containers: 0,
      Digest: 'digest',
    },
  });

  await vi.waitFor(() => {
    const cell = screen.getByRole('row', { name: 'check1' });
    expect(cell).toBeInTheDocument();
  });

  result.unmount();

  expect(cancelTokenSpy).not.toHaveBeenCalled();
});
