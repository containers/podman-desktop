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

import '@testing-library/jest-dom';
import { beforeAll, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
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
