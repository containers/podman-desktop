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

import type { Uri as APIUri } from '@podman-desktop/api';
import { afterEach, expect, test, vi } from 'vitest';

import { Uri } from './Uri.js';

afterEach(() => {
  vi.resetAllMocks();
  vi.clearAllMocks();
});

test('Expect revive to return revived Uri object', () => {
  const uriSerialized = {
    _scheme: 'scheme',
    _authority: 'authority',
    _path: 'path',
    _query: 'query',
    _fragment: 'fragment',
  } as unknown as APIUri;

  const revived = Uri.revive(uriSerialized);
  expect(revived.authority).equals('authority');
  expect(revived.scheme).equals('scheme');
  expect(revived.path).equals('path');
  expect(revived.fsPath).equals('path');
  expect(revived.query).equals('query');
  expect(revived.fragment).equals('fragment');
});
