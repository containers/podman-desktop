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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';
import type { ProviderInfo } from '/@api/provider-info';

import KubernetesEmptyPage from './KubernetesEmptyPage.svelte';

const mocks = vi.hoisted(() => ({
  EmbeddableCatalogExtensionList: vi.fn(),
}));

vi.mock('../extensions/EmbeddableCatalogExtensionList.svelte', () => ({
  default: mocks.EmbeddableCatalogExtensionList,
}));

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

(window as any).telemetryTrack = vi.fn();

test('expect to call EmbeddableCatalogExtensionList for all Kubernetes provider (local and remote)', () => {
  render(KubernetesEmptyPage);
  expect(mocks.EmbeddableCatalogExtensionList).toHaveBeenCalledTimes(1);
  expect(mocks.EmbeddableCatalogExtensionList).toHaveBeenNthCalledWith(
    1,
    expect.anything(),
    expect.objectContaining({
      category: 'Kubernetes',
      keywords: expect.arrayContaining(['provider']),
    }),
  );

  expect(mocks.EmbeddableCatalogExtensionList).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      keywords: expect.arrayContaining(['provider']),
      title: 'Extensions to help you deploy Kubernetes clusters on your machine or connect remotely to:',
    }),
  );
});

test('expect to send telemetry when extension that is installed is viewed', () => {
  mocks.EmbeddableCatalogExtensionList.mockImplementation((_, props) => {
    props.oninstall('extension-local');
  });
  render(KubernetesEmptyPage);
  expect(vi.mocked(window.telemetryTrack)).toHaveBeenCalledWith('kubernetes.nocontext.installExtension', {
    extension: 'extension-local',
  });
});

test('expect to send telemetry when extension that is ALREADY installed is viewed', () => {
  mocks.EmbeddableCatalogExtensionList.mockImplementation((_, props) => {
    props.ondetails('extension-local');
  });
  render(KubernetesEmptyPage);
  expect(vi.mocked(window.telemetryTrack)).toHaveBeenCalledWith('kubernetes.nocontext.showExtensionDetails', {
    extension: 'extension-local',
  });
});

test('expect to have links for each Kubernetes provider', async () => {
  providerInfos.set([
    {
      id: 'provider1',
      internalId: '101',
      name: 'Name 1',
      kubernetesProviderConnectionCreation: true,
      kubernetesProviderConnectionCreationButtonTitle: 'Go create',
    } as unknown as ProviderInfo,
    {
      id: 'provider2',
      internalId: '102',
      name: 'Name 2',
      kubernetesProviderConnectionCreation: true,
    } as unknown as ProviderInfo,
    {
      id: 'provider3',
      internalId: '103',
      name: 'Name 3',
    } as unknown as ProviderInfo,
  ]);
  render(KubernetesEmptyPage);
  await waitFor(() => {
    expect(screen.queryByLabelText('Go create')).not.toBeNull();
  });

  const link1 = screen.getByLabelText('Go create');
  await fireEvent.click(link1);
  expect(router.goto).toHaveBeenCalledWith('/preferences/provider/101');
  expect(vi.mocked(window.telemetryTrack)).toHaveBeenCalledWith('kubernetes.nocontext.createNew', {
    provider: 'provider1',
  });

  const link2 = screen.getByLabelText('Create new');
  await fireEvent.click(link2);
  expect(router.goto).toHaveBeenCalledWith('/preferences/provider/102');
  expect(vi.mocked(window.telemetryTrack)).toHaveBeenCalledWith('kubernetes.nocontext.createNew', {
    provider: 'provider2',
  });

  expect(screen.queryByLabelText(/Name 3/)).toBeNull();

  providerInfos.set([]);
  // Links should be updated (removed)
  await waitFor(() => {
    expect(screen.queryByLabelText(/Go create/)).toBeNull();
    expect(screen.queryByLabelText(/Create new/)).toBeNull();
  });
});
