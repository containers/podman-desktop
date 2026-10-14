/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { Registry, RegistrySuggestedProvider } from '@desktop-framework/extension-api';
import { waitFor } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import { default as userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { registriesInfos, registriesSuggestedInfos } from '/@/stores/registries';

import PreferencesRegistriesEditing from './PreferencesRegistriesEditing.svelte';

describe('PreferencesRegistriesEditing', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    registriesInfos.set([]);
    registriesSuggestedInfos.set([]);
  });

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

  test('Expect registry without name shows serverUrl', async () => {
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://myregistry.example.com',
      username: 'user',
      secret: 'secret',
    };
    registriesInfos.set([registry]);
    render(PreferencesRegistriesEditing, {});

    const entry = screen.getByText('myregistry.example.com');
    expect(entry).toBeInTheDocument();
  });

  test('Expect registry with alias shows alias instead of username', async () => {
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://test.com',
      name: 'Test Registry',
      username: 'user',
      secret: 'secret',
      alias: 'myAlias',
    };
    registriesInfos.set([registry]);
    render(PreferencesRegistriesEditing, {});

    expect(screen.getByText('myAlias')).toBeInTheDocument();
    expect(screen.queryByText('user')).not.toBeInTheDocument();
  });

  test('Expect registry without credentials shows Login now button', async () => {
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://test.com',
      name: 'Test Registry',
      username: '',
      secret: '',
    };
    registriesInfos.set([registry]);
    render(PreferencesRegistriesEditing, {});

    const loginButton = screen.getByRole('button', { name: 'Login now' });
    expect(loginButton).toBeInTheDocument();
  });

  test('Expect edit mode shows Login and Cancel buttons after clicking Edit password', async () => {
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://test.com',
      name: 'Test Registry',
      username: 'user',
      secret: 'secret',
    };
    registriesInfos.set([registry]);
    render(PreferencesRegistriesEditing, {});

    const kebabMenu = screen.getByRole('button', { name: 'kebab menu' });
    await userEvent.click(kebabMenu);

    const editButton = screen.getByTitle('Edit password');
    await userEvent.click(editButton);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeInTheDocument();

    const usernameInput = screen.getByPlaceholderText('Username');
    expect(usernameInput).toBeInTheDocument();
  });

  test('Expect cancel in edit mode restores original values', async () => {
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://test.com',
      name: 'Test Registry',
      username: 'originalUser',
      secret: 'originalSecret',
    };
    registriesInfos.set([registry]);
    render(PreferencesRegistriesEditing, {});

    const kebabMenu = screen.getByRole('button', { name: 'kebab menu' });
    await userEvent.click(kebabMenu);

    const editButton = screen.getByTitle('Edit password');
    await userEvent.click(editButton);

    const usernameInput = screen.getByPlaceholderText('Username');
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, 'newUser');

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(screen.getByText('originalUser')).toBeInTheDocument();
  });

  test('Expect show/hide password buttons work for existing registry', async () => {
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://test.com',
      name: 'Test Registry',
      username: 'user',
      secret: 'mySecretPassword',
    };
    registriesInfos.set([registry]);
    render(PreferencesRegistriesEditing, {});

    const showButton = screen.getByTitle('Show password');
    expect(showButton).toBeInTheDocument();

    await userEvent.click(showButton);

    expect(screen.getByText('mySecretPassword')).toBeInTheDocument();

    const hideButton = screen.getByTitle('Hide password');
    expect(hideButton).toBeInTheDocument();

    await userEvent.click(hideButton);

    expect(screen.queryByText('mySecretPassword')).not.toBeInTheDocument();
  });

  test('Expect suggested registries are visible with Configure button', async () => {
    const suggested: RegistrySuggestedProvider = {
      name: 'Docker Hub',
      url: 'docker.io',
    };
    registriesSuggestedInfos.set([suggested]);
    render(PreferencesRegistriesEditing, {});

    expect(screen.getByText('Docker Hub')).toBeInTheDocument();
    const configureButton = screen.getByRole('button', { name: 'Configure' });
    expect(configureButton).toBeInTheDocument();
  });

  test('Expect Configure on suggested registry shows login form', async () => {
    const suggested: RegistrySuggestedProvider = {
      name: 'Docker Hub',
      url: 'docker.io',
    };
    registriesSuggestedInfos.set([suggested]);
    render(PreferencesRegistriesEditing, {});

    const configureButton = screen.getByRole('button', { name: 'Configure' });
    await userEvent.click(configureButton);

    expect(screen.getByText('https://docker.io')).toBeInTheDocument();

    const usernameInput = screen.getByPlaceholderText('Username');
    expect(usernameInput).toBeInTheDocument();

    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toBeDisabled();

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    expect(cancelButton).toBeInTheDocument();
  });

  test('Expect login in edit mode calls updateImageRegistry', async () => {
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://test.com',
      name: 'Test Registry',
      username: 'user',
      secret: 'secret',
    };
    registriesInfos.set([registry]);
    vi.mocked(window.checkImageCredentials).mockResolvedValue(undefined);
    vi.mocked(window.updateImageRegistry).mockResolvedValue(undefined);
    render(PreferencesRegistriesEditing, {});

    const kebabMenu = screen.getByRole('button', { name: 'kebab menu' });
    await userEvent.click(kebabMenu);

    const editButton = screen.getByTitle('Edit password');
    await userEvent.click(editButton);

    const loginButton = screen.getByRole('button', { name: 'Login' });
    await userEvent.click(loginButton);

    await waitFor(() => expect(window.updateImageRegistry).toHaveBeenCalledOnce());
  });

  test('Expect removing registry calls unregisterImageRegistry', async () => {
    const registry: Registry = {
      source: 'test',
      serverUrl: 'https://test.com',
      name: 'Test Registry',
      username: 'user',
      secret: 'secret',
    };
    registriesInfos.set([registry]);
    render(PreferencesRegistriesEditing, {});

    const kebabMenu = screen.getByRole('button', { name: 'kebab menu' });
    await userEvent.click(kebabMenu);

    const removeButton = screen.getByTitle('Remove');
    await userEvent.click(removeButton);

    expect(window.unregisterImageRegistry).toHaveBeenCalledOnce();
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
    let button = screen.getByRole('button', { name: 'Add' });
    const password = screen.getByPlaceholderText('Password');
    const username = screen.getByPlaceholderText('Username');
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
    vi.mocked(window.showMessageBox)
      .mockResolvedValueOnce({ response: 'Cancel' })
      .mockResolvedValueOnce({ response: 'Add' });
    await userEvent.click(button);
    button = screen.getByRole('button', { name: 'Add' });
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    expect(window.showMessageBox).toHaveBeenCalledTimes(2);
    expect(window.createImageRegistry).toHaveBeenCalledOnce();
    expect(window.createImageRegistry).toHaveBeenLastCalledWith(undefined, {
      source: undefined,
      serverUrl: 'registry.host',
      username: 'username',
      secret: 'password',
      insecure: true,
    });
  });

  test('Expect a long error message in the Add registry dialog to wrap instead of overflowing', async () => {
    render(PreferencesRegistriesEditing, { showNewRegistryForm: true });

    await userEvent.type(screen.getByPlaceholderText('https://registry.io'), 'https://localhost:5000');
    await userEvent.type(screen.getByPlaceholderText('Username'), 'myuser');
    await userEvent.type(screen.getByPlaceholderText('Password'), 'password');

    // the error from the original report: it ends with a run of characters that
    // has nothing to wrap at, which is what pushed the text out of the dialog
    const error =
      'Unable to find auth info for https://localhost:5000/v2/. Error: RequestError: write EPROTO ' +
      '24412595112800:error:100000f7:SSL routines:OPENSSL_internal:WRONG_VERSION_NUMBER:.../../third_party/boringssl/src/ssl/tls_record.cc:127:';
    vi.mocked(window.checkImageCredentials).mockResolvedValue(undefined);
    vi.mocked(window.createImageRegistry).mockRejectedValue(new Error(error));

    await userEvent.click(screen.getByRole('button', { name: 'Add' }));

    const message = await screen.findByText(error);
    expect(message).toBeInTheDocument();
    // the message can break anywhere, so it stays inside the dialog instead of
    // widening it
    expect(message).toHaveClass('wrap-anywhere');
  });
});
