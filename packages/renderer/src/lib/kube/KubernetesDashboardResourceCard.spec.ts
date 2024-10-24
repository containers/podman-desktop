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
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import NodeIcon from '../images/NodeIcon.svelte';
import KubernetesDashboardResourceCard from './KubernetesDashboardResourceCard.svelte';

test('Verify basic card format', async () => {
  const params = { type: 'a type', Icon: NodeIcon, count: 4, link: 'test' };
  render(KubernetesDashboardResourceCard, params);

  const type = screen.getByText(params.type);
  expect(type).toBeInTheDocument();
  expect(type).toHaveClass('text-[var(--pd-invert-content-card-text)]');
  expect(type).toHaveClass('font-semibold');

  const count = screen.getByText(params.count);
  expect(count).toBeInTheDocument();
  expect(count).toHaveClass('text-2xl');
  expect(count).toHaveClass('text-[var(--pd-invert-content-card-text)]');
});

test('Expect clicking words', async () => {
  const gotoSpy = vi.spyOn(router, 'goto');

  const params = { type: 'a type', Icon: NodeIcon, count: 4, link: 'test-link' };
  render(KubernetesDashboardResourceCard, params);

  const type = screen.getByText(params.type);
  expect(type).toBeInTheDocument();

  expect(gotoSpy).not.toHaveBeenCalled();
  await userEvent.click(type);
  expect(gotoSpy).toHaveBeenCalledWith(params.link);
});
