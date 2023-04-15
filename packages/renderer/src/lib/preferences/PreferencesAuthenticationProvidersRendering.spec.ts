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
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { authenticationProviders } from '../../stores/authenticationProviders';
import PreferencesAuthenticationProvidersRendering from './PreferencesAuthenticationProvidersRendering.svelte';

afterEach(() => {
  vi.clearAllMocks();
});

test('Expect that page shows icon and message when no auth providers registered', async () => {
  render(PreferencesAuthenticationProvidersRendering, {});
  const noProvidersText = await screen.getByText('No authentication providers');
  expect(noProvidersText).toBeInTheDocument();
});

test('Expect that page shows registered authentication providers without accounts as logged out', async () => {
  authenticationProviders.set([
    {
      id: 'test',
      displayName: 'Test Authentication Provider',
      accounts: [],
    },
  ]);
  render(PreferencesAuthenticationProvidersRendering, {});
  const providerText = await screen.getByText('Test Authentication Provider');
  expect(providerText).toBeInTheDocument();
  const loggedOut = await screen.getByText('Logged out');
  expect(loggedOut).toBeInTheDocument();
});

const testProvidersInfo = [
  {
    id: 'test',
    displayName: 'Test Authentication Provider',
    accounts: [
      {
        id: 'test-account',
        label: 'Test Account',
      },
    ],
  },
];

test('Expect that page shows registered authentication providers with account as logged in', async () => {
  authenticationProviders.set(testProvidersInfo);
  render(PreferencesAuthenticationProvidersRendering, {});
  const providerText = await screen.getByText('Test Authentication Provider');
  expect(providerText).toBeInTheDocument();
  const loggedOut = await screen.getByText('Logged in');
  expect(loggedOut).toBeInTheDocument();
  const signoutButton = await screen.getByRole('button', { name: `Sign out of ${testProvidersInfo[0].accounts[0].label}`});
  expect(signoutButton).toBeInTheDocument();
  expect(signoutButton).toBeEnabled();
});

test('Expect Sign Out button click calls window.requestAuthenticationProviderSignOut with provider and account ids', async () => {
  authenticationProviders.set(testProvidersInfo);
  render(PreferencesAuthenticationProvidersRendering, {});
  const signoutButton = await screen.getByRole('button', { name: `Sign out of ${testProvidersInfo[0].accounts[0].label}`});
  const requestSignOutMock = vi.fn().mockImplementation(() => {});
  (window as any).requestAuthenticationProviderSignOut = requestSignOutMock;
  fireEvent.click(signoutButton);
  expect(requestSignOutMock).toBeCalledWith('test', 'test-account');
});
