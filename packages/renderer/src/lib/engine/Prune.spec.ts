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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import Prune from './Prune.svelte';

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      showMessageBox: vi.fn(),
      pruneContainers: vi.fn(),
      pruneImages: vi.fn(),
    },
    writable: true,
  });
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('containers', () => {
  test('pruned containers', async () => {
    render(Prune, {
      type: 'containers',
      engines: [
        {
          id: 'podman',
          name: 'Podman',
        },
      ],
    });

    // mock the window.showMessageBox method to return "all"
    const response = 1;
    vi.mocked(window.showMessageBox).mockResolvedValue({
      response,
    });

    // search for the button
    const button = await screen.findByRole('button', { name: 'Prune' });
    expect(button).toBeInTheDocument();
    await fireEvent.click(button);

    // check if the showMessageBox method was called with all the right parameters
    expect(window.showMessageBox).toHaveBeenCalledWith({
      buttons: ['Cancel', 'Yes'],
      title: 'Prune',
      message: 'This action will prune all unused containers from the Podman engine.',
    });

    expect(window.pruneContainers).toHaveBeenCalledWith('podman');
  });
});

describe('images', () => {
  const CANCEL_BUTTON = 'Cancel';
  const ALL_UNUSED_IMAGES = 'All unused images';
  const ALL_UNTAGGED_IMAGES = 'All untagged images';

  const IMAGE_BUTTONS = [CANCEL_BUTTON, ALL_UNUSED_IMAGES, ALL_UNTAGGED_IMAGES];

  const imageRender = () => {
    render(Prune, {
      type: 'images',
      engines: [
        {
          id: 'podman',
          name: 'Podman',
        },
      ],
    });
  };

  test('prune all untagged images', async () => {
    imageRender();

    // mock the window.showMessageBox method to return "all untaged images"
    const response = IMAGE_BUTTONS.indexOf(ALL_UNTAGGED_IMAGES);
    vi.mocked(window.showMessageBox).mockResolvedValue({
      response,
    });

    // search for the button
    const button = await screen.findByRole('button', { name: 'Prune' });
    expect(button).toBeInTheDocument();
    await fireEvent.click(button);

    // check if the showMessageBox method was called with all the right parameters
    expect(window.showMessageBox).toHaveBeenCalledWith({
      buttons: IMAGE_BUTTONS,
      title: 'Prune',
      message: 'This action will prune images from the Podman engine.',
    });

    expect(window.pruneImages).toHaveBeenCalledWith('podman', false);
  });

  test('prune all unused images', async () => {
    imageRender();

    // mock the window.showMessageBox method to return "all unused images"
    const response = IMAGE_BUTTONS.indexOf(ALL_UNUSED_IMAGES);
    vi.mocked(window.showMessageBox).mockResolvedValue({
      response,
    });

    // search for the button
    const button = await screen.findByRole('button', { name: 'Prune' });
    expect(button).toBeInTheDocument();
    await fireEvent.click(button);

    // check if the showMessageBox method was called with all the right parameters
    expect(window.showMessageBox).toHaveBeenCalledWith({
      buttons: IMAGE_BUTTONS,
      title: 'Prune',
      message: 'This action will prune images from the Podman engine.',
    });

    expect(window.pruneImages).toHaveBeenCalledWith('podman', true);
  });

  test('prune nothing (click cancel)', async () => {
    imageRender();

    // mock the window.showMessageBox method to return "Cancel"
    const response = IMAGE_BUTTONS.indexOf(CANCEL_BUTTON);
    vi.mocked(window.showMessageBox).mockResolvedValue({
      response,
    });

    // search for the button
    const button = await screen.findByRole('button', { name: 'Prune' });
    expect(button).toBeInTheDocument();
    await fireEvent.click(button);

    // check if the showMessageBox method was called with all the right parameters
    expect(window.showMessageBox).toHaveBeenCalledWith({
      buttons: IMAGE_BUTTONS,
      title: 'Prune',
      message: 'This action will prune images from the Podman engine.',
    });

    expect(window.pruneImages).not.toBeCalled();
  });
});
