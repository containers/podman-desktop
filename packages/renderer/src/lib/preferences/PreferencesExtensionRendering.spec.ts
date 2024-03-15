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

import '@testing-library/jest-dom/vitest';

import { render, screen, waitForElementToBeRemoved } from '@testing-library/svelte';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { extensionInfos } from '../../stores/extensions';
import PreferencesExtensionRendering from './PreferencesExtensionRendering.svelte';

const getOnboardingMock = vi.fn();
// fake the window.events object
beforeAll(() => {
  (window as any).getOnboarding = getOnboardingMock;
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
    readme: '',
    removable: true,
  };

  extensionInfos.set([extensionInfo]);
  return extensionInfo.id;
}
describe('PreferencesExtensionRendering', () => {
  test('Expect that the buttons have the correct state when an extension is stopped', async () => {
    const id = setup('stopped');
    render(PreferencesExtensionRendering, { extensionId: id });

    const start = screen.getByRole('button', { name: 'Enable' });
    expect(start).toBeInTheDocument();
    expect(start).toBeEnabled();
    const stop = screen.getByRole('button', { name: 'Disable' });
    expect(stop).toBeInTheDocument();
    expect(stop).toBeDisabled();
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toBeInTheDocument();
    expect(remove).toBeEnabled();
  });

  test('Expect that the buttons have the correct state when an extension is started', async () => {
    const id = setup('started');
    render(PreferencesExtensionRendering, { extensionId: id });

    const start = screen.getByRole('button', { name: 'Enable' });
    expect(start).toBeInTheDocument();
    expect(start).toBeDisabled();
    const stop = screen.getByRole('button', { name: 'Disable' });
    expect(stop).toBeInTheDocument();
    expect(stop).toBeEnabled();
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toBeInTheDocument();
    expect(remove).toBeDisabled();
  });

  test('Expect that the buttons have the correct state when an extension is starting', async () => {
    const id = setup('starting');
    render(PreferencesExtensionRendering, { extensionId: id });

    const start = screen.getByRole('button', { name: 'Enable' });
    expect(start).toBeInTheDocument();
    expect(start).toBeDisabled();
    const stop = screen.getByRole('button', { name: 'Disable' });
    expect(stop).toBeInTheDocument();
    expect(stop).toBeDisabled();
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toBeInTheDocument();
    expect(remove).toBeDisabled();
  });

  test('Expect that the buttons have the correct state when an extension is stopping', async () => {
    const id = setup('stopping');
    render(PreferencesExtensionRendering, { extensionId: id });

    const start = screen.getByRole('button', { name: 'Enable' });
    expect(start).toBeInTheDocument();
    expect(start).toBeDisabled();
    const stop = screen.getByRole('button', { name: 'Disable' });
    expect(stop).toBeInTheDocument();
    expect(stop).toBeDisabled();
    const remove = screen.getByRole('button', { name: 'Remove' });
    expect(remove).toBeInTheDocument();
    expect(remove).toBeDisabled();
  });

  test('Expect empty screen if there is no matching extension (could be during providerInfos is loading)', async () => {
    // clear store
    extensionInfos.set([]);

    // start without extension in the stores, should be empty
    render(PreferencesExtensionRendering, { extensionId: 'test' });

    // check empty page is displayed if we do not have matching of the extension
    const emptyHeading = screen.getByRole('heading', { name: 'Extension not found', level: 1 });
    expect(emptyHeading).toBeInTheDocument();

    // now register the extension in the store
    setup('started');

    // wait empty page disappear
    await waitForElementToBeRemoved(() => screen.queryByRole('heading', { name: 'Extension not found', level: 1 }));

    // now check disable button is displayed as extension is started
    const start = screen.getByRole('button', { name: 'Disable' });
    expect(start).toBeInTheDocument();
    expect(start).toBeEnabled();
  });
});
