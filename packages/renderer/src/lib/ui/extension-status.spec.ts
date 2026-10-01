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

import { describe, expect, test } from 'vitest';

import { ExtensionStatusMapper, type ExtensionStatusPresentation } from './extension-status';

const mapper = new ExtensionStatusMapper();

test.each([
  ['started', 'installed', { icon: 'running', labelClass: 'text-sm text-(--pd-status-running)', label: 'Installed' }],
  ['starting', 'enabling', { icon: 'waiting', labelClass: 'text-sm text-(--pd-status-waiting)', label: 'Enabling' }],
  ['stopped', 'disabled', { icon: 'stopped', labelClass: 'text-sm text-(--pd-status-stopped)', label: 'Disabled' }],
  ['stopping', 'disabling', { icon: 'waiting', labelClass: 'text-sm text-(--pd-status-waiting)', label: 'Disabling' }],
  ['failed', 'failed', { icon: 'terminated', labelClass: 'text-sm text-(--pd-status-terminated)', label: 'Failed' }],
] satisfies [string, string, ExtensionStatusPresentation][])(
  'maps extension state %s to lifecycle state %s',
  (extensionState, lifecycleState, presentation) => {
    expect(mapper.toLifecycleState(extensionState)).toBe(lifecycleState);
    expect(mapper.getPresentation(extensionState)).toEqual(presentation);
  },
);

test.each(['installed', 'missing-dependency', 'incompatible', 'upgrading', 'downgrading'])(
  'does not accept unproduced lifecycle state %s',
  status => {
    expect(mapper.toLifecycleState(status)).toBeUndefined();
  },
);

test.each(['unsupported', 'constructor', 'toString', '__proto__'])(
  'returns undefined for unsupported extension state %s',
  status => {
    expect(mapper.toLifecycleState(status)).toBeUndefined();
  },
);

describe('non-lifecycle presentations', () => {
  test('preserves the downloadable presentation', () => {
    expect(mapper.getPresentation('downloadable')).toEqual({
      icon: 'downloadable',
      labelClass: 'font-bold text-[9px] text-(--pd-status-ready)',
      label: 'DOWNLOADABLE',
    });
  });

  test('uses the unknown presentation and a title-case label for unsupported states', () => {
    expect(mapper.getPresentation('unexpected')).toEqual({
      icon: 'unknown',
      labelClass: 'font-bold text-[9px] text-(--pd-status-unknown)',
      label: 'Unexpected',
    });
  });
});
