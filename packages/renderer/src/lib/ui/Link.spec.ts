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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';
import { test, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import Link from './Link.svelte';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { router } from 'tinro';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

test('Check link styling', async () => {
  render(Link);

  // check for one element of the styling
  const link = screen.getByRole('link');
  expect(link).toBeInTheDocument();
  expect(link).toHaveClass('text-purple-400');
  expect(link).toHaveClass('hover:bg-white');
  expect(link).toHaveClass('hover:bg-opacity-10');
  expect(link).toHaveClass('cursor-pointer');
});

test('Check icon styling', async () => {
  render(Link, { icon: faRocket });

  // check for the fa SVG child
  const link = screen.getByRole('link');
  expect(link).toBeInTheDocument();
  expect(link.firstChild).toBeInTheDocument();
  expect(link.firstChild?.firstChild).toBeInTheDocument();
  expect(link.firstChild?.firstChild).toHaveClass('svelte-fa');
});

test('Check href action', async () => {
  const urlMock = vi.fn();
  (window as any).openExternal = urlMock;
  render(Link, { externalRef: 'http://test.com' });

  // check href link
  const link = screen.getByRole('link');
  expect(link).toBeInTheDocument();
  expect(urlMock).not.toHaveBeenCalled();

  fireEvent.click(link);

  expect(urlMock).toBeCalledTimes(1);
  expect(router.goto).not.toHaveBeenCalled();
});

test('Check local href action', async () => {
  const urlMock = vi.fn();
  (window as any).openExternal = urlMock;
  render(Link, { internalRef: '/Pods' });

  // check href link
  const link = screen.getByRole('link');
  expect(link).toBeInTheDocument();

  fireEvent.click(link);

  expect(router.goto).toBeCalledTimes(1);
  expect(urlMock).not.toHaveBeenCalled();
});

test('Check on:click action', async () => {
  const comp = render(Link);

  const clickMock = vi.fn();
  comp.component.$on('click', clickMock);

  // check on:click
  const link = screen.getByRole('link');
  expect(link).toBeInTheDocument();
  expect(clickMock).not.toHaveBeenCalled();

  fireEvent.click(link);

  expect(clickMock).toBeCalledTimes(1);
});
