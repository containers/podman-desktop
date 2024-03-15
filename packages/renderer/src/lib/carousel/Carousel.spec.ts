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

import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import CarouselTest from './CarouselTest.svelte';

let callback: any;

class ResizeObserver {
  constructor(callback1: (entries: ResizeObserverEntry[], observer: ResizeObserver) => void) {
    callback = callback1;
  }

  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeEach(() => {
  (window as any).ResizeObserver = ResizeObserver;
});

afterEach(() => {
  vi.resetAllMocks();
});

test('carousel cards get visible when size permits', async () => {
  render(CarouselTest);
  const card1 = screen.getByText('card 1');
  console.log(window.innerWidth);
  expect(card1).toBeVisible();

  callback([{ contentRect: { width: 680 } }]);

  await waitFor(() => {
    const card2 = screen.getByText('card 2');
    expect(card2).toBeVisible();
  });

  const cards = screen.queryAllByText('card 3');
  expect(cards.length).toBe(0);

  callback([{ contentRect: { width: 1020 } }]);

  await waitFor(() => {
    const card3 = screen.getByText('card 3');
    expect(card3).toBeVisible();
  });
});

test('rotate left button displays previous card', async () => {
  render(CarouselTest);
  const card1 = screen.getByText('card 1');
  expect(card1).toBeVisible();

  const cards = screen.queryAllByText('card 3');
  expect(cards.length).toBe(0);

  const left = screen.getByRole('button', { name: 'Rotate left' });
  await fireEvent.click(left);

  const card3 = screen.getByText('card 3');
  expect(card3).toBeVisible();
});

test('rotate right button displays next card', async () => {
  render(CarouselTest);
  const card1 = screen.getByText('card 1');
  expect(card1).toBeVisible();

  const cards = screen.queryAllByText('card 2');
  expect(cards.length).toBe(0);

  const right = screen.getByRole('button', { name: 'Rotate right' });
  await fireEvent.click(right);

  const card3 = screen.getByText('card 2');
  expect(card3).toBeVisible();
});

test('carousel left and right buttons enabled when all items does not fit into screen and disabled otherwise', async () => {
  render(CarouselTest);
  const card1 = screen.getByText('card 1');
  console.log(window.innerWidth);
  expect(card1).toBeVisible();

  let cards = screen.queryAllByText('card 2');
  expect(cards.length).toBe(0);

  cards = screen.queryAllByText('card 3');
  expect(cards.length).toBe(0);

  const left = screen.getByRole('button', { name: 'Rotate left' });
  const right = screen.getByRole('button', { name: 'Rotate right' });

  expect(left).toBeEnabled();
  expect(right).toBeEnabled();

  callback([{ contentRect: { width: 1020 } }]);

  await waitFor(() => {
    const card1 = screen.getByText('card 1');
    expect(card1).toBeVisible();
    const card2 = screen.getByText('card 2');
    expect(card2).toBeVisible();
    const card3 = screen.getByText('card 3');
    expect(card3).toBeVisible();
  });

  expect(left).toBeDisabled();
  expect(right).toBeDisabled();
});

test('left and right buttons have hover class', async () => {
  render(CarouselTest);
  const card1 = screen.getByText('card 1');
  console.log(window.innerWidth);
  expect(card1).toBeVisible();

  let cards = screen.queryAllByText('card 2');
  expect(cards.length).toBe(0);

  cards = screen.queryAllByText('card 3');
  expect(cards.length).toBe(0);

  const left = screen.getByRole('button', { name: 'Rotate left' });
  const right = screen.getByRole('button', { name: 'Rotate right' });

  expect(left).toHaveClass(/^hover:bg-/);
  expect(right).toHaveClass(/^hover:bg-/);
});
