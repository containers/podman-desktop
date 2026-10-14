/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { NetworkInspectInfo } from '@desktop-framework/api';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { networksListInfo } from '/@/stores/networks';

import NetworkDetails from './NetworkDetails.svelte';

vi.mock(import('/@/lib/editor/MonacoEditor.svelte'));

const network1: NetworkInspectInfo = {
  engineId: 'podman1',
  engineName: 'Podman 1',
  engineType: 'podman',
  Name: 'Network 1',
  Id: '123456789012345',
  Created: '',
  Scope: '',
  Driver: '',
  EnableIPv6: false,
  Internal: false,
  Attachable: false,
  Ingress: false,
  ConfigOnly: false,
};

beforeEach(() => {
  vi.resetAllMocks();
  networksListInfo.set([]);
  vi.mocked(window.inspectNetwork).mockResolvedValue(network1);
  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
});

test('Expect to have network name and shortId and network actions in Details page', async () => {
  vi.mocked(window.listNetworks).mockResolvedValue([network1]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await waitFor(
    () => {
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  const { getByRole, getByText } = render(NetworkDetails, { networkName: 'Network 1', engineId: 'podman1' });

  await waitFor(() => {
    expect(getByText('Network 1')).toBeInTheDocument();
    expect(getByText('123456789012')).toBeInTheDocument();
    expect(getByRole('button', { name: 'Delete Network' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Update Network' })).toBeInTheDocument();
  });
});

test('Expect redirect to previous page if current network is deleted', async () => {
  const routerGotoSpy = vi.spyOn(router, 'goto');
  // Mock the showMessageBox to return 0 (yes)
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  vi.mocked(window.listNetworks).mockResolvedValue([network1]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await waitFor(
    () => {
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  vi.mocked(window.removeNetwork).mockImplementation(async () => {
    networksListInfo.update(networks => networks.filter(network => network1.Id !== network.id));
  });

  // defines a fake lastPage so we can check where we will be redirected
  lastPage.set({ name: 'Fake Previous', path: '/last' });

  // render the component
  const { getByRole, queryByRole } = render(NetworkDetails, { networkName: 'Network 1', engineId: 'podman1' });

  // grab current route
  const currentRoute = window.location;
  expect(currentRoute.href).toBe('http://localhost:3000/');

  await waitFor(() => {
    getByRole('button', { name: 'Delete Network' });
  });

  const deleteButton = getByRole('button', { name: 'Delete Network' });
  await fireEvent.click(deleteButton);

  // Wait for confirmation modal to disappear after clicking on delete
  await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument());

  // check that remove method has been called
  expect(window.removeNetwork).toHaveBeenCalled();

  // expect that we have called the router when page has been removed
  // to jump to the previous page
  expect(routerGotoSpy).toBeCalledWith('/last');

  // grab updated route
  const afterRoute = window.location;
  expect(afterRoute.href).toBe('http://localhost:3000/last');
});

test('Expect to have summary and inspect tabs', async () => {
  vi.mocked(window.listNetworks).mockResolvedValue([network1]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  await waitFor(
    () => {
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  const { getByRole } = render(NetworkDetails, { networkName: 'Network 1', engineId: 'podman1' });

  await waitFor(() => {
    getByRole('link', { name: 'Summary' });
    getByRole('link', { name: 'Inspect' });
  });

  const summaryTab = getByRole('link', { name: 'Summary' });
  expect(summaryTab).toBeInTheDocument();

  await fireEvent.click(summaryTab);

  expect(window.location.href.endsWith('/summary')).toBeTruthy();

  const inspectTab = getByRole('link', { name: 'Inspect' });
  expect(inspectTab).toBeInTheDocument();

  await fireEvent.click(inspectTab);

  expect(window.location.href.endsWith('/inspect')).toBeTruthy();
});
