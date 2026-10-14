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

import '@testing-library/jest-dom/vitest';

import type { ProviderInfo } from '@desktop-framework/api';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeEach, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';
import { volumeListInfos } from '/@/stores/volumes';

import CreateVolume from './CreateVolume.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

beforeEach(() => {
  vi.resetAllMocks();
  volumeListInfos.set([]);
});

const createButtonTitle = 'Create';

test('Expect no create button with no providers', async () => {
  providerInfos.set([]);

  render(CreateVolume, {});

  // no button
  const createButton = screen.queryByRole('button', { name: createButtonTitle });
  expect(createButton).not.toBeInTheDocument();

  // expect empty screen
  const emptyScreen = screen.getByText('No Container Engine');
  expect(emptyScreen).toBeInTheDocument();

  // expect that we never call
  expect(window.createVolume).not.toBeCalled();
});

test('Expect Create button is working', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  render(CreateVolume, {});

  const createButton = screen.getByRole('button', { name: createButtonTitle });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // click on it
  await userEvent.click(createButton);

  // expect that we called createVolume API
  expect(window.createVolume).toHaveBeenCalledWith(expect.anything(), { Name: '' });
});

test('Expect Create with a custom name', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  render(CreateVolume, {});

  const createButton = screen.getByRole('button', { name: createButtonTitle });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // expect no combo box as only one provider
  const providerSelect = screen.queryByRole('combobox', { name: 'Provider Choice' });
  expect(providerSelect).not.toBeInTheDocument();

  // grab input field
  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  expect(nameInput).toBeInTheDocument();
  expect(nameInput).toBeEnabled();

  const customVolumeName = 'my-custom-volume';

  // enter the text 'my-custom-volume
  await userEvent.type(nameInput, customVolumeName);

  // click on it
  await userEvent.click(createButton);

  // expect that we called createVolume API
  expect(window.createVolume).toHaveBeenCalledWith(expect.objectContaining({ name: 'podman-machine-default' }), {
    Name: customVolumeName,
  });
});

test('Expect error message when volume creation fails', async () => {
  const errorMessage = 'volume name "bad/name" includes invalid characters';
  vi.mocked(window.createVolume).mockRejectedValueOnce(new Error(errorMessage));

  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  render(CreateVolume, {});

  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  await userEvent.type(nameInput, 'bad/name');

  const createButton = screen.getByRole('button', { name: createButtonTitle });
  await userEvent.click(createButton);

  const errorElement = screen.getByText(errorMessage);
  expect(errorElement).toBeInTheDocument();

  // should not show the Done button on failure
  const doneButton = screen.queryByRole('button', { name: 'Done' });
  expect(doneButton).not.toBeInTheDocument();
});

test('Expect Create with a custom name and multiple providers', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
    {
      name: 'docker',
      id: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'docker',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  render(CreateVolume, {});

  const createButton = screen.getByRole('button', { name: createButtonTitle });
  expect(createButton).toBeInTheDocument();
  expect(createButton).toBeEnabled();

  // change the provider's choice
  const providerSelect = screen.getByRole('combobox', { name: 'Provider Choice' });
  expect(providerSelect).toBeInTheDocument();
  expect(providerSelect).toBeEnabled();

  // change to the second provider
  await userEvent.selectOptions(providerSelect, 'docker');

  // grab input field
  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  expect(nameInput).toBeInTheDocument();
  expect(nameInput).toBeEnabled();

  const customVolumeName = 'my-custom-volume';

  // enter the text 'my-custom-volume
  await userEvent.type(nameInput, customVolumeName);

  // click on it
  await userEvent.click(createButton);

  // expect that we called createVolume API with the docker provider as we changed the toggle
  expect(window.createVolume).toHaveBeenCalledWith(expect.objectContaining({ name: 'docker' }), {
    Name: customVolumeName,
  });
});

