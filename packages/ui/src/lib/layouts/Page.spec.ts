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

import { fireEvent, getByRole, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import Page from './Page.svelte';

beforeEach(() => {
  vi.clearAllMocks();
});

test('Expect title is defined', async () => {
  const title = 'My Dummy Title';
  render(Page, {
    title,
  });

  const titleElement = screen.getByRole('heading', { level: 1, name: title });
  expect(titleElement).toBeInTheDocument();
  expect(titleElement).toHaveTextContent(title);
});

test('Expect no backlink or close is defined', async () => {
  render(Page, {
    title: 'No Title',
  });

  const backElement = screen.queryByLabelText('Back');
  expect(backElement).not.toBeInTheDocument();

  const closeElement = screen.queryByTitle('Close');
  expect(closeElement).toBeInTheDocument();
});

test('Expect page name is defined', async () => {
  const name = 'My Dummy Name';
  render(Page, {
    title: 'No Title',
    breadcrumbRightPart: name,
  });

  const nameElement = screen.getByLabelText('Page Name');
  expect(nameElement).toBeInTheDocument();
  expect(nameElement).toHaveTextContent(name);
});

test('Expect backlink is defined', async () => {
  const backName = 'Last page';
  const breadcrumbClickMock = vi.fn();

  render(Page, {
    breadcrumbLeftPart: 'Last page',
    breadcrumbRightPart: 'hello',
    title: 'No Title',
    onbreadcrumbClick: breadcrumbClickMock,
  });

  const backElement = screen.getByLabelText('Back');
  expect(backElement).toBeInTheDocument();
  expect(backElement).toHaveTextContent(backName);

  await fireEvent.click(backElement);

  expect(breadcrumbClickMock).toHaveBeenCalled();
});

test('Expect close link is defined', async () => {
  const closeClickMock = vi.fn();

  render(Page, {
    title: 'No Title',
    breadcrumbLeftPart: 'back',
    breadcrumbRightPart: 'hello',
    onclose: closeClickMock,
  });

  const closeElement = getByRole(document.body, 'button', { name: 'Close' });
  expect(closeElement).toBeInTheDocument();
  await fireEvent.click(closeElement);

  expect(closeClickMock).toHaveBeenCalled();
});

test('Expect Escape key works', async () => {
  const closeClickMock = vi.fn();

  render(Page, {
    title: 'No Title',
    breadcrumbLeftPart: 'back',
    onclose: closeClickMock,
  });
  await userEvent.keyboard('{Escape}');

  expect(closeClickMock).toHaveBeenCalled();
});

test('Expect no progress', async () => {
  render(Page, {
    title: 'No Title',
    inProgress: false,
  });

  const progress = screen.queryByRole('progressbar');
  expect(progress).toBeNull();
});

test('Expect progress', async () => {
  render(Page, {
    title: 'No Title',
    inProgress: true,
  });

  const progress = screen.getByRole('progressbar');
  expect(progress).toBeInTheDocument();
});

test('Expect subtitle is defined and cut', async () => {
  const subtitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
  render(Page, {
    title: '',
    subtitle,
  });

  // get the element having the 'Lorem ipsum' text
  const subtitleElement = screen.getByText(subtitle);
  expect(subtitleElement).toBeInTheDocument();

  // expect class has the clamp
  expect(subtitleElement).toHaveClass('line-clamp-1');
});

describe('Check for MutationObserver', () => {
  let mutationObserverObserve: typeof MutationObserver.prototype.observe | undefined;
  let mutationObserverDisconnect: typeof MutationObserver.prototype.disconnect | undefined;

  beforeEach(() => {
    vi.resetAllMocks();
    mutationObserverObserve = MutationObserver.prototype.observe;
    mutationObserverDisconnect = MutationObserver.prototype.disconnect;

    MutationObserver.prototype.observe = vi.fn();
    MutationObserver.prototype.disconnect = vi.fn();
  });

  afterEach(() => {
    if (!mutationObserverObserve || !mutationObserverDisconnect) {
      return;
    }
    MutationObserver.prototype.observe = mutationObserverObserve;
    MutationObserver.prototype.disconnect = mutationObserverDisconnect;
  });

  test('Expect disconected MutationObserver after onDestroy', async () => {
    const subtitle = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit';
    const page = render(Page, {
      title: '',
      subtitle,
    });

    const subtitleElement = screen.getByText(subtitle);
    expect(subtitleElement).toBeInTheDocument();

    expect(MutationObserver.prototype.observe).toHaveBeenCalledTimes(1);
    expect(MutationObserver.prototype.disconnect).toHaveBeenCalledTimes(0);

    // run unmount to trigger the onDestroy callback
    page.unmount();

    expect(MutationObserver.prototype.disconnect).toHaveBeenCalledTimes(1);
  });
});
