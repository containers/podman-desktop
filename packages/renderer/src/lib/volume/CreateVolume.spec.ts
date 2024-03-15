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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { providerInfos } from '../../stores/providers';
import CreateVolume from './CreateVolume.svelte';

const createVolumeMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).createVolume = createVolumeMock;
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
  expect(createVolumeMock).not.toBeCalled();
});

test('Expect Create button is working', async () => {
  providerInfos.set([
    {
      name: 'podman',
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
  expect(createVolumeMock).toHaveBeenCalledWith(expect.anything(), { Name: '' });
});

test('Expect Create with a custom name', async () => {
  providerInfos.set([
    {
      name: 'podman',
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
  expect(createVolumeMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'podman-machine-default' }), {
    Name: customVolumeName,
  });
});

test('Expect Create with a custom name and multiple providers', async () => {
  providerInfos.set([
    {
      name: 'podman',
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
  expect(createVolumeMock).toHaveBeenCalledWith(expect.objectContaining({ name: 'docker' }), {
    Name: customVolumeName,
  });
});
