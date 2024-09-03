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
import { tick } from 'svelte';
import { expect, test } from 'vitest';

import Tooltip from './Tooltip.svelte';
import { tooltipHidden } from './tooltip-store';

test('tooltip is not empty string when tooltipHidden value false', async () => {
  tooltipHidden.set(false);

  render(Tooltip, { tip: 'test 1' });
  expect(screen.queryByText('test 1')).toBeInTheDocument();

  tooltipHidden.set(true);
  await tick();
  expect(screen.queryByText('test 1')).not.toBeInTheDocument();

  tooltipHidden.set(false);
  await tick();
  expect(screen.queryByText('test 1')).toBeInTheDocument();
});
