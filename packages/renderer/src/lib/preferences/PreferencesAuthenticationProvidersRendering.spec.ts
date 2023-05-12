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

test('Expect that page shows icon and message when no auth providers registered', () => {
  render(PreferencesAuthenticationProvidersRendering, {});
  const noProvidersText = screen.getByText('No authentication providers');
  expect(noProvidersText).toBeInTheDocument();
});

test('Expect that page shows registered authentication providers without accounts as logged out', () => {
  authenticationProviders.set([
    {
      id: 'test',
      displayName: 'Test Authentication Provider',
      accounts: [],
      sessionRequests: [],
    },
  ]);
  render(PreferencesAuthenticationProvidersRendering, {});
  const providerText = screen.getByText('Test Authentication Provider');
  expect(providerText).toBeInTheDocument();
  const loggedOut = screen.getByText('Logged out');
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
    sessionRequests: [],
  },
];

test('Expect that page shows registered authentication providers with account as logged in', () => {
  authenticationProviders.set(testProvidersInfo);
  render(PreferencesAuthenticationProvidersRendering, {});
  const providerText = screen.getByText('Test Authentication Provider');
  expect(providerText).toBeInTheDocument();
  const loggedOut = screen.getByText('Logged in');
  expect(loggedOut).toBeInTheDocument();
  const signoutButton = screen.getByRole('button', { name: `Sign out of ${testProvidersInfo[0].accounts[0].label}` });
  expect(signoutButton).toBeInTheDocument();
  expect(signoutButton).toBeEnabled();
});

test('Expect Sign Out button click calls window.requestAuthenticationProviderSignOut with provider and account ids', () => {
  authenticationProviders.set(testProvidersInfo);
  render(PreferencesAuthenticationProvidersRendering, {});
  const signoutButton = screen.getByRole('button', { name: `Sign out of ${testProvidersInfo[0].accounts[0].label}` });
  const requestSignOutMock = vi.fn().mockImplementation(() => {});
  (window as any).requestAuthenticationProviderSignOut = requestSignOutMock;
  fireEvent.click(signoutButton);
  expect(requestSignOutMock).toBeCalledWith('test', 'test-account');
});

const testProividersInfoWithoutSessionRequests = [
  {
    id: 'test',
    displayName: 'Test Authentication Provider',
    accounts: [],
    sessionRequests: [],
  },
];

test('Expect Sign in menu item to be hidden when there are no session requests', async () => {
  authenticationProviders.set(testProividersInfoWithoutSessionRequests);
  render(PreferencesAuthenticationProvidersRendering, {});
  const menuButton = screen.queryAllByRole('button');
  expect(menuButton.length).equals(0); // no menu button
});

const testProividersInfoWithSessionRequests = [
  {
    id: 'test',
    displayName: 'Test Authentication Provider',
    accounts: [],
    sessionRequests: [
      {
        id: 'ext:test',
        providerId: 'test',
        extensionId: 'ext',
        extensionLabel: 'Extension Label',
        scopes: ['scope1', 'scope2'],
      },
    ],
  },
];

test('Expect Sign in menu item to be visible when there are session requests', async () => {
  authenticationProviders.set(testProividersInfoWithSessionRequests);
  render(PreferencesAuthenticationProvidersRendering, {});
  const menuButton = screen.getAllByRole('button');
  expect(menuButton.length).equals(1); // menu button
  fireEvent.click(menuButton[0]);
  render(PreferencesAuthenticationProvidersRendering, {});
  const menuItems = screen.getAllByText('Sign in to use Extension Label');
  expect(menuItems.length).equals(1);
  const requestSignInMock = vi.fn();
  (window as any).requestAuthenticationProviderSignIn = requestSignInMock;
  fireEvent.click(menuItems[0]);
  expect(requestSignInMock).toBeCalled();
});

test('Expects default icon to be used when provider has no images option', async () => {
  authenticationProviders.set(testProividersInfoWithSessionRequests);
  render(PreferencesAuthenticationProvidersRendering, {});
  screen.getByRole('img', {
    name: `Default icon for ${testProividersInfoWithSessionRequests[0].displayName} provider`,
  });
});

test('Expects images.icon option to be used when no themes are present', () => {
  const providerWithImageIcon = [
    {
      id: 'test',
      displayName: 'Test Authentication Provider',
      accounts: [],
      images: {
        icon: './icon.png',
      },
      sessionRequests: [],
    },
  ];
  authenticationProviders.set(providerWithImageIcon);
  render(PreferencesAuthenticationProvidersRendering, {});
  screen.getByRole('img', { name: `Icon for ${testProividersInfoWithSessionRequests[0].displayName} provider` });
});

test('Expects images.icon.dark option to be used when themes are present', () => {
  const providerWithImageIcon = [
    {
      id: 'test',
      displayName: 'Test Authentication Provider',
      accounts: [],
      images: {
        icon: {
          dark: './icon.png',
          light: './icon.png',
        },
      },
      sessionRequests: [],
    },
  ];
  authenticationProviders.set(providerWithImageIcon);
  render(PreferencesAuthenticationProvidersRendering, {});
  screen.getByRole('img', {
    name: `Dark color theme icon for ${testProividersInfoWithSessionRequests[0].displayName} provider`,
  });
});
