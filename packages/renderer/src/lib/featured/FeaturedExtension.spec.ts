/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import FeaturedExtension from '/@/lib/featured/FeaturedExtension.svelte';

import type { FeaturedExtension as IFeaturedExtension } from '../../../../main/src/plugin/featured/featured-api';

const fetchableFeaturedExtension: IFeaturedExtension = {
  builtin: true,
  id: 'foo.bar',
  displayName: 'FooBar',
  description: 'This is FooBar description',
  icon: 'data:image/png;base64,foobar',
  categories: [],
  fetchable: true,
  fetchLink: 'oci-hello/world',
  fetchVersion: '1.2.3',
  installed: false,
};

const installedFeaturedExtension: IFeaturedExtension = {
  builtin: true,
  id: 'foo.baz',
  displayName: 'FooBaz',
  description: 'Foobaz description',
  icon: 'data:image/png;base64,foobaz',
  categories: [],
  fetchable: false,
  installed: true,
};

const notFetchableFeaturedExtension: IFeaturedExtension = {
  builtin: true,
  id: 'foo.bar',
  displayName: 'Bar',
  description: 'FooBar not fetchable description',
  icon: 'data:image/png;base64,bar',
  categories: [],
  fetchable: false,
  installed: false,
};

function assertPrimary(component: HTMLElement) {
  expect(component).toBeDefined();
  expect(component).toHaveClass('bg-[var(--pd-card-bg)]');
  expect(component).toHaveClass('border-[var(--pd-card-bg)]');
  expect(component).not.toHaveClass('bg-[var(--pd-invert-content-card-bg)]');
  expect(component).not.toHaveClass('border-[var(--pd-invert-content-card-bg)]');
}

function assertSecondary(component: HTMLElement) {
  expect(component).toBeDefined();
  expect(component).not.toHaveClass('bg-[var(--pd-card-bg)]');
  expect(component).not.toHaveClass('border-[var(--pd-card-bg)]');
  expect(component).toHaveClass('bg-[var(--pd-invert-content-card-bg)]');
  expect(component).toHaveClass('border-[var(--pd-invert-content-card-bg)]');
}

describe('variants', () => {
  test('default should be primary', () => {
    render(FeaturedExtension, {
      featuredExtension: fetchableFeaturedExtension,
    });

    const card = screen.getByLabelText(fetchableFeaturedExtension.displayName);
    assertPrimary(card);
  });

  test('primary should have proper classes', () => {
    render(FeaturedExtension, {
      featuredExtension: fetchableFeaturedExtension,
      variant: 'primary',
    });

    const card = screen.getByLabelText(fetchableFeaturedExtension.displayName);
    assertPrimary(card);
  });

  test('secondary should have proper classes', () => {
    render(FeaturedExtension, {
      featuredExtension: fetchableFeaturedExtension,
      variant: 'secondary',
    });

    const card = screen.getByLabelText(fetchableFeaturedExtension.displayName);
    assertSecondary(card);
  });
});

describe('title', () => {
  test('title should not be visible by default', async () => {
    render(FeaturedExtension, {
      featuredExtension: fetchableFeaturedExtension,
    });

    const title = screen.queryByText('EXTENSION');
    expect(title).toBeNull();
  });

  test('title should be visible when displayTitle is true', async () => {
    render(FeaturedExtension, {
      featuredExtension: fetchableFeaturedExtension,
      displayTitle: true,
    });

    const title = screen.getByText('EXTENSION');
    expect(title).toBeDefined();
  });
});

test('Expect featured extension to show install button', () => {
  render(FeaturedExtension, {
    featuredExtension: fetchableFeaturedExtension,
  });

  // get by title
  const description = screen.getByTitle('This is FooBar description');
  expect(description).toBeInTheDocument();

  const image = screen.getByRole('img', { name: 'FooBar logo' });
  // expect the image to be there
  expect(image).toBeInTheDocument();
  // expect image source is correct
  expect(image).toHaveAttribute('src', 'data:image/png;base64,foobar');

  // Not installed so it should have a button to install
  const installButton = screen.getByRole('button', { name: 'Install foo.bar Extension' });
  // expect the button to be there
  expect(installButton).toBeInTheDocument();
});

test('Expect featured extension to show installed info', () => {
  render(FeaturedExtension, {
    featuredExtension: installedFeaturedExtension,
  });

  // get by title
  const description = screen.getByTitle('Foobaz description');
  expect(description).toBeInTheDocument();
  // contains the text installed
  expect(description).toHaveTextContent(/.*installed/);

  const image = screen.getByRole('img', { name: 'FooBaz logo' });
  // expect the image to be there
  expect(image).toBeInTheDocument();
  // expect image source is correct
  expect(image).toHaveAttribute('src', 'data:image/png;base64,foobaz');
});

test('Expect featured extension to show NAN when not fetchable', () => {
  render(FeaturedExtension, {
    featuredExtension: notFetchableFeaturedExtension,
  });

  // get by title
  const description = screen.getByTitle('FooBar not fetchable description');
  expect(description).toBeInTheDocument();
  // contains the text installed
  expect(description).toHaveTextContent(/.*N\/A/);

  const image = screen.getByRole('img', { name: 'Bar logo' });
  // expect the image to be there
  expect(image).toBeInTheDocument();
  // expect image source is correct
  expect(image).toHaveAttribute('src', 'data:image/png;base64,bar');
});
