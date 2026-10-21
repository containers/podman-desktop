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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import ErrorMessage from './ErrorMessage.svelte';

test('Check error message', async () => {
  const error = 'This is an error message';
  render(ErrorMessage, { error });

  // check error message
  const errorMesssage = screen.getByRole('alert');
  expect(errorMesssage).toBeInTheDocument();
  expect(errorMesssage).toHaveTextContent(error);
  // no static label: it would replace the error text as the accessible name
  expect(errorMesssage).not.toHaveAttribute('aria-label');
});

test('an explicit aria-label overrides the error text as accessible name', () => {
  render(ErrorMessage, { error: 'This is an error message', 'aria-label': 'Custom label' });

  expect(screen.getByRole('alert', { name: 'Custom label' })).toBeInTheDocument();
});

test('an error with a run of characters that has nothing to wrap at can wrap', async () => {
  const error =
    'Unable to find auth info for https://localhost:5000/v2/. Error: RequestError: write EPROTO ' +
    '24412595112800:error:100000f7:SSL routines:OPENSSL_internal:WRONG_VERSION_NUMBER:.../../third_party/boringssl/src/ssl/tls_record.cc:127:';
  render(ErrorMessage, { error });

  // The defect this guards: an error is text nobody chose the length of. A run
  // with no spaces in it cannot wrap, so it widens whatever contains it and
  // spills out of the dialog. wrap-anywhere breaks only what would otherwise
  // overflow.
  expect(screen.getByRole('alert')).toHaveClass('wrap-anywhere');
});
