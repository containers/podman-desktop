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

import type { AuditRecord, AuditResult } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import AuditMessageBox from './AuditMessageBox.svelte';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */

test('Should display info message', async () => {
  const dummyResult = {
    records: [
      {
        type: 'info',
        record: 'Dummy info message',
      } as AuditRecord,
    ],
  } as AuditResult;
  render(AuditMessageBox, { auditResult: dummyResult });
  const infoMessage = screen.getByLabelText('info');

  expect(infoMessage).toBeInTheDocument();
  expect(infoMessage).toHaveTextContent('Dummy info message');
});

test('Should display warning message', async () => {
  const dummyResult = {
    records: [
      {
        type: 'warning',
        record: 'Dummy warning message',
      } as AuditRecord,
    ],
  } as AuditResult;
  render(AuditMessageBox, { auditResult: dummyResult });
  const warnMessage = screen.getByLabelText('warning');

  expect(warnMessage).toBeInTheDocument();
  expect(warnMessage).toHaveTextContent('Dummy warning message');
});

test('Should display error message', async () => {
  const dummyResult = {
    records: [
      {
        type: 'error',
        record: 'Dummy error message',
      } as AuditRecord,
    ],
  } as AuditResult;
  render(AuditMessageBox, { auditResult: dummyResult });
  const errMessage = screen.getByLabelText('error');

  expect(errMessage).toBeInTheDocument();
  expect(errMessage).toHaveTextContent('Dummy error message');
});

test('Should update data when audit result is updated', async () => {
  const dummyResult = {
    records: [
      {
        type: 'error',
        record: 'Dummy error message',
      } as AuditRecord,
    ],
  } as AuditResult;
  const renderComponent = render(AuditMessageBox, { auditResult: dummyResult });
  const errMessage = screen.getByLabelText('error');

  expect(errMessage).toBeInTheDocument();
  expect(errMessage).toHaveTextContent('Dummy error message');

  // now we update the audit result field
  renderComponent.rerender({
    auditResult: {
      records: [
        {
          type: 'info',
          record: 'Dummy info message',
        },
      ],
    },
  });

  // wait for tick
  await new Promise(resolve => setTimeout(resolve, 500));

  const afterUpdateError = screen.queryByLabelText('error');
  expect(afterUpdateError).not.toBeInTheDocument();

  // check the info message now
  const infoMessage = screen.getByLabelText('info');

  expect(infoMessage).toBeInTheDocument();
  expect(infoMessage).toHaveTextContent('Dummy info message');
});
