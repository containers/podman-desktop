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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, beforeAll, expect, test, vi } from 'vitest';

import { authenticationProviders } from '../../stores/authenticationProviders';
import PreferencesAuthenticationProvidersRendering from './PreferencesAuthenticationProvidersRendering.svelte';

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
beforeAll(() => {
  (window as any).ResizeObserver = ResizeObserver;
});

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
    },
  ]);
  render(PreferencesAuthenticationProvidersRendering, {});
  const listOfProviders = screen.getByRole('list');
  expect(listOfProviders).toBeInTheDocument();
  const providerItem = screen.getByRole('listitem', { name: 'Test Authentication Provider' });
  expect(providerItem).toBeInTheDocument();
  const providerInfo = screen.getByLabelText('Provider Information');
  expect(providerInfo).toBeInTheDocument();
  const providerName = screen.getByLabelText('Provider Name');
  expect(providerName).toHaveTextContent('Test Authentication Provider');
  const providerStatus = screen.getByLabelText('Provider Status');
  expect(providerStatus).toHaveTextContent('Logged out');
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
  const providerName = screen.getByLabelText('Provider Name');
  expect(providerName).toHaveTextContent('Test Authentication Provider');
  const providerStatus = screen.getByLabelText('Provider Status');
  expect(providerStatus).toBeInTheDocument();
  expect(providerStatus).toHaveTextContent('Logged in');
  const providerStatusLabel = screen.getByLabelText('Logged In Username');
  expect(providerStatusLabel).toHaveTextContent('Test Account');
  const signoutButton = screen.getByRole('button', { name: `Sign out of ${testProvidersInfo[0].accounts[0].label}` });
  expect(signoutButton).toBeInTheDocument();
  expect(signoutButton).toBeEnabled();
});

test('Expect Sign Out button click calls window.requestAuthenticationProviderSignOut with provider and account ids', async () => {
  authenticationProviders.set(testProvidersInfo);
  render(PreferencesAuthenticationProvidersRendering, {});
  const signoutButton = screen.getByRole('button', { name: `Sign out of ${testProvidersInfo[0].accounts[0].label}` });
  const requestSignOutMock = vi.fn().mockImplementation(() => {});
  (window as any).requestAuthenticationProviderSignOut = requestSignOutMock;
  await fireEvent.click(signoutButton);
  expect(requestSignOutMock).toBeCalledWith('test', 'test-account');
});

const testProvidersInfoWithoutSessionRequests = [
  {
    id: 'test',
    displayName: 'Test Authentication Provider',
    accounts: [],
    sessionRequests: [],
  },
];

test('Expect Sign in button to be hidden when there are no session requests', async () => {
  authenticationProviders.set(testProvidersInfoWithoutSessionRequests);
  render(PreferencesAuthenticationProvidersRendering, {});
  const menuButton = screen.queryAllByRole('button');
  expect(menuButton.length).equals(0); // no menu button
});

const testProvidersInfoWithSessionRequests = [
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

test('Expect Sign In button to be visible when there is only one session request', async () => {
  authenticationProviders.set(testProvidersInfoWithSessionRequests);
  const requestSignInMock = vi.fn();
  (window as any).requestAuthenticationProviderSignIn = requestSignInMock;
  render(PreferencesAuthenticationProvidersRendering, {});
  const menuButton = screen.getByRole('button');
  const tooltip = screen.getByText('Sign in to use Extension Label');
  expect(tooltip).toBeInTheDocument();
  await fireEvent.click(menuButton);
  expect(requestSignInMock).toBeCalled();
});

const testProvidersInfoWithMultipleSessionRequests = [
  {
    id: 'test',
    displayName: 'Test Authentication Provider',
    accounts: [],
    sessionRequests: [
      {
        id: 'ext:test1',
        providerId: 'test',
        extensionId: 'ext1',
        extensionLabel: 'Extension1 Label',
        scopes: ['scope1', 'scope2'],
      },
      {
        id: 'ext:test2',
        providerId: 'test',
        extensionId: 'ext2',
        extensionLabel: 'Extension2 Label',
        scopes: ['scope1', 'scope2'],
      },
    ],
  },
];

test('Expect Sign In popup menu to be visible when there is more than one session request', async () => {
  authenticationProviders.set(testProvidersInfoWithMultipleSessionRequests);
  (window as any).requestAuthenticationProviderSignIn = vi.fn();
  render(PreferencesAuthenticationProvidersRendering, {});
  const menuButton = screen.getByRole('button');
  await fireEvent.click(menuButton);
  // test sign in with extension1
  const menuItem1 = screen.getByText('Sign in to use Extension1 Label');
  const requestSignInMock = vi.fn();
  (window as any).requestAuthenticationProviderSignIn = requestSignInMock;
  await fireEvent.click(menuItem1);
  expect(requestSignInMock).toBeCalledWith('ext:test1');
  // test sign in with extension2
  requestSignInMock.mockReset();
  await fireEvent.click(menuButton);
  const menuItem2 = screen.getByText('Sign in to use Extension2 Label');
  await fireEvent.click(menuItem2);
  expect(requestSignInMock).toBeCalledWith('ext:test2');
});

test('Expects default icon to be used when provider has no images option', async () => {
  authenticationProviders.set(testProvidersInfoWithSessionRequests);
  render(PreferencesAuthenticationProvidersRendering, {});
  screen.getByRole('img', {
    name: `Default icon for ${testProvidersInfoWithSessionRequests[0].displayName} provider`,
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
  screen.getByRole('img', { name: `Icon for ${testProvidersInfoWithSessionRequests[0].displayName} provider` });
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
    name: `Dark color theme icon for ${testProvidersInfoWithSessionRequests[0].displayName} provider`,
  });
});
