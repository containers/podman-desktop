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
import { describe, expect, test } from 'vitest';

import Spinner from './Spinner.svelte';

describe('parent attributes should be propagate', () => {
  test('style attribute should be propagated', () => {
    render(Spinner, {
      style: 'color: green;',
    });

    const spinner = screen.getByRole('progressbar', { name: 'Loading', busy: true });
    expect(spinner).toBeDefined();

    expect(spinner.getAttribute('style')).toBe('color: green;');
  });

  test('class attribute should be propagated', () => {
    render(Spinner, {
      class: 'dummy-class',
    });

    const spinner = screen.getByRole('progressbar', { name: 'Loading', busy: true });
    expect(spinner).toBeDefined();

    expect(spinner.classList).toContain('dummy-class');
  });
});
