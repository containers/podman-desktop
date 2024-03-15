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
import { beforeAll, describe, expect, test } from 'vitest';

import PreferencesPageDockerExtensions from './PreferencesPageDockerExtensions.svelte';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

const buttonText = 'Install extension from the OCI image';

describe('PreferencesPageDockerExtensions', () => {
  test('Expect that textbox is available and button is displayed', async () => {
    render(PreferencesPageDockerExtensions, {});

    const input = screen.getByRole('textbox', { name: 'OCI Image Name' });
    expect(input).toBeInTheDocument();
    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('Expect that whitespace does not enable button', async () => {
    render(PreferencesPageDockerExtensions, { ociImage: '   ' });

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('Expect that valid entry enables button', async () => {
    render(PreferencesPageDockerExtensions, { ociImage: 'some-valid-image-name' });

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });
});
