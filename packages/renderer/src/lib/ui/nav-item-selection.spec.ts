/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import { expect, test } from 'vitest';

import { isNavItemSelected } from './nav-item-selection';

test.each([
  { route: '/pods', href: '/pods', expected: true, desc: 'exact match' },
  { route: '/pods/podman/foo', href: '/pods', expected: true, desc: 'child route' },
  { route: '/pods?filter=running', href: '/pods', expected: true, desc: 'query string is ignored' },
  { route: '/containers', href: '/pods', expected: false, desc: 'unrelated route' },
  { route: '/', href: '/', expected: true, desc: 'root matches root' },
  { route: '/pods', href: '/', expected: false, desc: 'root never matches a deeper route' },
  { route: '/kubernetes/nodes', href: '/kubernetes', expected: true, desc: 'submenu parent' },
  { route: '/my%20page', href: '/my page', expected: true, desc: 'href is URI encoded before comparing' },
])('isNavItemSelected($route, $href) is $expected — $desc', ({ route, href, expected }) => {
  expect(isNavItemSelected(route, href)).toBe(expected);
});
