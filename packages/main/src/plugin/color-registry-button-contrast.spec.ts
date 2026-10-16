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

import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { wcagContrast } from 'culori';
import { assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { Disposable } from '/@/plugin/types/disposable.js';

import { ColorRegistry } from './color-registry.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import type { DefaultConfiguration } from './default-configuration.js';
import type { Directories } from './directories.js';
import type { LockedConfiguration } from './locked-configuration.js';

vi.mock(import('./configuration-registry.js'));

class TestColorRegistry extends ColorRegistry {
  override initColors(): void {
    super.initColors();
  }
}

const apiSender: ApiSenderType = {
  send: vi.fn(),
  receive: vi.fn(),
};

let registry: TestColorRegistry;

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(ConfigurationRegistry.prototype.addConfigurationEnum).mockReturnValue(Disposable.noop());
  const configurationRegistry = new ConfigurationRegistry(
    apiSender,
    {} as Directories,
    {} as DefaultConfiguration,
    {} as LockedConfiguration,
  );
  registry = new TestColorRegistry(apiSender, configurationRegistry);
  registry.initColors();
});

// WCAG 1.4.11 non-text contrast
const MIN_CONTRAST = 3;

// Button.svelte draws the ring with outline-offset-2, so a 2px gap of the surface behind the button
// separates the ring from the button fill. The surface is therefore the only adjacent colour (WCAG 2.4.7).
const SURFACES = ['content-bg', 'content-card-bg', 'content-card-inset-bg', 'modal-bg', 'invert-content-bg'];
const RINGS = ['button-focus-ring', 'button-focus-ring-danger'];

describe.each(['light', 'dark', 'hc-light', 'hc-dark'])('button focus ring contrast in %s theme', theme => {
  const cases = RINGS.flatMap(ring => SURFACES.map(surface => [ring, surface] as const));

  test.each(cases)('%s against %s is at least 3:1', (ring, surface) => {
    const colors = new Map(registry.listColors(theme).map(c => [c.id, c.value]));
    const ringValue = colors.get(ring);
    const surfaceValue = colors.get(surface);
    assert(ringValue, `${ring} is not registered in ${theme}`);
    assert(surfaceValue, `${surface} is not registered in ${theme}`);

    expect(wcagContrast(ringValue, surfaceValue)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });
});
