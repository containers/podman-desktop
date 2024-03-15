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

import '@testing-library/jest-dom/vitest';

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test } from 'vitest';

import SendFeedback from './SendFeedback.svelte';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect that the button is disabled when loading the page', async () => {
  render(SendFeedback, {});
  const button = screen.getByRole('button', { name: 'Send feedback' });
  expect(button).toBeInTheDocument();
  expect(button).toBeDisabled();
});

test('Expect that the button is enabled after clicking on a smiley', async () => {
  render(SendFeedback, {});
  const button = screen.getByRole('button', { name: 'Send feedback' });

  // expect to have indication why the button is disabled
  expect(screen.getByText('Please select an experience smiley')).toBeInTheDocument();

  // click on a smiley
  const smiley = screen.getByRole('button', { name: 'very-happy-smiley' });
  await fireEvent.click(smiley);

  // now expect to have the button enabled
  expect(button).toBeEnabled();

  // and the indication is gone
  expect(screen.queryByText('Please select an experience smiley')).not.toBeInTheDocument();
});

test('Expect very sad smiley errors without feedback', async () => {
  render(SendFeedback, {});
  const button = screen.getByRole('button', { name: 'Send feedback' });
  expect(button).toBeDisabled();

  // expect to have indication why the button is disabled
  expect(screen.getByText('Please select an experience smiley')).toBeInTheDocument();

  // click on very sad smiley
  const smiley = screen.getByRole('button', { name: 'very-sad-smiley' });
  await fireEvent.click(smiley);

  // expect button is still disabled, but with different indication
  expect(button).toBeDisabled();
  const message = screen.getByText('Please share contact info or details on how we can improve');
  expect(message).toBeInTheDocument();

  // add some text
  const feedback = screen.getByTestId('tellUsWhyFeedback');
  expect(feedback).toBeInTheDocument();

  await userEvent.type(feedback, 'PD is awesome');

  // button is enabled and the indication is gone
  expect(button).toBeEnabled();
  expect(message).not.toBeInTheDocument();
});

test('Expect sad smiley warns without feedback', async () => {
  render(SendFeedback, {});
  const button = screen.getByRole('button', { name: 'Send feedback' });
  expect(button).toBeDisabled();

  // expect to have indication why the button is disabled
  expect(screen.getByText('Please select an experience smiley')).toBeInTheDocument();

  // click on very sad smiley
  const smiley = screen.getByRole('button', { name: 'sad-smiley' });
  await fireEvent.click(smiley);

  // expect button is now enabled, but with different indication
  expect(button).toBeEnabled();
  const warn = screen.getByText('We would really appreciate knowing how we can improve');
  expect(warn).toBeInTheDocument();

  // add some text
  const feedback = screen.getByTestId('tellUsWhyFeedback');
  expect(feedback).toBeInTheDocument();

  await userEvent.type(feedback, 'PD is awesome');

  // and the indication is gone
  expect(warn).not.toBeInTheDocument();
});
