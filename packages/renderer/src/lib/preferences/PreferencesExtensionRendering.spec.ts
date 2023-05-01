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

import '@testing-library/jest-dom';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PreferencesExtensionRendering from './PreferencesExtensionRendering.svelte';
import { extensionInfos } from '../../stores/extensions';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

// extension page needs a mock extension to work correctly
function setup(state: string): string {
  const extensionInfo = {
    id: 'test',
    name: 'test',
    version: '1.0',
    displayName: 'Test extension',
    state: state,
    description: 'An extension for testing',
    path: '/test',
    publisher: 'podman-desktop',
    removable: true,
  };

  extensionInfos.set([extensionInfo]);
  return extensionInfo.id;
}
describe('PreferencesExtensionRendering', () => {
  test('Expect that the buttons have the correct state when an extension is stopped', async () => {
    const id = setup('stopped');
    render(PreferencesExtensionRendering, { extensionId: id });

    const start = screen.getByRole('button', { name: 'Start' });
    expect(start).toBeInTheDocument();
    expect(start).toBeEnabled();
    const stop = screen.getByRole('button', { name: 'Stop' });
    expect(stop).toBeInTheDocument();
    expect(stop).toBeDisabled();
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toBeInTheDocument();
    expect(remove).toBeEnabled();
  });

  test('Expect that the buttons have the correct state when an extension is started', async () => {
    const id = setup('started');
    render(PreferencesExtensionRendering, { extensionId: id });

    const start = screen.getByRole('button', { name: 'Start' });
    expect(start).toBeInTheDocument();
    expect(start).toBeDisabled();
    const stop = screen.getByRole('button', { name: 'Stop' });
    expect(stop).toBeInTheDocument();
    expect(stop).toBeEnabled();
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toBeInTheDocument();
    expect(remove).toBeDisabled();
  });

  test('Expect that the buttons have the correct state when an extension is starting', async () => {
    const id = setup('starting');
    render(PreferencesExtensionRendering, { extensionId: id });

    const start = screen.getByRole('button', { name: 'Start' });
    expect(start).toBeInTheDocument();
    expect(start).toBeDisabled();
    const stop = screen.getByRole('button', { name: 'Stop' });
    expect(stop).toBeInTheDocument();
    expect(stop).toBeDisabled();
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toBeInTheDocument();
    expect(remove).toBeDisabled();
  });

  test('Expect that the buttons have the correct state when an extension is stopping', async () => {
    const id = setup('stopping');
    render(PreferencesExtensionRendering, { extensionId: id });

    const start = screen.getByRole('button', { name: 'Start' });
    expect(start).toBeInTheDocument();
    expect(start).toBeDisabled();
    const stop = screen.getByRole('button', { name: 'Stop' });
    expect(stop).toBeInTheDocument();
    expect(stop).toBeDisabled();
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toBeInTheDocument();
    expect(remove).toBeDisabled();
  });
});
