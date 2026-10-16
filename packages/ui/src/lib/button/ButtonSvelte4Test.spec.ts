/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { fireEvent, render } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import ContainerIcon from '../icons/ContainerIcon.svelte';
import ButtonSvelte4Test from './ButtonSvelte4Test.svelte';

test('should render content', () => {
  const { getByText } = render(ButtonSvelte4Test, {
    onclick: vi.fn(),
    content: 'Dummy Button',
    icon: undefined,
  });

  const btn = getByText('Dummy Button');
  expect(btn).toBeInTheDocument();
});

test('svelte component icon should be properly rendered', () => {
  const { container } = render(ButtonSvelte4Test, {
    onclick: vi.fn(),
    content: 'Dummy Button',
    icon: ContainerIcon,
  });

  const svg = container.querySelector('svg');
  expect(svg).toBeDefined();
});

test('click event should be propagated', async () => {
  const onclickMock = vi.fn();
  const { getByRole } = render(ButtonSvelte4Test, {
    onclick: onclickMock,
    icon: undefined,
    content: undefined,
  });

  const btn = getByRole('button');
  expect(btn).toBeInTheDocument();

  expect(onclickMock).not.toHaveBeenCalled();

  await fireEvent.click(btn);

  expect(onclickMock).toHaveBeenCalledOnce();
});

test('click event should not be propagated when disabled', async () => {
  const onclickMock = vi.fn();
  const { getByRole } = render(ButtonSvelte4Test, {
    onclick: onclickMock,
    icon: undefined,
    content: undefined,
    disabled: true,
  });

  await fireEvent.click(getByRole('button'));

  expect(onclickMock).not.toHaveBeenCalled();
});
