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

import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import ReleaseNotesBox from './ReleaseNotesBox.svelte';

const podmanDesktopUpdateAvailableMock = vi.fn();
const getPodmanDesktopVersionMock = vi.fn();
const openExternalMock = vi.fn();
const updatePodmanDesktopMock = vi.fn();
const updateConfigurationValueMock = vi.fn();
const getConfigurationValueMock = vi.fn();
const podmanDesktopGetReleaseNotesMock = vi.fn();
const responseJSON = { image: 'image1.png', title: 'Release 1.1', summary: 'some info about v1.1.0 release' };

beforeEach(() => {
  vi.resetAllMocks();
  (window as any).podmanDesktopUpdateAvailable = podmanDesktopUpdateAvailableMock.mockResolvedValue(false);
  (window as any).getPodmanDesktopVersion = getPodmanDesktopVersionMock.mockResolvedValue('1.1.0');
  (window as any).openExternal = openExternalMock;
  (window as any).podmanDesktopGetReleaseNotes = podmanDesktopGetReleaseNotesMock.mockResolvedValue({
    releaseNotesAvailable: true,
    notesURL: `appHomepage/blog/podman-desktop-release-1.1`,
    notes: responseJSON,
  });
  (window as any).updatePodmanDesktop = updatePodmanDesktopMock;
  (window as any).updateConfigurationValue = updateConfigurationValueMock;
  (window as any).getConfigurationValue = getConfigurationValueMock.mockResolvedValue('show');
  (window.events as unknown) = {
    receive: vi.fn().mockImplementation(() => {
      return {
        dispose: vi.fn(),
      };
    }),
  };
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
  podmanDesktopUpdateAvailableMock.mockResolvedValue(true);
  render(ReleaseNotesBox);
  await waitFor(() => expect(podmanDesktopGetReleaseNotesMock));
  await tick();
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Update' })).toBeInTheDocument());
  const updateButton = screen.getByRole('button', { name: 'Update' });
  await userEvent.click(updateButton);
  expect(updatePodmanDesktopMock).toHaveBeenCalled();
});

test('expect update button to not show when there is no update', async () => {
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
