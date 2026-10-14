/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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

import type { OverriddenExtension } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test } from 'vitest';

import ExtensionBadge from './ExtensionBadge.svelte';

type ExtensionType = {
  type: 'dd' | 'pd';
  removable: boolean;
  devMode: boolean;
  bundled: boolean;
  overrides?: OverriddenExtension;
};

beforeEach(() => {});

test('Expect to have badge for dd Extension', async () => {
  const extension: ExtensionType = {
    type: 'dd',
    removable: true,
    devMode: false,
    bundled: false,
  };
  render(ExtensionBadge, { extension });

  const visibleLabel = screen.getByText('Docker Desktop extension');
  expect(visibleLabel).toBeInTheDocument();

  const tooltipTrigger = screen.getByTestId('tooltip-trigger');
  await fireEvent.mouseEnter(tooltipTrigger);

  const labels = await screen.findAllByText('Docker Desktop extension');
  expect(labels).toHaveLength(2);
  expect(labels[0]).toBeInTheDocument();
  expect(labels[1]).toBeInTheDocument();
});

test('Expect to have badge for pd bundled extension', async () => {
  const extension: ExtensionType = {
    type: 'pd',
    removable: false,
    devMode: false,
    bundled: true,
  };
  render(ExtensionBadge, { extension });

  const visibleLabel = screen.getByText('Bundled extension');
  expect(visibleLabel).toBeInTheDocument();

  const tooltipTrigger = screen.getByTestId('tooltip-trigger');
  await fireEvent.mouseEnter(tooltipTrigger);

  const labels = await screen.findAllByText('Bundled extension');
  expect(labels).toHaveLength(2);
  expect(labels[0]).toBeInTheDocument();
  expect(labels[1]).toBeInTheDocument();
});

test('Expect to have badge for devMode Extension', async () => {
  const extension: ExtensionType = {
    type: 'pd',
    removable: false,
    devMode: true,
    bundled: false,
  };
  render(ExtensionBadge, { extension });

  const visibleLabel = screen.getByText('devMode Extension');
  expect(visibleLabel).toBeInTheDocument();

  const tooltipTrigger = screen.getByTestId('tooltip-trigger');
  expect(tooltipTrigger).toBeInTheDocument();
  await fireEvent.mouseEnter(tooltipTrigger);

  const tooltip = await screen.findByText('In Development Mode Extension');
  expect(tooltip).toBeInTheDocument();
});

test('Expect an Overrides badge naming the bundled extension it replaces', async () => {
  const extension: ExtensionType = {
    type: 'pd',
    removable: true,
    devMode: false,
    bundled: false,
    overrides: { id: 'podman-desktop.kind', version: '1.31.0-next' },
  };
  render(ExtensionBadge, { extension });

  expect(screen.getByText('Overrides')).toBeInTheDocument();

  await fireEvent.mouseEnter(screen.getByTestId('tooltip-trigger'));
  expect(
    await screen.findByText('Replaces the bundled extension podman-desktop.kind v1.31.0-next'),
  ).toBeInTheDocument();
});

test('Expect the Overrides badge next to the devMode badge for an --extension-folder extension', () => {
  const extension: ExtensionType = {
    type: 'pd',
    removable: false,
    devMode: true,
    bundled: false,
    overrides: { id: 'podman-desktop.kind', version: '1.31.0-next' },
  };
  render(ExtensionBadge, { extension });

  expect(screen.getByText('devMode Extension')).toBeInTheDocument();
  expect(screen.getByText('Overrides')).toBeInTheDocument();
});

test('Expect no Overrides badge for an extension not replacing a bundled one', () => {
  const extension: ExtensionType = {
    type: 'pd',
    removable: true,
    devMode: false,
    bundled: false,
  };
  render(ExtensionBadge, { extension });

  expect(screen.queryByText('Overrides')).not.toBeInTheDocument();
});
