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
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';

import ImageDetailsFilesExpandableCommand from './ImageDetailsFilesExpandableCommand.svelte';

test('command with more than 2 lines', async () => {
  render(ImageDetailsFilesExpandableCommand, {
    command: `RUN command1    command2\tcommand3\ncommand4`,
  });

  // Initial display
  let text = screen.getByText(/RUN command1/);
  expect(text).toBeInTheDocument();
  expect(text.innerHTML).toEqual(`RUN command1\n    command2`);

  let more = screen.queryByText('show more');
  let less = screen.queryByText('show less');
  expect(more).toBeInTheDocument();
  expect(less).not.toBeInTheDocument();

  // Display more
  await userEvent.click(more!);
  less = screen.queryByText('show less');
  more = screen.queryByText('show more');
  expect(more).not.toBeInTheDocument();
  expect(less).toBeInTheDocument();

  text = screen.getByText(/RUN command1/);
  expect(text).toBeInTheDocument();
  expect(text.innerHTML).toEqual(`RUN command1\n    command2\n\tcommand3\ncommand4`);

  // Display less
  await userEvent.click(less!);
  less = screen.queryByText('show less');
  more = screen.queryByText('show more');
  expect(more).toBeInTheDocument();
  expect(less).not.toBeInTheDocument();

  text = screen.getByText(/RUN command1/);
  expect(text).toBeInTheDocument();
  expect(text.innerHTML).toEqual(`RUN command1\n    command2`);
});

test('command with 2 lines', async () => {
  render(ImageDetailsFilesExpandableCommand, {
    command: `RUN command1  command2`,
  });
  const text = screen.getByText(/RUN command1/);
  expect(text).toBeInTheDocument();
  expect(text.innerHTML).toEqual(`RUN command1\n  command2`);

  const more = screen.queryByText('show more');
  const less = screen.queryByText('show less');
  expect(more).not.toBeInTheDocument();
  expect(less).not.toBeInTheDocument();
});
