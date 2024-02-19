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
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/svelte';
import ImageActions from '/@/lib/image/ImageActions.svelte';
import type { ImageInfoUI } from '/@/lib/image/ImageInfoUI';

const showMessageBoxMock = vi.fn();
const getContributedMenusMock = vi.fn();

vi.mock('./image-utils', () => {
  return {
    ImageUtils: vi.fn().mockImplementation(() => ({
      deleteImage: vi.fn().mockImplementation(() => Promise.reject(new Error('Cannot delete image in test'))),
    })),
  };
});

beforeAll(() => {
  (window as any).showMessageBox = showMessageBoxMock;

  (window as any).getContributedMenus = getContributedMenusMock;
  (window as any).hasAuthconfigForImage = vi.fn();
  (window as any).hasAuthconfigForImage.mockImplementation(() => Promise.resolve(false));
});

const fakedImage: ImageInfoUI = {
  id: 'dummy',
  name: 'dummy',
} as unknown as ImageInfoUI;

test('Expect showMessageBox to be called when error occurs', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));

  const image: ImageInfoUI = {
    name: 'dummy',
    status: 'UNUSED',
  } as ImageInfoUI;

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image,
  });
  const button = screen.getByTitle('Delete Image');
  expect(button).toBeDefined();
  await fireEvent.click(button);

  await waitFor(() => {
    expect(showMessageBoxMock).toHaveBeenCalledOnce();
  });

  expect(image.status).toBe('DELETING');
});

test('Expect no dropdown when one contribution and dropdownMenu off', async () => {
  // Since we only have one contribution, we do not use a dropdown
  getContributedMenusMock.mockImplementation(_context =>
    Promise.resolve([{ command: 'valid-command', title: 'dummy-contrib' }]),
  );

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image: fakedImage,
    dropdownMenu: false,
    detailed: true,
    groupContributions: true,
  });

  expect(getContributedMenusMock).toHaveBeenCalled();

  await waitFor(() => {
    const div = screen.getByTitle('dummy-contrib').parentElement;
    expect(div).toBeDefined();
    expect(div?.classList).toHaveLength(0);
  });
});

test('Expect contribution in dropdown when several contributions and dropdownMenu off', async () => {
  // Since we have more than one contribution we group them in a dropdown
  getContributedMenusMock.mockImplementation(_context =>
    Promise.resolve([
      { command: 'valid-command', title: 'dummy-contrib' },
      { command: 'valid-command-2', title: 'dummy-contrib-2' },
    ]),
  );

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image: fakedImage,
    dropdownMenu: false,
    detailed: true,
    groupContributions: true,
  });

  expect(getContributedMenusMock).toHaveBeenCalled();

  await waitFor(() => {
    const button = screen.getByLabelText('kebab menu');
    expect(button).toBeDefined();
    expect(button.parentElement).toBeDefined();
    expect(button.parentElement?.classList?.length).toBeGreaterThan(0);
  });
});

test('Expect no dropdown when several contributions and dropdownMenu mode on', async () => {
  // Simulate with multiple contributions
  getContributedMenusMock.mockImplementation(_context =>
    Promise.resolve([
      { command: 'valid-command', title: 'dummy-contrib' },
      { command: 'valid-command-2', title: 'dummy-contrib-2' },
    ]),
  );

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image: fakedImage,
    dropdownMenu: true, // We are showing all actions in a Dropdown
    detailed: true,
    groupContributions: false, // we do not group them since we are in a dropdown
  });

  expect(getContributedMenusMock).toHaveBeenCalled();

  await fireEvent.click(screen.getByLabelText('kebab menu'));

  await waitFor(() => {
    const button = screen.getByTitle('dummy-contrib');
    expect(button).toBeDefined();
    expect(button.firstChild?.nodeName.toLowerCase()).toBe('svg');
    expect(button.lastChild?.nodeName.toLowerCase()).toBe('span');
    expect(button.lastChild?.textContent).toBe('dummy-contrib');
  });
});

test('Expect Push image to be there', async () => {
  // Mock the showMessageBox to return 0 (yes)
  showMessageBoxMock.mockResolvedValue({ response: 0 });
  getContributedMenusMock.mockImplementation(() => Promise.resolve([]));

  const image: ImageInfoUI = {
    name: 'dummy',
    status: 'UNUSED',
  } as ImageInfoUI;

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image,
  });

  const button = screen.getByTitle('Push Image');
  expect(button).toBeDefined();
});
