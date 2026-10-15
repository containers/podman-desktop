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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { onDidChangeConfiguration } from '/@/stores/configurationProperties';
import { updateAvailable } from '/@/stores/update-store';

import ReleaseNotesBox from './ReleaseNotesBox.svelte';

const podmanDesktopUpdateAvailableMock = vi.fn();
const getPodmanDesktopVersionMock = vi.fn();
const openExternalMock = vi.fn();
const updatePodmanDesktopMock = vi.fn();
const updateConfigurationValueMock = vi.fn();
const getConfigurationValueMock = vi.fn();
const podmanDesktopGetReleaseNotesMock = vi.fn();
const responseJSON = { image: 'image1.png', title: 'Release 1.1', summary: 'some info about v1.1.0 release' };

beforeAll(() => {
  Object.defineProperty(window, 'podmanDesktopUpdateAvailable', { value: podmanDesktopUpdateAvailableMock });
  Object.defineProperty(window, 'getPodmanDesktopVersion', { value: getPodmanDesktopVersionMock });
  Object.defineProperty(window, 'openExternal', { value: openExternalMock });
  Object.defineProperty(window, 'podmanDesktopGetReleaseNotes', { value: podmanDesktopGetReleaseNotesMock });
  Object.defineProperty(window, 'updatePodmanDesktop', { value: updatePodmanDesktopMock });
  Object.defineProperty(window, 'updateConfigurationValue', { value: updateConfigurationValueMock });
  Object.defineProperty(window, 'getConfigurationValue', { value: getConfigurationValueMock });
});

const callbacks = new Map<string, (arg: unknown) => void>();

beforeEach(() => {
  vi.resetAllMocks();
  podmanDesktopUpdateAvailableMock.mockResolvedValue(false);
  getPodmanDesktopVersionMock.mockResolvedValue('1.1.0');
  podmanDesktopGetReleaseNotesMock.mockResolvedValue({
    releaseNotesAvailable: true,
    notesURL: `appHomepage/blog/podman-desktop-release-1.1`,
    notes: responseJSON,
  });
  getConfigurationValueMock.mockResolvedValue('show');
  onDidChangeConfiguration.addEventListener = vi.fn().mockImplementation((message: string, callback: () => void) => {
    callbacks.set(message, callback);
  });
});

test('expect banner to be visible', async () => {
  render(ReleaseNotesBox);
  await tick();
  expect(getConfigurationValueMock).toBeCalledWith('releaseNotesBanner.show');
  await waitFor(() => expect(podmanDesktopGetReleaseNotesMock).toBeCalled());
  await tick();
  expect(screen.getByText(responseJSON.title)).toBeInTheDocument();
  expect(screen.getAllByText(responseJSON.summary)[0]).toBeInTheDocument();
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.getByRole('img')).toHaveAttribute('src', responseJSON.image);
});

test('expect image to fill full height of parent with object-cover scaling', async () => {
  render(ReleaseNotesBox);

  const image: HTMLImageElement = await vi.waitFor(() => {
    const img = screen.getByRole('img', {
      name: 'Podman Desktop 1.1.0 release image',
    });
    expect(img).toBeInTheDocument();
    return img as HTMLImageElement;
  });

  expect(image.classList.contains('h-full')).toBe(true);
  expect(image.classList.contains('object-cover')).toBe(true);
  expect(image.classList.contains('max-w-[20%]')).toBe(true);
  expect(image.classList.contains('object-contain')).toBe(false);
  expect(image.classList.contains('self-start')).toBe(false);
});

test('expect image to be hidden if there is a loading error', async () => {
  const { getByRole, queryByRole } = render(ReleaseNotesBox);

  const image: HTMLImageElement = await vi.waitFor(() => {
    const img = getByRole('img', {
      name: 'Podman Desktop 1.1.0 release image',
    });
    expect(img).toBeInTheDocument();
    expect(img).instanceof(HTMLImageElement);
    return img as HTMLImageElement;
  });

  // svelte never render the image, so we need
  // to manually send an error event
  await fireEvent.error(image);

  await vi.waitFor(() => {
    const img = queryByRole('img');
    expect(img).toBeNull();
  });
});

