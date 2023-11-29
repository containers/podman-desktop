/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import '@testing-library/jest-dom/vitest';
import { beforeEach, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import PreferencesKubernetesContextsRendering from './PreferencesKubernetesContextsRendering.svelte';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import type { KubeContext } from '../../../../main/src/plugin/kubernetes-context';

// Create a fake KubeContextUI
const mockContext1: KubeContext = {
  name: 'context-name',
  cluster: 'cluster-name',
  user: 'user-name',
  clusterInfo: {
    name: 'cluster-name',
    server: 'https://server-name',
  },
};

const mockContext2: KubeContext = {
  name: 'context-name2',
  cluster: 'cluster-name2',
  user: 'user-name2',
  clusterInfo: {
    name: 'cluster-name2',
    server: 'https://server-name2',
  },
  currentContext: true,
};

beforeEach(() => {
  kubernetesContexts.set([mockContext1, mockContext2]);
});

test('test that name, cluster and the server is displayed when rendering', async () => {
  (window as any).kubernetesGetCurrentContextName = vi.fn().mockResolvedValue('my-current-context');
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('context-name')).toBeInTheDocument();
  expect(await screen.findByText('cluster-name')).toBeInTheDocument();
  expect(await screen.findByText('user-name')).toBeInTheDocument();
  expect(await screen.findByText('https://server-name')).toBeInTheDocument();
});

test('If nothing is returned for contexts, expect that the page shows a message', async () => {
  kubernetesContexts.set([]);
  render(PreferencesKubernetesContextsRendering, {});
  expect(await screen.findByText('No Kubernetes contexts found')).toBeInTheDocument();
});

test('Test that context-name2 is the current context', async () => {
  (window as any).kubernetesGetCurrentContextName = vi.fn().mockResolvedValue('context-name2');
  render(PreferencesKubernetesContextsRendering, {});

  // Get current-context by aria label
  // find "context-name" which is located within the same parent div as current-context
  // make sure the content is context-name2
  const currentContext = await screen.findByLabelText('current-context');
  expect(currentContext).toBeInTheDocument();

  // Make sure that the span with the text "context-name2" is within the same parent div as current-context (to make sure that it is the current context)
  const spanContextName = await screen.findByText('context-name2');
  expect(spanContextName).toBeInTheDocument();
  expect(spanContextName.parentElement).toEqual(currentContext.parentElement);
});

test('when deleting the current context, a popup should ask confirmation', async () => {
  const showMessageBoxMock = vi.fn();
  (window as any).showMessageBox = showMessageBoxMock;
  showMessageBoxMock.mockResolvedValue({ result: 1 });

  render(PreferencesKubernetesContextsRendering, {});
  const currentContext = screen.getAllByRole('row')[1];
  expect(currentContext).toBeInTheDocument();

  const label = within(currentContext).queryByLabelText('current-context');
  expect(label).toBeInTheDocument();

  const deleteBtn = within(currentContext).getByRole('button', { name: 'Delete Context' });
  expect(deleteBtn).toBeInTheDocument();
  await fireEvent.click(deleteBtn);
  expect(showMessageBoxMock).toHaveBeenCalledOnce();
});

test('when deleting the non current context, no popup should ask confirmation', async () => {
  const showMessageBoxMock = vi.fn();
  (window as any).showMessageBox = showMessageBoxMock;
  showMessageBoxMock.mockResolvedValue({ result: 1 });

  render(PreferencesKubernetesContextsRendering, {});
  const currentContext = screen.getAllByRole('row')[0];
  expect(currentContext).toBeInTheDocument();

  const label = within(currentContext).queryByLabelText('current-context');
  expect(label).not.toBeInTheDocument();

  const deleteBtn = within(currentContext).getByRole('button', { name: 'Delete Context' });
  expect(deleteBtn).toBeInTheDocument();
  await fireEvent.click(deleteBtn);
  expect(showMessageBoxMock).not.toHaveBeenCalled();
});
