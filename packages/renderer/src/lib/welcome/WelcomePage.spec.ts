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

import { fireEvent, render, screen } from '@testing-library/svelte';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { beforeAll, expect, test, vi } from 'vitest';

import { onboardingList } from '/@/stores/onboarding';

import WelcomePage from './WelcomePage.svelte';

const getFeaturedExtensionsMock = vi.fn();
const getProviderInfosMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
  (window as any).updateConfigurationValue = vi.fn();
  (window as any).getPodmanDesktopVersion = vi.fn();
  (window as any).telemetryConfigure = vi.fn();
  (window as any).getFeaturedExtensions = getFeaturedExtensionsMock;
  (window as any).getProviderInfos = getProviderInfosMock;
  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

async function waitRender(customProperties: object): Promise<void> {
  render(WelcomePage, { ...customProperties });
  await tick();
}

test('Expect the close button is on the page', async () => {
  await waitRender({ showWelcome: true });
  const button = screen.getByRole('button', { name: 'Go to Podman Desktop' });
  expect(button).toBeInTheDocument();
  expect(button).toBeEnabled();
});

test('Expect that the close button closes the window', async () => {
  await waitRender({ showWelcome: true });
  const button = screen.getByRole('button', { name: 'Go to Podman Desktop' });
  await fireEvent.click(button);
  // and the button is gone
  expect(button).not.toBeInTheDocument();
});

test('Expect that telemetry UI is hidden when telemetry has already been prompted', async () => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue('true');
  await waitRender({ showWelcome: true, showTelemetry: false });
  let checkbox;
  try {
    checkbox = screen.getByRole('checkbox', { name: 'Enable telemetry' });
  } catch {
    // ignore errors
  }
  expect(checkbox).toBe(undefined);
});

test('Expect that telemetry UI is visible when necessary', async () => {
  await waitRender({ showWelcome: true, showTelemetry: true });
  const checkbox = screen.getByRole('checkbox', { name: 'Enable telemetry' });
  expect(checkbox).toBeInTheDocument();
});

test('Expect welcome screen to show three checked onboarding providers', async () => {
  onboardingList.set([
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar1',
      displayName: 'FooBar1',
      icon: 'data:image/png;base64,foobar1',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          completionEvents: [],
        },
      ],
      enablement: 'true',
    },
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar2',
      displayName: 'FooBar2',
      icon: 'data:image/png;base64,foobar2',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          completionEvents: [],
        },
      ],
      enablement: 'true',
    },
    {
      extension: 'id',
      title: 'onboarding',
      name: 'foobar3',
      displayName: 'FooBar3',
      icon: 'data:image/png;base64,foobar3',
      steps: [
        {
          id: 'step',
          title: 'step',
          state: 'failed',
          completionEvents: [],
        },
      ],
      enablement: 'true',
    },
  ]);

  // wait until the onboarding list is populated
  while (get(onboardingList).length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  await waitRender({ showWelcome: true });

  // wait until aria-label 'providerList' is populated
  while (screen.queryAllByLabelText('providerList').length === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Check that the logos for foobar1, foobar2, and foobar3 are present
  const image1 = screen.getByRole('img', { name: 'foobar1 logo' });
  expect(image1).toBeInTheDocument();
  expect(image1).toHaveAttribute('src', 'data:image/png;base64,foobar1');

  const image2 = screen.getByRole('img', { name: 'foobar2 logo' });
  expect(image2).toBeInTheDocument();
  expect(image2).toHaveAttribute('src', 'data:image/png;base64,foobar2');

  const image3 = screen.getByRole('img', { name: 'foobar3 logo' });
  expect(image3).toBeInTheDocument();
  expect(image3).toHaveAttribute('src', 'data:image/png;base64,foobar3');

  // Check that all three are checked as well
  const checkbox1 = screen.getByRole('checkbox', { name: 'FooBar1 checkbox' });
  expect(checkbox1).toBeInTheDocument();
  expect(checkbox1).toBeChecked();

  const checkbox2 = screen.getByRole('checkbox', { name: 'FooBar2 checkbox' });
  expect(checkbox2).toBeInTheDocument();
  expect(checkbox2).toBeChecked();

  const checkbox3 = screen.getByRole('checkbox', { name: 'FooBar3 checkbox' });
  expect(checkbox3).toBeInTheDocument();
  expect(checkbox3).toBeChecked();
});
