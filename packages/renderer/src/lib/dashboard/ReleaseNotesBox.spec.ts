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
const podmanDesktopOpenReleaseNotesMock = vi.fn();
const updatePodmanDesktopMock = vi.fn();
const updateConfigurationValueMock = vi.fn();
const getConfigurationValueMock = vi.fn();
const fetchMock = vi.fn();
const fetchJSONMock = vi.fn();
const responsJSON = { image: 'image1.png', title: 'Release 1.1', summary: 'some info about v1.1.0 release' };

beforeEach(() => {
  vi.resetAllMocks();
  fetchJSONMock.mockImplementation(() => {
    return responsJSON;
  });
  (window as any).podmanDesktopUpdateAvailable = podmanDesktopUpdateAvailableMock.mockResolvedValue(false);
  (window as any).getPodmanDesktopVersion = getPodmanDesktopVersionMock.mockResolvedValue('1.1.0');
  (window as any).podmanDesktopOpenReleaseNotes = podmanDesktopOpenReleaseNotesMock;
  (window as any).updatePodmanDesktop = updatePodmanDesktopMock;
  (window as any).updateConfigurationValue = updateConfigurationValueMock;
  (window as any).getConfigurationValue = getConfigurationValueMock.mockResolvedValue(true);
  (global as any).fetch = fetchMock.mockImplementation(() =>
    Promise.resolve({ ok: true, json: fetchJSONMock } as unknown as Response),
  );
  (window.events as unknown) = {
    receive: vi.fn(),
  };
});

test('expect banner to be visible', async () => {
  render(ReleaseNotesBox);
  expect(getConfigurationValueMock).toBeCalledWith('releaseNotesBanner.show');
  await waitFor(() => expect(fetchMock).toBeCalledWith('https://podman-desktop.io/release-notes/1.1.json'));
  await waitFor(() => expect(fetchJSONMock).toBeCalled());
  await tick();
  expect(screen.getByText(responsJSON.title)).toBeInTheDocument();
  expect(screen.getByText(responsJSON.summary)).toBeInTheDocument();
  expect(screen.getByRole('img')).toBeInTheDocument();
  expect(screen.getByRole('img')).toHaveAttribute('src', responsJSON.image);
});

test('expect no release notes available', async () => {
  fetchMock.mockImplementation(() => Promise.resolve({ ok: false } as unknown as Response));
  render(ReleaseNotesBox);
  await waitFor(() => expect(fetchMock).toBeCalled());
  await tick();
  expect(screen.queryByText(responsJSON.title)).not.toBeInTheDocument();
  expect(screen.queryByText(responsJSON.summary)).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.getByText('Release notes are currently unavailable, please check again later.')).toBeInTheDocument();
});

test('expect update button to show when there is an update', async () => {
  podmanDesktopUpdateAvailableMock.mockResolvedValue(true);
  render(ReleaseNotesBox);
  await waitFor(() => expect(fetchMock).toBeCalledWith('https://podman-desktop.io/release-notes/1.1.json'));
  await waitFor(() => expect(fetchJSONMock).toBeCalled());
  await tick();
  expect(screen.getByRole('button', { name: 'Update' })).toBeInTheDocument();
  const updateButton = screen.getByRole('button', { name: 'Update' });
  await userEvent.click(updateButton);
  expect(updatePodmanDesktopMock).toHaveBeenCalled();
});

test('expect update button to not show when there is no update', async () => {
  render(ReleaseNotesBox);
  await waitFor(() => expect(fetchMock).toBeCalledWith('https://podman-desktop.io/release-notes/1.1.json'));
  await waitFor(() => expect(fetchJSONMock).toBeCalled());
  await tick();
  expect(screen.queryByRole('button', { name: 'Update' })).not.toBeInTheDocument();
});

test('expect clicking on close button to not show banner anymore', async () => {
  render(ReleaseNotesBox);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument);
  const closeButton = screen.getByRole('button', { name: 'Close' });
  await userEvent.click(closeButton);
  await tick();
  expect(updateConfigurationValueMock).toBeCalledWith('releaseNotesBanner.show', false);
  expect(screen.queryByText(responsJSON.title)).not.toBeInTheDocument();
  expect(screen.queryByText(responsJSON.summary)).not.toBeInTheDocument();
});
