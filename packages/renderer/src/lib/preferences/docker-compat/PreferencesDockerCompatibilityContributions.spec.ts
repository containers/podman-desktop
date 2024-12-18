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

import { render, screen } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import { ContextUI } from '/@/lib/context/context';
import { configurationProperties } from '/@/stores/configurationProperties';
import { context } from '/@/stores/context';
import { extensionInfos } from '/@/stores/extensions';
import type { ExtensionInfo } from '/@api/extension-info';

import PreferencesDockerCompatibilityContributions from './PreferencesDockerCompatibilityContributions.svelte';

beforeEach(() => {
  vi.resetAllMocks();

  Object.defineProperty(global, 'window', {
    value: {
      getConfigurationValue: vi.fn(),
      navigator: {
        clipboard: {
          writeText: vi.fn(),
        },
      },
    },
    writable: true,
  });
});

test('display group', async () => {
  // one extension
  extensionInfos.set([
    {
      id: 'my.extensionId',
      name: 'My Extension',
      description: 'My Extension description',
      version: '1.0.0',
      publisher: 'My Publisher',
      icon: 'my-icon',
      state: 'started',
    } as ExtensionInfo,
  ]);

  // two properties with the same group
  // one property without a group
  // one property with a different scope
  configurationProperties.set([
    {
      id: 'my.first.property',
      title: 'First Property',
      markdownDescription: 'First Property Description',
      parentId: '',
      scope: 'DockerCompatibility',
      group: 'my.extensionId',
      extension: {
        id: 'my.extensionId',
      },
    },
    {
      id: 'my.other.property',
      title: 'Other Property',
      markdownDescription: 'Other Property Description',
      parentId: '',
      scope: 'DockerCompatibility',
      group: 'my.extensionId',
      extension: {
        id: 'my.extensionId',
      },
    },
    {
      id: 'my.property.without.group',
      title: 'Property Without Group',
      parentId: '',
      scope: 'DockerCompatibility',
      group: '',
      extension: {
        id: 'my.extensionId',
      },
    },
    {
      id: 'my.property.with.different.scope',
      title: 'Property With Different Scope',
      parentId: '',
      scope: 'DEFAULT',
      group: 'my.extensionId',
    },
  ]);

  render(PreferencesDockerCompatibilityContributions);

  // check that the group is being displayed
  const groupName = screen.getByRole('list', { name: 'my.extensionId' });
  expect(groupName).toBeInTheDocument();

  // now, check that the two properties are there

  // search for text "My First: Property"
  const firstProperty = screen.getByRole('status', { name: 'My First: Property' });
  expect(firstProperty).toBeInTheDocument();

  // check markdown description
  const firstPropertyDescription = screen.getByRole('document', { name: 'my.first.property' });
  expect(firstPropertyDescription).toBeInTheDocument();

  // search for text "My Other: Property"
  const otherProperty = screen.getByRole('status', { name: 'My Other: Property' });
  expect(otherProperty).toBeInTheDocument();

  // other markdown description
  const otherPropertyDescription = screen.getByRole('document', { name: 'my.other.property' });
  expect(otherPropertyDescription).toBeInTheDocument();
});

test('no group if empty', async () => {
  // no property
  configurationProperties.set([]);

  // no extensions
  extensionInfos.set([]);

  // no global context
  context.set(new ContextUI());

  render(PreferencesDockerCompatibilityContributions);

  // no list item
  const listItems = screen.queryAllByRole('list');
  expect(listItems.length).toBe(0);
});
