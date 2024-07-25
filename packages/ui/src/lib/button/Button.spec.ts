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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import Button from './Button.svelte';

test('Check primary button styling', async () => {
  render(Button, { type: 'primary' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-[var(--pd-button-primary-bg)]');
  expect(button).toHaveClass('hover:bg-[var(--pd-button-primary-hover-bg)]');
  expect(button).toHaveClass('border-none');
  expect(button).toHaveClass('py-[5px]');
  expect(button).toHaveClass('text-[var(--pd-button-text)]');
});

test('Check disabled/in-progress primary button styling', async () => {
  render(Button, { type: 'primary', inProgress: true });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-[var(--pd-button-disabled)]');
  expect(button).toHaveClass('py-[5px]');
  expect(button).toHaveClass('text-[var(--pd-button-disabled-text)]');
});

test('Check primary button is the default', async () => {
  render(Button);

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('bg-[var(--pd-button-primary-bg)]');
  expect(button).toHaveClass('text-[var(--pd-button-text)]');
});

test('Check secondary button styling', async () => {
  render(Button, { type: 'secondary' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-[var(--pd-button-secondary)]');
  expect(button).toHaveClass('border-[1px]');
  expect(button).toHaveClass('py-[4px]');
  expect(button).toHaveClass('text-[var(--pd-button-secondary)]');
  expect(button).toHaveClass('hover:bg-[var(--pd-button-secondary-hover)]');
  expect(button).toHaveClass('hover:border-[var(--pd-button-secondary-hover)]');
  expect(button).toHaveClass('hover:text-[var(--pd-button-text)]');
});

test('Check danger button styling', async () => {
  render(Button, { type: 'danger' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-[var(--pd-button-danger-border)]');
  expect(button).toHaveClass('border-2');
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('py-[3px]');
  expect(button).toHaveClass('bg-[var(--pd-button-danger-bg)]');
  expect(button).toHaveClass('text-[var(--pd-button-danger-text)]');
  expect(button).toHaveClass('hover:bg-[var(--pd-button-danger-hover-bg)]');
  expect(button).toHaveClass('hover:text-[var(--pd-button-danger-hover-text)]');
});

test('Check disabled/in-progress secondary button styling', async () => {
  render(Button, { type: 'secondary', inProgress: true });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-[var(--pd-button-disabled)]');
  expect(button).toHaveClass('border-[1px]');
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('py-[4px]');
  expect(button).toHaveClass('bg-[var(--pd-button-disabled)]');
  expect(button).toHaveClass('text-[var(--pd-button-disabled-text)]');
});

test('Check link button styling', async () => {
  render(Button, { type: 'link' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-none');
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('py-[5px]');
  expect(button).toHaveClass('hover:bg-[var(--pd-button-link-hover-bg)]');
  expect(button).toHaveClass('text-[var(--pd-button-link-text)]');
});

test('Check disabled/in-progress link button styling', async () => {
  render(Button, { type: 'link', inProgress: true });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('px-4');
  expect(button).toHaveClass('py-[5px]');
  expect(button).toHaveClass('text-[var(--pd-button-disabled-text)]');
});

test('Check tab button styling', async () => {
  render(Button, { type: 'tab' });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('border-b-[3px]');
  expect(button).toHaveClass('border-[var(--pd-button-tab-border)]');
  expect(button).toHaveClass('pb-1');
  expect(button).toHaveClass('text-[var(--pd-button-tab-text)]');
});

test('Check selected tab button styling', async () => {
  render(Button, { type: 'tab', selected: true });

  // check for a few elements of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('text-[var(--pd-button-tab-text-selected)]');
  expect(button).toHaveClass('border-[var(--pd-button-tab-border-selected)]');
});

test('Check icon button with fas prefix is visible', async () => {
  render(Button, { icon: faTrash });

  // check for a few elements of the styling
  const img = screen.getByRole('img', { hidden: true });
  expect(img).toBeInTheDocument();
});

test('Check icon button with fab prefix is visible', async () => {
  render(Button, { icon: faGithub });

  // check for a few elements of the styling
  const img = screen.getByRole('img', { hidden: true });
  expect(img).toBeInTheDocument();
});

test('Button inProgress must have a spinner', async () => {
  // render the component
  render(Button, { inProgress: true });

  const svg = screen.getByRole('img');
  expect(svg).toBeDefined();
});

test('Button no progress no icon do not have spinner', async () => {
  // render the component
  render(Button, { inProgress: false });

  const svg = screen.queryByRole('img');
  expect(svg).toBeNull();
});

test('Button hidden should be hidden', async () => {
  render(Button, { hidden: true });
  const button = screen.queryByRole('button');
  expect(button).not.toBeInTheDocument();
});