test('Expect error and disabled button when volume name already exists', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  volumeListInfos.set([
    {
      engineId: 'podman.podman-machine-default',
      engineName: 'podman',
      name: 'existing-volume',
    } as unknown as VolumeInfoUI,
  ]);

  render(CreateVolume, {});

  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  await userEvent.type(nameInput, 'existing-volume');

  await waitFor(() => {
    expect(
      screen.getByText('The name "existing-volume" already exists. Please choose a different name.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeDisabled();
  });
});

test('Expect no error when volume name is unique', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  volumeListInfos.set([
    {
      engineId: 'podman.podman-machine-default',
      engineName: 'podman',
      name: 'existing-volume',
    } as unknown as VolumeInfoUI,
  ]);

  render(CreateVolume, {});

  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  await userEvent.type(nameInput, 'new-volume');

  await waitFor(() => {
    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeEnabled();
  });
});

test('Expect no error when volume name is empty', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  volumeListInfos.set([
    {
      engineId: 'podman.podman-machine-default',
      engineName: 'podman',
      name: 'existing-volume',
    } as unknown as VolumeInfoUI,
  ]);

  render(CreateVolume, {});

  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  await userEvent.type(nameInput, 'existing-volume');

  await waitFor(() => {
    expect(screen.getByText(/already exists/)).toBeInTheDocument();
  });

  await userEvent.clear(nameInput);

  await waitFor(() => {
    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeEnabled();
  });
});

test('Expect revalidation when provider changes', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
    {
      name: 'docker',
      id: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'docker',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  volumeListInfos.set([
    {
      engineId: 'podman.podman-machine-default',
      engineName: 'podman',
      name: 'shared-name',
    } as unknown as VolumeInfoUI,
  ]);

  render(CreateVolume, {});

  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  await userEvent.type(nameInput, 'shared-name');

  await waitFor(() => {
    expect(screen.getByText(/already exists/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeDisabled();
  });

  const providerSelect = screen.getByRole('combobox', { name: 'Provider Choice' });
  await userEvent.selectOptions(providerSelect, 'docker');

  await waitFor(() => {
    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeEnabled();
  });
});

test('Expect no false positive when providers share connection name', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'Docker',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
    {
      name: 'docker',
      id: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'Docker',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  volumeListInfos.set([
    {
      engineId: 'docker.Docker',
      engineName: 'docker',
      name: 'my-vol',
    } as unknown as VolumeInfoUI,
  ]);

  render(CreateVolume, {});

  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  await userEvent.type(nameInput, 'my-vol');

  // podman.Docker is selected first — no volume named 'my-vol' there
  await waitFor(() => {
    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeEnabled();
  });

  // switch to docker.Docker — 'my-vol' exists there
  const providerSelect = screen.getByRole('combobox', { name: 'Provider Choice' });
  const options = providerSelect.querySelectorAll('option');
  await userEvent.selectOptions(providerSelect, options[1] as HTMLOptionElement);

  await waitFor(() => {
    expect(screen.getByText(/already exists/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeDisabled();
  });
});

test('Expect no duplicate error after successful creation when store updates', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  volumeListInfos.set([]);

  vi.mocked(window.createVolume).mockResolvedValue(undefined);

  render(CreateVolume, {});

  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  await userEvent.type(nameInput, 'new-volume');

  const createButton = screen.getByRole('button', { name: createButtonTitle });
  await userEvent.click(createButton);

  // Simulate the store updating with the newly created volume
  volumeListInfos.set([
    {
      engineId: 'podman.podman-machine-default',
      engineName: 'podman',
      name: 'new-volume',
    } as unknown as VolumeInfoUI,
  ]);

  // The "Done" button should appear and no error should be shown
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument();
  });
});

test('Expect error clears when name is corrected', async () => {
  providerInfos.set([
    {
      name: 'podman',
      id: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as unknown as ProviderInfo,
  ]);

  volumeListInfos.set([
    {
      engineId: 'podman.podman-machine-default',
      engineName: 'podman',
      name: 'my-volume',
    } as unknown as VolumeInfoUI,
  ]);

  render(CreateVolume, {});

  const nameInput = screen.getByRole('textbox', { name: 'Volume Name' });
  await userEvent.type(nameInput, 'my-volume');

  await waitFor(() => {
    expect(screen.getByText(/already exists/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeDisabled();
  });

  await userEvent.clear(nameInput);
  await userEvent.type(nameInput, 'my-volume-2');

  await waitFor(() => {
    expect(screen.queryByText(/already exists/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: createButtonTitle })).toBeEnabled();
  });
});
