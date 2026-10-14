/**********************************************************************
 * Copyright (C) 2024-2026 Red Hat, Inc.
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

import type { TelemetryMessages } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { expect, test, vi } from 'vitest';

import FeedbackForm from './FeedbackForm.svelte';

test('something', () => {
  render(FeedbackForm);
  expect(screen.getByLabelText('content')).toBeInTheDocument();
  expect(screen.getByLabelText('validation and buttons')).toBeInTheDocument();
  expect(screen.getByLabelText('validation')).toBeInTheDocument();
});

test('Expect privacy statement is missing from the UI when not provided', async () => {
  render(FeedbackForm);

  await tick();

  const privacyLink = screen.queryByRole('link');
  expect(privacyLink).not.toBeInTheDocument();
});

test('Expect privacy statement is included when it exists', async () => {
  const telem: TelemetryMessages = {
    acceptMessage: 'Help improve the product',
    privacy: {
      link: 'Click here',
      url: 'privacy-url',
    },
  };
  vi.mocked(window.getTelemetryMessages).mockResolvedValue(telem);

  render(FeedbackForm);

  await tick();

  const privacyLink = screen.getByRole('link');
  expect(privacyLink).toBeInTheDocument();
  expect(privacyLink.textContent).toEqual(telem.privacy?.link);

  await fireEvent.click(privacyLink);
  await vi.waitFor(() => expect(vi.mocked(window.openExternal)).toBeCalledWith(telem.privacy?.url));
});
