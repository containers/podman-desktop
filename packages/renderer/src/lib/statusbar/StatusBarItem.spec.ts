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

import { test, expect } from 'vitest';
import type { StatusBarEntry } from '../../../../main/src/plugin/statusbar/statusbar-registry';
import { iconClass } from './StatusBarItem';

test('check iconClass with font awesome icons', () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: 'fas fa-podman',
  };

  const icon = iconClass(statusBarEntry);
  expect(icon).toBe('fas fa-podman');
});

test('check iconClass with custom icon name', () => {
  const statusBarEntry: StatusBarEntry = {
    enabled: true,
    activeIconClass: '${podman}',
  };

  const icon = iconClass(statusBarEntry);
  expect(icon).toBe('podman-desktop-icon-podman');
});
