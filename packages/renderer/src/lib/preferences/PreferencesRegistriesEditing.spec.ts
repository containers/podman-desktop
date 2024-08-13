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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom/vitest';

import type { Registry } from '@podman-desktop/api';
import { waitFor } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { default as userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { registriesInfos } from '../../stores/registries';
import PreferencesRegistriesEditing from './PreferencesRegistriesEditing.svelte';

beforeEach(() => {
  (window as any).window.ddExtensionInstall = vi.fn().mockResolvedValue(undefined);
  (window as any).window.getImageRegistryProviderNames = vi.fn().mockResolvedValue(undefined);
  (window as any).window.showMessageBox = vi.fn();
  (window as any).window.checkImageCredentials = vi.fn();
  (window as any).window.createImageRegistry = vi.fn().mockImplementation((...args: any[]) => {
    console.log(args);
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('PreferencesRegistriesEditing', () => {
  test('Expect that add registry button is visible and enabled', async () => {
    render(PreferencesRegistriesEditing, {});

    const button = screen.getByRole('button', { name: 'Add registry' });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('Expect that existing registries are visible', async () => {
    const name = 'custom-container-registry';
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://test.com',
      name: name,
      username: 'user',
      secret: 'secret',
    };
    registriesInfos.set([registry]);
    render(PreferencesRegistriesEditing, {});

    const entry2 = screen.getByText(name);
    expect(entry2).toBeInTheDocument();

    // can still add more registries
    const button = screen.getByRole('button', { name: 'Add registry' });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('Expect that adding a registry enables a form, and Add button is initially disabled', async () => {
    render(PreferencesRegistriesEditing, { showNewRegistryForm: true });

    const button = screen.getByRole('button', { name: 'Add registry' });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    const entry = screen.getByPlaceholderText('https://registry.io');
    expect(entry).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: 'Add' });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  test('Expect that adding registry using self signed or not verifiable certificate triggers confirmation request', async () => {
    render(PreferencesRegistriesEditing);
    const addRegistryBtn = screen.getByRole('button', { name: 'Add registry' });
    await userEvent.click(addRegistryBtn);
    const button = screen.getByRole('button', { name: 'Add' });
    const password = screen.getByPlaceholderText('password');
    const username = screen.getByPlaceholderText('username');
    const url = screen.getByPlaceholderText('https://registry.io');
    expect(button).toBeVisible();
    expect(button).toBeDisabled();
    expect(password).toBeVisible();
    expect(username).toBeVisible();
    expect(url).toBeVisible();
    await userEvent.type(url, 'https://registry.host');
    await userEvent.type(username, 'username');
    await userEvent.type(password, 'password');
    expect(button).toBeEnabled();
    vi.mocked(window.checkImageCredentials)
      .mockRejectedValueOnce(new Error('unable to verify the first certificate'))
      .mockRejectedValueOnce(new Error('self signed certificate in certificate chain'));
    vi.mocked(window.showMessageBox).mockResolvedValueOnce({ response: 1 }).mockResolvedValueOnce({ response: 0 });
    await userEvent.click(button);
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    expect(window.showMessageBox).toHaveBeenCalledTimes(2);
    expect(window.createImageRegistry).toHaveBeenCalledOnce();
    expect(window.createImageRegistry).toHaveBeenLastCalledWith(undefined, {
      source: undefined,
      serverUrl: 'https://registry.host',
      username: 'username',
      secret: 'password',
      insecure: true,
    });
  });
});
