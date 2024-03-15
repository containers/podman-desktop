/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { beforeEach, expect, expectTypeOf, test, vi } from 'vitest';

import type { ViewContributionIcon } from './api/view-info.js';
import type { Disposable } from './types/disposable.js';
import { ViewRegistry } from './view-registry.js';

let viewRegistry: ViewRegistry;

let registerViewsDisposable: Disposable;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeEach(() => {
  viewRegistry = new ViewRegistry();
  const manifest = {
    contributes: {
      views: {
        'icons/containersList': [
          {
            when: 'io.x-k8s.kind.cluster in containerLabelKeys',
            icon: '${kind-icon}',
          },
        ],
      },
    },
  };
  registerViewsDisposable = viewRegistry.registerViews('extension', manifest.contributes.views);
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should return empty array for unknown view', async () => {
  const views = viewRegistry.fetchViewsContributions('unknown');
  expect(views).toBeDefined();
  expectTypeOf(views).toBeArray();
  expect(views.length).toBe(0);
});

test('View context should have a single entry', async () => {
  const views = viewRegistry.fetchViewsContributions('extension');
  expect(views).toBeDefined();
  expectTypeOf(views).toBeArray();
  expect(views.length).toBe(1);
  expect((views[0].value as ViewContributionIcon).when).toBe('io.x-k8s.kind.cluster in containerLabelKeys');
  expect((views[0].value as ViewContributionIcon).icon).toBe('${kind-icon}');
});

test('Should not find menus after dispose', async () => {
  registerViewsDisposable.dispose();
  const views = viewRegistry.fetchViewsContributions('extension');
  expect(views).toStrictEqual([]);
});
