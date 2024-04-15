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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';
import { configurationProperties } from '/@/stores/configurationProperties';
import { onboardingList } from '/@/stores/onboarding';

import type { OnboardingInfo } from '../../../../main/src/plugin/api/onboarding';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import InstalledExtensionCardLeftOnboardingAndProperties from './InstalledExtensionCardLeftOnboardingAndProperties.svelte';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect to have onboarding button for extension', async () => {
  const onboardingInfo: OnboardingInfo = {
    extension: 'myExtensionId',
    name: '',
    displayName: '',
    icon: '',
    title: '',
    steps: [],
    enablement: 'true',
  };

  onboardingList.set([onboardingInfo]);

  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'myExtensionId',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: '',
    path: '',
    readme: '',
  };
  render(InstalledExtensionCardLeftOnboardingAndProperties, { extension });

  // expect button to be there 'Onboarding foo'
  const onboardingButton = screen.getByRole('button', { name: 'Onboarding foo' });
  expect(onboardingButton).toBeInTheDocument();

  // expect button to be enabled
  expect(onboardingButton).toBeEnabled();

  // click on it
  await fireEvent.click(onboardingButton);

  // check method has been called
  expect(router.goto).toHaveBeenCalledWith('/preferences/onboarding/myExtensionId');
});

test('expect edit properties button being enabled', async () => {
  const configSchema: IConfigurationPropertyRecordedSchema = {
    title: '',
    parentId: 'preferences.myExtensionId.hello',
    scope: 'DEFAULT',
  };

  // add onboarding properties
  configurationProperties.set([configSchema]);

  const extension: CombinedExtensionInfoUI = {
    type: 'pd',
    id: 'myExtensionId',
    name: 'foo',
    description: 'my description',
    displayName: '',
    publisher: '',
    removable: true,
    version: 'v1.2.3',
    state: '',
    path: '',
    readme: '',
  };

  render(InstalledExtensionCardLeftOnboardingAndProperties, { extension });

  // expect button to be there 'Edit Properties'
  const editPropertiesButton = screen.getByRole('button', { name: 'Edit properties of foo extension' });
  expect(editPropertiesButton).toBeInTheDocument();

  // expect button to be enabled
  expect(editPropertiesButton).toBeEnabled();

  // click on it
  await fireEvent.click(editPropertiesButton);

  // check method has been called
  expect(router.goto).toHaveBeenCalledWith('/preferences/default/preferences.myExtensionId');
});