test('expect no release notes available', async () => {
  podmanDesktopGetReleaseNotesMock.mockResolvedValue({
    releaseNotesAvailable: false,
    notesURL: `appRepo/release-summary`,
  });

  render(ReleaseNotesBox);
  await waitFor(() => expect(podmanDesktopGetReleaseNotesMock).toBeCalled());
  await tick();
  expect(screen.queryByText(responseJSON.title)).not.toBeInTheDocument();
  expect(screen.queryByText(responseJSON.summary)).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(
    screen.getByText('Release notes are currently unavailable, please check again later or try this'),
  ).toBeInTheDocument();
});

test('expect update button to show when there is an update', async () => {
  updateAvailable.set(true);
  render(ReleaseNotesBox);
  await waitFor(() => expect(podmanDesktopGetReleaseNotesMock));
  await tick();
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Update' })).toBeInTheDocument());
  const updateButton = screen.getByRole('button', { name: 'Update' });
  await userEvent.click(updateButton);
  expect(updatePodmanDesktopMock).toHaveBeenCalled();
});

test('expect update button to not show when there is no update', async () => {
  updateAvailable.set(false);
  render(ReleaseNotesBox);
  await waitFor(() => expect(podmanDesktopGetReleaseNotesMock).toBeCalled());
  await tick();
  expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
});

test('expect clicking on close button to not show banner anymore', async () => {
  render(ReleaseNotesBox);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument);
  const closeButton = screen.getByRole('button', { name: 'Close' });
  await userEvent.click(closeButton);
  await tick();
  expect(updateConfigurationValueMock).toBeCalledWith('releaseNotesBanner.show', '1.1.0');
  expect(screen.queryByText(responseJSON.title)).not.toBeInTheDocument();
  expect(screen.queryByText(responseJSON.summary)).not.toBeInTheDocument();
});

test('expect clicking on Dismiss button to not show banner anymore', async () => {
  render(ReleaseNotesBox);
  const dismissButton = await screen.findByRole('button', { name: 'Dismiss' });
  await userEvent.click(dismissButton);

  await waitFor(() => expect(updateConfigurationValueMock).toBeCalledWith('releaseNotesBanner.show', '1.1.0'));
  expect(screen.queryByText(responseJSON.title)).not.toBeInTheDocument();
  expect(screen.queryByText(responseJSON.summary)).not.toBeInTheDocument();
});

test('expect no release notes widget if no notesUrl as well', async () => {
  podmanDesktopGetReleaseNotesMock.mockResolvedValue({
    releaseNotesAvailable: false,
  });

  render(ReleaseNotesBox);
  await waitFor(() => expect(podmanDesktopGetReleaseNotesMock).toBeCalled());
  await tick();
  expect(screen.queryByText(responseJSON.title)).not.toBeInTheDocument();
  expect(screen.queryByText(responseJSON.summary)).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(
    screen.queryByText('Release notes are currently unavailable, please check again later or try this'),
  ).not.toBeInTheDocument();
});

test('show release notes on configuration change to non-current version value', async () => {
  // do not show release notes
  getConfigurationValueMock.mockResolvedValueOnce('1.1.0');
  const showReleaseNotes = 'releaseNotesBanner.show';
  render(ReleaseNotesBox);
  await waitFor(() => expect(podmanDesktopGetReleaseNotesMock).toBeCalled());

  expect(screen.queryByText(responseJSON.title)).not.toBeInTheDocument();
  expect(screen.queryByText(responseJSON.summary)).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();

  callbacks.get(showReleaseNotes)?.({ detail: { key: showReleaseNotes, value: 'show' } });
  await tick();

  expect(screen.getByText(responseJSON.title)).toBeInTheDocument();
  expect(screen.getAllByText(responseJSON.summary)[0]).toBeInTheDocument();
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.getByRole('img')).toHaveAttribute('src', responseJSON.image);
});

test('hide release notes on configuration change to current version value', async () => {
  getConfigurationValueMock.mockResolvedValueOnce('show');
  const showReleaseNotes = 'releaseNotesBanner.show';
  render(ReleaseNotesBox);
  await tick();

  await vi.waitFor(() => {
    expect(screen.getByText(responseJSON.title)).toBeInTheDocument();
    expect(screen.getAllByText(responseJSON.summary)[0]).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', responseJSON.image);
  });

  callbacks.get(showReleaseNotes)?.({ detail: { key: showReleaseNotes, value: '1.1.0' } });
  await tick();

  expect(screen.queryByText(responseJSON.title)).not.toBeInTheDocument();
  expect(screen.queryByText(responseJSON.summary)).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});
